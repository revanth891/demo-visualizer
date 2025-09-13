// In-memory storage (shared across functions)
let answers = [];

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    const { id } = req.query;
    const answer = answers.find(a => a.id === id);

    if (!answer) {
      return res.status(404).json({ error: 'Answer not found' });
    }

    res.status(200).json(answer);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
