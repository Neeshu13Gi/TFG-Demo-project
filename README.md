# DommyPro Backend API

Production-ready Node.js backend with Express.js for authentication and module management.

## Setup

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Running the Server

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

The server will start on `https://tfg-demo-project.onrender.com`

## API Documentation

### Health Check
```http
GET /health
```

### Authentication APIs

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "abc123",
    "name": "John Doe",
    "email": "john@example.com",
    "avatarUrl": "",
    "role": "user",
    "token": "DUMMY_TOKEN_1234567890_ABCD1234"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "User already exists"
}
```

---

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "abc123",
    "name": "John Doe",
    "email": "john@example.com",
    "avatarUrl": "",
    "role": "user",
    "token": "DUMMY_TOKEN_1234567890_ABCD1234"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

#### Logout User
```http
POST /auth/logout
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Module APIs

#### Get All Modules
```http
GET /modules
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6920a2eda37e548ad7b21444",
      "title": "Leadership & Management",
      "description": "Build essential leadership qualities.",
      "thumbnailUrl": "",
      "type": "WEB",
      "duration": "30 mins",
      "totalLessons": 5,
      "submodules": [
        {
          "title": "EQ based Leadership",
          "submoduleId": "698c6e71e8ad60a12303754a"
        }
      ]
    }
  ]
}
```

---

#### Get Module by ID
```http
GET /modules/:id
```

**Example:**
```http
GET /modules/6920a2eda37e548ad7b21444
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "6920a2eda37e548ad7b21444",
    "title": "Leadership & Management",
    "description": "Build essential leadership qualities.",
    "thumbnailUrl": "",
    "type": "WEB",
    "duration": "30 mins",
    "totalLessons": 5,
    "submodules": [
      {
        "title": "EQ based Leadership",
        "submoduleId": "698c6e71e8ad60a12303754a"
      }
    ]
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Module not found"
}
```

---

## Features

✅ **Express.js** - Fast and minimalist web framework  
✅ **CORS Enabled** - Cross-origin requests supported  
✅ **JSON Middleware** - Automatic JSON parsing  
✅ **In-Memory Storage** - No database setup required  
✅ **Authentication** - Register, login, logout flows  
✅ **Module Management** - Static module data with search by ID  
✅ **Error Handling** - Comprehensive error responses  
✅ **Production-Ready** - Structured, scalable code  

## Testing

### Using cURL

```bash
# Register
curl -X POST https://tfg-demo-project.onrender.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"pass123"}'

# Login
curl -X POST https://tfg-demo-project.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"pass123"}'

# Get Modules
curl https://tfg-demo-project.onrender.com/modules

# Get Module by ID
curl https://tfg-demo-project.onrender.com/modules/6920a2eda37e548ad7b21444
```

### Using Postman

1. Import the endpoints from the API Documentation
2. Test each endpoint with the provided request bodies
3. Copy tokens from successful login responses to test protected routes

## Integration with Frontend

### Example: React/TypeScript

```typescript
const API_URL = 'https://tfg-demo-project.onrender.com';

// Register
const register = async (name: string, email: string, password: string) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  return response.json();
};

// Login
const login = async (email: string, password: string) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return response.json();
};

// Get Modules
const getModules = async () => {
  const response = await fetch(`${API_URL}/modules`);
  return response.json();
};

// Get Module by ID
const getModuleById = async (id: string) => {
  const response = await fetch(`${API_URL}/modules/${id}`);
  return response.json();
};
```

## Architecture

```
DommyPro Backend
├── server.js          # Main application file
├── package.json       # Dependencies & scripts
├── README.md          # This file
└── .gitignore         # Git ignore rules
```

## Future Enhancements

- Add JWT token validation
- Implement password hashing (bcrypt)
- Add database persistence (MongoDB/PostgreSQL)
- Add rate limiting
- Add request logging/monitoring
- Add authentication for protected endpoints
- Add user profile management
- Add module progress tracking

## Notes

⚠️ **Data Persistence**: User data is stored in memory and will be lost when the server restarts.  
⚠️ **Security**: Passwords are stored in plain text. Use proper hashing in production.  
⚠️ **Tokens**: Tokens are dummy tokens. Implement JWT in production.

---

# 🎨 Frontend Setup

## Files

- `index.html` - Main HTML structure
- `styles.css` - Complete styling (responsive design)
- `app.js` - JavaScript logic with console debugging

