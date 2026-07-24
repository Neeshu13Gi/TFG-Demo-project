/**
 * DommyPro Frontend - Main Application Logic
 * Handles authentication, module fetching, and UI state management
 */

// =====================
// CONSOLE LOG PERSISTENCE
// =====================
const LogStorage = (() => {
    const STORAGE_KEY = 'sessionLogs';
    const MAX_LOGS = 500;
    let logs = [];

    // Initialize logs from sessionStorage
    function init() {
        try {
            const stored = sessionStorage.getItem(STORAGE_KEY);
            logs = stored ? JSON.parse(stored) : [];
        } catch (e) {
            logs = [];
        }
    }

    // Add a log entry
    function add(level, args) {
        const timestamp = new Date().toLocaleTimeString();
        const message = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ');
        
        logs.push({ timestamp, level, message });
        
        // Keep only the last MAX_LOGS entries
        if (logs.length > MAX_LOGS) {
            logs = logs.slice(-MAX_LOGS);
        }
        
        // Persist to sessionStorage
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
        } catch (e) {
            console.warn('Failed to persist logs to sessionStorage', e);
        }
    }

    // Get all logs
    function getAll() {
        return logs;
    }

    // Clear logs
    function clear() {
        logs = [];
        try {
            sessionStorage.removeItem(STORAGE_KEY);
        } catch (e) {
            console.warn('Failed to clear logs from sessionStorage', e);
        }
    }

    return { init, add, getAll, clear };
})();

// Override console methods to capture logs
(() => {
    LogStorage.init();
    
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    const originalInfo = console.info;

    console.log = function(...args) {
        LogStorage.add('log', args);
        originalLog.apply(console, args);
    };

    console.warn = function(...args) {
        LogStorage.add('warn', args);
        originalWarn.apply(console, args);
    };

    console.error = function(...args) {
        LogStorage.add('error', args);
        originalError.apply(console, args);
    };

    console.info = function(...args) {
        LogStorage.add('info', args);
        originalInfo.apply(console, args);
    };
})();

// =====================
// CONFIGURATION
// =====================
// Use same-origin in production; localhost in development
const API_URL = (() => {

    const host = window.location.hostname;

    const isLocal =
        host === 'localhost' ||
        host === '127.0.0.1' ||
        host === '0.0.0.0' ||
        host.endsWith('.local');

    return isLocal
        ? 'http://localhost:3000'
        : 'https://tfg-demo-project.onrender.com';

})();

console.log('%c🔌 API Configuration', 'color: #667eea; font-size: 14px; font-weight: bold;');
console.log('   Hostname:', window.location.hostname);
console.log('   API URL:', API_URL);
console.log('   Environment:', API_URL.includes('localhost') ? 'DEVELOPMENT ✅' : 'PRODUCTION ⚠️');

const TOKEN_KEY = 'authToken';
const USER_KEY = 'currentUser';

// =====================
// STATE MANAGEMENT
// =====================
let currentUser = null;
let currentModule = null;
let allModules = [];
let currentCareerJob = null;
let convaiInterviewResponses = [];

const careerJobs = [
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

// =====================
// INITIALIZATION
// =====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DommyPro Frontend Initialized');
    
    // Check if user is already logged in
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);
    
    console.log('📦 On initialization:');
    console.log('  - Saved Token exists:', !!savedToken);
    console.log('  - Saved User exists:', !!savedUser);
    
    if (savedToken && savedUser) {
        currentUser = JSON.parse(savedUser);
        console.log('✅ User restored from localStorage:', currentUser.email, currentUser.token?.substring(0, 20));
        unlockSidebar();
        showDashboard();
    } else {
        console.log('📝 No active session. Showing auth screen.');
        lockSidebar();
        showLoginForm();
    }
});

// =====================
// CONVAI IFRAME MESSAGE LISTENER
// Captures conversation data sent from CareerCoach iframe via postMessage
// =====================
window.addEventListener('message', (event) => {
    const data = event.data;
    if (!data || typeof data !== 'object') return;

    if (data.type === 'CONVAI_USER_SPEECH' && data.text) {
        convaiInterviewResponses.push({ role: 'user', text: data.text });
    }

    if (data.type === 'CONVAI_CHAR_RESPONSE' && data.text) {
        convaiInterviewResponses.push({ role: 'interviewer', text: data.text });
    }

    if (data.type === 'CONVAI_INTERVIEW_DONE' && Array.isArray(data.responses)) {
        convaiInterviewResponses = data.responses;
        showGenerateReportBtn();
    }
});

// =====================
// SIDEBAR HELPERS
// =====================
function lockSidebar() {
    document.querySelector('.app-sidebar')?.classList.add('sidebar-locked');
}

function unlockSidebar() {
    document.querySelector('.app-sidebar')?.classList.remove('sidebar-locked');
}

function setActiveNav(id) {
    document.querySelectorAll('#sidebarNav .nav-item').forEach(el => el.classList.remove('active'));
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
}

