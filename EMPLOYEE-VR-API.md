# Employee VR Training System - API Documentation

## 🎯 Overview

The DommyPro backend now includes employee VR training management. Employees can log in and access assigned training modules which are delivered via Unity WebGL.

---

## 📋 Employee Training Endpoints

### 1. Employee Login (Create/Update)

**Endpoint:** `POST /login`

**Purpose:** Log in an employee. If the employee doesn't exist, create a new record. If they exist, update their last login time.

**Request:**
```json
{
  "employeeID": "EMP001",
  "employeeName": "John Doe"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "employeeID": "EMP001",
  "employeeName": "John Doe",
  "message": "Logged in successfully",
  "createdAt": "2026-03-26T10:30:00.000Z",
  "lastLogin": "2026-03-26T10:35:00.000Z"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "employeeID and employeeName are required"
}
```

**Example cURL:**
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"employeeID":"EMP001","employeeName":"John Doe"}'
```

---

### 2. Get Training Modules

**Endpoint:** `GET /getTrainingModules?employeeID=EMP001`

**Purpose:** Fetch the list of available VR training modules for the logged-in employee.

**Query Parameters:**
- `employeeID` (required): The employee ID

**Response (200 OK):**
```json
{
  "success": true,
  "employeeID": "EMP001",
  "employeeName": "John Doe",
  "modules": [
    {
      "moduleID": "vr_safety_001",
      "moduleName": "VR Safety Training",
      "description": "Comprehensive safety protocols",
      "duration": "30 mins"
    },
    {
      "moduleID": "vr_compliance_002",
      "moduleName": "Compliance Training",
      "description": "Company compliance and regulations",
      "duration": "45 mins"
    },
    {
      "moduleID": "vr_leadership_003",
      "moduleName": "VR Leadership Program",
      "description": "Leadership skills in virtual environment",
      "duration": "60 mins"
    },
    {
      "moduleID": "vr_technical_004",
      "moduleName": "Technical Skills Training",
      "description": "Advanced technical training",
      "duration": "90 mins"
    },
    {
      "moduleID": "vr_customer_005",
      "moduleName": "Customer Service VR",
      "description": "Customer interaction simulations",
      "duration": "50 mins"
    }
  ],
  "totalModules": 5,
  "completedModules": []
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "employeeID is required"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Employee not found"
}
```

**Example cURL:**
```bash
curl "http://localhost:3000/getTrainingModules?employeeID=EMP001"
```

---

## 🚀 Complete Employee Training Flow

### Step 1: Employee Login
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"employeeID":"EMP001","employeeName":"John Doe"}'
```

Response:
```json
{
  "status": "success",
  "employeeID": "EMP001",
  "employeeName": "John Doe",
  "message": "Logged in successfully"
}
```

### Step 2: Fetch Available Modules
```bash
curl "http://localhost:3000/getTrainingModules?employeeID=EMP001"
```

Response: (See above - array of 5 training modules)

### Step 3: Launch WebGL Training
```
URL: http://localhost:3000/webgl/Build/index.html?moduleID=vr_safety_001&employeeID=EMP001
```

The WebGL application loads and can read the parameters:
```javascript
const urlParams = new URLSearchParams(window.location.search);
const moduleID = urlParams.get('moduleID');      // vr_safety_001
const employeeID = urlParams.get('employeeID');  // EMP001
```

---

## 📁 Available Training Modules

| Module ID | Module Name | Description | Duration |
|-----------|-------------|-------------|----------|
| `vr_safety_001` | VR Safety Training | Comprehensive safety protocols | 30 mins |
| `vr_compliance_002` | Compliance Training | Company compliance and regulations | 45 mins |
| `vr_leadership_003` | VR Leadership Program | Leadership skills in virtual environment | 60 mins |
| `vr_technical_004` | Technical Skills Training | Advanced technical training | 90 mins |
| `vr_customer_005` | Customer Service VR | Customer interaction simulations | 50 mins |

---

## 🎮 Integration with WebGL

### Launching a Training Module

**Frontend (JavaScript):**
```javascript
// 1. Login employee
const loginResponse = await fetch('http://localhost:3000/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    employeeID: 'EMP001',
    employeeName: 'John Doe'
  })
});

// 2. Get available modules
const modulesResponse = await fetch('http://localhost:3000/getTrainingModules?employeeID=EMP001');
const modules = await modulesResponse.json();

// 3. Launch specific module in WebGL
const module = modules.modules[0]; // First module
const webglUrl = `http://localhost:3000/webgl/Build/index.html?moduleID=${module.moduleID}&employeeID=EMP001`;
window.location.href = webglUrl;
// Or open in iframe/new window
```

### Reading Parameters in Unity WebGL

**In your Unity C# script:**
```csharp
using UnityEngine;

