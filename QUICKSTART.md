# DommyPro - Quick Start Guide

## 📋 Prerequisites
- Node.js 18+ installed
- npm installed
- Git (optional)

## 🚀 Setup in 3 Steps

### Step 1: Install Backend Dependencies
```bash
cd "e:\MetaVerse911\01 - Projects\WebProjects\TFG DommyPro"
npm install
```

### Step 2: Start Backend Server
```bash
npm start
```

You should see:
```
✅ Server running on http://localhost:3000
📊 API Documentation:
  - Health Check: GET http://localhost:3000/health
  - Register: POST http://localhost:3000/auth/register
  ...
```

### Step 3: Open Frontend
Open `index.html` in your browser:
- Double-click the file, OR
- Use VS Code Live Server extension, OR
- Run a local server: `python -m http.server 8000`

## 🎯 Complete End-to-End Flow

### 1. **Register** 📝
- Click "Register" button
- Fill in Name, Email, Password
- Click "Register"
- See success toast notification
- Dashboard automatically loads

### 2. **View Modules** 📚
- You now see 3 modules:
  - Leadership & Management (30 mins, 5 lessons)
  - Innovation (45 mins, 3 lessons)
  - Sales Excellence (60 mins, 8 lessons)

### 3. **View Module Details** 🔍
- Click any module card
- See full details:
  - Title & Description
  - Duration & Number of Lessons
  - Submodules list
  - Module ID

### 4. **Launch Module** 🎮
- Click "Launch Module" button
- Unity WebGL placeholder appears
- Shows Module ID for debugging
- In production: Initializes real Unity with correct moduleId

### 5. **Logout** 👋
- Click "Logout" button in top-right
- Token is cleared from localStorage
- Redirected to login screen

### 6. **Login** 🔐
- Try logging in with same credentials
- Verify it works!

## 🧪 Test with API Endpoints

### Health Check
```bash
curl http://localhost:3000/health
```

### Register
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"John Doe\",\"email\":\"john@example.com\",\"password\":\"secret\"}"
```

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"john@example.com\",\"password\":\"secret\"}"
```

### Get Modules
```bash
curl http://localhost:3000/modules
```

### Get Module by ID
```bash
curl http://localhost:3000/modules/6920a2eda37e548ad7b21444
```

## 🐛 Debugging

### Check Browser Console (F12)
- Look for 🚀, ✅, ❌, 📥, 📡 logs
- Every action is logged with timestamps

### Check Backend Terminal
- See all incoming requests
- Console logs from server

### Check Network Tab (F12 → Network)
- See all API calls
- Check request/response bodies
- Verify status codes

### Common Issues

**"Cannot GET /modules"**
- Backend not running on port 3000
- Fix: Run `npm start` in backend folder

**CORS Error**
- Frontend running on different port than expected
- Fix: Check `API_URL` in `app.js` (should be `http://localhost:3000`)

**Token not persisting**
- Check localStorage in DevTools (F12 → Application → Storage)
- Verify localStorage is not disabled
- Check for "authToken" and "currentUser" keys

**Login fails with invalid email**
- Make sure to register first
- Use exact same email/password combo
- Check backend console for errors

## 📊 Project Structure

```
TFG DommyPro/
├── package.json          ← Dependencies
├── server.js             ← Backend API (port 3000)
├── index.html            ← Frontend UI
├── styles.css            ← Frontend styling
├── app.js                ← Frontend logic
├── README.md             ← Full documentation
├── QUICKSTART.md         ← This file
└── .gitignore            ← Git ignore rules
```

## 🎓 Learning Path

1. **First Run**: Register → Login → View Modules
2. **API Testing**: Use curl to test endpoints directly
3. **Code Review**: 
   - Check `server.js` for API structure
   - Check `app.js` for frontend integration
   - Check console logs for flow understanding
4. **Customization**:
   - Add more modules in `STATIC_MODULES`
   - Add more auth endpoints
   - Update UI styling in `styles.css`

## 🔧 Customization

### Add More Modules
Edit `server.js` - update `STATIC_MODULES` array:
```javascript
STATIC_MODULES = [
  // ... existing modules
  {
    "_id": "new_id_123",
    "title": "Your Module Title",
    "description": "Your description",
    "duration": "XX mins",
    "totalLessons": 10,
    // ... more fields
  }
]
```

### Change Port
Edit `server.js`:
```javascript
const PORT = 3001; // Change from 3000
```

### Add New Auth Endpoint
Add to `server.js`:
```javascript
app.post('/auth/profile', (req, res) => {
  // Your logic
});
```

## 📞 Support

### Backend Issues
- Check terminal for errors
- Verify Node.js version: `node --version`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Frontend Issues
- Check browser console: F12 → Console
- Clear localStorage: `localStorage.clear()` in console
- Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)

### API Testing
- Use Postman (free download)
- Or use curl commands above

## ✅ Success Indicators

- ✅ Backend running on http://localhost:3000/health (returns JSON)
- ✅ Frontend loads without errors
- ✅ Can register new user
- ✅ Can login with registered user
- ✅ Can view modules
- ✅ Can see module details
- ✅ Can logout and login again
- ✅ All console logs visible in DevTools

## 🎉 Next Steps

1. Deploy backend to production server
2. Connect real Unity WebGL with moduleId
3. Add database (MongoDB/PostgreSQL)
4. Implement JWT tokens
5. Add password hashing (bcrypt)
6. Add user profiles & progress tracking
7. Add admin panel for module management

---

**Happy Learning! 🚀**
