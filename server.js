import express from 'express';
import cors from 'cors';
import path from 'path';
const app = express();
const PORT = process.env.PORT || 3000;

// =====================
// CORS CONFIGURATION
// =====================
const corsOptions = {
  origin: function(origin, callback) {
    // Allowed origins for local development
   const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5500',
  'https://tfg-demo-project.onrender.com'
];
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS policy'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 3600 // 1 hour cache for preflight
};

// =====================
// MIDDLEWARE
// =====================
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(path.resolve()));
// Serve WebGL build files statically
app.use('/webgl', express.static('webgl'));

// =====================
// IN-MEMORY STORAGE
// =====================
let users = [];
let employees = []; // Employee records for VR training

// =====================
// MODULE DATA
// =====================
const STATIC_MODULES = [
  {
    "_id": "6920a2eda37e548ad7b21444",
    "title": "Leadership & Management",
    "description": "Build essential leadership qualities.",
    "thumbnailUrl": "",
    "type": "WEB",
    "duration": "30 mins",
    "submodules": [
      {"title":"Module 1 : EQ based Leadership","submoduleId":"698c6e71e8ad60a12303754a","_id":"698c6e71e8ad60a12303754a"},
      {"title":"Module 2 : Decision Making","submoduleId":"698c6e71e8ad60a12303754b","_id":"698c6e71e8ad60a12303754b"},
      {"title":"Module 3 : Crisis Management","submoduleId":"698c6e71e8ad60a12303754c","_id":"698c6e71e8ad60a12303754c"},
      {"title":"Module 4 : Critical Thinking","submoduleId":"698c6e71e8ad60a12303754d","_id":"698c6e71e8ad60a12303754d"},
      {"title":"Module 5 : Problem Solving","submoduleId":"698c6e71e8ad60a12303754e","_id":"698c6e71e8ad60a12303754e"},
      {"title":"Module 6 : Leading teams","submoduleId":"698c6e71e8ad60a12303754f","_id":"698c6e71e8ad60a12303754f"},
      {"title":"Module 7 : Setting performance goals, giving feedback","submoduleId":"698c6e71e8ad60a123037550","_id":"698c6e71e8ad60a123037550"}
    ],
    "totalLessons": 5,
    "__v": 0,
    "updatedAt": "2026-02-11T11:56:33.457Z"
  },
  {
    "_id": "6920a2eda37e548ad7b21445",
    "title": "Innovation",
    "description": "Sharpen your strategic mindset.",
    "thumbnailUrl": "",
    "type": "WEB",
    "duration": "45 mins",
    "submodules": [
      {"title":"Module 1 : Strategic Thinking","submoduleId":"698c6e71e8ad60a123037559","_id":"698c6e71e8ad60a123037559"},
      {"title":"Module 2 : Design thinking-based Ideation","submoduleId":"698c6e71e8ad60a12303755a","_id":"698c6e71e8ad60a12303755a"},
      {"title":"Module 3 : Effective Meeting Skills","submoduleId":"698c6e71e8ad60a12303755b","_id":"698c6e71e8ad60a12303755b"}
    ],
    "totalLessons": 3,
    "__v": 0,
    "updatedAt": "2026-02-11T11:56:33.588Z"
  },
  {
    "_id": "6920a2eda37e548ad7b21446",
    "title": "Sales Excellence",
    "description": "Master the art of selling.",
    "thumbnailUrl": "",
    "type": "WEB",
    "duration": "60 mins",
    "submodules": [
      {"title":"Module 1 : Virtual Sales","submoduleId":"698c6e71e8ad60a123037560","_id":"698c6e71e8ad60a123037560"},
      {"title":"Module 2 : Presentation Skills","submoduleId":"698c6e71e8ad60a123037561","_id":"698c6e71e8ad60a123037561"},
      {"title":"Module 3 : Closing Skills","submoduleId":"698c6e71e8ad60a123037562","_id":"698c6e71e8ad60a123037562"},
      {"title":"Module 4 : Negotiation Skills","submoduleId":"698c6e71e8ad60a123037563","_id":"698c6e71e8ad60a123037563"},
      {"title":"Module 5 : Selling Skills","submoduleId":"698c6e71e8ad60a123037564","_id":"698c6e71e8ad60a123037564"},
      {"title":"Module 6 : Performance review conversation","submoduleId":"698c6e71e8ad60a123037565","_id":"698c6e71e8ad60a123037565"}
    ],
    "totalLessons": 8,
    "__v": 0,
    "updatedAt": "2026-02-11T11:56:33.690Z"
  }
];

