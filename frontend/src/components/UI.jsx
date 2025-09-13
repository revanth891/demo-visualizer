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

  // Demo questions - spectacular scientific concepts
  const demoQuestions = [
    "Explain Newton's First Law of Motion",
    "What is photosynthesis?",
    "Describe the Solar System",
    "How does gravity work?",
    "Explain the water cycle",
    "What is nuclear fission?",
    "Explain how volcanoes erupt",
    "Describe the process of evolution",
    "How does the human heart work?",
    "Explain climate change",
    "What is the speed of light?",
    "How do rockets work?",
    "What is the periodic table?",
    "Explain how vaccines work",
    "What is dark matter?",
    "How do earthquakes happen?",
    "What is the solar system?",
    "Explain how computers work",
    "What is the theory of relativity?",
    "How do airplanes fly?",
    "What is the human brain?",
    "Explain how plants grow",
    "What is nuclear fusion?"
  ];

  // Load questions on mount
  useEffect(() => {
    fetchQuestions();
  }, []);

  // SSE connection
  useEffect(() => {
    const eventSource = new EventSource('http://localhost:3001/api/stream');
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'question_created') {
        setQuestions(prev => [...prev, data.question]);
      } else if (data.type === 'answer_created') {
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
    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;

      const elapsed = timestamp - startTimeRef.current;
      const duration = currentAnswer.visualization.duration || 4000;
      const progress = Math.min(elapsed / duration, 1);

      setCurrentTime(elapsed);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      currentAnswer.visualization.layers?.forEach(layer => {
        drawLayer(ctx, layer, progress, elapsed);
      });

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

  const fetchQuestions = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/questions');
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
      const response = await fetch('http://localhost:3001/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, question: question.trim() }),
      });
      setQuestion('');
    } catch (error) {
      console.error('Error submitting question:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerClick = async (answerId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/answers/${answerId}`);
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

  const handleDemoClick = (demoQuestion) => {
    setQuestion(demoQuestion);
    handleQuestionSubmit({ preventDefault: () => {} });
  };

  // Drawing functions
  const drawLayer = (ctx, layer, progress, elapsed) => {
    const { type, props, animations = [] } = layer;
    const normalizedProps = normalizeProps(props);
    const currentProps = applyAnimations(normalizedProps, animations, elapsed);

    switch (type) {
      case 'circle':
        drawCircle(ctx, currentProps);
        break;
      case 'rectangle':
        drawRectangle(ctx, currentProps);
        break;
      case 'arrow':
        drawArrow(ctx, currentProps);
        break;
      case 'text':
        drawText(ctx, currentProps);
        break;
      case 'star':
        drawStar(ctx, currentProps);
        break;
      case 'particles':
        drawParticleSystem(ctx, currentProps);
        break;
      case 'wave':
        drawWave(ctx, currentProps);
        break;
      case 'explosion':
        drawExplosion(ctx, currentProps);
        break;
      case 'energy':
        drawEnergyField(ctx, currentProps);
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
    const { x, y, r, fill, stroke, strokeWidth = 1, glow = false, gradient = false } = props;

    ctx.save();

    if (glow) {
      // Add glow effect
      ctx.shadowColor = fill || stroke || '#ffffff';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }

    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);

    if (gradient && fill) {
      // Create radial gradient
      const gradientFill = ctx.createRadialGradient(x, y, 0, x, y, r);
      gradientFill.addColorStop(0, fill);
      gradientFill.addColorStop(0.7, fill + '80');
      gradientFill.addColorStop(1, fill + '40');
      ctx.fillStyle = gradientFill;
    } else if (fill) {
      ctx.fillStyle = fill;
    }

    if (fill) ctx.fill();

    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = strokeWidth;
      ctx.stroke();
    }

    ctx.restore();
  };

  const drawRectangle = (ctx, props) => {
    const { x, y, width, height, fill, stroke, strokeWidth = 1, glow = false, rounded = false, gradient = false } = props;

    ctx.save();

    if (glow) {
      ctx.shadowColor = fill || stroke || '#ffffff';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }

    if (rounded) {
      // Draw rounded rectangle
      const radius = Math.min(width, height) * 0.1;
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, radius);
    } else {
      ctx.beginPath();
      ctx.rect(x, y, width, height);
    }

    if (gradient && fill) {
      // Create linear gradient
      const gradientFill = ctx.createLinearGradient(x, y, x + width, y + height);
      gradientFill.addColorStop(0, fill);
      gradientFill.addColorStop(0.5, fill + 'CC');
      gradientFill.addColorStop(1, fill + '80');
      ctx.fillStyle = gradientFill;
    } else if (fill) {
      ctx.fillStyle = fill;
    }

    if (fill) ctx.fill();

    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = strokeWidth;
      ctx.stroke();
    }

    ctx.restore();
  };

  const drawArrow = (ctx, props) => {
    const { x, y, dx, dy, color = '#ffffff', width = 3, glow = false, animated = false } = props;

    ctx.save();

    if (glow) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }

    // Draw main line with gradient
    const gradient = ctx.createLinearGradient(x, y, x + dx, y + dy);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, color + '80');

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + dx, y + dy);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = width;
    ctx.stroke();

    // Draw arrowhead
    const angle = Math.atan2(dy, dx);
    const arrowLength = Math.max(15, Math.sqrt(dx * dx + dy * dy) * 0.15);

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

    ctx.restore();
  };

  const drawText = (ctx, props) => {
    const { x, y, text, fontSize = 24, fill = '#ffffff', fontFamily = 'Inter', glow = false, bold = false, italic = false, outline = false } = props;

    ctx.save();

    // Build font string
    let fontStyle = '';
    if (italic) fontStyle += 'italic ';
    if (bold) fontStyle += 'bold ';
    fontStyle += `${fontSize}px ${fontFamily}`;

    ctx.font = fontStyle;

    if (glow) {
      ctx.shadowColor = fill;
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }

    // Draw outline if requested
    if (outline) {
      ctx.strokeStyle = fill === '#ffffff' ? '#000000' : '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeText(text, x, y);
    }

    // Draw main text
    ctx.fillStyle = fill;
    ctx.fillText(text, x, y);

    ctx.restore();
  };

  const drawStar = (ctx, props) => {
    const { x, y, outerRadius = 30, innerRadius = 15, points = 5, fill = '#ffff00', glow = true } = props;

    ctx.save();

    if (glow) {
      ctx.shadowColor = fill;
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }

    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();

    ctx.fillStyle = fill;
    ctx.fill();

    ctx.restore();
  };

  const drawParticleSystem = (ctx, props) => {
    const { x, y, count = 20, radius = 100, colors = ['#ffffff', '#00ffff', '#ff00ff', '#ffff00'] } = props;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const distance = Math.random() * radius;
      const px = x + Math.cos(angle) * distance;
      const py = y + Math.sin(angle) * distance;
      const size = Math.random() * 3 + 1;
      const color = colors[Math.floor(Math.random() * colors.length)];

      ctx.save();
      ctx.globalAlpha = Math.random() * 0.8 + 0.2;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  };

  const drawWave = (ctx, props) => {
    const { x, y, width = 400, amplitude = 30, frequency = 0.02, stroke = '#00ffff', strokeWidth = 3, fill = null } = props;

    ctx.save();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth;

    ctx.beginPath();
    ctx.moveTo(x, y);

    for (let i = 0; i <= width; i += 2) {
      const waveY = y + Math.sin(i * frequency) * amplitude * Math.sin(Date.now() * 0.005);
      ctx.lineTo(x + i, waveY);
    }

    if (fill) {
      ctx.lineTo(x + width, y + amplitude * 2);
      ctx.lineTo(x, y + amplitude * 2);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
    } else {
      ctx.stroke();
    }

    ctx.restore();
  };

  const drawExplosion = (ctx, props) => {
    const { x, y, radius = 50, particles = 12, colors = ['#ff0000', '#ff6600', '#ffff00', '#ffffff'] } = props;

    for (let i = 0; i < particles; i++) {
      const angle = (i / particles) * Math.PI * 2;
      const distance = Math.random() * radius;
      const px = x + Math.cos(angle) * distance;
      const py = y + Math.sin(angle) * distance;

      ctx.save();
      ctx.strokeStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.lineWidth = Math.random() * 3 + 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(px, py);
      ctx.stroke();
      ctx.restore();
    }
  };

  const drawEnergyField = (ctx, props) => {
    const { x, y, radius = 60, rings = 3, color = '#00ffff' } = props;

    for (let r = 0; r < rings; r++) {
      const ringRadius = radius * (1 - r * 0.2);
      const opacity = 0.8 - r * 0.2;

      ctx.save();
      ctx.strokeStyle = color;
      ctx.globalAlpha = opacity;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
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
                width={700}
                height={450}
                className="visualization-canvas"
              />
              <div className="controls">
                <button onClick={handlePlayPause} className="control-btn">
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min((currentTime / (currentAnswer.visualization.duration || 4000)) * 100, 100)}%`
                    }}
                  />
                </div>
                <span className="progress-text">
                  {Math.round((currentTime / (currentAnswer.visualization.duration || 4000)) * 100)}%
                </span>
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
