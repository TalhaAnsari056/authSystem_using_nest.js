# Authentication System - Architecture & Code Flow

## Directory Structure Overview

```
src/
├── auth/                 # Authentication logic
│   ├── auth.controller.ts     # HTTP endpoints (register, login, profile)
│   ├── auth.service.ts        # Business logic (password hashing, JWT signing)
│   ├── auth.guard.ts          # JWT token validation middleware
│   ├── auth.module.ts         # Module configuration & imports
│   ├── constants.ts           # JWT configuration constants
│   └── dto/
│       └── registerUser.dto.ts # Data validation (register)
│
├── user/                 # User data management
│   ├── user.service.ts        # Database operations
│   └── user.module.ts
│
├── app.module.ts         # Root module
└── main.ts              # Application entry point

schemas/
└── user.schema.ts       # Mongoose User model with validation rules
```

## Code Flow

### 1. REGISTRATION FLOW
```
POST /auth/register
    ↓
RegisterDto Validation (email format, password required)
    ↓
AuthService.registerUser()
    ├── bcrypt.hash(password, 10 salt rounds)
    ├── UserService.createUser() → MongoDB
    ├── JwtService.signAsync({sub: userId, username})
    └── Return {access_token: JWT}
```

### 2. LOGIN FLOW (TO BE IMPLEMENTED)
```
POST /auth/login
    ↓
LoginDto Validation (email + password)
    ↓
AuthService.login()
    ├── UserService.findByEmail(email) → MongoDB
    ├── bcrypt.compare(password, hashed) → Verify password
    ├── JwtService.signAsync({sub: userId, username})
    └── Return {access_token: JWT}
```

### 3. PROFILE/PROTECTED ROUTE FLOW
```
GET /auth/profile (with Authorization header)
    ↓
AuthGuard.canActivate()
    ├── Extract token from "Bearer <token>" header
    ├── JwtService.verifyAsync(token)
    ├── Decode payload {sub, username} → request['user']
    └── Proceed if valid, else throw UnauthorizedException
    ↓
AuthController.getProfile()
    ├── Extract userId from request.user.sub
    ├── UserService.getUserById() → MongoDB
    └── Return {id, username, email}
```

## Key Technologies & Patterns

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Password Security | bcrypt | Hash passwords (10 salt rounds) |
| JWT Token | @nestjs/jwt | Generate & verify authentication tokens |
| Database | Mongoose/MongoDB | User persistence |
| Validation | class-validator | DTO validation decorators |
| Guards | @nestjs/common | Middleware for route protection |
| HTTP Methods | REST | POST register, POST login, GET profile |

## Database Model (User Schema)

```typescript
{
  _id: ObjectId (auto-generated),
  username: string (required),
  email: string (required, unique index),
  password: string (required, hashed with bcrypt),
  role: string (default: 'user'),
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-generated)
}
```

## Error Handling

- **Duplicate Email**: ConflictException (code 11000 from MongoDB)
- **Invalid JWT**: UnauthorizedException from AuthGuard
- **Missing Token**: UnauthorizedException from AuthGuard
- **User Not Found**: Returns null, frontend handles accordingly

## Security Features

1. ✅ Password hashing with bcrypt (10 rounds)
2. ✅ JWT token validation on protected routes
3. ✅ Unique email constraint in MongoDB
4. ✅ Bearer token extraction & validation
5. ✅ Role-based schema setup (ready for RBAC)