function updateSidebarUser(user) {
    if (!user) return;
    const initials = (user.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const avatarEl = document.getElementById('sidebarAvatar');
    const nameEl   = document.getElementById('sidebarUserName');
    const emailEl  = document.getElementById('sidebarUserEmail');
    if (avatarEl) avatarEl.textContent = initials;
    if (nameEl)   nameEl.textContent   = user.name || '';
    if (emailEl)  emailEl.textContent  = user.email || '';
}

// =====================
// AUTH UI MANAGEMENT
// =====================
function showLoginForm() {
    console.log('📝 Showing login form');
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('welcomeMessage').style.display = 'none';
    document.getElementById('modulesSection').style.display = 'none';
    document.getElementById('moduleDetailSection').style.display = 'none';
    const trainingZone = document.getElementById('trainingZoneSection');
    if (trainingZone) trainingZone.style.display = 'none';
    document.getElementById('authSection').style.display = 'flex';
    clearLoginForm();
}

function showRegisterForm() {
    console.log('📝 Showing register form');
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.getElementById('welcomeMessage').style.display = 'none';
    document.getElementById('modulesSection').style.display = 'none';
    document.getElementById('moduleDetailSection').style.display = 'none';
    const trainingZone = document.getElementById('trainingZoneSection');
    if (trainingZone) trainingZone.style.display = 'none';
    document.getElementById('authSection').style.display = 'flex';
    clearRegisterForm();
}

function showDashboard() {
    console.log('🏠 Showing dashboard');
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('modulesSection').style.display = 'block';
    document.getElementById('moduleDetailSection').style.display = 'none';
    document.getElementById('careerSection').style.display = 'none';
    document.getElementById('careerJobDetailSection').style.display = 'none';
    document.getElementById('reportsSection').style.display = 'none';
    document.getElementById('reportDetailSection').style.display = 'none';
    document.getElementById('careerReportSection').style.display = 'none';
    const trainingZone = document.getElementById('trainingZoneSection');
    if (trainingZone) trainingZone.style.display = 'none';

    updateSidebarUser(currentUser);
    setActiveNav('nav-dashboard');

    // Welcome banner
    const banner = document.getElementById('welcomeBanner');
    const bannerName = document.getElementById('welcomeBannerName');
    if (banner) banner.style.display = 'block';
    if (bannerName) bannerName.textContent = `Welcome, ${currentUser?.name || 'User'}`;

    // Stats
    const statsEl = document.getElementById('summaryStats');
    if (statsEl) statsEl.style.display = 'grid';

    // Page title
    const pt = document.getElementById('pageTitle');
    if (pt) pt.textContent = 'Dashboard';

    // Fetch and display modules
    fetchModules();
}

function hideDashboardExtras() {
    const banner = document.getElementById('welcomeBanner');
    const stats  = document.getElementById('summaryStats');
    if (banner) banner.style.display = 'none';
    if (stats)  stats.style.display  = 'none';
}

function showModules() {
    console.log('📚 Showing modules (Training)');
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('modulesSection').style.display = 'block';
    document.getElementById('moduleDetailSection').style.display = 'none';
    document.getElementById('careerSection').style.display = 'none';
    document.getElementById('careerJobDetailSection').style.display = 'none';
    document.getElementById('reportsSection').style.display = 'none';
    document.getElementById('reportDetailSection').style.display = 'none';
    document.getElementById('careerReportSection').style.display = 'none';
    document.getElementById('welcomeMessage').style.display = 'none';
    const trainingZone = document.getElementById('trainingZoneSection');
    if (trainingZone) trainingZone.style.display = 'none';
    hideDashboardExtras();

    const pt = document.getElementById('pageTitle');
    if (pt) pt.textContent = 'Training';

    updateSidebarUser(currentUser);
    setActiveNav('nav-training');

    if (allModules.length > 0) {
        renderModules(allModules);
    } else {
        fetchModules();
    }

    document.getElementById('modulesSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// =====================
// FORM HANDLERS
// =====================
async function handleRegister(event) {
    event.preventDefault();
    console.log('📝 Register form submitted');
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    console.log(`📧 Registering: ${email}`);
    
    const errorDiv = document.getElementById('registerError');
    errorDiv.classList.remove('show');
    
    try {
        showLoading(true);
        
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        console.log('📡 Register response:', data);
        
        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }
        
        // Save user and token
        currentUser = data.data;
        localStorage.setItem(TOKEN_KEY, data.data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.data));
        
        console.log('✅ Registration successful!', currentUser.email);
        showToast('Account created successfully!', 'success');
        showLoading(false);
        
        // Show dashboard after a short delay
        setTimeout(() => {
            showDashboard();
        }, 500);
        
    } catch (error) {
        console.error('❌ Registration error:', error);
        showLoading(false);
        errorDiv.textContent = error.message;
        errorDiv.classList.add('show');
        showToast(error.message, 'error');
    }
}

async function handleLogin(event) {
    event.preventDefault();
    console.log('🔐 Login form submitted');
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    console.log(`📧 Logging in: ${email}`);
    
    const errorDiv = document.getElementById('loginError');
    errorDiv.classList.remove('show');
    
    try {
        showLoading(true);
        
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        console.log('📡 Login response:', data);
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }
        
        // Save user and token
        currentUser = data.data;
        localStorage.setItem(TOKEN_KEY, data.data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.data));
        
        console.log('✅ Login successful!', currentUser.email);
        showToast('Login successful!', 'success');
        showLoading(false);
        unlockSidebar();

        setTimeout(() => {
            showDashboard();
        }, 500);
        
    } catch (error) {
        console.error('❌ Login error:', error);
        showLoading(false);
        errorDiv.textContent = error.message;
        errorDiv.classList.add('show');
        showToast(error.message, 'error');
    }
}

