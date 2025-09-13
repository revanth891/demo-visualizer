const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware


app.use(express.json({ limit: "50mb" }));
app.use(cors({ origin: true, credentials: true }));


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
        const prompt = `You are an educational AI that explains concepts with both text and visualizations. Be elaborate and detailed. Mention every element of the list if there is one.
For the question: "${question}"

Please respond with a JSON object containing:
1. "text": A clear, simple explanation (2-3 sentences)
2. "visualization": A JSON specification for animating the concept

The visualization should include:
- id: unique identifier
- duration: animation duration in milliseconds (3000-6000 recommended)
- fps: frames per second (30 recommended)
- layers: array of visual elements with animations

Each layer should have:
- id: unique identifier
- type: one of "circle", "rectangle", "polygon", "star", "arrow", "line", "curve", "text", "particle", "wave"
- props: visual properties using these exact names:
  - For circles: { "x", "y", "r" (not radius), "fill", "stroke", "strokeWidth" }
  - For rectangles: { "x", "y", "width", "height", "fill", "stroke", "strokeWidth" }
  - For text: { "x", "y", "text", "fontSize", "fill", "fontFamily" }
  - For arrows: { "x", "y", "dx", "dy", "color", "width" }
  - For lines: { "x1", "y1", "x2", "y2", "stroke", "strokeWidth", "dash" }
- animations: array of animation objects with:
  - property: the prop to animate
  - from: starting value
  - to: ending value
  - start: start time in ms
  - end: end time in ms
  - easing: "easeIn", "easeOut", "easeInOut", "bounce", "elastic", "back"
  - type: "linear", "orbit", "bounce", "pulse", "fade", "rotate", "color"

IMPORTANT RENDERING RULES (strict):
1) Black & White only. Use only "#000" black fills and strokes on a white canvas.
2) Name your layers with meaningful ids and optional label field to clarify elements. For photosynthesis, use ids/labels like "leaf", "sun", "water", "air", "glucose", "oxygen", "roots", "soil", etc.
3) Prefer filled black shapes with black outlines. No colors other than black.
4) Use "fill" for fill color and "stroke" for stroke color. Do not use "color" except in arrows' width/color fields which will be coerced.
5) Use "r" for circle radius, not "radius", always keep "r" less than "50" and more than "10".
6) Respond with pure JSON only, no markdown formatting.

Example response format:
{
  "text": "Newton's First Law states that an object will remain at rest or in uniform motion unless acted upon by an external force.",
  "visualization": {
    "id": "newtons_law_vis",
    "duration": 4000,
    "fps": 30,
    "layers": [
      {
        "id": "ball",
        "type": "circle",
        "props": { "x": 100, "y": 200, "r": 20, "fill": "#3498db" },
        "animations": [
          { "property": "x", "from": 100, "to": 400, "start": 0, "end": 3000, "easing": "easeInOut" }
        ]
      },
      {
        "id": "force_arrow",
        "type": "arrow",
        "props": { "x": 90, "y": 200, "dx": 30, "dy": 0, "color": "#e74c3c", "width": 3 },
        "animations": []
      }
    ]
  }
}`;

        const response = await client.chat.completions.create({
            // model: "openai/gpt-oss-120b",
            model: "meta-llama/Llama-3.3-70B-Instruct",
            // model: "Qwen/Qwen3-235B-A22B-Thinking-2507",
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
                            props: { x: 100, y: 100, text: "Visualization", fontSize: 14, fill: "#333" },
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
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});

module.exports = app;
