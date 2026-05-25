# API Testing Guide

This file contains example requests for testing the DommyPro API using different tools.

## 📋 Table of Contents
1. Using cURL
2. Using Postman
3. Using Insomnia
4. Using VS Code REST Client
5. Using Node.js (fetch)

---

## 1️⃣ Using cURL

### Register User
```bash
curl -X POST https://tfg-demo-project.onrender.com/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"John Doe\",
    \"email\": \"john@example.com\",
    \"password\": \"password123\"
  }"
```

**Expected Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "abc123def456",
    "name": "John Doe",
    "email": "john@example.com",
    "avatarUrl": "",
    "role": "user",
    "token": "DUMMY_TOKEN_1234567890_ABC123"
  }
}
```

### Login User
```bash
curl -X POST https://tfg-demo-project.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"john@example.com\",
    \"password\": \"password123\"
  }"
```

### Logout User
```bash
curl -X POST https://tfg-demo-project.onrender.com/auth/logout \
  -H "Content-Type: application/json"
```

### Get All Modules
```bash
curl -X GET https://tfg-demo-project.onrender.com/modules \
  -H "Authorization: Bearer DUMMY_TOKEN_1234567890_ABC123"
```

### Get Module by ID
```bash
curl -X GET https://tfg-demo-project.onrender.com/modules/6920a2eda37e548ad7b21444 \
  -H "Authorization: Bearer DUMMY_TOKEN_1234567890_ABC123"
```

### Health Check
```bash
curl https://tfg-demo-project.onrender.com/health
```

---

## 2️⃣ Using Postman

### Setup

1. **Create New Collection:**
   - Click "Collections" → "Create New Collection"
   - Name: "DommyPro API"

2. **Import Environment Variables:**
   - Click "Environments" → "Create New"
   - Add variable: `base_url` = `https://tfg-demo-project.onrender.com`
   - Add variable: `token` = (will update after login)

### Requests

#### Register
- **Method:** POST
- **URL:** `{{base_url}}/auth/register`
- **Headers:**
  - `Content-Type: application/json`
- **Body (raw JSON):**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```

#### Login
- **Method:** POST
- **URL:** `{{base_url}}/auth/login`
- **Headers:**
  - `Content-Type: application/json`
- **Body (raw JSON):**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Tests Tab (to save token):**
  ```javascript
  if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("token", jsonData.data.token);
  }
  ```

#### Get Modules
- **Method:** GET
- **URL:** `{{base_url}}/modules`
- **Headers:**
  - `Authorization: Bearer {{token}}`

#### Get Module by ID
- **Method:** GET
- **URL:** `{{base_url}}/modules/6920a2eda37e548ad7b21444`
- **Headers:**
  - `Authorization: Bearer {{token}}`

---

## 3️⃣ Using Insomnia

1. Create new Collection: "DommyPro"
2. Add Environment Variable:
   - `base_url`: `https://tfg-demo-project.onrender.com`
   - `token`: (empty, will update)

3. Create requests same as Postman examples

---

## 4️⃣ Using VS Code REST Client

Install extension: `REST Client` by Huachao Mao

Create file: `test.http`

```http
@base_url = https://tfg-demo-project.onrender.com
@token = DUMMY_TOKEN_xxx

### Health Check
GET {{base_url}}/health

### Register
POST {{base_url}}/auth/register
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "pass123"
}

### Login
POST {{base_url}}/auth/login
Content-Type: application/json

{
  "email": "jane@example.com",
  "password": "pass123"
}

### Logout
POST {{base_url}}/auth/logout
Content-Type: application/json

### Get All Modules
GET {{base_url}}/modules
Authorization: Bearer {{token}}

### Get Module by ID
GET {{base_url}}/modules/6920a2eda37e548ad7b21444
Authorization: Bearer {{token}}

### Get Module - Leadership
GET {{base_url}}/modules/6920a2eda37e548ad7b21444
Authorization: Bearer {{token}}

### Get Module - Innovation
GET {{base_url}}/modules/6920a2eda37e548ad7b21445
Authorization: Bearer {{token}}

### Get Module - Sales
GET {{base_url}}/modules/6920a2eda37e548ad7b21446
Authorization: Bearer {{token}}
```