function logout() {
    console.log('👋 Logging out');
    
    // Clear storage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    currentUser = null;
    
    console.log('✅ Logout successful');
    showToast('Logged out successfully', 'success');
    
    // Lock sidebar and reset user display
    lockSidebar();
    updateSidebarUser({ name: '', email: '' });
    setActiveNav('');
    
    // Show login form
    setTimeout(() => {
        showLoginForm();
    }, 300);
}

// =====================
// MODULE MANAGEMENT
// =====================
// =====================
// MODULE MANAGEMENT (Robust Version)
// =====================
async function fetchModules() {
    console.log('📥 Fetching modules...');

    try {
        showLoading(true);

        const response = await fetch(`${API_URL}/modules`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${currentUser.token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || 'Failed to fetch modules');
        }

        const modules = await response.json();
        console.log('📡 Modules response:', modules);

        // modules is directly an array now
        allModules = Array.isArray(modules) ? modules : [];

        if (allModules.length === 0) {
            document.getElementById('modulesList').innerHTML = '<p><em>No modules available</em></p>';
        } else {
            renderModules(allModules);
            const totalEl = document.getElementById('statTotal');
            if (totalEl) totalEl.textContent = allModules.length;
        }

        showLoading(false);

    } catch (error) {
        console.error('❌ Error fetching modules:', error);
        showLoading(false);
        showToast(error.message, 'error');
    }
}
function renderModules(modules) {
    console.log('🎨 Rendering modules...');

    const modulesList = document.getElementById('modulesList');
    if (!modulesList) {
        console.error('❌ modulesList element not found in DOM');
        return;
    }

    modulesList.innerHTML = '';

    if (!Array.isArray(modules) || modules.length === 0) {
        modulesList.innerHTML = '<p><em>No modules available</em></p>';
        console.warn('⚠️ No modules to render');
        return;
    }

    const scoreLabels = ['Excellent', 'Average', 'Needs Improvement'];
    const scoreClasses = ['', 'avg', 'needs-imp'];

    modules.forEach((module, index) => {
        const moduleCard = document.createElement('div');
        moduleCard.className = 'module-card';

        const title  = module?.title || 'Untitled Module';
        const letter = title.trim()[0]?.toUpperCase() || '?';
        const type   = module?.type || 'WEB';

        // Simulated lesson % and score for display
        const lessonPcts  = [78, 61, 26];
        const scoreIdx    = [1, 1, 2];
        const pct   = lessonPcts[index % lessonPcts.length];
        const score = scoreLabels[scoreIdx[index % scoreIdx.length]];
        const scoreCls = scoreClasses[scoreIdx[index % scoreIdx.length]];

        moduleCard.innerHTML = `
            <div class="module-thumbnail">
                <span class="module-thumb-letter">${letter}</span>
                <span class="module-type-badge">${type}</span>
            </div>
            <div class="module-content">
                <h3>${title}</h3>
                <div class="module-stats">
                    <div class="module-stat-row">
                        <span class="module-stat-label">Lesson Completed</span>
                        <span class="module-stat-val">${pct}%</span>
                    </div>
                    <div class="module-stat-row">
                        <span class="module-stat-label">Overall Score</span>
                        <span class="module-stat-val ${scoreCls}">${score}</span>
                    </div>
                </div>
                <div class="module-card-actions">
                    <button class="btn-card-continue" onclick="event.stopPropagation();showModuleDetail('${module?._id}')">Continue</button>
                    <button class="btn-card-result" onclick="event.stopPropagation();showReports()">View Result</button>
                </div>
            </div>
        `;

        modulesList.appendChild(moduleCard);
    });

    console.log('✅ Modules rendered');
}

