# Flask Backend - Testing Guide

Quick reference for testing all endpoints.

## Setup Test Environment

### Start the Server
```bash
python run.py
```

Expected output:
```
🚀 Server running on port 5000
📧 Email: Configured
🔐 Supabase: Connected
```

## Testing Tools

### Option 1: cURL (Command Line)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"user@example.com","password":"pass123"}'
```

### Option 2: Postman (GUI)
- Import endpoints into Postman
- Create environment variables for baseUrl and token
- Run collections

### Option 3: Python Requests
```python
import requests

response = requests.post('http://localhost:5000/api/auth/login',
  json={'identifier': 'user@example.com', 'password': 'pass123'})
print(response.json())
```

## Health Check

### Test 1: Server Health
```bash
curl http://localhost:5000/api/health
```

**Expected Response (200):**
```json
{
  "status": "success",
  "message": "HealHub API is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Authentication Flow Tests

### Test 2: User Registration

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "password": "SecurePass123",
    "confirmPassword": "SecurePass123",
    "dateOfBirth": "1990-01-15",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "country": "US",
    "postalCode": "10001"
  }'
```

**Expected Response (201):**
```json
{
  "status": "success",
  "message": "Registration successful. Please verify your email.",
  "data": {
    "user": {
      "id": "user-id",
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "patient",
      "is_active": true
    }
  }
}
```

**What to Check:**
- ✓ Status code is 201
- ✓ User object returned without password_hash
- ✓ Email verification message displayed
- ✓ Database has new user record

### Test 3: Email Verification

```bash
curl -X POST http://localhost:5000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "code": "123456"
  }'
```

**Expected Response (200):**
```json
{
  "status": "success",
  "message": "Email verified successfully"
}
```

**What to Check:**
- ✓ Use verification code from registration
- ✓ Status code is 200
- ✓ User email_verified_at is set in database

### Test 4: Login (After Email Verification)

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "john@example.com",
    "password": "SecurePass123"
  }'
```

**Expected Response (200):**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user-id",
      "email": "john@example.com",
      "role": "patient"
    },
    "token": "eyJhbGc...",
    "dashboard": {
      "dashboardRoute": "/patient/dashboard",
      "dashboardName": "Patient Dashboard",
      "permissions": ["view_profile", "book_appointments", "view_prescriptions"],
      "features": ["appointments", "prescriptions", "reminders", "health_records"]
    }
  }
}
```

**What to Check:**
- ✓ Status code is 200
- ✓ Token is provided (JWT format)
- ✓ Dashboard info matches user role
- ✓ User data doesn't include password_hash

**Save the token for next tests:**
```bash
TOKEN="eyJhbGc..."
```

### Test 5: Get Profile (Protected)

```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": "user-id",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1234567890",
    "role": "patient",
    "city": "New York",
    "state": "NY"
  }
}
```

**What to Check:**
- ✓ Status code is 200
- ✓ Returns user profile without password
- ✓ All user fields are present

### Test 6: Update Profile (Protected)

```bash
curl -X PUT http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "city": "Los Angeles",
    "state": "CA"
  }'
```

**Expected Response (200):**
```json
{
  "status": "success",
  "message": "Profile updated successfully",
  "data": {
    "id": "user-id",
    "city": "Los Angeles",
    "state": "CA"
  }
}
```

**What to Check:**
- ✓ Status code is 200
- ✓ Updated fields are reflected
- ✓ Other fields remain unchanged

### Test 7: Logout (Protected)

```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200):**
```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

**What to Check:**
- ✓ Status code is 200
- ✓ Message confirms logout
- ✓ Token still works (Flask doesn't maintain blacklist)

### Test 8: Forgot Password

```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'
```

**Expected Response (200):**
```json
{
  "status": "success",
  "message": "Password reset link sent to your email",
  "data": {
    "reset_token": "abc123..."
  }
}
```

**What to Check:**
- ✓ Status code is 200
- ✓ Email would be sent in production
- ✓ Reset token is returned

### Test 9: Reset Password

```bash
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-id",
    "token": "reset-token-from-test-8",
    "password": "NewPass123",
    "confirmPassword": "NewPass123"
  }'
