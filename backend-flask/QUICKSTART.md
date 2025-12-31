# Quick Start Guide - Flask Backend

## Get Started in 5 Minutes

### 1. Setup Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure Environment
```bash
# Copy example env file
cp .env.example .env

# Edit .env with your settings:
# - SUPABASE_URL
# - SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - JWT_SECRET
# - EMAIL_HOST, EMAIL_USER, EMAIL_PASS
```

### 4. Run the Server
```bash
python run.py
```

Expected output:
```
🚀 Server running on port 5000
📧 Email: Configured
🔐 Supabase: Connected
```

### 5. Test the API
```bash
# Health check
curl http://localhost:5000/api/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "Test1234",
    "confirmPassword": "Test1234"
  }'
```

## Key Differences from Node.js Version

| Feature | Node.js | Flask |
|---------|---------|-------|
| Main File | server.js | run.py |
| Framework | Express | Flask |
| Config | config/index.js | app/config/config.py |
| Middleware | middlewares/ | app/middlewares/ |
| Start Command | npm start | python run.py |

## Troubleshooting

### Port Already in Use
```bash
# Change port in .env
PORT=5001

# Or kill process using port 5000
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

### Supabase Connection Error
- Verify `.env` has correct credentials
- Check if Supabase project is active
- Test connection with:
  ```bash
  python -c "from app.services.supabase_service import supabase_service; print('Connected!')"
  ```

### Missing Dependencies
```bash
# Reinstall all dependencies
pip install -r requirements.txt --upgrade
```

## Next Steps

1. Implement remaining controllers (Patient, Doctor, Admin)
2. Add patient appointment endpoints
3. Implement prescription management
4. Set up reminder/notification system
5. Add admin dashboard endpoints
6. Deploy to production (Heroku, AWS, etc.)

## Useful Commands

```bash
# List installed packages
pip list

# Update packages
pip install -r requirements.txt --upgrade

# Run with specific Python version
python3.10 run.py

# Check Python version
python --version
```

## Frontend Integration

Update your frontend to use the Flask backend:

```javascript
// Change API base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Login example
const response = await fetch(`${API_BASE_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    identifier: 'user@example.com',
    password: 'password123'
  })
});

const data = await response.json();
const token = data.data.token;

// Use token in subsequent requests
const profileResponse = await fetch(`${API_BASE_URL}/auth/profile`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## Production Deployment

### Using Gunicorn
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 run:app
```

### Using Docker
```dockerfile
FROM python:3.10

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "run:app"]
```

### Heroku Deployment
```bash
# Create Procfile
echo "web: gunicorn run:app" > Procfile

# Deploy
git push heroku main
```

---

**Ready to go! Start the server and begin development.** 🚀