async function showModuleDetail(moduleId) {
   console.log(`📖 Loading module detail: ${moduleId}`);

    try {
        const response = await fetch(`${API_URL}/modules/${moduleId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${currentUser.token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        console.log('📡 Module detail response:', data);

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Failed to fetch module');
        }

        currentModule = data.data;
        if (!currentModule || Object.keys(currentModule).length === 0) {
            throw new Error('Module data is empty');
        }

        // Critical elements
        const titleEl         = document.getElementById('moduleDetailTitle');
        const descEl          = document.getElementById('moduleDetailDescription');
        const submodulesList  = document.getElementById('submodulesList');
        const breadcrumbEl    = document.getElementById('moduleBreadcrumb');
        const badgeEl         = document.getElementById('completionBadge');

        if (!titleEl || !descEl || !submodulesList) {
            throw new Error('Required DOM elements for module detail not found');
        }

        // Breadcrumb + title
        if (breadcrumbEl) breadcrumbEl.textContent = currentModule.title || '';
        titleEl.textContent = currentModule.title || 'Untitled Module';
        descEl.textContent  = currentModule.description || 'No description available';

        const idEl = document.getElementById('moduleIdCode');
        if (idEl) idEl.textContent = currentModule._id || 'N/A';

        // Progress tracking via localStorage
        const progressKey = `progress_${currentModule._id}`;
        let completedIds = [];
        try { completedIds = JSON.parse(localStorage.getItem(progressKey) || '[]'); } catch {}

        const submodules = Array.isArray(currentModule.submodules) ? currentModule.submodules : [];
        submodulesList.innerHTML = '';

        if (submodules.length > 0) {
            // Determine in-progress: first submodule not yet completed
            const inProgressIdx = submodules.findIndex(s => !completedIds.includes(s._id));

            submodules.forEach((sub, index) => {
                const isDone       = completedIds.includes(sub._id);
                const isInProgress = index === inProgressIdx;
                const statusClass  = isDone ? 'completed' : isInProgress ? 'in-progress' : 'pending';
                const icon         = isDone ? '✓' : isInProgress ? '☆' : '○';

                const li = document.createElement('li');
                li.innerHTML = `
                    <div class="submodule-bar ${statusClass}">
                        <span class="submodule-icon">${icon}</span>
                        <span>${sub.title || 'Untitled Submodule'}</span>
                    </div>`;
                submodulesList.appendChild(li);
            });

            // Completion badge
            const pct = submodules.length ? Math.round((completedIds.length / submodules.length) * 100) : 0;
            if (badgeEl) badgeEl.textContent = `${pct}% Completed`;
        } else {
            submodulesList.innerHTML = '<li style="color:#aaa;font-size:.9rem">No submodules available</li>';
            if (badgeEl) badgeEl.textContent = '0% Completed';
        }

        setActiveNav('nav-training');

        // Toggle UI sections
        document.getElementById('modulesSection').style.display = 'none';
        document.getElementById('welcomeMessage').style.display = 'none';
        document.getElementById('moduleDetailSection').style.display = 'block';
        const trainingZone = document.getElementById('trainingZoneSection');
        if (trainingZone) trainingZone.style.display = 'none';

    } catch (error) {
        console.error('❌ Error loading module detail:', error);
        showToast(error.message || 'Unknown error loading module', 'error');
    }
}

function backToModules() {
    console.log('⬅️ Going back to modules list');
    document.getElementById('moduleDetailSection').style.display = 'none';
    document.getElementById('unityContainer').style.display = 'none';
    document.getElementById('careerSection').style.display = 'none';
    document.getElementById('careerJobDetailSection').style.display = 'none';
    document.getElementById('modulesSection').style.display = 'block';
    const trainingZone = document.getElementById('trainingZoneSection');
    if (trainingZone) trainingZone.style.display = 'none';
    currentModule = null;
}

function showCareerCoach() {
    console.log('💼 Showing Career Coach');
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('modulesSection').style.display = 'none';
    document.getElementById('moduleDetailSection').style.display = 'none';
    document.getElementById('careerSection').style.display = 'block';
    document.getElementById('careerJobDetailSection').style.display = 'none';
    document.getElementById('reportsSection').style.display = 'none';
    document.getElementById('reportDetailSection').style.display = 'none';
    document.getElementById('careerReportSection').style.display = 'none';
    const trainingZone = document.getElementById('trainingZoneSection');
    if (trainingZone) trainingZone.style.display = 'none';
    hideDashboardExtras();
    const pt = document.getElementById('pageTitle');
    if (pt) pt.textContent = 'Career Coach';
    updateSidebarUser(currentUser);
    setActiveNav('nav-career');
    renderCareerJobs();
}

function renderCareerJobs() {
    console.log('🧾 Rendering career jobs');
    const list = document.getElementById('careerJobsList');
    if (!list) {
        console.error('Career jobs container missing');
        return;
    }
    list.innerHTML = careerJobs.map(job => `
        <div class="module-card career-job-card">
            <div class="module-thumbnail">💼</div>
            <div class="module-content">
                <h3>${job.title}</h3>
                <p><strong>${job.company}</strong></p>
                <p>${job.description}</p>
                <div class="module-meta">
                    <span>Experience: ${job.experience}</span>
                    <span>Skills: ${job.skills.join(', ')}</span>
                </div>
                <div class="job-actions">
                    <button class="btn btn-primary" onclick="showCareerJobDetail('${job._id}')">View Job</button>
                </div>
            </div>
        </div>
    `).join('');
}

function showCareerJobDetail(jobId) {
    console.log('📄 Showing career job detail for', jobId);
    const job = careerJobs.find(item => item._id === jobId);
    if (!job) {
        showToast('Job not found', 'error');
        return;
    }
    currentCareerJob = job;

    document.getElementById('careerJobTitle').textContent = job.title;
    document.getElementById('careerJobDescription').textContent = job.description;
    document.getElementById('careerJobCompany').textContent = job.company;
    document.getElementById('careerJobExperience').textContent = job.experience;
    document.getElementById('careerJobSkills').textContent = job.skills.join(', ');
    document.getElementById('careerSection').style.display = 'none';
    document.getElementById('careerJobDetailSection').style.display = 'block';
}

function startCareerInterview(jobId) {
    console.log('🎯 startCareerInterview called with jobId:', jobId);
    console.log('📦 currentCareerJob:', currentCareerJob);
    
    const job = careerJobs.find(item => item._id === jobId) || currentCareerJob;
    
    if (!job) {
        console.error('❌ No job found');
        console.log('  - jobId parameter:', jobId);
        console.log('  - currentCareerJob:', currentCareerJob);
        console.log('  - careerJobs:', careerJobs);
        showToast('Please select a job first', 'error');
        return;
    }
    
    console.log('✅ Job found:', job.title);
    currentCareerJob = job;
    convaiInterviewResponses = [];
    const jobTitle = encodeURIComponent(job.title);
    const jobDesc = encodeURIComponent(job.description);
    const jobSkills = encodeURIComponent(job.skills.join(', '));
    const jobExp = encodeURIComponent(job.experience);
    
    // Build URL - use relative path from current page
    const webglUrl = `./CareerCoach/index.html?jobId=${job._id}&jobTitle=${jobTitle}&jobDescription=${jobDesc}&jobSkills=${jobSkills}&jobExperience=${jobExp}`;
    console.log(`🎯 WebGL URL:`, webglUrl);
    console.log(`📍 Current location:`, window.location.href);
    showToast(`Opening interview for ${job.title}`, 'success');
    
    // Load CareerCoach WebGL in iframe (same as modules)
    const container = document.getElementById('careerCoachContainer');
    const placeholder = document.querySelector('.career-webgl-placeholder');
    
    if (!container) {
        console.error('❌ careerCoachContainer not found in DOM');
        showToast('Error: Interview container not found in page', 'error');
        return;
    }

    if (!placeholder) {
        console.error('❌ career-webgl-placeholder not found in DOM');
        console.log('📍 Looking for element with class: career-webgl-placeholder');
        console.log('📍 Container HTML:', container.innerHTML);
        showToast('Error: Interview placeholder not found', 'error');
        return;
    }
    
    console.log('✅ Container and placeholder found');
    console.log('📊 Creating iframe with fullscreen layout...');
    
    placeholder.innerHTML = `
        <div class="career-webgl-fullscreen">
            <div class="career-webgl-toolbar">
                <button class="btn btn-secondary" onclick="closeCareerCoach()">Close Interview</button>
            </div>
            <div style="flex: 1; width: 100%; height: 100%; display: flex; flex-direction: column; background: #000;">
                <div style="flex: 1; position: relative;">
                    <iframe 
                        id="careerCoachIframe"
                        src="${webglUrl}"
                        class="career-fullscreen-frame"
                        allowfullscreen="true"
                        allow="fullscreen; microphone"
                        sandbox="allow-same-origin allow-scripts allow-popups allow-pointer-lock allow-modals allow-top-navigation-by-user-activation allow-forms"
                        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
                    ></iframe>
                </div>
            </div>
        </div>
    `;
    
    console.log('📱 Showing container and hiding button...');
    container.style.display = 'block';
    document.getElementById('startCareerInterviewBtn').style.display = 'none';

    const fullscreenTarget = container.querySelector('.career-webgl-fullscreen') || container;
    if (fullscreenTarget.requestFullscreen) {
        fullscreenTarget.requestFullscreen().catch(() => {});
    } else if (fullscreenTarget.webkitRequestFullscreen) {
        fullscreenTarget.webkitRequestFullscreen();
    }
    
    // Wait for DOM to be ready before accessing iframe
    setTimeout(() => {
        const iframe = document.getElementById('careerCoachIframe');
        console.log(`✅ iframe element found:`, iframe ? 'YES' : 'NO');
        
        if (iframe) {
            console.log(`📺 iframe src:`, iframe.src);
            console.log(`📺 iframe id:`, iframe.id);
            console.log(`📺 iframe parent:`, iframe.parentElement.id || iframe.parentElement.className);
            
            // Load event to verify iframe is loading
            iframe.addEventListener('load', () => {
                console.log(`✅ Career Coach iframe content loaded successfully`);
            });
            
            iframe.addEventListener('error', (e) => {
                console.error(`❌ Career Coach iframe load error:`, e);
                showToast('Failed to load Career Coach', 'error');
            });
            
            // Check iframe accessibility
            try {
                console.log('🔍 Checking iframe accessibility...');
                setTimeout(() => {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                    if (iframeDoc) {
                        console.log('✅ iframe is accessible and loaded');
                    } else {
                        console.log('⏳ iframe document not yet available (will load shortly)');
                    }
                }, 1000);
            } catch (e) {
                console.log('⚠️ Cannot access iframe content (expected for cross-origin):', e.message);
            }
        } else {
            console.error('❌ Failed to find iframe after creation');
            console.error('❌ iframe search results:');
            console.error('   - getElementById careerCoachIframe:', document.getElementById('careerCoachIframe'));
            console.error('   - querySelector #careerCoachIframe:', document.querySelector('#careerCoachIframe'));
            showToast('Error: Failed to create interview container', 'error');
        }
    }, 100);
}

function showGenerateReportBtn() {
    const btn = document.getElementById('generateReportBtn');
    if (btn) btn.style.display = 'inline-block';
}

async function generateCareerReport() {
    const job = currentCareerJob;
    if (!job) {
        showToast('No active interview job found', 'error');
        return;
    }

    showLoading(true);
    try {
        // Fetch real report saved by Unity from backend
        const res = await fetch(`${API_URL}/interview-reports`);
        const data = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message || 'Failed to fetch report');
        }

        // Find the most recent report matching the current job title
        const reports = data.data || [];
        const unityReport = reports.find(r =>
            r.jobTitle && r.jobTitle.toLowerCase() === job.title.toLowerCase()
        ) || reports[0];

        if (!unityReport) {
            showLoading(false);
            showToast('No report found. Please complete the interview in Unity first.', 'error');
            return;
        }

        // Map Unity report fields → showCareerReport() format
        const reportData = {
            userName: currentUser?.name || 'Candidate',
            appliedRole: unityReport.jobTitle || job.title,
            interviewType: 'HR + Technical + Behavioral',
            scores: {
                communication: unityReport.communication,
                confidence: unityReport.confidence,
                technicalSkills: unityReport.technicalSkills,
                problemSolving: unityReport.problemSolving
            },
            strengths: unityReport.strengths || [],
            areasToImprove: unityReport.areasToImprove || [],
            questionReview: [],
            summary: unityReport.summary || '',
            overallScore: unityReport.overallScore
        };

        showLoading(false);
        showCareerReport(reportData);
    } catch (error) {
        showLoading(false);
        showToast(`Failed to load report: ${error.message}`, 'error');
    }
}

function showCareerReport(data) {
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('modulesSection').style.display = 'none';
    document.getElementById('moduleDetailSection').style.display = 'none';
    document.getElementById('careerSection').style.display = 'none';
    document.getElementById('careerJobDetailSection').style.display = 'none';
    document.getElementById('reportsSection').style.display = 'none';
    document.getElementById('reportDetailSection').style.display = 'none';
    document.getElementById('careerReportSection').style.display = 'block';
    const trainingZone = document.getElementById('trainingZoneSection');
    if (trainingZone) trainingZone.style.display = 'none';
    hideDashboardExtras();

    const pt = document.getElementById('pageTitle');
    if (pt) pt.textContent = 'Interview Report';
    setActiveNav('nav-career');

    const initials = (data.userName || 'C').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    document.getElementById('crAvatar').textContent = initials;
    document.getElementById('crUserName').textContent = data.userName || 'Candidate';
    document.getElementById('crAppliedRole').textContent = data.appliedRole || '';
    document.getElementById('crInterviewType').textContent = data.interviewType || '';

    const scoreLabels = [
        { key: 'communication', label: 'Communication' },
        { key: 'confidence', label: 'Confidence' },
        { key: 'technicalSkills', label: 'Technical Skills' },
        { key: 'problemSolving', label: 'Problem Solving' }
    ];
    const scoresGrid = document.getElementById('crScoresGrid');
    scoresGrid.innerHTML = scoreLabels.map(({ key, label }) => `
        <div class="cr-score-card">
            <div class="cr-score-value">${data.scores?.[key] ?? '--'}%</div>
            <div class="cr-score-label">${label}</div>
        </div>
    `).join('');

    const strengthsEl = document.getElementById('crStrengths');
    strengthsEl.innerHTML = (data.strengths || []).map(s => `<li>• ${s}</li>`).join('');

    const areasEl = document.getElementById('crAreasToImprove');
    areasEl.innerHTML = (data.areasToImprove || []).map(a => `<li>• ${a}</li>`).join('');

    const reviewEl = document.getElementById('crQuestionReview');
    reviewEl.innerHTML = (data.questionReview || []).map((item, i) => `
        <div class="cr-question-item">
            <div class="cr-question-title">${i + 1}. ${item.question}</div>
            <div class="cr-question-feedback">${item.feedback}</div>
        </div>
    `).join('');

    document.getElementById('crSummaryText').textContent = data.summary || '';

    const retakeBtn = document.getElementById('crRetakeBtn');
    if (retakeBtn && currentCareerJob) {
        retakeBtn.onclick = () => showCareerJobDetail(currentCareerJob._id);
    }
}

function downloadCareerReport() {
    showToast('PDF download coming soon', 'info');
}

function closeCareerCoach() {
    const careerContainer = document.getElementById('careerCoachContainer');
    const placeholder = document.querySelector('.career-webgl-placeholder');
    const iframe = document.getElementById('careerCoachIframe');

    if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
        const exitFullscreen = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
        if (exitFullscreen) {
            exitFullscreen.call(document);
        }
    }

    if (iframe) {
        iframe.src = 'about:blank';
    }

    if (placeholder) {
        placeholder.innerHTML = `
            <p>🎤 Career Coach interview loading...</p>
        `;
    }

    if (careerContainer) {
        careerContainer.style.display = 'none';
    }

    document.getElementById('startCareerInterviewBtn').style.display = 'block';
    showGenerateReportBtn();
}

// =====================
// UNITY WEBGL INTEGRATION
// =====================
function launchUnityWebGL() {
    console.log(`🎮 Launching Unity WebGL for module: ${currentModule._id}`);
    console.log('📦 Module data:', currentModule);
    
    // Get token using correct key
    let token = localStorage.getItem(TOKEN_KEY);
    if (!token && currentUser && currentUser.token) {
        token = currentUser.token;
    }
    
    console.log(`🔑 Token available: ${token ? 'YES (' + token.substring(0, 20) + '...)' : 'NO'}`);
    console.log(`🔑 TOKEN_KEY = '${TOKEN_KEY}'`);
    console.log(`🔑 currentUser =`, currentUser);
    
    // Build URL with module ID and token
    let webglUrl = `/webgl/index.html?moduleId=${currentModule._id}`;
    if (token) {
        webglUrl += `&token=${encodeURIComponent(token)}`;
        console.log('✅ Token added to WebGL URL');
    } else {
        console.warn('⚠️ No token found - WebGL will run without authentication');
    }
    
    showToast(`${currentModule.title} module loaded!`, 'success');
    console.log('📡 WebGL URL:', webglUrl);
    
    // Navigate to WebGL player in new approach - open it in the unity container
    const placeholder = document.querySelector('.unity-webgl-placeholder');
    placeholder.innerHTML = `
        <div class="unity-webgl-fullscreen">
            <div class="unity-webgl-toolbar">
                <button class="btn btn-secondary" onclick="closeUnityWebGL()">Close Player</button>
            </div>
            <iframe 
                id="webglIframe"
                src="${webglUrl}"
                class="webgl-fullscreen-frame"
                allow="fullscreen; microphone"
                sandbox="allow-same-origin allow-scripts allow-popups allow-pointer-lock allow-modals allow-top-navigation-by-user-activation allow-forms"
            ></iframe>
        </div>
    `;
    
    document.getElementById('unityContainer').style.display = 'block';

    const iframe = document.getElementById('webglIframe');
    if (iframe && iframe.requestFullscreen) {
        iframe.requestFullscreen().catch((error) => {
            console.warn('Unable to request fullscreen for Unity iframe:', error);
        });
    }
}

function closeUnityWebGL() {
    const unityContainer = document.getElementById('unityContainer');
    const placeholder = document.querySelector('.unity-webgl-placeholder');
    const iframe = document.getElementById('webglIframe');

    if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
        const exitFullscreen = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
        if (exitFullscreen) {
            exitFullscreen.call(document);
        }
    }

    if (iframe) {
        iframe.src = 'about:blank';
    }

    if (placeholder) {
        placeholder.innerHTML = `
            <p>🎮 Unity WebGL content would load here</p>
            <p id="moduleIdDisplay"></p>
            <p style="font-size: 12px; color: #999;">Module ID: <code id="moduleIdCode"></code></p>
        `;
    }

    if (unityContainer) {
        unityContainer.style.display = 'none';
    }
}

// =====================
// REPORT SAVING
// =====================
async function saveReport(reportData) {
    try {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) {
            showToast('❌ Not authenticated. Please login first.', 'error');
            return null;
        }

        console.log('💾 Saving report:', reportData);

        const response = await fetch(`${API_URL}/reports`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(reportData)
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('❌ Report save error:', error);
            showToast(`❌ Failed to save report: ${error.message}`, 'error');
            return null;
        }

        const savedReport = await response.json();
        console.log('✅ Report saved successfully:', savedReport);
        showToast('✅ Report saved successfully!', 'success');
        return savedReport;
    } catch (error) {
        console.error('❌ Report save exception:', error);
        showToast(`❌ Error saving report: ${error.message}`, 'error');
        return null;
    }
}

// Get user's reports
async function getUserReports() {
    try {
        const token = localStorage.getItem(TOKEN_KEY);
        console.log('🔑 TOKEN_KEY:', TOKEN_KEY);
        console.log('🔑 Token from localStorage:', token ? token.substring(0, 20) + '...' : 'NONE');
        
        if (!token) {
            console.warn('⚠️ Not authenticated. Cannot fetch reports.');
            showToast('⚠️ No auth token found. Please login again.', 'error');
            return [];
        }

        console.log('📤 Sending GET /reports with token');
        const response = await fetch(`${API_URL}/reports`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('📥 Response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Failed to fetch reports:', errorData);
            showToast(`❌ Failed to load reports: ${errorData.message}`, 'error');
            return [];
        }

        const data = await response.json();
        console.log('✅ Reports fetched:', data);
        return data.data || [];
    } catch (error) {
        console.error('❌ Error fetching reports:', error);
        showToast(`❌ Error: ${error.message}`, 'error');
        return [];
    }
}

// Get specific report by ID
async function getReportById(reportId) {
    try {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) {
            console.warn('⚠️ Not authenticated. Cannot fetch report.');
            return null;
        }

        const response = await fetch(`${API_URL}/reports/${reportId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            console.error('❌ Failed to fetch report');
            return null;
        }

        const report = await response.json();
        console.log('✅ Report fetched:', report);
        return report.data;
    } catch (error) {
        console.error('❌ Error fetching report:', error);
        return null;
    }
}

// =====================
// REPORTS UI SECTION
// =====================
async function showReports() {
    console.log('📊 Showing reports section');
    console.log('🔐 Current user:', currentUser);
    console.log('🔐 Token in localStorage:', localStorage.getItem(TOKEN_KEY) ? 'EXISTS' : 'MISSING');

    document.getElementById('authSection').style.display = 'none';
    document.getElementById('modulesSection').style.display = 'none';
    document.getElementById('moduleDetailSection').style.display = 'none';
    document.getElementById('reportsSection').style.display = 'block';
    document.getElementById('reportDetailSection').style.display = 'none';
    document.getElementById('careerReportSection').style.display = 'none';
    const trainingZone = document.getElementById('trainingZoneSection');
    if (trainingZone) trainingZone.style.display = 'none';
    hideDashboardExtras();
    const pt = document.getElementById('pageTitle');
    if (pt) pt.textContent = 'Reports';

    updateSidebarUser(currentUser);
    setActiveNav('nav-reports');

    showLoading(true);
    const reports = await getUserReports();
    showLoading(false);

    const reportsList = document.getElementById('reportsList');
    
    if (!reports || reports.length === 0) {
        reportsList.innerHTML = '<p style="text-align: center; padding: 40px;">No reports yet. Complete a training module to generate a report.</p>';
        return;
    }

    reportsList.innerHTML = reports.map(report => `
        <div class="report-card" onclick="showReportDetail('${report._id}')">
            <div class="report-card-header">
                <h3>${report.module.title}</h3>
                <span class="report-score">${report.overallScore}</span>
            </div>
            <div class="report-card-body">
                <p><strong>Interaction Time:</strong> ${report.interactionTime}</p>
                <p><strong>Date:</strong> ${new Date(report.createdAt).toLocaleDateString()}</p>
                <div class="report-skills">
                    <span class="skill-badge">${report.skills.communication}</span>
                    <span class="skill-badge">${report.skills.clarity}</span>
                </div>
            </div>
        </div>
    `).join('');
}

async function showReportDetail(reportId) {
    console.log(`📋 Showing report detail: ${reportId}`);
    document.getElementById('reportsSection').style.display = 'none';
    document.getElementById('reportDetailSection').style.display = 'block';

    showLoading(true);
    const report = await getReportById(reportId);
    showLoading(false);

    if (!report) {
        showToast('❌ Failed to load report', 'error');
        showReports();
        return;
    }

    // Populate report details
    document.getElementById('reportModuleTitle').textContent = report.module.title;
    document.getElementById('reportDateTime').textContent = new Date(report.createdAt).toLocaleString();
    document.getElementById('reportInteractionTime').textContent = report.interactionTime;
    document.getElementById('reportOverallScore').textContent = report.overallScore;
    document.getElementById('reportSpeakingPace').textContent = `${report.speakingPace.wpm} WPM`;
    document.getElementById('reportSpeakingPaceRating').textContent = report.speakingPace.rating;
    document.getElementById('reportFillerWords').textContent = `${report.fillerWords.count} words`;
    document.getElementById('reportFillerWordsRating').textContent = report.fillerWords.rating;

    // Skills
    document.getElementById('reportSkillCommunication').textContent = report.skills.communication;
    document.getElementById('reportSkillProblemSolving').textContent = report.skills.problemSolving;
    document.getElementById('reportSkillClarity').textContent = report.skills.clarity;
    document.getElementById('reportSkillBodyLanguage').textContent = report.skills.bodyLanguage;

    // Transcript and Feedback
    document.getElementById('reportTranscript').textContent = report.transcript || 'No transcript available';
    document.getElementById('reportFeedback').textContent = report.feedback || 'No feedback available';
}

// =====================
// UI HELPERS
// =====================
function showLoading(show) {
    document.getElementById('loadingSpinner').style.display = show ? 'flex' : 'none';
}

function showToast(message, type = 'info') {
    console.log(`📢 Toast [${type}]: ${message}`);
    
    const container = document.getElementById('toastContainer');
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function clearLoginForm() {
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('loginError').classList.remove('show');
}

function clearRegisterForm() {
    document.getElementById('registerName').value = '';
    document.getElementById('registerEmail').value = '';
    document.getElementById('registerPassword').value = '';
    document.getElementById('registerError').classList.remove('show');
}

// =====================
// DEBUG LOGGING
// =====================
console.log('%c🔹 DommyPro Frontend Loaded', 'color: #667eea; font-size: 16px; font-weight: bold;');
console.log('API URL:', API_URL);
console.log('Token Key:', TOKEN_KEY);
console.log('User Key:', USER_KEY);