```

**Expected Response (200):**
```json
{
  "status": "success",
  "message": "Password reset successfully"
}
```

**What to Check:**
- ✓ Status code is 200
- ✓ Token is marked as used in database
- ✓ Can login with new password

### Test 10: Resend Verification

```bash
curl -X POST http://localhost:5000/api/auth/resend-verification \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'
```

**Expected Response (200):**
```json
{
  "status": "success",
  "message": "Verification code sent to your email"
}
```

**What to Check:**
- ✓ Status code is 200
- ✓ New verification code generated
- ✓ Email sent with new code

## Error Cases Testing

### Test 11: Invalid Credentials

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "john@example.com",
    "password": "WrongPassword"
  }'
```

**Expected Response (401):**
```json
{
  "status": "error",
  "message": "Invalid credentials"
}
```

### Test 12: Missing Required Fields

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "john@example.com"
  }'
```

**Expected Response (400):**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": ["Password is required"]
}
```

### Test 13: Invalid Email

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "invalid-email",
    "password": "Pass123",
    "confirmPassword": "Pass123"
  }'
```

**Expected Response (400):**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": ["Invalid email address"]
}
```

### Test 14: Missing Authorization Header

```bash
curl -X GET http://localhost:5000/api/auth/profile
```

**Expected Response (401):**
```json
{
  "status": "error",
  "message": "Not authorized, no token provided"
}
```

### Test 15: Invalid Token

```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer invalid-token"
```

**Expected Response (401):**
```json
{
  "status": "error",
  "message": "Not authorized, invalid token"
}
```

## Performance Testing

### Test Response Time

```bash
time curl -X GET http://localhost:5000/api/health
```

**Expected:**
- Health check: < 50ms
- Login: < 200ms
- Profile fetch: < 150ms

### Test Rate Limiting

Make multiple requests quickly:

```bash
for i in {1..150}; do
  curl -s http://localhost:5000/api/health > /dev/null
  echo "Request $i"
done
```

**Expected:** 
- First 100 requests succeed
- Request 101+ get rate limit error (429)

## Test Automation Script

Create `test_api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:5000/api"
EMAIL="test$(date +%s)@example.com"
TOKEN=""

echo "🧪 Running API Tests..."

# Test 1: Health
echo "1️⃣  Testing health endpoint..."
curl -s $BASE_URL/health | jq .

# Test 2: Register
echo "2️⃣  Testing registration..."
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"firstName\": \"Test\",
    \"lastName\": \"User\",
    \"email\": \"$EMAIL\",
    \"password\": \"Test1234\",
    \"confirmPassword\": \"Test1234\"
  }")
echo $REGISTER_RESPONSE | jq .

# Test 3: Login
echo "3️⃣  Testing login..."
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"identifier\": \"$EMAIL\",
    \"password\": \"Test1234\"
  }")
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')
echo $LOGIN_RESPONSE | jq .

# Test 4: Get Profile
echo "4️⃣  Testing get profile..."
curl -s -X GET $BASE_URL/auth/profile \
  -H "Authorization: Bearer $TOKEN" | jq .

# Test 5: Logout
echo "5️⃣  Testing logout..."
curl -s -X POST $BASE_URL/auth/logout \
  -H "Authorization: Bearer $TOKEN" | jq .

echo "✅ Tests completed!"
```

Run with:
```bash
chmod +x test_api.sh
./test_api.sh
```

## Common Test Issues

### Issue: "Connection refused"
**Solution:** Make sure server is running (`python run.py`)

### Issue: "Invalid token"
**Solution:** Copy token from login response, ensure no extra spaces

### Issue: "Email not verified"
**Solution:** Run verification test before login test

### Issue: "User already exists"
**Solution:** Use unique email (add timestamp like `test$(date +%s)@example.com`)

### Issue: "Supabase connection failed"
**Solution:** Check `.env` has correct SUPABASE credentials

## Postman Collection

Import this into Postman:

```json
{
  "info": {
    "name": "HealHub API",
    "description": "Flask backend tests"
  },
  "item": [
    {
      "name": "Health",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/api/health"
      }
    },
    {
      "name": "Register",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/auth/register",
        "body": {
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com",
          "password": "Test1234",
          "confirmPassword": "Test1234"
        }
      }
    }
  ]
}
```

---

**All tests should pass!** 🎉

If you encounter any issues, check:
1. Server is running
2. Database credentials are correct
3. Email is configured (or disabled)
4. Token format is correct
