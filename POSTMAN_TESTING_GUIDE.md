# 🚀 Postman Testing Guide - Course CRUD APIs

## **Step 1: Start Your Server**
```bash
cd auth_system
npm run start
# or
npm run start:dev
```
Server runs on: `http://localhost:3000`

---

## **Step 2: Create Postman Collection**

### **2.1 Create New Collection**
- Open Postman
- Click **"Collections"** → **"Create New Collection"**
- Name it: `Course CRUD Tests`

### **2.2 Create Environment Variable**
1. Click **"Environments"** (top left)
2. Click **"Create Environment"**
3. Name it: `Local Development`
4. Add variables:
```
base_url: http://localhost:3000
token: (leave empty, will fill after login)
```
5. Click **Save**
6. Select this environment in the top-right dropdown

---

## **Step 3: API Requests (In Order)**

### **REQUEST 1: Register New Admin User**
```
Method: POST
URL: {{base_url}}/auth/register

Body (JSON):
{
  "username": "admin_user",
  "email": "admin@example.com",
  "password": "Admin@123456"
}

Expected Response (201):
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Save the token:**
1. Click **"Tests"** tab
2. Add this script:
```javascript
var jsonData = pm.response.json();
pm.environment.set("token", jsonData.access_token);
```
3. Send request → Token auto-saves to environment

---

### **REQUEST 2: Get User Profile (Verify Authentication)**
```
Method: GET
URL: {{base_url}}/auth/profile

Headers:
Authorization: Bearer {{token}}

Expected Response (200):
{
  "id": "507f1f77bcf86cd799439011",
  "username": "admin_user",
  "email": "admin@example.com"
}
```

---

### **REQUEST 3: Create Course (CREATE - Admin Only)**
```
Method: POST
URL: {{base_url}}/courses

Headers:
Authorization: Bearer {{token}}
Content-Type: application/json

Body (JSON):
{
  "courseName": "Advanced Node.js Mastery",
  "description": "Master advanced concepts in Node.js including streams, clustering, and performance optimization",
  "level": "Advanced",
  "price": 99.99
}

Expected Response (201):
{
  "statusCode": 201,
  "message": "Course created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "courseName": "Advanced Node.js Mastery",
    "description": "Master advanced concepts...",
    "level": "Advanced",
    "price": 99.99,
    "createdAt": "2026-04-10T10:30:00.000Z",
    "updatedAt": "2026-04-10T10:30:00.000Z"
  }
}
```

**Save Course ID:**
```javascript
// Add to Tests tab
var jsonData = pm.response.json();
pm.environment.set("courseId", jsonData.data._id);
```

---

### **REQUEST 4: Get All Courses (READ - Public)**
```
Method: GET
URL: {{base_url}}/courses

Headers: (None needed)

Expected Response (200):
{
  "statusCode": 200,
  "message": "Courses retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "courseName": "Advanced Node.js Mastery",
      "description": "Master advanced concepts...",
      "level": "Advanced",
      "price": 99.99,
      "createdAt": "2026-04-10T10:30:00.000Z",
      "updatedAt": "2026-04-10T10:30:00.000Z"
    }
  ],
  "count": 1
}
```

---

### **REQUEST 5: Get Single Course by ID (READ - Public)**
```
Method: GET
URL: {{base_url}}/courses/{{courseId}}

Headers: (None needed)

Expected Response (200):
{
  "statusCode": 200,
  "message": "Course retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "courseName": "Advanced Node.js Mastery",
    "description": "Master advanced concepts...",
    "level": "Advanced",
    "price": 99.99,
    "createdAt": "2026-04-10T10:30:00.000Z",
    "updatedAt": "2026-04-10T10:30:00.000Z"
  }
}
```

---

### **REQUEST 6: Update Course (UPDATE - Admin Only)**
```
Method: PATCH
URL: {{base_url}}/courses/{{courseId}}

Headers:
Authorization: Bearer {{token}}
Content-Type: application/json

