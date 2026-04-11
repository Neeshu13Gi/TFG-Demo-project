import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';

// =====================
// ENVIRONMENT SETUP
// =====================
dotenv.config(); // Load variables from .env file

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
// Pre-populate with a test user for development
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
let employees = []; // Employee records for VR training
let reports = []; // Training reports storage

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
  
  let user = users.find(u => u.email === email && u.password === password);
  
  // Auto-create user on first login (for development/demo)
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

// =====================
// USER ENDPOINTS
// =====================

// GET CURRENT USER (/users/me)
app.get('/users/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ success: false, message: "Authorization token required" });
  
  const user = users.find(u => u.token === token);
  if (!user) return res.status(401).json({ success: false, message: "Invalid or expired token" });
  
  const { password: _, ...userResponse } = user;
  res.status(200).json({ success: true, data: userResponse });
});

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
// REPORTS ENDPOINTS
// =====================

// POST - CREATE/SAVE REPORT
app.post('/reports', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: "Not authorized", stack: "Authorization token required" });
    
    const user = users.find(u => u.token === token);
    if (!user) return res.status(401).json({ message: "Not authorized", stack: "Invalid or expired token" });

    const { module, overallScore, interactionTime, speakingPace, fillerWords, skills, transcript, feedback } = req.body;
    
    // Validate required fields
    if (!module || !overallScore || !interactionTime) {
      return res.status(400).json({ message: "Missing required fields", stack: "module, overallScore, interactionTime required" });
    }

    // Find the module data
    const moduleData = STATIC_MODULES.find(m => m._id === module);
    if (!moduleData) {
      return res.status(404).json({ message: "Module not found", stack: "Invalid module ID" });
    }

    // Create report object
    const report = {
      _id: generateId(),
      user: user._id,
      module: {
        _id: moduleData._id,
        title: moduleData.title,
        thumbnailUrl: moduleData.thumbnailUrl || ""
      },
      overallScore: overallScore || "",
      interactionTime: interactionTime || "",
      speakingPace: speakingPace || { wpm: 0, rating: "" },
      fillerWords: fillerWords || { count: 0, rating: "" },
      skills: skills || {
        communication: "",
        problemSolving: "",
        clarity: "",
        bodyLanguage: ""
      },
      transcript: transcript || "",
      feedback: feedback || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    reports.push(report);
    res.status(201).json(report);
  } catch (error) {
    console.error('❌ Report creation error:', error);
    res.status(500).json({ message: error.message, stack: error.stack });
  }
});

// GET - RETRIEVE REPORT BY ID
app.get('/reports/:id', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: "Not authorized to view this report", stack: "Authorization token required" });
    
    const user = users.find(u => u.token === token);
    if (!user) return res.status(401).json({ message: "Not authorized to view this report", stack: "Invalid or expired token" });

    const report = reports.find(r => r._id === req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found", stack: "Report ID does not exist" });

    // Check authorization - user can only view their own reports
    if (report.user !== user._id) {
      return res.status(401).json({ message: "Not authorized to view this report", stack: "You don't have permission to view this report" });
    }

    res.status(200).json(report);
  } catch (error) {
    console.error('❌ Report retrieval error:', error);
    res.status(500).json({ message: error.message, stack: error.stack });
  }
});

// GET - RETRIEVE ALL REPORTS FOR CURRENT USER
app.get('/reports', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('📊 GET /reports request');
    console.log('   Authorization header:', authHeader ? authHeader.substring(0, 30) + '...' : 'MISSING');
    
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      console.log('   ❌ No token found');
      return res.status(401).json({ message: "Not authorized", stack: "Authorization token required" });
    }
    
    console.log('   🔑 Token:', token.substring(0, 20) + '...');
    console.log('   👥 Total users in system:', users.length);
    
    const user = users.find(u => u.token === token);
    if (!user) {
      console.log('   ❌ User not found for token');
      return res.status(401).json({ message: "Not authorized", stack: "Invalid or expired token" });
    }

    console.log('   ✅ User found:', user.email);
    const userReports = reports.filter(r => r.user === user._id);
    console.log('   📋 Reports count:', userReports.length);
    res.status(200).json({ success: true, data: userReports, count: userReports.length });
  } catch (error) {
    console.error('❌ Reports retrieval error:', error);
    res.status(500).json({ message: error.message, stack: error.stack });
  }
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

// =====================
// GEMINI API ENDPOINT (Secure with API Key)
// =====================
app.post('/api/generate', async (req, res) => {
  try {
    // Check if API key exists
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY not found in environment variables');
      return res.status(500).json({ 
        success: false, 
        message: "API key not configured on server. Contact administrator." 
      });
    }

    // Validate request body
    const { prompt, contents } = req.body;
    if (!prompt && !contents) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide 'prompt' or 'contents' in request body" 
      });
    }

    // Prepare request body for Gemini API
    const requestBody = {
      contents: contents || [{
        parts: [{
          text: prompt
        }]
      }]
    };

    // Call Gemini API with secure key from .env
    console.log('🔑 API Key present:', !!apiKey);
    console.log('🔑 API Key length:', apiKey?.length);
    console.log('🔑 API Key starts with:', apiKey?.substring(0, 10) + '...');
    
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
    );

    console.log('📊 Gemini API Response Status:', response.status);
    
    // Handle Gemini API response
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Gemini API error (Status ' + response.status + '):', errorData);
      return res.status(response.status).json({ 
        success: false, 
        message: "Gemini API error (Status " + response.status + ")",
        error: errorData,
        debug: {
          apiKeyValid: apiKey && apiKey !== 'your_secret_gemini_api_key_here',
          apiKeyLength: apiKey?.length
        }
      });
    }

    const data = await response.json();
    res.status(200).json({ 
      success: true, 
      data: data 
    });

  } catch (error) {
    console.error('❌ API Generation error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error",
      error: error.message 
    });
  }
});

// ✅ ROOT ROUTE
app.get('/', (req, res) => {
  res.sendFile(path.resolve('index.html'));
});

// =====================
// ERROR & 404 HANDLERS
// =====================
app.use((req, res) => res.status(404).json({ success: false, message: "Endpoint not found" }));
app.use((err, req, res, next) => res.status(500).json({ success: false, message: "Internal server error", error: err.message }));

// =====================
// START SERVER
// =====================
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));

export default app;