import { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Send,
  RotateCcw,
  Download,
  Sparkles,
  BookOpen,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';

// API base URL configuration
const getApiBaseUrl = () => {
  // In production, use environment variable or fallback to the deployed API
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_BASE_URL || 'https://demo-visualizer.onrender.com';
  }
  // In development, use the Vite proxy (which routes /api to the backend)
  return '';
};

const API_BASE_URL = getApiBaseUrl();

// Consolidated UI Component - Black & White Luxury Design
function UI() {
  const [questions, setQuestions] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userId] = useState('u1');
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);

  // Demo questions - cleaned and minimal
  const demoQuestions = [
    "Explain Newton's First Law of Motion",
    "What is photosynthesis?",
    "Describe the Solar System",
    "How does gravity work?",
    "Explain the water cycle"
  ];

  // Load questions on mount
  useEffect(() => {
    fetchQuestions();
  }, []);

  // SSE connection
  useEffect(() => {
    const eventSource = new EventSource(`${API_BASE_URL}/api/stream`);
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'question_created') {
        setQuestions(prev => [...prev, data.question]);
      } else if (data.type === 'answer_created') {
        // Update the corresponding question with answerId
        setQuestions(prev => prev.map(q =>
          q.id === data.answer.questionId
            ? { ...q, answerId: data.answer.id }
            : q
        ));
        if (questions.some(q => q.id === data.answer.questionId)) {
          setCurrentAnswer(data.answer);
          setIsPlaying(true);
        }
      }
    };
    return () => eventSource.close();
  }, [questions]);

  // Canvas animation
  useEffect(() => {
    if (!currentAnswer?.visualization || !isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Calculate scaling and offset to fit content within canvas bounds
    const layers = currentAnswer.visualization.layers || [];
    const bounds = calculateLayerBounds(layers);
    const { scale, offsetX, offsetY } = calculateFitTransform(bounds, canvas.width, canvas.height);

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;

      const elapsed = timestamp - startTimeRef.current;
      const duration = currentAnswer.visualization.duration || 4000;
      const progress = Math.min(elapsed / duration, 1);

      setCurrentTime(elapsed);

      // Clear canvas completely
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Fill background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Save context state
      ctx.save();

      // Apply scaling and offset transform first
      ctx.translate(offsetX, offsetY);
      ctx.scale(scale, scale);

      // Clip to the scaled canvas bounds to prevent overflow
      // Use a slightly smaller clip area to ensure labels stay within bounds
      const clipPadding = 10;
      ctx.beginPath();
      ctx.rect(
        -offsetX / scale + clipPadding,
        -offsetY / scale + clipPadding,
        canvas.width / scale - 2 * clipPadding,
        canvas.height / scale - 2 * clipPadding
      );
      ctx.clip();

      // Draw all layers
      layers.forEach(layer => {
        drawLayer(ctx, layer, progress, elapsed);
      });

      // Restore context state
      ctx.restore();

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        startTimeRef.current = null;
      }
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentAnswer?.visualization, isPlaying]);

  // Reset animation when visualization changes
  useEffect(() => {
    startTimeRef.current = null;
    setCurrentTime(0);
  }, [currentAnswer?.visualization]);

  // Helper functions for canvas fitting
  const calculateLayerBounds = (layers) => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    layers.forEach(layer => {
      const props = layer.props;
      if (!props) return;

      switch (layer.type) {
        case 'circle':
          const cx = props.x || 0;
          const cy = props.y || 0;
          const cr = props.r || 10;
          minX = Math.min(minX, cx - cr);
          minY = Math.min(minY, cy - cr);
          maxX = Math.max(maxX, cx + cr);
          maxY = Math.max(maxY, cy + cr);
          break;
        case 'rectangle':
          const rx = props.x || 0;
          const ry = props.y || 0;
          const rw = props.width || 20;
          const rh = props.height || 20;
          minX = Math.min(minX, rx);
          minY = Math.min(minY, ry);
          maxX = Math.max(maxX, rx + rw);
          maxY = Math.max(maxY, ry + rh);
          break;
        case 'arrow':
          const ax = props.x || 0;
          const ay = props.y || 0;
          const adx = props.dx || 0;
          const ady = props.dy || 0;
          minX = Math.min(minX, ax, ax + adx);
          minY = Math.min(minY, ay, ay + ady);
          maxX = Math.max(maxX, ax, ax + adx);
          maxY = Math.max(maxY, ay, ay + ady);
          break;
        case 'line':
          const lx1 = props.x1 || 0;
          const ly1 = props.y1 || 0;
          const lx2 = props.x2 || 0;
          const ly2 = props.y2 || 0;
          minX = Math.min(minX, lx1, lx2);
          minY = Math.min(minY, ly1, ly2);
          maxX = Math.max(maxX, lx1, lx2);
          maxY = Math.max(maxY, ly1, ly2);
          break;
        case 'text':
          const tx = props.x || 0;
          const ty = props.y || 0;
          minX = Math.min(minX, tx);
          minY = Math.min(minY, ty);
          maxX = Math.max(maxX, tx + 100); // Estimate text width
          maxY = Math.max(maxY, ty + (props.fontSize || 16));
          break;
        case 'polygon':
        case 'star':
          const px = props.x || 0;
          const py = props.y || 0;
          const pr = Math.max(props.r || 40, props.outerRadius || 40);
          minX = Math.min(minX, px - pr);
          minY = Math.min(minY, py - pr);
          maxX = Math.max(maxX, px + pr);
          maxY = Math.max(maxY, py + pr);
          break;
        case 'wave':
          const wx = props.x || 0;
          const wy = props.y || 0;
          const ww = props.width || 200;
          const wa = props.amplitude || 20;
          minX = Math.min(minX, wx);
          minY = Math.min(minY, wy - wa);
          maxX = Math.max(maxX, wx + ww);
          maxY = Math.max(maxY, wy + wa);
          break;
        case 'curve':
          if (props.points && props.points.length) {
            props.points.forEach(point => {
              minX = Math.min(minX, point.x || 0);
              minY = Math.min(minY, point.y || 0);
              maxX = Math.max(maxX, point.x || 0);
              maxY = Math.max(maxY, point.y || 0);
            });
          }
          break;
      }
    });

    // Add padding for labels
    const labelPadding = 30;
    minX -= labelPadding;
    minY -= labelPadding;
    maxX += labelPadding;
    maxY += labelPadding;

    return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
  };

  const calculateFitTransform = (bounds, canvasWidth, canvasHeight) => {
    if (bounds.width <= 0 || bounds.height <= 0) {
      return { scale: 1, offsetX: 0, offsetY: 0 };
    }

    // Calculate scale to fit within canvas while maintaining aspect ratio
    const contentAspectRatio = bounds.width / bounds.height;
    const canvasAspectRatio = canvasWidth / canvasHeight;

    let scale;
    let offsetX = 0;
    let offsetY = 0;

    if (contentAspectRatio > canvasAspectRatio) {
      // Content is wider than canvas - fit by width
      scale = canvasWidth / bounds.width;
      const scaledHeight = bounds.height * scale;
      offsetY = (canvasHeight - scaledHeight) / 2;
    } else {
      // Content is taller than canvas - fit by height
      scale = canvasHeight / bounds.height;
      const scaledWidth = bounds.width * scale;
      offsetX = (canvasWidth - scaledWidth) / 2;
    }

    // Don't scale up, only down, and ensure minimum scale for readability
    const finalScale = Math.min(scale, 1);
    const minScale = Math.max(0.2, Math.min(canvasWidth / bounds.width, canvasHeight / bounds.height) * 0.8);
    const clampedScale = Math.max(finalScale, minScale);

    // Adjust offsets to center the content properly
    const actualOffsetX = offsetX - bounds.minX * clampedScale;
    const actualOffsetY = offsetY - bounds.minY * clampedScale;

    return {
      scale: clampedScale,
      offsetX: actualOffsetX,
      offsetY: actualOffsetY
    };
  };

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/questions`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, question: question.trim() }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setQuestion('');
    } catch (error) {
      console.error('Error submitting question:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerClick = async (answerId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/answers/${answerId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const answer = await response.json();
      setCurrentAnswer(answer);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error fetching answer:', error);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    startTimeRef.current = null;
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const handleDemoClick = (demoQuestion) => {
    setQuestion(demoQuestion);
    handleQuestionSubmit({ preventDefault: () => {} });
  };

  // Drawing functions
  const drawLayer = (ctx, layer, progress, elapsed) => {
    const { type, props, animations = [] } = layer;
    const normalizedProps = normalizeProps(props);
    const currentProps = applyAnimations(normalizedProps, animations, elapsed);
    const enforcedProps = enforceMonochrome(currentProps);

    switch (type) {
      case 'circle':
        drawCircle(ctx, enforcedProps);
        drawAutoLabel(ctx, layer, enforcedProps, 'circle');
        break;
      case 'rectangle':
        drawRectangle(ctx, enforcedProps);
        drawAutoLabel(ctx, layer, enforcedProps, 'rectangle');
        break;
      case 'arrow':
        drawArrow(ctx, enforcedProps);
        drawAutoLabel(ctx, layer, enforcedProps, 'arrow');
        break;
      case 'line':
        drawLine(ctx, enforcedProps);
        drawAutoLabel(ctx, layer, enforcedProps, 'line');
        break;
      case 'polygon':
        drawPolygon(ctx, enforcedProps);
        drawAutoLabel(ctx, layer, enforcedProps, 'polygon');
        break;
      case 'curve':
        drawCurve(ctx, enforcedProps);
        drawAutoLabel(ctx, layer, enforcedProps, 'curve');
        break;
      case 'star':
        drawStar(ctx, enforcedProps);
        drawAutoLabel(ctx, layer, enforcedProps, 'star');
        break;
      case 'wave':
        drawWave(ctx, enforcedProps);
        drawAutoLabel(ctx, layer, enforcedProps, 'wave');
        break;
      case 'text':
        // Text is used as-is but force black
        drawText(ctx, enforcedProps);
        break;
      default:
        console.warn(`Unknown layer type: ${type}`);
    }
  };

  const normalizeProps = (props) => {
    const normalized = { ...props };
    if (normalized.color && !normalized.fill) normalized.fill = normalized.color;
    if (normalized.color && !normalized.stroke) normalized.stroke = normalized.color;
    if (normalized.radius && !normalized.r) normalized.r = normalized.radius;
    return normalized;
  };

  const enforceMonochrome = (props) => {
    return {
      ...props,
      fill: '#000',
      stroke: '#000',
      color: '#000'
    };
  };

  const applyAnimations = (baseProps, animations, elapsed) => {
    const props = { ...baseProps };
    animations.forEach(animation => {
      const { property, from, to, start = 0, end, easing = 'easeInOut' } = animation;
      const duration = end - start;

      if (elapsed >= start && elapsed <= end) {
        const animProgress = (elapsed - start) / duration;
        const easedProgress = applyEasing(animProgress, easing);
        props[property] = from + (to - from) * easedProgress;
      }
    });
    return props;
  };

  const applyEasing = (t, easing) => {
    switch (easing) {
      case 'easeIn': return t * t;
      case 'easeOut': return t * (2 - t);
      default: return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
  };

  const drawCircle = (ctx, props) => {
    const { x, y, r, fill, stroke, strokeWidth = 1 } = props;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = strokeWidth;
      ctx.stroke();
    }
  };

  const drawRectangle = (ctx, props) => {
    const { x, y, width, height, fill, stroke, strokeWidth = 1 } = props;
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fillRect(x, y, width, height);
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = strokeWidth;
      ctx.strokeRect(x, y, width, height);
    }
  };

  const drawLine = (ctx, props) => {
    const { x1, y1, x2, y2, stroke = '#000', strokeWidth = 2, dash = [] } = props;
    ctx.save();
    if (dash && dash.length) ctx.setLineDash(dash);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  };

  const drawPolygon = (ctx, props) => {
    const { x, y, sides = 5, r = 40, rotation = 0, fill = '#000', stroke = '#000', strokeWidth = 1 } = props;
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const angle = rotation + (i * 2 * Math.PI) / sides;
      const px = x + Math.cos(angle) * r;
      const py = y + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = strokeWidth;
      ctx.stroke();
    }
  };

  const drawCurve = (ctx, props) => {
    const { points = [], stroke = '#000', strokeWidth = 2, fill } = props;
    if (points.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    if (fill) {
      ctx.fillStyle = '#000';
      ctx.fill();
    }
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
  };

  const drawStar = (ctx, props) => {
    const { x, y, outerRadius = 40, innerRadius = 20, points = 5, rotation = 0, fill = '#000', stroke = '#000', strokeWidth = 1 } = props;
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = rotation + (i * Math.PI) / points;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = strokeWidth; ctx.stroke(); }
  };

  const drawWave = (ctx, props) => {
    const { x, y, width = 200, amplitude = 20, frequency = 0.02, stroke = '#000', strokeWidth = 2, fill } = props;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let i = 0; i <= width; i += 2) {
      const waveY = y + Math.sin(i * frequency) * amplitude;
      ctx.lineTo(x + i, waveY);
    }
    if (fill) {
      ctx.lineTo(x + width, y);
      ctx.closePath();
      ctx.fillStyle = '#000';
      ctx.fill();
    } else {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = strokeWidth;
      ctx.stroke();
    }
  };

  const prettify = (s) => {
    if (!s) return '';
    return String(s).replace(/[_-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const drawAutoLabel = (ctx, layer, props, type) => {
    const label = layer.label || props.label || prettify(layer.id);
    if (!label || type === 'text') return;

    let cx = props.x ?? 0;
    let cy = props.y ?? 0;
    let offsetX = 0;
    let offsetY = -6; // Default offset above the shape

    if (type === 'rectangle') {
      cx = props.x + (props.width || 0) / 2;
      cy = props.y + (props.height || 0) / 2;
      offsetY = -(props.height || 0) / 2 - 12; // Position above the rectangle
    }
    if (type === 'circle' || type === 'star' || type === 'polygon') {
      const radius = props.r || props.outerRadius || props.radius || 20;
      cx = props.x;
      cy = props.y;
      offsetY = -radius - 12; // Position above the circle/star/polygon
    }
    if (type === 'line') {
      cx = (props.x1 + props.x2) / 2;
      cy = (props.y1 + props.y2) / 2;
      offsetY = -8; // Position slightly above the line
    }
    if (type === 'arrow') {
      cx = props.x + (props.dx || 0) / 2;
      cy = props.y + (props.dy || 0) / 2;
      offsetY = -8; // Position slightly above the arrow
    }
    if (type === 'curve' && Array.isArray(props.points) && props.points.length) {
      const mid = props.points[Math.floor(props.points.length / 2)];
      cx = mid.x;
      cy = mid.y;
      offsetY = -8; // Position slightly above the curve
    }
    if (type === 'wave') {
      cx = props.x + (props.width || 200) / 2;
      cy = props.y;
      offsetY = - (props.amplitude || 20) - 12; // Position above the wave
    }

    ctx.save();
    ctx.fillStyle = '#000';
    ctx.font = `10px Inter`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(label, cx + offsetX, cy + offsetY);
    ctx.restore();
  };

  const drawArrow = (ctx, props) => {
    const { x, y, dx, dy, color = '#000', width = 2 } = props;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + dx, y + dy);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();

    const angle = Math.atan2(dy, dx);
    const arrowLength = 10;
    ctx.beginPath();
    ctx.moveTo(x + dx, y + dy);
    ctx.lineTo(
      x + dx - arrowLength * Math.cos(angle - Math.PI / 6),
      y + dy - arrowLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(x + dx, y + dy);
    ctx.lineTo(
      x + dx - arrowLength * Math.cos(angle + Math.PI / 6),
      y + dy - arrowLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
  };

  const drawText = (ctx, props) => {
    const { x, y, text, fontSize = 12, fill = '#000', fontFamily = 'Inter' } = props;
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = fill;
    ctx.fillText(text, x, y);
  };

  return (
    <div className="luxury-app">
      {/* Compact Header */}
      <header className="luxury-header">
        <div className="header-content">
          <Sparkles className="logo-icon" />
          <h1 className="app-title">AI Learning</h1>
        </div>
      </header>

      {/* Answer Section - Most Prominent */}
      {currentAnswer && (
        <section className="answer-section-main">
          <div className="answer-header">
            <h2>Answer</h2>
          </div>
          <div className="answer-content-main">
            <p>{currentAnswer.text}</p>
          </div>
        </section>
      )}

      <div className="main-content">
        {/* Visualization Section - Secondary */}
        <section className="visualization-section">
          {currentAnswer?.visualization ? (
            <div className="canvas-container">
              <canvas
                ref={canvasRef}
                width={900}
                height={600}
                className="visualization-canvas"
              />
              <div className="controls">
                <button onClick={handleRestart} className="control-btn restart-btn" title="Restart Animation">
                  <RotateCcw size={16} />
                </button>
                <button onClick={handlePlayPause} className="control-btn play-btn">
                  {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                </button>
                <div className="progress-container">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.min((currentTime / (currentAnswer.visualization.duration || 4000)) * 100, 100)}%`
                      }}
                    />
                  </div>
                  <span className="progress-text">
                    {Math.floor(currentTime / 1000)}s / {Math.floor((currentAnswer.visualization.duration || 4000) / 1000)}s
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <BookOpen size={48} />
              <h3>Ask a question to see a visualization</h3>
              <p>Try one of the examples below</p>
            </div>
          )}
        </section>

        {/* Input & Quick Actions */}
        <section className="input-section">
          {/* Question Input */}
          <form onSubmit={handleQuestionSubmit} className="question-form">
            <div className="input-group">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a scientific question..."
                disabled={isLoading}
                className="question-input"
              />
              <button
                type="submit"
                disabled={!question.trim() || isLoading}
                className="submit-btn"
              >
                {isLoading ? <Loader2 size={20} className="spin" /> : <Send size={20} />}
              </button>
            </div>
          </form>

          {/* Demo Questions - Compact */}
          <div className="demo-section">
            <div className="demo-grid">
              {demoQuestions.map((demo, index) => (
                <button
                  key={index}
                  onClick={() => handleDemoClick(demo)}
                  className="demo-btn"
                >
                  {demo}
                </button>
              ))}
            </div>
          </div>

          {/* Compact History */}
          {questions.length > 0 && (
            <div className="compact-history">
              <h4>Recent Questions</h4>
              <div className="history-list">
                {questions.slice(-3).map((q) => (
                  <div key={q.id} className="history-item">
                    <span className="history-text">{q.question}</span>
                    {q.answerId && (
                      <button
                        onClick={() => handleAnswerClick(q.answerId)}
                        className="history-btn"
                      >
                        View
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default UI;
