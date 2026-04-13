import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

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

const loadReportsFromDisk = () => {
  try {
    const reportsDir = path.join(path.resolve(), 'reports');
    if (!fs.existsSync(reportsDir)) return;

    const files = fs.readdirSync(reportsDir).filter(f => f.toLowerCase().endsWith('.json'));
    const loaded = [];

    for (const file of files) {
      try {
        const raw = fs.readFileSync(path.join(reportsDir, file), 'utf8');
        const obj = JSON.parse(raw);
        if (obj && obj._id) loaded.push(obj);
      } catch {
        // ignore invalid json files
      }
    }

    // Deduplicate by _id, prefer newest (disk)
    const byId = new Map();
    for (const r of [...reports, ...loaded]) byId.set(r._id, r);
    reports = Array.from(byId.values());
    console.log(`📦 Loaded reports from disk: ${loaded.length} (total in memory: ${reports.length})`);
  } catch (e) {
    console.warn(`⚠️ Failed loading reports from disk: ${e.message}`);
  }
};

const persistReportToDisk = (report) => {
  try {
    const reportsDir = path.join(path.resolve(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const safeTitle = (report?.module?.title || 'Report').replace(/[^a-zA-Z0-9-_]/g, '_');
    const filename = `${safeTitle}_${report._id}.json`;
    const filePath = path.join(reportsDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(report, null, 2), 'utf8');
    return filename;
  } catch (e) {
    console.warn(`⚠️ Could not save report to file: ${e.message}`);
    return null;
  }
};

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

const extractAuthToken = (authHeader) => {
  if (!authHeader || typeof authHeader !== 'string') return null;
  // Common formats: "Bearer <token>", "bearer <token>", "<token>"
  const trimmed = authHeader.trim();
  return trimmed.replace(/^bearer\s+/i, '').trim() || null;
};

const getOrCreateUserByToken = (token) => {
  if (!token) return null;
  let user = users.find(u => u.token === token);
  if (user) return user;

  // Demo-friendly behavior:
  // Unity WebGL may send reports after a cold start or across instances.
  // If a token is present but unknown, treat it as a valid session identity
  // and materialize a user record so report saving doesn't 401.
  const short = token.substring(0, 12).replace(/[^a-zA-Z0-9]/g, '');
  user = {
    _id: generateId(),
    name: 'WebGL User',
    email: `webgl_${short}@demo.local`,
    password: '',
    avatarUrl: '',
    role: 'user',
    token
  };
  users.push(user);
  return user;
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
  const token = extractAuthToken(req.headers.authorization);
  if (!token) return res.status(401).json({ success: false, message: "Authorization token required" });
  
  const user = getOrCreateUserByToken(token);
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
    const token = extractAuthToken(req.headers.authorization);
    if (!token) return res.status(401).json({ message: "Not authorized", stack: "Authorization token required" });
    
    const user = getOrCreateUserByToken(token);
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
      userToken: token,
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
    
    // ALSO SAVE TO LOCAL FILE (NEW!)
    const savedFilename = persistReportToDisk(report);
    if (savedFilename) console.log(`✅ Report saved to file: ${savedFilename}`);
    
    res.status(201).json(report);
  } catch (error) {
    console.error('❌ Report creation error:', error);
    res.status(500).json({ message: error.message, stack: error.stack });
  }
});

