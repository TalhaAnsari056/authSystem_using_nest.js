# 🔐 Complete Authentication & Authorization Guide

## **✅ What's Been Implemented**

### **1. Refresh Token System**
- Access tokens expire in **15 minutes**
- Refresh tokens expire in **7 days**
- Refresh tokens are stored in database
- Automatic token rotation on refresh

### **2. Admin Creation Mechanism**
- Endpoint to promote existing users to admin
- Admin-only operation (requires existing admin)
- Detailed audit logging

---

## **API Endpoints Reference**

### **Authentication Endpoints**

#### **1. Register New User**
```http
POST http://localhost:3000/auth/register

Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass@123"
}
```

**Response (201):**
```json
{
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### **2. Login User**
```http
POST http://localhost:3000/auth/login

Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass@123"
}
```

**Response (200):**
```json
{
  "statusCode": 200,
  "message": "User logged in successfully",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### **3. Refresh Access Token** 🆕
```http
POST http://localhost:3000/auth/refresh

Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "statusCode": 200,
  "message": "Token refreshed successfully",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (NEW)",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (NEW)"
  }
}
```

---

#### **4. Get User Profile**
```http
GET http://localhost:3000/auth/profile

Authorization: Bearer {access_token}
```

**Response (200):**
```json
{
  "statusCode": 200,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

---

#### **5. Promote User to Admin** 🆕 (Admin Only)
```http
POST http://localhost:3000/auth/promote-to-admin

Authorization: Bearer {admin_access_token}
Content-Type: application/json

{
  "userId": "507f1f77bcf86cd799439012"
}
```

**Response (200):**
```json
{
  "statusCode": 200,
  "message": "User \"john_doe\" has been promoted to admin role",
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "admin"
  }
}
```

---

## **🚀 How to Create Your First Admin**

### **Step 1: Start the Server**
```bash
cd auth_system
npm run start:dev
```

### **Step 2: Register a User**
Use Postman or REST Client to register:
```http
POST http://localhost:3000/auth/register

{
  "username": "admin_user",
  "email": "admin@example.com",
  "password": "AdminPass@123"
}
```

### **Step 3: Manual Database Update (Quick Method)**

Open MongoDB Compass or mongo shell:
```javascript
// Connect to your database and run:
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

**OR**

### **Step 3B: Use SQL Query (If Using SQL)**
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

### **Step 4: Verify Admin Role**
Login and check profile:
```http
GET http://localhost:3000/auth/profile

// You should see:
{
  "role": "admin"
}
```

### **Step 5: Create More Admins**
Now use the admin account to promote other users:
```http
POST http://localhost:3000/auth/promote-to-admin

Authorization: Bearer {your_admin_token}

{
  "userId": "507f1f77bcf86cd799439012"
}
```

---

## **Token Lifecycle**

### **Timeline:**
```
T=0min     → User logs in
           → Gets access_token (15min expiry) + refresh_token (7 days expiry)

T=10min    → Using access_token works fine
           → Making API calls with Authorization: Bearer {access_token}

T=16min    → access_token EXPIRED ❌
           → API returns 401 Unauthorized

T=16min    → Client calls POST /auth/refresh with refresh_token
           → Gets NEW access_token + NEW refresh_token
           → Continue using API ✅

T=7 days   → refresh_token EXPIRED ❌
           → User must login again
```

---

## **Security Features**

✅ **Access Token Short-lived** (15 min)
- Even if intercepted, limited exposure window
- Reduces security risk

✅ **Refresh Token Long-lived** (7 days)
- Better user experience
- Stored in database for validation
- Can be revoked if compromised

✅ **Token Validation**
- Signature verification on every request
- Database cross-check for refresh tokens
- Role-based access control

✅ **Password Hashing**
- bcrypt with 10 salt rounds
- Never stored in plain text

---

## **Common Use Cases**

### **Scenario 1: Web Application**
```
1. User registers → Receives tokens
2. Frontend stores tokens locally
3. Every API call includes access_token
4. When access_token expires → Automatically refresh
5. Continue using app without re-login
```

### **Scenario 2: Admin Panel**
```
1. Admin logs in
2. Admin can view all users via endpoints
3. Admin can promote users to admin
4. Only admins can create/update/delete courses
```

### **Scenario 3: Token Refresh**
```
// Client-side pseudocode
function makeApiCall(endpoint, accessToken) {
  try {
    return fetch(endpoint, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
  } catch (401) {
    // Token expired
    const newTokens = refresh(refreshToken)
    return makeApiCall(endpoint, newTokens.access_token)
  }
}
```

---

## **Postman Setup for Token Management**

### **Store Tokens Automatically**
In Postman, add this script to **Tests** tab after login:

```javascript
var jsonData = pm.response.json();
pm.environment.set("access_token", jsonData.data.access_token);
pm.environment.set("refresh_token", jsonData.data.refresh_token);
```

### **Use in Subsequent Requests**
```
Authorization: Bearer {{access_token}}
```

### **Refresh Token Automatically**
Create a pre-request script:
```javascript
// Check if token needs refresh
const tokens = pm.environment.get("tokens");
if (tokens && isTokenExpired(tokens.access_token)) {
  pm.sendRequest({
    url: "http://localhost:3000/auth/refresh",
    method: "POST",
    body: {
      refresh_token: tokens.refresh_token
    }
  }, (err, response) => {
    pm.environment.set("access_token", response.json().data.access_token);
  });
}
```

---

## **Error Scenarios**

### **Error 1: Invalid Refresh Token**
```json
{
  "statusCode": 401,
  "message": "Invalid refresh token"
}
```

### **Error 2: Refresh Token Expired**
```json
{
  "statusCode": 401,
  "message": "Invalid refresh token"
}
```

### **Error 3: User Not Found**
```json
{
  "statusCode": 404,
  "message": "User not found"
}
```

### **Error 4: Already Admin**
```json
{
  "statusCode": 400,
  "message": "User \"john_doe\" is already an admin"
}
```

---

## **Best Practices**

✅ **Always use refresh tokens** for extending sessions  
✅ **Never store tokens** in plain localStorage (use secure cookies)  
✅ **Validate tokens** on every protected endpoint  
✅ **Log token usage** for audit trails  
✅ **Revoke tokens** on password change  
✅ **Keep refresh tokens** secure (HttpOnly cookies preferred)  

---

## **Testing Checklist**

- [ ] Register new user
- [ ] Login user
- [ ] Get access_token and refresh_token
- [ ] Use access_token to call protected endpoint
- [ ] Wait 15+ minutes or mock token expiry
- [ ] Call refresh endpoint
- [ ] Verify new access_token works
- [ ] Promote user to admin
- [ ] Create course as admin user
- [ ] Try to create course as regular user (should fail)

---

Happy secure authentication! 🔐
