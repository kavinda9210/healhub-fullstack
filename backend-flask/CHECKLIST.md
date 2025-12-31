# ✅ Flask Backend - Setup Checklist

Complete this checklist to get your Flask backend up and running.

## 📋 Pre-Setup (Read These First)

- [ ] Read `00-START-HERE.md` (overview)
- [ ] Read `INDEX.md` (documentation index)
- [ ] Read `QUICKSTART.md` (quick setup guide)
- [ ] Understand project structure from `MANIFEST.md`

## 💾 Installation

### Step 1: Navigate to Project Directory
```bash
cd c:\Users\Kavinda\OneDrive\Documents\GitHub\finalHealHub\backend-flask
```
- [ ] Confirmed location

### Step 2: Create Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux (if applicable)
python3 -m venv venv
source venv/bin/activate
```
- [ ] Virtual environment created
- [ ] Virtual environment activated
- [ ] Verify with: `pip --version` (should show venv path)

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```
- [ ] Command executed successfully
- [ ] No error messages
- [ ] All 15 packages installed

### Step 4: Verify Installation
```bash
pip list | grep Flask
pip list | grep JWT
pip list | grep supabase
```
- [ ] Flask is installed
- [ ] Flask-JWT-Extended is installed
- [ ] supabase is installed

## 🔧 Configuration

### Step 5: Create Environment File
```bash
# Copy example to .env
cp .env.example .env
```
- [ ] `.env` file created

### Step 6: Edit Environment Variables

Open `.env` and fill in required values:

**Supabase (Required):**
- [ ] `SUPABASE_URL` - Add your Supabase project URL
- [ ] `SUPABASE_ANON_KEY` - Add your anonymous key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Add your service role key

**JWT (Required):**
- [ ] `JWT_SECRET` - Set a secure random string (e.g., `openssl rand -hex 32`)

**Email (Optional but recommended):**
- [ ] `EMAIL_HOST` - Set to `smtp.gmail.com` or your SMTP server
- [ ] `EMAIL_PORT` - Set to `587`
- [ ] `EMAIL_USER` - Set to your email address
- [ ] `EMAIL_PASS` - Set to your app password (for Gmail, use app-specific password)

**Application:**
- [ ] `APP_NAME` - Set to `HealHub` (or your app name)
- [ ] `APP_URL` - Set to `http://localhost:3000` (your frontend URL)
- [ ] `FRONTEND_URL` - Set to `http://localhost:3000`

### Step 7: Verify Configuration
```bash
# Check .env file exists
ls -la .env

# Verify it has your values (don't show secrets)
grep "SUPABASE_URL" .env
```
- [ ] `.env` file exists
- [ ] All required variables are set
- [ ] No empty values for required fields

## 🚀 Running the Application

### Step 8: Start the Server
```bash
python run.py
```

Expected output:
```
🚀 Server running on port 5000
📧 Email: Configured (or Not configured)
🔐 Supabase: Connected (or Not connected)
```

- [ ] Server starts without errors
- [ ] Shows "Server running on port 5000"
- [ ] Shows Supabase connection status

### Step 9: Test Health Endpoint

In a new terminal:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "success",
  "message": "HealHub API is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

- [ ] curl command executes
- [ ] Returns 200 status code
- [ ] Response is valid JSON
- [ ] Status is "success"

## 🧪 Basic Testing

### Step 10: Test Registration

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "Test1234",
    "confirmPassword": "Test1234"
  }'
```

- [ ] Request succeeds (201 status)
- [ ] Response includes user object
- [ ] No password_hash in response
- [ ] User created in database

### Step 11: Test Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "test@example.com",
    "password": "Test1234"
  }'
```

- [ ] Request succeeds (200 status)
- [ ] Response includes JWT token
- [ ] Response includes dashboard info
- [ ] Token is valid format

### Step 12: Save Token for Protected Route Tests

From login response, copy the `token` value:
```bash
TOKEN="your_token_here"
```

- [ ] Token saved in variable

### Step 13: Test Protected Route

```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

- [ ] Request succeeds (200 status)
- [ ] Returns user profile data
- [ ] No password_hash in response

### Step 14: Test Error Handling

```bash
curl -X GET http://localhost:5000/api/auth/profile
```

- [ ] Request fails (401 status)
- [ ] Returns error message
- [ ] Message says "Not authorized, no token provided"

## 📚 Additional Testing

### Step 15: Run All Tests
Follow guide in `TESTING.md`:
```bash
# Review TESTING.md for comprehensive test suite
```

- [ ] Reviewed TESTING.md
- [ ] Understand all test cases
- [ ] Know how to test each endpoint

### Step 16: Test with Different Tools
- [ ] Tested with curl
- [ ] Tested with Postman (import collection)
- [ ] Tested with Python requests library

## 🔗 Frontend Integration

### Step 17: Update Frontend URL
Update your React/Next.js frontend to use Flask backend:

```javascript
// From:
const API_URL = 'http://localhost:5000/api';

