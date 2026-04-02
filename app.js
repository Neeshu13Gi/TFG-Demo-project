/**
 * DommyPro Frontend - Main Application Logic
 * Handles authentication, module fetching, and UI state management
 */

// =====================
// CONFIGURATION
// =====================
const API_URL = 'https://tfg-demo-project.onrender.com';

const TOKEN_KEY = 'authToken';
const USER_KEY = 'currentUser';

// =====================
// STATE MANAGEMENT
// =====================
let currentUser = null;
let currentModule = null;
let allModules = [];

// =====================
// INITIALIZATION
// =====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DommyPro Frontend Initialized');
    
    // Check if user is already logged in
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);
    
    if (savedToken && savedUser) {
        currentUser = JSON.parse(savedUser);
        console.log('✅ User restored from localStorage:', currentUser.email);
        showDashboard();
    } else {
        console.log('📝 No active session. Showing auth screen.');
        showLoginForm();
    }
});

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
    document.getElementById('authSection').style.display = 'flex';
    clearRegisterForm();
}

function showDashboard() {
    console.log('🏠 Showing dashboard');
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('modulesSection').style.display = 'block';
    document.getElementById('moduleDetailSection').style.display = 'none';
    
    // Update navbar
    document.getElementById('authLinks').style.display = 'none';
    document.getElementById('userInfo').style.display = 'flex';
    document.getElementById('userName').textContent = currentUser.name;
    
    // Show welcome message
    document.getElementById('welcomeMessage').style.display = 'block';
    document.getElementById('welcomeName').textContent = currentUser.name;
    
    // Fetch and display modules
    fetchModules();
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
        
        // Show dashboard after a short delay
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
    
    // Reset UI
    document.getElementById('userInfo').style.display = 'none';
    document.getElementById('authLinks').style.display = 'flex';
    
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

    modules.forEach((module, index) => {
        const moduleCard = document.createElement('div');
        moduleCard.className = 'module-card';
        moduleCard.onclick = () => showModuleDetail(module?._id);

        const title = module?.title || 'Untitled Module';
        const description = module?.description || 'No description available';
        const duration = module?.duration || 'N/A';
        const totalLessons = module?.totalLessons ?? 0;

        moduleCard.innerHTML = `
            <div class="module-thumbnail">📚</div>
            <div class="module-content">
                <h3>${title}</h3>
                <p>${description}</p>
                <div class="module-meta">
                    <span>⏱️ ${duration}</span>
                    <span>📝 ${totalLessons} lessons</span>
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
        const titleEl = document.getElementById('moduleDetailTitle');
        const descEl = document.getElementById('moduleDetailDescription');
        const durationEl = document.getElementById('moduleDetailDuration');
        const lessonsEl = document.getElementById('moduleDetailLessons');
        const typeEl = document.getElementById('moduleDetailType');
        const submodulesList = document.getElementById('submodulesList');

        if (!titleEl || !descEl || !durationEl || !lessonsEl || !typeEl || !submodulesList) {
            throw new Error('Required DOM elements for module detail not found');
        }

        // Optional element
        const idEl = document.getElementById('moduleIdCode');

        // Fill in module data with safe defaults
        titleEl.textContent = currentModule.title || 'Untitled Module';
        descEl.textContent = currentModule.description || 'No description available';
        durationEl.textContent = currentModule.duration || 'N/A';
        lessonsEl.textContent = currentModule.totalLessons ?? 0;
        typeEl.textContent = currentModule.type || 'Unknown';

        if (idEl) idEl.textContent = currentModule._id || 'N/A';

        // Render submodules
        submodulesList.innerHTML = '';

        const submodules = Array.isArray(currentModule.submodules) ? currentModule.submodules : [];
        if (submodules.length > 0) {
            console.log(`📚 Rendering ${submodules.length} submodules`);
            submodules.forEach((sub, index) => {
                const li = document.createElement('li');
                li.style.marginBottom = '0.5rem';

                const button = document.createElement('button');
                button.className = 'btn btn-outline';
                button.style.width = '100%';
                button.style.textAlign = 'left';
                button.textContent = `${index + 1}. ${sub?.title || 'Untitled Submodule'}`;
                button.onclick = () => showToast(`Submodule selected: ${sub?.title || 'Untitled'}`, 'success');

                li.appendChild(button);
                submodulesList.appendChild(li);
            });
        } else {
            console.warn('⚠️ No submodules available for this module');
            submodulesList.innerHTML = '<li><em>No submodules available</em></li>';
        }

        // Toggle UI sections
        document.getElementById('modulesSection').style.display = 'none';
        document.getElementById('welcomeMessage').style.display = 'none';
        document.getElementById('moduleDetailSection').style.display = 'block';

    } catch (error) {
        console.error('❌ Error loading module detail:', error);
        showToast(error.message || 'Unknown error loading module', 'error');
    }
}

function backToModules() {
    console.log('⬅️ Going back to modules list');
    document.getElementById('moduleDetailSection').style.display = 'none';
    document.getElementById('unityContainer').style.display = 'none';
    document.getElementById('modulesSection').style.display = 'block';
    currentModule = null;
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
        <div style="text-align: center; padding: 20px;">
            <p style="margin-bottom: 10px;">Loading Unity WebGL Player...</p>
            <iframe 
                id="webglIframe"
                src="${webglUrl}" 
                style="width: 100%; height: 700px; border: none; border-radius: 8px;"
                allowfullscreen="true"
                sandbox="allow-same-origin allow-scripts allow-popups allow-pointer-lock allow-modals allow-top-navigation-by-user-activation"
            ></iframe>
        </div>
    `;
    
    document.getElementById('unityContainer').style.display = 'block';
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