Click "Send Request" to test each endpoint.

---

## 5️⃣ Using Node.js (fetch)

Create file: `test.js`

```javascript
const BASE_URL = 'https://tfg-demo-project.onrender.com';

// Helper function for API calls
async function apiCall(endpoint, method = 'GET', body = null, token = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await response.json();
  
  return {
    status: response.status,
    ok: response.ok,
    data
  };
}

// Test functions
async function runTests() {
  console.log('🧪 Starting API Tests...\n');

  // 1. Health Check
  console.log('1️⃣ Health Check');
  const health = await apiCall('/health');
  console.log(health.data);
  console.log('---\n');

  // 2. Register
  console.log('2️⃣ Register User');
  const register = await apiCall('/auth/register', 'POST', {
    name: 'Test User',
    email: 'test@example.com',
    password: 'test123'
  });
  console.log(register.data);
  const token = register.data.data?.token;
  console.log('---\n');

  // 3. Login
  console.log('3️⃣ Login');
  const login = await apiCall('/auth/login', 'POST', {
    email: 'test@example.com',
    password: 'test123'
  });
  console.log(login.data);
  console.log('Token:', login.data.data?.token);
  console.log('---\n');

  // 4. Get Modules
  console.log('4️⃣ Get All Modules');
  const modules = await apiCall('/modules', 'GET', null, token);
  console.log(`Found ${modules.data.data.length} modules`);
  modules.data.data.forEach(mod => {
    console.log(`  - ${mod.title} (${mod._id})`);
  });
  console.log('---\n');

  // 5. Get Module by ID
  console.log('5️⃣ Get Module by ID');
  const module = await apiCall('/modules/6920a2eda37e548ad7b21444', 'GET', null, token);
  console.log(module.data.data.title);
  console.log(module.data.data.description);
  console.log('---\n');

  // 6. Logout
  console.log('6️⃣ Logout');
  const logout = await apiCall('/auth/logout', 'POST');
  console.log(logout.data);

  console.log('\n✅ All tests completed!');
}

runTests().catch(console.error);
```

Run:
```bash
node test.js
```

---

## 🧩 Test Scenarios

### Scenario 1: Full User Journey
1. ✅ Health Check
2. ✅ Register new user
3. ✅ Login with credentials
4. ✅ Get all modules
5. ✅ Get specific module
6. ✅ Logout

### Scenario 2: Error Cases
1. ✅ Register with existing email (should fail)
2. ✅ Login with wrong password (should fail)
3. ✅ Get non-existent module (should 404)
4. ✅ Call without token (should 401)

### Scenario 3: Performance
1. ✅ Time: Register endpoint
2. ✅ Time: Login endpoint
3. ✅ Time: Get modules endpoint
4. ✅ Time: Get single module

---

## 📊 Expected Status Codes

| Endpoint | Method | Status | Meaning |
|----------|--------|--------|---------|
| `/health` | GET | 200 | API is running |
| `/auth/register` | POST | 201 | User created |
| `/auth/register` | POST | 400 | User exists or invalid data |
| `/auth/login` | POST | 200 | Login successful |
| `/auth/login` | POST | 401 | Invalid credentials |
| `/auth/logout` | POST | 200 | Logout successful |
| `/modules` | GET | 200 | Modules retrieved |
| `/modules/:id` | GET | 200 | Module found |
| `/modules/:id` | GET | 404 | Module not found |
| Any endpoint | ANY | 500 | Server error |

---

## 💡 Tips

- Always include `Content-Type: application/json` header
- Save token after login for subsequent requests
- Token goes in `Authorization: Bearer <token>` header
- Check response status before using data
- Use console logs or DevTools Network tab for debugging
- Backend logs all requests (check terminal)

---

## 🚀 Automation

### Using npm scripts

Add to `package.json`:
```json
{
  "scripts": {
    "test:curl": "bash test-curl.sh",
    "test:node": "node test.js"
  }
}
```

Run:
```bash
npm run test:node
```

---

Happy Testing! 🎉