Body (JSON) - Can update 1 or more fields:
{
  "price": 149.99,
  "courseName": "Advanced Node.js Mastery - Updated"
}

Expected Response (200):
{
  "statusCode": 200,
  "message": "Course updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "courseName": "Advanced Node.js Mastery - Updated",
    "description": "Master advanced concepts...",
    "level": "Advanced",
    "price": 149.99,
    "createdAt": "2026-04-10T10:30:00.000Z",
    "updatedAt": "2026-04-10T10:30:05.000Z"
  }
}
```

---

### **REQUEST 7: Delete Course (DELETE - Admin Only)**
```
Method: DELETE
URL: {{base_url}}/courses/{{courseId}}

Headers:
Authorization: Bearer {{token}}

Expected Response (200):
{
  "statusCode": 200,
  "message": "Course \"Advanced Node.js Mastery - Updated\" deleted successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "courseName": "Advanced Node.js Mastery - Updated",
    "description": "Master advanced concepts...",
    "level": "Advanced",
    "price": 149.99,
    "createdAt": "2026-04-10T10:30:00.000Z",
    "updatedAt": "2026-04-10T10:30:05.000Z"
  }
}
```

---

## **Step 4: Test Error Scenarios**

### **ERROR 1: Missing Authentication (Admin endpoint without token)**
```
Method: POST
URL: {{base_url}}/courses

Headers: (Empty - no Authorization)

Body:
{
  "courseName": "Test",
  "description": "Test description here",
  "level": "Beginner",
  "price": 49.99
}

Expected Response (401):
{ "message": "Unauthorized", "statusCode": 401 }
```

---

### **ERROR 2: Invalid Course ID Format**
```
Method: GET
URL: {{base_url}}/courses/invalid-id-format

Expected Response (400):
{
  "statusCode": 400,
  "message": "Invalid course ID format: invalid-id-format"
}
```

---

### **ERROR 3: Course Not Found**
```
Method: GET
URL: {{base_url}}/courses/507f1f77bcf86cd799999999

Expected Response (404):
{
  "statusCode": 404,
  "message": "Course with ID \"507f1f77bcf86cd799999999\" not found in database"
}
```

---

### **ERROR 4: Validation Error (Missing Required Fields)**
```
Method: POST
URL: {{base_url}}/courses

Headers:
Authorization: Bearer {{token}}

Body:
{
  "courseName": "Test"
  // Missing: description, level, price
}

Expected Response (400):
{
  "statusCode": 400,
  "message": "Bad Request",
  "error": [
    "Description is required",
    "Level is required",
    "Price is required"
  ]
}
```

---

### **ERROR 5: Invalid Level Value**
```
Method: POST
URL: {{base_url}}/courses

Headers:
Authorization: Bearer {{token}}

Body:
{
  "courseName": "Test Course",
  "description": "Test description here for course",
  "level": "Expert",  // Invalid! Must be Beginner, Intermediate, Advanced
  "price": 49.99
}

Expected Response (400):
{
  "statusCode": 400,
  "message": "Bad Request",
  "error": ["Level must be one of: Beginner, Intermediate, Advanced"]
}
```

---

## **Step 5: Quick Testing Workflow**

1. **Register/Login** → Get token
2. **Create Course** → Save course ID
3. **Get All Courses** → Verify it appears
4. **Get Single Course** → Verify details
5. **Update Course** → Modify and check changes
6. **Delete Course** → Verify removal
7. **Try to Get Deleted Course** → Should return 404

---

## **Postman Tips 💡**

- Use **{{variable}}** for dynamic values
- Save tokens automatically with Tests tab scripts
- Use **Pre-request Script** to auto-generate test data
- Export collection to share with team
- Use **Postman Runner** to run all tests sequentially

---

## **Expected Results Summary**

| Operation | Status | Protected |
|-----------|--------|-----------|
| Create | 201 | ✅ Admin only |
| Read All | 200 | ❌ Public |
| Read One | 200 | ❌ Public |
| Update | 200 | ✅ Admin only |
| Delete | 200 | ✅ Admin only |

---

Happy testing! 🎉
