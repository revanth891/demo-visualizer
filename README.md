# 🚀 AI Chat-to-Visualization App

A cool app that turns science concepts into awesome interactive visuals using AI! It has a sleek glass-morphism UI, smooth animations, and real-time AI explanations to make learning fun.

## ✨ Features

- **🎨 Glass-Morphism UI**: Transparent, modern design with colorful gradients
- **🎯 Interactive Demos**: Auto-play 5 science topics with progress bars
- **🎭 Animations**: 8+ shapes with cool effects like rotation and glow
- **⚡ Real-Time Updates**: Instant responses with Server-Sent Events
- **🎮 Play/Pause Controls**: Control animations with visual feedback
- **📱 Responsive**: Works great on phones and computers
- **🧠 AI-Powered**: Uses IO.net API for smart explanations

## 🛠️ Tech Used

- **Backend**: Node.js + Express
- **Frontend**: React + Vite + Modern CSS
- **AI**: IO.net API (Llama-3.3-70B-Instruct)
- **Real-Time**: Server-Sent Events (SSE)
- **Visuals**: HTML5 Canvas
- **Fonts**: Inter (Google Fonts)

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- npm or yarn
- IO.net API key

### 1. Backend Setup
```bash
cd backend
npm install
```

### 2. Add API Key
Edit `backend/.env`:
```
IO_API_KEY=your_api_key
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

### 4. Run the App
**Backend** (Terminal 1):
```bash
cd backend
npm start
```

**Frontend** (Terminal 2):
```bash
cd frontend
npm run dev
```

Visit:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## API Endpoints

- **POST /api/questions**: Submit a question (e.g., "Explain Newton's First Law")
- **GET /api/questions**: Get all questions and answers
- **GET /api/answers/:id**: Get answer with explanation and visuals
- **GET /api/stream**: Real-time updates via SSE

## 🎯 Demo System

Explore 5 pre-built science demos:
1. **⚖️ Newton's First Law**: Objects stay at rest or in motion
2. **🌱 Photosynthesis**: Plants turn light into energy
3. **☀️ Solar System**: Sun and orbiting planets
4. **🌍 Gravity**: Force pulling objects together
5. **💧 Water Cycle**: Water’s movement through nature

**Demo Features**:
- Auto-play with progress tracking
- Click to explore specific topics
- Smooth integration with AI

## 🎨 Visualizations

AI creates visuals with 8+ shapes like circles, stars, and waves, plus animations like orbiting, scaling, and glowing effects.

### Example Visualization
```json
{
  "id": "vis_001",
  "duration": 6000,
  "layers": [
    {
      "id": "sun",
      "type": "circle",
      "props": { "x": 300, "y": 300, "r": 40, "fill": "#f39c12", "glow": true }
    },
    {
      "id": "earth",
      "type": "circle",
      "props": { "x": 200, "y": 300, "r": 15, "fill": "#3498db" },
      "animations": [
        { "property": "x", "from": 200, "to": 400, "start": 0, "end": 6000, "easing": "easeInOut", "type": "orbit" }
      ]
    }
  ]
}
```

## How It Works

- **Backend**: Takes questions, uses IO.net API for answers and visuals, stores data in memory, sends updates via SSE
- **Frontend**: Sends questions, shows visuals on canvas, updates in real-time

## Notes

- Uses in-memory storage (use a database for production)
- Visuals rendered with HTML5 Canvas
- SSE for real-time updates
- IO.net API is easy to use (OpenAI-compatible)

## License
MIT License