public class ModuleLoader : MonoBehaviour
{
    void Start()
    {
        string moduleID = GetQueryParam("moduleID");
        string employeeID = GetQueryParam("employeeID");
        
        Debug.Log($"Loading module: {moduleID} for employee: {employeeID}");
        // Load appropriate training content based on moduleID
        LoadTrainingModule(moduleID);
    }
    
    string GetQueryParam(string param)
    {
        string url = Application.absoluteURL;
        int paramStart = url.IndexOf("?");
        if (paramStart == -1) return "";
        
        string queryString = url.Substring(paramStart + 1);
        foreach (string pair in queryString.Split('&'))
        {
            string[] parts = pair.Split('=');
            if (parts[0] == param && parts.Length > 1)
                return System.Uri.UnescapeDataString(parts[1]);
        }
        return "";
    }
}
```

---

## 📊 Data Storage

### In-Memory Employee Records

Employees are stored in memory with the following structure:
```json
{
  "employeeID": "EMP001",
  "employeeName": "John Doe",
  "createdAt": "2026-03-26T10:30:00.000Z",
  "lastLogin": "2026-03-26T10:35:00.000Z",
  "completedModules": ["vr_safety_001", "vr_compliance_002"]
}
```

⚠️ **Note:** Data is stored in memory and will be lost when the server restarts. For production, use a database (MongoDB, PostgreSQL, etc.).

---

## 🔗 Server Endpoints Summary

```
Authentication (Original):
  POST   /auth/register              - Register new user
  POST   /auth/login                 - Login user (original)
  POST   /auth/logout                - Logout user
  GET    /modules                    - Get all modules
  GET    /modules/:id                - Get module by ID

Employee VR Training (New):
  POST   /login                      - Employee login/create
  GET    /getTrainingModules         - Get available modules for employee

WebGL Static Files:
  http://localhost:3000/webgl/*      - Access WebGL build files
```

---

## 🧪 Testing

### Using Postman

1. **Create Request Collection:**
   - Collections → New Collection → "Employee Training"

2. **Add Requests:**

   **Request 1: Employee Login**
   - Method: POST
   - URL: `http://localhost:3000/login`
   - Body (raw JSON):
     ```json
     {
       "employeeID": "EMP001",
       "employeeName": "John Doe"
     }
     ```

   **Request 2: Get Modules**
   - Method: GET
   - URL: `http://localhost:3000/getTrainingModules?employeeID=EMP001`

3. **Run Requests:** Send and check responses

---

## 📋 Test Scenarios

### Scenario 1: New Employee
```
1. POST /login with new employeeID
   → Employee record created
   → Login successful

2. GET /getTrainingModules?employeeID=EMP001
   → Returns 5 available modules
   → completedModules = []
```

### Scenario 2: Returning Employee
```
1. POST /login with existing employeeID (but new name)
   → Employee record updated
   → lastLogin updated
   → All previous data preserved

2. GET /getTrainingModules?employeeID=EMP001
   → Same modules returned
   → Previous completedModules preserved
```

### Scenario 3: WebGL Launch
```
1. Select from available modules
2. Open WebGL URL with moduleID parameter
3. Unity WebGL app reads parameters
4. Training content loads
5. Employee completes training
6. (Future) Mark module as completed via new endpoint
```

---

## 🔒 Security Considerations

**Current Implementation (Development):**
- No authentication required for /login endpoint
- No encryption of employee data
- In-memory storage (no persistence)

**Production Recommendations:**
- Implement JWT token authentication
- Require employee password or SSO integration
- Use HTTPS for all communications
- Store data in secure database
- Implement rate limiting
- Add audit logging
- Encrypt sensitive data
- Use firewall rules to restrict API access

---

## 💾 WebGL Folder Structure

```
webgl/
├── Build/
│   ├── index.html              ← Main WebGL player
│   ├── Build.wasm              ← WebAssembly module
│   ├── Build.js                ← JavaScript code
│   ├── Build.json              ← Build manifest
│   └── (other build files)
├── README.md                   ← Setup instructions
└── BUILD_INSTRUCTIONS.txt      ← How to export from Unity
```

**To add your Unity WebGL build:**
1. Open your project in Unity
2. Build for WebGL
3. Select the `webgl/Build/` folder as destination
4. Copy all files from the Unity build output

---

## 🚀 Quick Start

### Terminal 1: Start Backend
```bash
cd "e:\MetaVerse911\01 - Projects\WebProjects\TFG DommyPro"
npm start
```

### Terminal 2: Test API
```bash
# Employee login
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"employeeID":"EMP001","employeeName":"John Doe"}'

# Get training modules
curl "http://localhost:3000/getTrainingModules?employeeID=EMP001"
```

### Browser: Access WebGL
```
http://localhost:3000/webgl/Build/index.html
```

---

## 📞 Support

- Backend Logs: Check terminal output when running `npm start`
- API Errors: Check response `message` field
- WebGL Issues: Check browser console (F12 → Console)
- Network Issues: Check Network tab (F12 → Network)

---

**Happy Training! 🎓🚀**
