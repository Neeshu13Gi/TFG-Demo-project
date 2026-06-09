import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import path from 'path';
import fs from 'fs';

// Load local .env values during development.
// Render will supply GROQ_API_KEY from its environment variables.
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

   const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5500',
  'https://tfg-demo-project.onrender.com'
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
    model: body.model || 'llama-3.3-70b-versatile',
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
// MODULE ENDPOINTS
// =====================

// GET ALL MODULES
app.get('/modules', (req, res) => {

  res.status(200).json(STATIC_MODULES);

});


// GET MODULE BY ID
app.get('/modules/:id', (req, res) => {

  const module =
    STATIC_MODULES.find(
      m => m._id === req.params.id
    );

  if (!module) {

    return res.status(404).json({
      success: false,
      message: 'Module not found'
    });

  }

  res.status(200).json({
    success: true,
    data: module
  });

});


// =====================
// JOB ROUTES FOR CAREER COACH
// =====================

const CAREER_JOBS = [
  {
    _id: '101',
    title: 'Frontend Developer',
    company: 'TFG Technologies',
    skills: ['HTML', 'CSS', 'JavaScript', 'React'],
    experience: '2-4 years',
    description: 'Build modern responsive interfaces, collaborate with product teams, and implement design-driven UI components.'
  },
  {
    _id: '102',
    title: 'Sales Executive',
    company: 'TFG Solutions',
    skills: ['Sales', 'Negotiation', 'CRM', 'Communication'],
    experience: '3+ years',
    description: 'Lead sales conversations, identify customer needs, and close enterprise deals with consultative selling skills.'
  },
  {
    _id: '103',
    title: 'UI/UX Designer',
    company: 'TFG Innovation Labs',
    skills: ['Figma', 'Prototyping', 'User Research', 'Visual Design'],
    experience: '2-5 years',
    description: 'Design intuitive user experiences and create high-fidelity prototypes for web and mobile applications.'
  }
];

// GET ALL JOBS
app.get('/jobs', (req, res) => {
  res.status(200).json({
    success: true,
    data: CAREER_JOBS
  });
});

// GET JOB BY ID
app.get('/jobs/:id', (req, res) => {
  const job = CAREER_JOBS.find(j => j._id === req.params.id);
  
  if (!job) {
    return res.status(404).json({
      success: false,
      message: 'Job not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: job
  });
});

// =====================
// REPORT ROUTES
// =====================

const enrichReport = (report) => {
  if (!report || typeof report.module !== 'string') return report;
  const mod = STATIC_MODULES.find(m => m._id === report.module);
  return { ...report, module: mod || { _id: report.module, title: 'Unknown Module' } };
};

app.get('/reports', (req, res) => {
  res.status(200).json({
    success: true,
    data: reports.map(enrichReport)
  });
});

app.get('/reports/:id', (req, res) => {
  const report = reports.find(r => r._id === req.params.id);
  if (!report) {
    return res.status(404).json({ success: false, message: 'Report not found' });
  }
  res.status(200).json({ success: true, data: enrichReport(report) });
});

app.post('/reports', (req, res) => {
  const report = req.body;
  if (!report || typeof report !== 'object') {
    return res.status(400).json({ success: false, message: 'Report body is required' });
  }

  report._id = report._id || generateId();
  report.createdAt = new Date().toISOString();
  reports.push(report);
  persistReportToDisk(report);

  res.status(201).json({ success: true, data: enrichReport(report) });
});

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
// CAREER COACH REPORT ENDPOINT
// =====================
app.post('/InterviewReport', async (req, res) => {
  try {
    const { userName, jobTitle, interviewType, responses } = req.body;

    if (!jobTitle) {
      return res.status(400).json({ success: false, message: 'jobTitle is required' });
    }

    const responsesText = Array.isArray(responses) && responses.length
      ? responses.map((r, i) => `Q${i + 1}: ${r.question}\nA${i + 1}: ${r.answer}`).join('\n')
      : 'No interview responses provided — generate realistic scores for this role.';

    const prompt = `You are an expert AI career coach. Evaluate the following mock interview and return ONLY a valid JSON object — no markdown, no explanation, just the raw JSON.

Candidate: ${userName || 'Candidate'}
Applied Role: ${jobTitle}
Interview Type: ${interviewType || 'HR + Technical + Behavioral'}
Interview Q&A:
${responsesText}

Return this exact JSON structure:
{
  "scores": { "communication": <60-100>, "confidence": <60-100>, "technicalSkills": <60-100>, "problemSolving": <60-100> },
  "strengths": ["<strength 1>","<strength 2>","<strength 3>","<strength 4>","<strength 5>"],
  "areasToImprove": ["<area 1>","<area 2>","<area 3>","<area 4>","<area 5>"],
  "questionReview": [{"question":"<question text>","feedback":"<one sentence feedback>"}],
  "summary": "<2-3 sentence summary ending with: Overall Interview Readiness Score: XX%>",
  "overallScore": <60-100>
}`;

    const payload = {
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 900,
      temperature: 0.7,
      top_p: 0.95
    };

    const result = await requestGroqChatCompletion(payload);
    const content = result.choices?.[0]?.message?.content || '';

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ success: false, message: 'AI returned unexpected format' });
    }

    const reportData = JSON.parse(jsonMatch[0]);
    reportData.userName = userName || 'Candidate';
    reportData.appliedRole = jobTitle;
    reportData.interviewType = interviewType || 'HR + Technical + Behavioral';
    reportData.generatedAt = new Date().toISOString();

    return res.status(200).json({ success: true, data: reportData });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// =====================
// GROQ API ENDPOINTS
// =====================

app.post('/suggestion', async (req, res) => {

    try {

        const payload =
            createGroqPayload(
                req.body,
                300);

        const result =
            await requestGroqChatCompletion(
                payload);

        return res.status(200).json(result);

    } catch (error) {

        return res.status(500).json({
            error: error.message
        });

    }
});

app.post('/report', async (req, res) => {

    try {

        const payload =
            createGroqPayload(
                req.body,
                500);

        const result =
            await requestGroqChatCompletion(
                payload);

        return res.status(200).json(result);

    } catch (error) {

        return res.status(500).json({
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

// Static files served AFTER API routes so /reports and other paths aren't intercepted
app.use(express.static(path.resolve()));

loadReportsFromDisk();

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  console.log(`Render endpoints:`);
  console.log(`  POST https://tfg-demo-project.onrender.com/suggestion`);
  console.log(`  POST https://tfg-demo-project.onrender.com/report`);
});