// =====================
// UTILITY FUNCTIONS
// =====================
const generateId = () => Math.random().toString(36).substr(2, 9);
const generateToken = () => `DUMMY_TOKEN_${Date.now()}_${Math.random().toString(36).substring(2,10).toUpperCase()}`;
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ success: false, message: "Invalid email or password" });

  user.token = generateToken();
  const { password: _, ...userResponse } = user;
  res.status(200).json({ success: true, data: userResponse });
});

app.post('/auth/logout', (req, res) => res.status(200).json({ success: true, message: "Logged out successfully" }));

// =====================
// MODULE ENDPOINTS (MATCH UNITY FORMAT)
// =====================

// GET ALL MODULES
app.get('/modules', (req, res) => {
  res.status(200).json(STATIC_MODULES); // Unity expects raw array
});

// GET MODULE BY ID
app.get('/modules/:id', (req, res) => {
  const module = STATIC_MODULES.find(m => m._id === req.params.id);
  if (!module) return res.status(404).json({ success: false, message: "Module not found" });
  res.status(200).json({ success: true, data: module });
});

// =====================
// API PROXY (for production server)
// =====================
// This proxies requests to the production API, allowing the WebGL build
// (which has hardcoded production URLs) to work with proper CORS
app.get('/api/modules', async (req, res) => {
  try {
    const BASE_URL = `https://tfg-demo-project.onrender.com`;
    const productionUrl = `${BASE_URL}/modules`;
    
    console.log(`🔄 Proxying request to: ${productionUrl}`);
    
    const response = await fetch(productionUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      return res.status(response.status).json({ success: false, message: "Failed to fetch modules" });
    }
    
    const data = await response.json();
    
    // Return with proper CORS headers (already set by corsOptions middleware)
    res.status(200).json(data);
    
  } catch (error) {
    console.error('❌ Proxy error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Proxy request failed', 
      error: error.message 
    });
  }
});

// Catch-all proxy for other /api/* paths
app.get('/api/*', async (req, res) => {
  try {
    const path = req.path.replace('/api/', ''); // Remove /api/ prefix
    const BASE_URL = `https://tfg-demo-project.onrender.com`;
    const productionUrl = `${BASE_URL}/${path}`;
    
    console.log(`🔄 Proxying request to: ${productionUrl}`);
    
    const response = await fetch(productionUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    res.status(response.status).json(data);
    
  } catch (error) {
    console.error('❌ Proxy error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Proxy request failed', 
      error: error.message 
    });
  }
});

// =====================
// HEALTH CHECK
// =====================
app.get('/health', (req, res) => res.status(200).json({ success: true, message: "API is running", timestamp: new Date().toISOString() }));
// ✅ ROOT ROUTE (ADD THIS)
app.get('/', (req, res) => {
  res.sendFile(path.resolve('index.html'));
});
// =====================
// ERROR & 404 HANDLERS
// =====================
app.use((req, res) => res.status(404).json({ success: false, message: "Endpoint not found" }));
app.get('/', (req, res) => {
  res.sendFile(path.resolve('index.html'));
});
app.use((err, req, res, next) => res.status(500).json({ success: false, message: "Internal server error", error: err.message }));

// =====================
// START SERVER
// =====================
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));

export default app;