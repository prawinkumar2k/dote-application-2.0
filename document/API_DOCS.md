# 🖥️ Backend API Documentation

> Node.js + Express REST API for DOTE Admission Portal

## Table of Contents
1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [Error Handling](#error-handling)
5. [Security](#security)
6. [Database Schema](#database-schema)

---

## API Overview

### Base URL
```
Development: http://localhost:5000/api
Production:  https://api.dote-portal.com/api
```

### API Version
```
Current Version: v2.0.0
API Prefix: /api (v1 coming soon)
```

### Response Format
All responses are in JSON format:

**Success Response:**
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "errorCode": "ERROR_CODE",
  "message": "Error description",
  "statusCode": 400,
  "timestamp": "2026-04-18T10:30:00Z"
}
```

---

## Authentication

### Overview
The API uses **JWT (JSON Web Token)** authentication with HTTP-only cookies.

### Login Flow
```
User Credentials → POST /auth/login → Verify Credentials → Generate JWT Token
                  → Set HTTP-only Cookie → Return User Info
```

### JWT Token Structure
```javascript
Header: { alg: "HS256", typ: "JWT" }
Payload: { 
  id: "user_id",
  role: "admin|college|student",
  name: "User Name",
  iat: 1710765000,
  exp: 1710851400
}
Signature: HMACSHA256(header.payload, JWT_SECRET)
```

### Token Expiration
- Default: 24 hours
- Refresh: Automatic on new login
- Logout: Token cleared from cookies

### Cookie Configuration
- **Name**: `token`
- **HttpOnly**: ✅ Yes (secure against XSS)
- **Secure**: ✅ Yes (in production, HTTPS only)
- **SameSite**: ✅ Strict (CSRF protection)
- **Domain**: Auto-managed by browser

---

## API Endpoints

### 🔐 Authentication Routes

#### **Login**
```http
POST /api/auth/login
Content-Type: application/json

Request Body:
{
  "userId": "admin001",
  "password": "securePassword123",
  "role": "admin"
}

Response 200 OK:
{
  "success": true,
  "role": "admin",
  "user": {
    "id": 1,
    "name": "Admin User",
    "role": "admin"
  }
}

Response 401 Unauthorized:
{
  "success": false,
  "message": "Invalid credentials",
  "errorCode": "INVALID_CREDENTIALS"
}
```

**Validation Rules:**
- `userId`: Required, min 3 characters
- `password`: Required, min 6 characters
- `role`: Required, must be "admin", "college", or "student"

---

#### **Logout**
```http
POST /api/auth/logout

Response 200 OK:
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 👤 Student Routes (Planned)

#### **Get Student Profile**
```http
GET /api/students/me
Authorization: Bearer <JWT_TOKEN>

Response 200 OK:
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 101,
    "fullName": "John Doe",
    "dateOfBirth": "2005-01-15",
    "gender": "M",
    "email": "john.doe@example.com",
    "mobile": "9876543210",
    "aadhaarNumber": "123456789012",
    "community": "OBC",
    "caste": "General",
    "createdAt": "2026-04-15T10:00:00Z",
    "updatedAt": "2026-04-18T14:30:00Z"
  }
}

Response 401 Unauthorized:
{
  "success": false,
  "message": "Not authorized, token failed"
}
```

---

#### **Create Application**
```http
POST /api/students/applications
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Request Body:
{
  "step": 1,
  "data": {
    "fullName": "John Doe",
    "dateOfBirth": "2005-01-15",
    "gender": "M",
    "aadhaar": "123456789012",
    "religion": "Hindu",
    "community": "OBC",
    "caste": "General",
    "admissionType": "First Year"
  }
}

Response 201 Created:
{
  "success": true,
  "data": {
    "applicationId": 101,
    "studentUserId": 1,
    "currentStep": 1,
    "status": "draft",
    "createdAt": "2026-04-18T15:00:00Z"
  }
}
```

---

#### **Update Application Step**
```http
PUT /api/students/applications/:applicationId/step
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Request Body:
{
  "step": 2,
  "data": {
    "email": "john@example.com",
    "mobile": "9876543210",
    "commAddress": "123 Main St, City, State",
    "permanentAddress": "456 Oak Ave, Town, State"
  }
}

Response 200 OK:
{
  "success": true,
  "data": {
    "applicationId": 101,
    "currentStep": 2,
    "status": "draft"
  }
}
```

---

#### **Get All Applications**
```http
GET /api/students/applications
Authorization: Bearer <JWT_TOKEN>

Query Parameters:
?status=draft     # Filter by status (draft, submitted, approved, rejected)
?page=1          # Pagination
?limit=10        # Items per page

Response 200 OK:
{
  "success": true,
  "data": [
    {
      "applicationId": 101,
      "status": "draft",
      "currentStep": 3,
      "submittedAt": null,
      "updatedAt": "2026-04-18T15:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1
  }
}
```

---

### 🏫 College Routes (Planned)

#### **Get College Applications**
```http
GET /api/colleges/applications
Authorization: Bearer <JWT_TOKEN>

Query Parameters:
?status=submitted  # Filter by status
?stream=CSE       # Filter by stream
?page=1

Response 200 OK:
{
  "success": true,
  "data": [
    {
      "applicationId": 101,
      "studentName": "John Doe",
      "studentEmail": "john@example.com",
      "status": "submitted",
      "marks": 95.5,
      "submittedAt": "2026-04-18T10:30:00Z"
    }
  ],
  "total": 42
}
```

---

#### **Update Application Status**
```http
PUT /api/colleges/applications/:applicationId/status
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Request Body:
{
  "status": "approved",
  "remarks": "Student meets all eligibility criteria"
}

Response 200 OK:
{
  "success": true,
  "data": {
    "applicationId": 101,
    "status": "approved",
    "updatedAt": "2026-04-18T16:00:00Z"
  }
}
```

---

### ⚙️ Admin Routes (Planned)

#### **Create College**
```http
POST /api/admin/colleges
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Request Body:
{
  "collegeName": "Tech Institute of Excellence",
  "collegeCode": "TIE001",
  "approvedCourses": "CSE,ECE,ME",
  "maxIntake": 180,
  "state": "Karnataka",
  "district": "Bangalore"
}

Response 201 Created:
{
  "success": true,
  "data": {
    "id": 5,
    "collegeName": "Tech Institute of Excellence",
    "collegeCode": "TIE001",
    "createdAt": "2026-04-18T16:30:00Z"
  }
}
```

---

#### **Get All Colleges**
```http
GET /api/admin/colleges
Authorization: Bearer <JWT_TOKEN>

Query Parameters:
?state=Karnataka
?district=Bangalore
?page=1

Response 200 OK:
{
  "success": true,
  "data": [
    {
      "id": 5,
      "collegeName": "Tech Institute of Excellence",
      "collegeCode": "TIE001",
      "state": "Karnataka",
      "district": "Bangalore",
      "totalApplications": 42
    }
  ],
  "total": 15
}
```

---

## Error Handling

### Standard Error Codes

| Code | HTTP Status | Description |
|------|------------|-------------|
| `INVALID_CREDENTIALS` | 401 | Login credentials don't match |
| `USER_NOT_FOUND` | 404 | User account not found |
| `INVALID_TOKEN` | 401 | JWT token is invalid or expired |
| `INSUFFICIENT_PERMISSIONS` | 403 | User role not authorized |
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `DATABASE_ERROR` | 500 | Database operation failed |
| `SERVER_ERROR` | 500 | Internal server error |

### Error Response Example
```json
{
  "success": false,
  "errorCode": "VALIDATION_ERROR",
  "message": "User ID must be at least 3 characters",
  "statusCode": 400,
  "errors": [
    {
      "field": "userId",
      "message": "User ID must be at least 3 characters",
      "value": "ad"
    }
  ],
  "timestamp": "2026-04-18T10:30:00Z"
}
```

---

## Security

### CORS Policy
```javascript
Origin: http://localhost:5173 (development)
Credentials: true
Methods: GET, POST, PUT, DELETE, OPTIONS
Headers: Content-Type, Authorization
```

### Rate Limiting
- **Login Endpoint**: 5 attempts per 15 minutes per IP
- **API Endpoints**: 100 requests per 15 minutes per IP
- **Response Header**: `X-RateLimit-Remaining`

### Password Security
- **Algorithm**: Bcryptjs with salt rounds 10
- **Minimum Length**: 6 characters (enforced frontend & backend)
- **Hashing**: SHA-512 then Bcrypt
- **Storage**: Never in plain text

### Data Validation
- **Server-side**: Express-validator on all inputs
- **Client-side**: React form validation (additional layer)
- **SQL Injection**: Prevented via prepared statements
- **XSS**: Prevented via input sanitization

### HTTPS & Cookies
- **HTTPS**: Enforced in production
- **Cookies**: HTTP-only, SameSite=Strict
- **Transport**: Encrypted in transit (TLS 1.2+)

---

## Database Schema

### User Master Table
```sql
CREATE TABLE user_master (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  user_name VARCHAR(255) NOT NULL,
  role ENUM('admin', 'college', 'student') NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_role (role)
);
```

### Student Master Table
```sql
CREATE TABLE student_master (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  full_name VARCHAR(255),
  date_of_birth DATE,
  gender ENUM('M', 'F', 'Other'),
  aadhaar_number VARCHAR(12) UNIQUE,
  email VARCHAR(255),
  mobile VARCHAR(10),
  community VARCHAR(100),
  caste VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user_master(user_id),
  INDEX idx_aadhaar (aadhaar_number),
  INDEX idx_user_id (user_id)
);
```

### Institution Master Table
```sql
CREATE TABLE institution_master (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  college_name VARCHAR(255) NOT NULL,
  college_code VARCHAR(50) UNIQUE,
  approved_courses VARCHAR(500),
  max_intake INT,
  state VARCHAR(100),
  district VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user_master(user_id),
  INDEX idx_college_code (college_code)
);
```

### Application Table
```sql
CREATE TABLE application (
  application_id INT PRIMARY KEY AUTO_INCREMENT,
  student_user_id INT NOT NULL,
  college_user_id INT,
  status ENUM('draft', 'submitted', 'approved', 'rejected') DEFAULT 'draft',
  current_step INT DEFAULT 1,
  submitted_at TIMESTAMP NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_user_id) REFERENCES user_master(user_id),
  INDEX idx_status (status),
  INDEX idx_student_application (student_user_id, status)
);
```

---

## Testing

### Using cURL

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "admin001",
    "password": "Admin@123456",
    "role": "admin"
  }' \
  -c cookies.txt
```

#### Protected Request (using cookies)
```bash
curl -X GET http://localhost:5000/api/students/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -b cookies.txt
```

### Using Postman
1. Import API collection from `POSTMAN_COLLECTION.json`
2. Set environment variables (BASE_URL, AUTH_TOKEN)
3. Run test suite

---

## Deployment

### Environment Variables Required
- `PORT`: Server port (default: 5000)
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`: Database credentials
- `JWT_SECRET`: Secure random string for token signing
- `NODE_ENV`: development/production

### Production Checklist
- ✅ HTTPS enabled
- ✅ Environment variables configured
- ✅ Database backups in place
- ✅ Error logging configured
- ✅ Rate limiting enabled
- ✅ CORS properly configured
- ✅ Security headers added
- ✅ Monitoring/alerts set up

---

## Support

For API issues or questions:
- 📧 Email: api-support@dote-portal.com
- 🐛 GitHub Issues: [issues](https://github.com/prawinkumar2k/dote-application-2.0/issues)
- 📚 Documentation: [README.md](../README.md)

---

**Last Updated**: April 18, 2026  
**API Version**: 2.0.0  
**Status**: Active