## Features

✅ **Authentication Flow**
- Register new account
- Login with credentials
- Persistent token storage (localStorage)
- Logout button with token clearing

✅ **Module Management**
- View all available modules
- Click to see module details
- Display submodule information
- Module metadata (duration, lessons, type)

✅ **Error Handling**
- Login/Register validation
- Network error handling
- User-friendly error messages
- Toast notifications

✅ **Debugging**
- Console logs for every action
- API request/response logging
- State management logging
- Event tracking

✅ **UI/UX**
- Clean, modern interface
- Responsive design (mobile-friendly)
- Smooth animations
- Loading indicators
- Toast notifications

## Running the Frontend

Once both backend and frontend are ready:

### 1. Start Backend
```bash
cd "e:\MetaVerse911\01 - Projects\WebProjects\TFG DommyPro"
npm start
```

### 2. Open Frontend in Browser
```
http://localhost:[YOUR_PORT]/index.html
```

Or use VS Code Live Server extension:
- Right-click `index.html`
- Select "Open with Live Server"

## Complete User Flow

```
1. User opens http://localhost:PORT/index.html
   ↓
2. Register or Login form appears
   ↓
3. User fills form and submits
   ↓
4. Frontend sends to Backend API (https://tfg-demo-project.onrender.com/auth/register or /auth/login)
   ↓
5. Backend validates & stores in memory, returns token
   ↓
6. Frontend saves token to localStorage
   ↓
7. Dashboard loads with all modules
   ↓
8. User clicks module card
   ↓
9. Module details load (API call to /modules/:id)
   ↓
10. "Launch Module" button shows Unity WebGL placeholder
    (In production, this would initialize Unity with moduleId)
   ↓
11. User can click logout → token cleared → back to login
```

## API Integration

### Register
```javascript
POST /auth/register
{
  "name": "John",
  "email": "john@example.com",
  "password": "pass123"
}

Response:
{
  "success": true,
  "data": {
    "_id": "abc123",
    "token": "DUMMY_TOKEN_xxx",
    "name": "John",
    "email": "john@example.com"
  }
}
```

### Login
```javascript
POST /auth/login
{
  "email": "john@example.com",
  "password": "pass123"
}
```

### Get Modules
```javascript
GET /modules
Authorization: Bearer DUMMY_TOKEN_xxx
```

### Get Module Detail
```javascript
GET /modules/6920a2eda37e548ad7b21444
Authorization: Bearer DUMMY_TOKEN_xxx
```

## Console Debugging

Open browser DevTools (F12) to see all logs:

```
🚀 DommyPro Frontend Initialized
📝 Showing login form
🔐 Login form submitted
📧 Logging in: john@example.com
📡 Login response: {...}
✅ Login successful! john@example.com
🏠 Showing dashboard
📥 Fetching modules...
📡 Modules response: {...}
✅ Loaded 3 modules
📖 Loading module detail: 6920a2eda37e548ad7b21444
✅ Module loaded: Leadership & Management
🎮 Launching Unity WebGL for module: 6920a2eda37e548ad7b21444
👋 Logging out
```

## Error Handling Examples

### Invalid Login
```javascript
❌ Login error: Invalid email or password
```

### Network Error
```javascript
❌ Error fetching modules: Failed to fetch
```

### Register - User Exists
```javascript
❌ Registration error: User already exists
```

## Storage

### localStorage Keys
- `authToken` - JWT/Dummy token from backend
- `currentUser` - User object (JSON stringified)

### In-Memory Backend
- `users` - Array of registered users
- `STATIC_MODULES` - Static module data

## Testing Checklist

- [ ] Register new user
- [ ] Login with registered user
- [ ] View modules list
- [ ] Click modules to see details
- [ ] Logout and verify token is cleared
- [ ] Refresh page and verify session persists (if logged in)
- [ ] Try invalid login
- [ ] Check browser console for all logs
- [ ] Test on mobile/tablet view

## Unity WebGL Integration

To connect with real Unity WebGL:

```javascript
// In app.js launchUnityWebGL() function:
if (window.unityInstance) {
    window.unityInstance.SendMessage(
        'UIManager',           // GameObject name
        'LoadModule',          // Method name
        currentModule._id      // Module ID parameter
    );
}
```

## License

MIT
