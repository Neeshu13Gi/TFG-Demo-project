import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import path from 'path';

// Load local .env values during development.
// Render will supply GROQ_API_KEY from its environment variables.
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

const allowedOrigins = [
  'http://localhost:3000',
  'https://neeshu13gi.github.io'
];

// Serve static files from root directory
app.use(express.static(path.resolve()));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS policy does not allow this origin'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const ensureGroqApiKey = () => {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured in environment variables');
  }
  return GROQ_API_KEY;
};

const requestGroqChatCompletion = async (payload) => {
  const apiKey = ensureGroqApiKey();
  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    payload,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    }
  );
  return response.data;
};

const createGroqPayload = (body, defaultMaxTokens = 400) => {
  const messages = body.messages || (body.prompt ? [{ role: 'user', content: body.prompt }] : []);
  if (!messages.length) {
    throw new Error('Request body must include prompt or messages');
  }

  return {
    model: body.model || 'gpt-4o-mini',
    messages,
    max_tokens: body.max_tokens || defaultMaxTokens,
    temperature: typeof body.temperature === 'number' ? body.temperature : 0.7,
    top_p: typeof body.top_p === 'number' ? body.top_p : 0.95
  };
};

app.post('/suggestion', async (req, res) => {
  try {
    const payload = createGroqPayload(req.body, 300);
    const result = await requestGroqChatCompletion(payload);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Suggestion endpoint error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Unable to generate suggestion',
      error: error.message
    });
  }
});

app.post('/report', async (req, res) => {
  try {
    const payload = createGroqPayload(req.body, 500);
    const result = await requestGroqChatCompletion(payload);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Report endpoint error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Unable to generate report',
      error: error.message
    });
  }
});

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    environment: process.env.NODE_ENV || 'development'
  });
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  console.log(`Render endpoints:`);
  console.log(`  POST https://tfg-demo-project.onrender.com/suggestion`);
  console.log(`  POST https://tfg-demo-project.onrender.com/report`);
});
