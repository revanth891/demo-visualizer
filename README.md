# 🚀 AI Chat-to-Visualization App

A cutting-edge educational application that transforms scientific concepts into stunning interactive visualizations using advanced AI. Experience the future of learning with beautiful glass-morphism UI, smooth animations, and real-time AI-generated explanations.

## ✨ Features

- **🎨 Modern Glass-Morphism UI**: Beautiful transparent design with animated gradients
- **🎯 Interactive Demo System**: Auto-play through 5+ scientific concepts with progress tracking
- **🎭 Advanced Animations**: 8+ shape types with easing, rotation, scaling, and color interpolation
- **⚡ Real-time Updates**: Server-Sent Events for instant responses
- **🎪 Enhanced Visualizations**: Stars, polygons, waves, particles, and curves with glow effects
- **🎮 Play/Pause Controls**: Full control over animation playback with visual feedback
- **📱 Responsive Design**: Works perfectly on desktop and mobile devices
- **🧠 AI-Powered**: IO.net integration with advanced LLMs for intelligent explanations

## 🛠️ Tech Stack

- **Backend**: Node.js + Express + CORS
- **Frontend**: React + Vite + Modern CSS (Glass-morphism)
- **AI**: IO.net API (Llama-3.3-70B-Instruct)
- **Real-time**: Server-Sent Events (SSE)
- **Visualization**: HTML5 Canvas + Advanced Animation Engine
- **UI Framework**: Custom Glass-morphism with CSS Variables
- **Fonts**: Inter (Google Fonts) for modern typography

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- IO.net API key

### 1. Clone and Setup Backend

```bash
cd backend
npm install
```

### 2. Configure API Key

Edit `backend/.env` and replace with your actual IO.net API key:

```
IO_API_KEY=your_actual_api_key_here
```

### 3. Setup Frontend

```bash
cd ../frontend
npm install
```

### 4. Run the Application

#### Terminal 1 - Backend
```bash
cd backend
npm start
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## API Endpoints

### POST /api/questions
Submit a new question for explanation and visualization.

**Request:**
```json
{
  "userId": "u1",
  "question": "Explain Newton's First Law of Motion"
}
```

**Response:**
```json
{
  "questionId": "q_123",
  "answerId": "a_456"
}
```

### GET /api/questions
Fetch all questions and their associated answers.

### GET /api/answers/:id
Fetch detailed answer with text explanation and visualization spec.

### GET /api/stream
Server-Sent Events endpoint for real-time updates.

## 🎯 Interactive Demo System

The app includes a built-in demo system with 5 pre-configured scientific concepts:

### 📚 Available Demos

1. **⚖️ Newton's First Law** - An object at rest stays at rest, and an object in motion stays in motion
2. **🌱 Photosynthesis** - The process by which plants convert light energy into chemical energy
3. **☀️ Solar System** - Our solar system consists of the Sun and all objects that orbit it
4. **🌍 Gravity** - The force that attracts objects with mass towards each other
5. **💧 Water Cycle** - The continuous movement of water through evaporation, condensation, and precipitation

### 🎮 Demo Features

- **Auto-Play Mode**: Automatically cycle through all demos with progress tracking
- **Manual Navigation**: Click any demo card to explore specific concepts
- **Visual Progress**: Real-time progress bars and status indicators
- **Seamless Integration**: Works with the same AI system as custom questions

## 🎨 Enhanced Visualization System

The AI generates sophisticated visualizations with 8+ shape types and advanced animations:

### 🎭 Supported Shape Types

- **circle** - Circles with optional glow effects
- **rectangle** - Rectangles with rounded corners
- **polygon** - Regular polygons (triangle, hexagon, etc.)
- **star** - Stars with customizable points
- **arrow** - Directional arrows
- **line** - Lines with dashed patterns
- **curve** - Smooth curves through points
- **text** - Animated text with font customization
- **particle** - Glowing particles with effects
- **wave** - Sinusoidal waves with fill options

### 🎬 Advanced Animation Features

- **Easing Functions**: easeIn, easeOut, easeInOut, bounce, elastic, back
- **Animation Types**: orbit, bounce, pulse, fade, rotate, color interpolation
- **Transformations**: scale, rotation, opacity, position
- **Advanced Properties**: glow effects, dashed lines, gradients

### 📊 Example Visualization Spec

```json
{
  "id": "vis_001",
  "duration": 6000,
  "fps": 30,
  "layers": [
    {
      "id": "sun",
      "type": "circle",
      "props": {
        "x": 300, "y": 300, "r": 40,
        "fill": "#f39c12", "glow": true
      },
      "animations": []
    },
    {
      "id": "earth",
      "type": "circle",
      "props": {
        "x": 200, "y": 300, "r": 15,
        "fill": "#3498db"
      },
      "animations": [
        {
          "property": "x",
          "from": 200, "to": 400,
          "start": 0, "end": 6000,
          "easing": "easeInOut",
          "type": "orbit"
        }
      ]
    }
  ]
}
```

## Architecture

### Backend Flow
1. Receive question via POST /api/questions
2. Generate explanation + visualization using IO.net API
3. Store question and answer in memory
4. Broadcast updates via SSE

### Frontend Flow
1. User submits question
2. Listen for real-time updates via EventSource
3. Render visualization on canvas with animations
4. Display Q&A history

## Development Notes

- The backend uses in-memory storage (replace with database for production)
- Visualizations are rendered using HTML5 Canvas with requestAnimationFrame
- SSE provides real-time updates without WebSocket complexity
- The IO.net API is OpenAI-compatible, making it easy to integrate

## License

MIT License
