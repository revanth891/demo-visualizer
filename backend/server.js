const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize IO.net client
const client = new OpenAI({
    apiKey: process.env.IO_API_KEY,
    baseURL: "https://api.intelligence.io.solutions/api/v1/",
});

// In-memory storage (in production, use a database)
let questions = [];
let answers = [];
let questionCounter = 1;
let answerCounter = 1;

// SSE connections
let clients = [];

// LLM Service Function
async function generateExplanationAndVisualization(question) {
    try {
        const prompt = `You are an advanced educational AI that creates STUNNING, ELABORATE visualizations for scientific concepts. Create visually spectacular, large-scale animations that fill the entire canvas (800x600) with dramatic effects and multiple animated elements.

For the question: "${question}"

Create an ELABORATE, SPECTACULAR visualization with these requirements:

🎯 **VISUAL SCALE & IMPACT:**
- Use the FULL canvas: 700x450 pixels
- Create LARGE, impressive elements (50-100+ pixel sizes)
- Fill the canvas with 8-12 animated layers
- Use dramatic colors and effects: #00ffff, #ff00ff, #ffff00, #ff6600, #ff0000, #ffffff

🎨 **AVAILABLE SHAPE TYPES (use MULTIPLE types):**
- "circle" - with glow: true, gradient: true effects
- "rectangle" - with rounded: true, gradient: true
- "star" - glowing stars with outerRadius: 40-60
- "arrow" - gradient arrows with glow: true, width: 4-6
- "text" - large, bold text with glow: true, fontSize: 48-72, outline: true
- "particles" - particle systems (count: 40-60, radius: 120-180)
- "wave" - animated sine waves with fill gradients
- "explosion" - radiating explosion effects (particles: 16-24, radius: 80-120)
- "energy" - concentric energy rings (rings: 6-8, radius: 80-140)

✨ **ENHANCED VISUAL PROPERTIES:**
- glow: true for ALL major elements
- gradient: true for color transitions
- bold: true for text emphasis
- outline: true for text contrast
- Large scales: r: 40-80, width: 120-250, height: 60-120
- Bright, vibrant colors with high contrast

🎬 **ELABORATE ANIMATIONS:**
- duration: 10000-15000ms for spectacular impact
- Multiple animation phases with overlapping timing
- Complex easing: "bounce", "elastic", "back"
- Scale transformations (from: 0.5, to: 2.0)
- Rotation animations (from: 0, to: 6.28)
- Sequential layered animations

🌟 **SPECTACULAR COMPOSITION:**
- Background atmospheric effects (particles, energy fields)
- Central dramatic elements (large glowing objects)
- Dynamic supporting animations (waves, explosions)
- Multiple text layers with different sizes
- Particle effects and energy visualizations

EXAMPLE for Photosynthesis:
{
  "text": "Photosynthesis is the process by which plants convert light energy into chemical energy...",
  "visualization": {
    "id": "photosynthesis_spectacular",
    "duration": 10000,
    "fps": 30,
    "layers": [
      {
        "id": "sun_giant",
        "type": "circle",
        "props": { "x": 350, "y": 120, "r": 70, "fill": "#ffff00", "glow": true, "gradient": true },
        "animations": [
          { "property": "r", "from": 50, "to": 90, "start": 0, "end": 3000, "easing": "elastic" }
        ]
      },
      {
        "id": "energy_rings",
        "type": "energy",
        "props": { "x": 350, "y": 120, "radius": 100, "rings": 6, "color": "#00ffff" },
        "animations": [
          { "property": "radius", "from": 60, "to": 130, "start": 1000, "end": 5000, "easing": "bounce" }
        ]
      },
      {
        "id": "particles_sun",
        "type": "particles",
        "props": { "x": 350, "y": 120, "count": 40, "radius": 120, "colors": ["#ffff00", "#ff6600", "#00ffff", "#ffffff"] },
        "animations": []
      },
      {
        "id": "plant_large",
        "type": "rectangle",
        "props": { "x": 200, "y": 320, "width": 220, "height": 80, "fill": "#34c759", "rounded": true, "gradient": true },
        "animations": [
          { "property": "height", "from": 40, "to": 120, "start": 2000, "end": 6000, "easing": "back" }
        ]
      },
      {
        "id": "wave_energy",
        "type": "wave",
        "props": { "x": 50, "y": 300, "width": 500, "amplitude": 30, "stroke": "#00ff00", "strokeWidth": 4, "fill": "rgba(0,255,0,0.3)" },
        "animations": []
      },
      {
        "id": "explosion_energy",
        "type": "explosion",
        "props": { "x": 350, "y": 200, "radius": 80, "particles": 16, "colors": ["#ffff00", "#00ff00", "#ffffff", "#ff6600"] },
        "animations": [
          { "property": "radius", "from": 20, "to": 110, "start": 3000, "end": 7000, "easing": "bounce" }
        ]
      },
      {
        "id": "star_energy",
        "type": "star",
        "props": { "x": 550, "y": 160, "outerRadius": 40, "innerRadius": 20, "fill": "#ffff00", "glow": true },
        "animations": [
          { "property": "outerRadius", "from": 25, "to": 55, "start": 4000, "end": 8000, "easing": "elastic" }
        ]
      },
      {
        "id": "arrow_light",
        "type": "arrow",
        "props": { "x": 300, "y": 140, "dx": -80, "dy": -15, "color": "#ffff00", "width": 4, "glow": true },
        "animations": [
          { "property": "dx", "from": -40, "to": -120, "start": 1000, "end": 4000, "easing": "easeInOut" }
        ]
      },
      {
        "id": "title_text",
        "type": "text",
        "props": { "x": 350, "y": 60, "text": "PHOTOSYNTHESIS", "fontSize": 48, "fill": "#ffffff", "bold": true, "glow": true, "outline": true },
        "animations": [
          { "property": "fontSize", "from": 24, "to": 60, "start": 0, "end": 2500, "easing": "elastic" }
        ]
      },
      {
        "id": "subtitle_text",
        "type": "text",
        "props": { "x": 350, "y": 400, "text": "Light Energy → Chemical Energy", "fontSize": 24, "fill": "#00ffff", "bold": true, "glow": true },
        "animations": [
          { "property": "y", "from": 420, "to": 400, "start": 2000, "end": 4000, "easing": "bounce" }
        ]
      }
    ]
  }
}

⚠️ IMPORTANT: Respond with PURE JSON only, no markdown formatting!`;

        const response = await client.chat.completions.create({
            model: "meta-llama/Llama-3.3-70B-Instruct",
            messages: [
                {
                    role: "system",
                    content: "You are an educational AI that creates explanations with visualizations. Always respond with valid JSON containing 'text' and 'visualization' fields."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 2000
        });

        const content = response.choices[0].message.content;
        console.log('LLM Response:', content);

        // Try to parse as JSON, handle markdown code blocks
        try {
            let jsonContent = content;

            // Check if response is wrapped in markdown code blocks
            if (content.includes('```json')) {
                const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
                if (jsonMatch) {
                    jsonContent = jsonMatch[1].trim();
                }
            } else if (content.includes('```')) {
                const jsonMatch = content.match(/```\s*([\s\S]*?)\s*```/);
                if (jsonMatch) {
                    jsonContent = jsonMatch[1].trim();
                }
            }

            console.log('Extracted JSON content:', jsonContent);

            const parsed = JSON.parse(jsonContent);
            return parsed;
        } catch (parseError) {
            console.error('Failed to parse LLM response as JSON:', parseError);
            console.error('Original content:', content);

            // Try to extract any JSON-like content from the response
            const jsonPattern = /\{[\s\S]*\}/;
            const jsonMatch = content.match(jsonPattern);

            if (jsonMatch) {
                try {
                    const extractedJson = JSON.parse(jsonMatch[0]);
                    console.log('Successfully extracted JSON from content');
                    return extractedJson;
                } catch (extractError) {
                    console.error('Failed to extract JSON:', extractError);
                }
            }

            // Fallback response
            return {
                text: content || "I couldn't generate a proper response format, but here's what I have.",
                visualization: {
                    id: "fallback_vis",
                    duration: 2000,
                    fps: 30,
                    layers: [
                        {
                            id: "fallback_text",
                            type: "text",
                            props: { x: 100, y: 100, text: "Visualization", fontSize: 24, fill: "#333" },
                            animations: []
                        }
                    ]
                }
            };
        }
    } catch (error) {
        console.error('Error calling IO.net API:', error);
        throw error;
    }
}

// SSE endpoint
app.get('/api/stream', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
    });

    // Send initial connection message
    res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

    // Add client to list
    clients.push(res);

    // Remove client on disconnect
    req.on('close', () => {
        clients = clients.filter(client => client !== res);
    });
});

