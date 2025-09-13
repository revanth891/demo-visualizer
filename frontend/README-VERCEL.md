# Vercel Deployment Setup

This project has been configured for Vercel deployment with integrated API routes.

## Environment Variables

You need to set the following environment variable in your Vercel project:

- `IO_API_KEY`: Your IO.net API key

## Deployment Steps

1. **Set Environment Variables**:
   - Go to your Vercel project dashboard
   - Navigate to Settings → Environment Variables
   - Add `IO_API_KEY` with your API key value

2. **Deploy**:
   - Push your code to GitHub
   - Connect your repository to Vercel
   - Vercel will automatically detect the configuration and deploy

## API Routes

The following API endpoints are available:

- `GET /api/questions` - Fetch all questions
- `POST /api/questions` - Submit a new question
- `GET /api/answers/[id]` - Fetch answer by ID
- `GET /api/stream` - Server-sent events for real-time updates

## Development

For local development, you can still run the backend separately:

```bash
cd backend
npm install
npm start
```

Then in the frontend directory:

```bash
npm install
npm run dev
```

## Configuration Files

- `vercel.json` - Vercel deployment configuration
- `api/` - Vercel serverless functions
- `vite.config.js` - Updated for both dev and production
