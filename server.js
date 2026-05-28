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

// CORS MUST come before routes
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
// Serve static files from root directory
app.use(express.static(path.resolve()));

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

// =====================
// IN-MEMORY USER STORAGE
// =====================
let users = [
  { 
    _id: 'test_user_001', 
    name: 'Test User', 
    email: 'test@example.com', 
    password: 'test123', 
    avatarUrl: '', 
    role: 'user', 
    token: 'PERSISTENT_TEST_TOKEN_001' 
  }
];

const generateId = () => Math.random().toString(36).substr(2, 9);
const generateToken = () => `TOKEN_${Date.now()}_${Math.random().toString(36).substring(2,10).toUpperCase()}`;
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const extractAuthToken = (authHeader) => {
  if (!authHeader || typeof authHeader !== 'string') return null;
  const trimmed = authHeader.trim();
  return trimmed.replace(/^bearer\s+/i, '').trim() || null;
};

// =====================
// AUTH ENDPOINTS
// =====================
app.post('/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ success: false, message: "Name, email, and password required" });
  if (!validateEmail(email)) return res.status(400).json({ success: false, message: "Invalid email" });
  if (users.find(u => u.email === email)) return res.status(400).json({ success: false, message: "User already exists" });

  const newUser = { _id: generateId(), name, email, password, avatarUrl: "", role: "user", token: generateToken() };
  users.push(newUser);
  const { password: _, ...userResponse } = newUser;
  res.status(201).json({ success: true, data: userResponse });
});

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: "Email and password required" });
  
  let user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    user = { 
      _id: generateId(), 
      name: email.split('@')[0], 
      email, 
      password, 
      avatarUrl: '', 
      role: 'user', 
      token: null 
    };
    users.push(user);
  }

  user.token = generateToken();
  const { password: _, ...userResponse } = user;
  res.status(200).json({ success: true, data: userResponse });
});

app.post('/auth/logout', (req, res) => res.status(200).json({ success: true, message: "Logged out successfully" }));

app.get('/users/me', (req, res) => {
  const token = extractAuthToken(req.headers.authorization);
  if (!token) return res.status(401).json({ success: false, message: "Authorization token required" });
  
  const user = users.find(u => u.token === token);
  if (!user) return res.status(401).json({ success: false, message: "Invalid or expired token" });
  
  const { password: _, ...userResponse } = user;
  res.status(200).json({ success: true, data: userResponse });
});

// =====================
// GROQ API ENDPOINTS
// =====================

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