// Broadcast function for SSE
function broadcast(eventType, data) {
    clients.forEach(client => {
        client.write(`data: ${JSON.stringify({ type: eventType, ...data })}\n\n`);
    });
}

// POST /api/questions - Submit a question
app.post('/api/questions', async (req, res) => {
    try {
        const { userId, question } = req.body;

        if (!userId || !question) {
            return res.status(400).json({ error: 'userId and question are required' });
        }

        // Create question object
        const questionObj = {
            id: `q_${questionCounter++}`,
            userId,
            question,
            timestamp: new Date().toISOString()
        };

        // Save question
        questions.push(questionObj);

        // Broadcast question creation
        broadcast('question_created', { question: questionObj });

        // Generate explanation and visualization
        const llmResponse = await generateExplanationAndVisualization(question);

        // Create answer object
        const answerObj = {
            id: `a_${answerCounter++}`,
            questionId: questionObj.id,
            text: llmResponse.text,
            visualization: llmResponse.visualization,
            timestamp: new Date().toISOString()
        };

        // Save answer
        answers.push(answerObj);

        // Broadcast answer creation
        broadcast('answer_created', { answer: answerObj });

        res.json({
            questionId: questionObj.id,
            answerId: answerObj.id
        });

    } catch (error) {
        console.error('Error processing question:', error);
        res.status(500).json({ error: 'Failed to process question' });
    }
});

// GET /api/questions - Fetch all questions
app.get('/api/questions', (req, res) => {
    res.json(questions.map(q => ({
        id: q.id,
        userId: q.userId,
        question: q.question,
        answerId: answers.find(a => a.questionId === q.id)?.id
    })));
});

// GET /api/answers/:id - Fetch answer by ID
app.get('/api/answers/:id', (req, res) => {
    const answer = answers.find(a => a.id === req.params.id);
    if (!answer) {
        return res.status(404).json({ error: 'Answer not found' });
    }
    res.json(answer);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