// GET - RETRIEVE REPORT BY ID
app.get('/reports/:id', (req, res) => {
  try {
    const token = extractAuthToken(req.headers.authorization);
    if (!token) return res.status(401).json({ message: "Not authorized to view this report", stack: "Authorization token required" });
    
    const user = getOrCreateUserByToken(token);
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
    
    const token = extractAuthToken(authHeader);
    if (!token) {
      console.log('   ❌ No token found');
      return res.status(401).json({ message: "Not authorized", stack: "Authorization token required" });
    }
    
    console.log('   🔑 Token:', token.substring(0, 20) + '...');
    console.log('   👥 Total users in system:', users.length);
    
    const user = getOrCreateUserByToken(token);
    if (!user) {
      console.log('   ❌ User not found for token');
      return res.status(401).json({ message: "Not authorized", stack: "Invalid or expired token" });
    }

    console.log('   ✅ User found:', user.email);
    let userReports = reports.filter(r => r.user === user._id || r.userToken === token);

    // Demo UX: if user has no reports yet, create one dummy report once.
    if (userReports.length === 0) {
      const moduleData = STATIC_MODULES[0];
      const now = new Date().toISOString();
      const dummy = {
        _id: generateId(),
        user: user._id,
        userToken: token,
        module: {
          _id: moduleData._id,
          title: moduleData.title,
          thumbnailUrl: moduleData.thumbnailUrl || ""
        },
        overallScore: "4.2",
        interactionTime: "2 min 10 sec",
        speakingPace: { wpm: 118, rating: "Good" },
        fillerWords: { count: 3, rating: "Good" },
        skills: {
          communication: "Intermediate",
          problemSolving: "Novice",
          clarity: "Intermediate",
          bodyLanguage: "Novice"
        },
        transcript: "Demo report: complete a module to generate real data.",
        feedback: "This is a sample report shown when you have no saved reports yet.",
        createdAt: now,
        updatedAt: now,
        isDummy: true
      };

      reports.push(dummy);
      const savedFilename = persistReportToDisk(dummy);
      if (savedFilename) console.log(`🧪 Dummy report saved to file: ${savedFilename}`);
      userReports = [dummy];
    }
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

// =====================
// LIST ALL REPORTS (BEFORE CATCH-ALL)
// =====================
app.get('/api/reports', (req, res) => {
  try {
    const reportsDir = path.join(path.resolve(), 'reports');
    
    if (!fs.existsSync(reportsDir)) {
      return res.status(200).json({ 
        success: true, 
        reports: [],
        message: "No reports yet"
      });
    }

    const files = fs.readdirSync(reportsDir);
    const reports = files.map(file => {
      const filePath = path.join(reportsDir, file);
      const stats = fs.statSync(filePath);
      return {
        filename: file,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
      };
    });

    res.status(200).json({ 
      success: true, 
      reports: reports.sort((a, b) => b.modified - a.modified),
      count: reports.length
    });

  } catch (error) {
    console.error('❌ Error listing reports:', error.message);
    res.status(500).json({ 
      success: false, 
      message: "Failed to list reports",
      error: error.message 
    });
  }
});

// =====================
// GET SPECIFIC REPORT (BEFORE CATCH-ALL)
// =====================
app.get('/api/reports/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(path.resolve(), 'reports', filename);
    
    // Security: prevent directory traversal
    if (!filePath.startsWith(path.join(path.resolve(), 'reports'))) {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied"
      });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        success: false, 
        message: "Report not found"
      });
    }

    const content = fs.readFileSync(filePath, 'utf8');
    res.status(200).json({ 
      success: true, 
      filename: filename,
      content: content,
      size: fs.statSync(filePath).size
    });

  } catch (error) {
    console.error('❌ Error reading report:', error.message);
    res.status(500).json({ 
      success: false, 
      message: "Failed to read report",
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
// REPORT SAVING ENDPOINT (Local - No Deploy Needed)
// =====================
app.post('/api/save-report', async (req, res) => {
  try {
    const { filename, content, format } = req.body;
    
    if (!filename || !content) {
      return res.status(400).json({ 
        success: false, 
        message: "filename and content are required" 
      });
    }

    // Sanitize filename
    const sanitized = filename.replace(/[^a-zA-Z0-9-_\.]/g, '_');
    const ext = format === 'json' ? '.json' : '.md';
    const fullFilename = `${sanitized}${ext}`;
    const filePath = path.join(path.resolve(), 'reports', fullFilename);
    
    // Create reports directory if it doesn't exist
    const reportsDir = path.join(path.resolve(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Save report locally
    fs.writeFileSync(filePath, content, 'utf8');
    
    console.log(`✅ Report saved: ${fullFilename}`);
    
    res.status(200).json({ 
      success: true, 
      message: "Report saved locally",
      filename: fullFilename,
      path: filePath,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Report save error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: "Failed to save report",
      error: error.message 
    });
  }
});

// =====================
// REPORTS DASHBOARD
// =====================
app.get('/reports-dashboard', (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reports Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }
    .container { 
      max-width: 900px; 
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 { font-size: 2em; margin-bottom: 10px; }
    .header p { opacity: 0.9; }
    .content { padding: 30px; }
    .report-list { list-style: none; }
    .report-item {
      background: #f8f9fa;
      padding: 15px;
      margin: 10px 0;
      border-radius: 8px;
      border-left: 4px solid #667eea;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .report-item:hover {
      background: #e9ecef;
      transform: translateX(5px);
    }
    .report-info { flex: 1; }
    .report-name { font-weight: bold; color: #333; margin-bottom: 5px; }
    .report-meta { font-size: 0.85em; color: #666; }
    .report-actions {
      display: flex;
      gap: 10px;
    }
    button {
      padding: 8px 15px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9em;
      transition: all 0.3s ease;
    }
    .btn-view {
      background: #667eea;
      color: white;
    }
    .btn-view:hover { background: #5568d3; }
    .btn-download {
      background: #28a745;
      color: white;
    }
    .btn-download:hover { background: #218838; }
    .btn-delete {
      background: #dc3545;
      color: white;
    }
    .btn-delete:hover { background: #c82333; }
    .empty {
      text-align: center;
      color: #999;
      padding: 40px;
      font-size: 1.1em;
    }
    .modal {
      display: none;
      position: fixed;
      z-index: 1000;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0,0,0,0.5);
    }
    .modal-content {
      background-color: white;
      margin: 10% auto;
      padding: 25px;
      border-radius: 8px;
      width: 90%;
      max-width: 700px;
      max-height: 70vh;
      overflow-y: auto;
    }
    .modal-close {
      float: right;
      font-size: 28px;
      font-weight: bold;
      cursor: pointer;
      color: #999;
    }
    .modal-close:hover { color: #000; }
    .modal-title { font-size: 1.5em; margin-bottom: 15px; color: #333; }
    .report-content {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 6px;
      font-family: 'Courier New', monospace;
      white-space: pre-wrap;
      word-wrap: break-word;
      font-size: 0.9em;
      line-height: 1.5;
    }
    .loading { text-align: center; padding: 20px; color: #666; }
    .error { color: #dc3545; padding: 15px; background: #f8d7da; border-radius: 6px; margin-bottom: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Reports Dashboard</h1>
      <p>All saved reports from your local server</p>
    </div>
    <div class="content">
      <div id="error-box"></div>
      <div id="reports-container" class="loading">Loading reports...</div>
    </div>
  </div>

  <div id="reportModal" class="modal">
    <div class="modal-content">
      <span class="modal-close">&times;</span>
      <div class="modal-title" id="modalTitle"></div>
      <div class="report-content" id="modalContent"></div>
    </div>
  </div>

  <script>
    const modal = document.getElementById('reportModal');
    const closeBtn = document.querySelector('.modal-close');
    
    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (event) => {
      if (event.target == modal) modal.style.display = 'none';
    };

    function loadReports() {
      const container = document.getElementById('reports-container');
      const errorBox = document.getElementById('error-box');
      errorBox.innerHTML = '';

      fetch('/api/reports')
        .then(res => res.json())
        .then(data => {
          if (!data.success || data.reports.length === 0) {
            container.innerHTML = '<div class="empty">📭 No reports yet</div>';
            return;
          }

          let html = '<ul class="report-list">';
          data.reports.forEach(report => {
            const date = new Date(report.modified).toLocaleString();
            const sizeKB = (report.size / 1024).toFixed(2);
            html += \`
              <li class="report-item">
                <div class="report-info">
                  <div class="report-name">📄 \${report.filename}</div>
                  <div class="report-meta">Modified: \${date} | Size: \${sizeKB} KB</div>
                </div>
                <div class="report-actions">
                  <button class="btn-view" onclick="viewReport('\${report.filename}')">View</button>
                  <button class="btn-download" onclick="downloadReport('\${report.filename}')">Download</button>
                </div>
              </li>
            \`;
          });
          html += '</ul>';
          container.innerHTML = html;
        })
        .catch(err => {
          errorBox.innerHTML = \`<div class="error">❌ Error loading reports: \${err.message}</div>\`;
          container.innerHTML = '';
        });
    }

    function viewReport(filename) {
      fetch(\`/api/reports/\${filename}\`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            document.getElementById('modalTitle').textContent = '📋 ' + filename;
            document.getElementById('modalContent').textContent = data.content;
            modal.style.display = 'block';
          }
        })
        .catch(err => alert('Error loading report: ' + err.message));
    }

    function downloadReport(filename) {
      const link = document.createElement('a');
      link.href = \`/api/reports/\${filename}\`;
      link.download = filename;
      link.click();
    }

    // Load reports on page load
    loadReports();
    
    // Refresh every 5 seconds
    setInterval(loadReports, 5000);
  </script>
</body>
</html>
  `;
  res.send(html);
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
loadReportsFromDisk();
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));

export default app;