// Use this in your auth service
```

- [ ] Frontend API_URL updated to Flask backend
- [ ] Test login from frontend
- [ ] Token handling works
- [ ] Protected endpoints accessible

### Step 18: Verify CORS Works
```bash
curl -X OPTIONS http://localhost:5000/api/auth/login \
  -H "Origin: http://localhost:3000"
```

- [ ] CORS headers present
- [ ] Allow-Origin matches frontend URL
- [ ] Frontend can access API

## 📖 Documentation Review

### Step 19: Review Key Documentation
- [ ] Read `README.md` for full documentation
- [ ] Read `IMPLEMENTATION_GUIDE.md` for extending backend
- [ ] Bookmark `TESTING.md` for reference
- [ ] Understand `MIGRATION_GUIDE.md` if coming from Node.js

### Step 20: Set Up IDE/Editor
- [ ] Code editor configured
- [ ] Python extension installed (if using VS Code)
- [ ] Linting configured (optional)
- [ ] Code formatting configured (optional)

## 🔒 Security Checklist

- [ ] JWT_SECRET is not default value
- [ ] Email credentials are correct
- [ ] .env file is in .gitignore (already configured)
- [ ] .env file is NOT committed to git
- [ ] FRONTEND_URL is correct for CORS
- [ ] DEBUG is False for production

## 📊 Verification Summary

Create a test log:

```
Setup Date: ___________
Completion Date: ___________

✓ Installation: Complete / Incomplete / Issues: _________
✓ Configuration: Complete / Incomplete / Issues: _________
✓ Server Start: Working / Not Working / Issues: _________
✓ Health Check: Working / Not Working / Issues: _________
✓ Registration: Working / Not Working / Issues: _________
✓ Login: Working / Not Working / Issues: _________
✓ Protected Route: Working / Not Working / Issues: _________
✓ Error Handling: Working / Not Working / Issues: _________
✓ CORS: Working / Not Working / Issues: _________
✓ Frontend Integration: Working / Not Working / Issues: _________

Overall Status: ✅ Ready for Development
```

## 🚀 Next Steps

Once everything is working:

1. **Continue Development**
   - [ ] Read `IMPLEMENTATION_GUIDE.md`
   - [ ] Add Patient controller
   - [ ] Add Doctor controller
   - [ ] Add Admin controller

2. **Add Features**
   - [ ] Implement appointments
   - [ ] Implement prescriptions
   - [ ] Implement reminders

3. **Testing**
   - [ ] Write unit tests
   - [ ] Write integration tests
   - [ ] Set up CI/CD

4. **Deployment**
   - [ ] Choose hosting platform
   - [ ] Configure production .env
   - [ ] Deploy using Gunicorn
   - [ ] Set up monitoring

## 🆘 Troubleshooting

If you encounter issues, check:

1. **Server won't start**
   - [ ] Python version >= 3.8? Check: `python --version`
   - [ ] Virtual environment activated? Check: `pip --version`
   - [ ] All dependencies installed? Check: `pip list`
   - [ ] Port 5000 not in use? Check: `lsof -i :5000` (macOS) or `netstat -ano | findstr :5000` (Windows)

2. **Supabase connection fails**
   - [ ] .env file exists?
   - [ ] SUPABASE_URL is valid?
   - [ ] SUPABASE_SERVICE_ROLE_KEY is valid?
   - [ ] Internet connection working?

3. **Email not sending**
   - [ ] Email credentials correct in .env?
   - [ ] SMTP port correct (usually 587)?
   - [ ] Gmail? Using app-specific password?
   - [ ] Firewall blocking SMTP?

4. **Login returns "Email not verified"**
   - [ ] Ran verification test first?
   - [ ] Used correct verification code?
   - [ ] Verification code not expired?

See `README.md` troubleshooting section for more help.

## ✅ Final Verification

Before considering setup complete:

```bash
# 1. Health check works
curl http://localhost:5000/api/health

# 2. Registration works
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test2@example.com","password":"Test1234","confirmPassword":"Test1234"}'

# 3. Can view this checklist
cat CHECKLIST.md

# 4. Can view documentation
ls -la README.md QUICKSTART.md IMPLEMENTATION_GUIDE.md
```

All commands should work without errors.

---

## 🎉 Setup Complete!

Once you have all checkmarks:

✅ Flask backend is installed
✅ Environment is configured
✅ Server is running
✅ API is responding
✅ All tests passing
✅ Frontend can connect
✅ Ready for development

**You're all set! Start building!** 🚀

---

**Checklist Status:** [ ] In Progress [ ] Complete [ ] Issues Encountered

**Date Started:** ___________
**Date Completed:** ___________
**Total Time:** ___________

**Notes:**
```
_____________________________________
_____________________________________
_____________________________________
```

---

If you encounter any issues, refer to:
- README.md - Full documentation and troubleshooting
- QUICKSTART.md - Common issues
- TESTING.md - How to test endpoints
- INDEX.md - Find the right documentation
