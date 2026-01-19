# HealHub Flask Backend

This is a Flask-based backend conversion of the original Node.js HealHub healthcare management system. It maintains the same API endpoints and functionality while leveraging Flask's simplicity and Python's powerful ecosystem.

## Features

- ✅ User authentication (JWT-based)
- ✅ Role-based access control (Patient, Doctor, Admin, Ambulance Staff)
- ✅ Email verification and password reset
- ✅ CORS enabled for frontend integration
- ✅ Rate limiting for API protection
- ✅ Supabase integration for database operations
- ✅ Email service integration (SMTP)
- ✅ Comprehensive error handling
- ✅ Request validation middleware

## Project Structure

```
backend-flask/
├── app/
│   ├── __init__.py           # Flask app factory
│   ├── config/
│   │   ├── __init__.py
│   │   └── config.py         # Configuration management
│   ├── controllers/
│   │   ├── __init__.py
│   │   └── auth_controller.py # Authentication endpoints
│   ├── middlewares/
│   │   ├── __init__.py
│   │   ├── auth_middleware.py # JWT & role-based auth
│   │   ├── error_middleware.py # Error handling
│   │   └── validation_middleware.py # Request validation
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth_routes.py    # Auth endpoints
│   │   └── other_routes.py   # Placeholder routes
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py   # Authentication logic
│   │   ├── email_service.py  # Email operations
│   │   └── supabase_service.py # Database operations
│   └── utils/
│       └── __init__.py
├── run.py                    # Application entry point
├── requirements.txt          # Python dependencies
├── .env.example              # Environment variables template
└── README.md                 # This file
```

## Installation

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Virtual environment (recommended)

### Setup Instructions

1. **Clone the repository:**
   ```bash
   cd backend-flask
   ```

2. **Create a virtual environment:**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate
   
   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your actual configuration:
   - Supabase credentials
   - JWT secret
   - Email SMTP settings
   - Frontend URL

5. **Run the application:**
   ```bash
   python run.py
   ```
   
   The API will be available at `http://localhost:5000`

## React API Checker (Optional)

A small React UI is included to manually test the backend endpoints.

1. Start the Flask backend:
  ```bash
  python run.py
  ```

2. Start the React dev server:
  ```bash
  cd frontend-react
  npm install
  npm run dev
  ```

3. Open `http://localhost:5173`.

Notes:
- The React dev server proxies `/api` to `http://localhost:5000` (see `frontend-react/vite.config.js`), so you can keep the API base URL as `/api`.
- If you want to call the backend directly, set `VITE_API_BASE_URL=http://localhost:5000/api` in `frontend-react/.env`.

## API Endpoints

### Authentication

#### 1. Register User
- **Endpoint:** `POST /api/auth/register`
- **Body:**
  ```json
  {
    "firstName": "Nimal",
    "lastName": "Shantha",
    "email": "nimalshantha@gmail.com",
    "phone": "0789254555",
    "password": "SecurePass123",
    "confirmPassword": "SecurePass123",
    "dateOfBirth": "1990-01-15",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "country": "US",
    "postalCode": "10001"
  }
  ```

#### 2. Login
- **Endpoint:** `POST /api/auth/login`
- **Body:**
  ```json
  {
    "identifier": "john@example.com",
    "password": "SecurePass123"
  }
  ```

#### 3. Verify Email
- **Endpoint:** `POST /api/auth/verify-email`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "code": "123456"
  }
  ```

#### 4. Resend Verification Code
- **Endpoint:** `POST /api/auth/resend-verification`
- **Body:**
  ```json
  {
    "email": "john@example.com"
  }
  ```

#### 5. Forgot Password
- **Endpoint:** `POST /api/auth/forgot-password`
- **Body:**
  ```json
  {
    "email": "john@example.com"
  }
  ```

#### 6. Reset Password
- **Endpoint:** `POST /api/auth/reset-password`
- **Body:**
  ```json
  {
    "userId": "user-id",
    "token": "reset-token",
    "password": "NewPassword123",
    "confirmPassword": "NewPassword123"
  }
  ```

#### 7. Get Profile (Protected)
- **Endpoint:** `GET /api/auth/profile`
- **Headers:** `Authorization: Bearer <token>`

#### 8. Update Profile (Protected)
- **Endpoint:** `PUT /api/auth/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** Fields to update (firstName, lastName, city, etc.)

#### 9. Logout (Protected)
- **Endpoint:** `POST /api/auth/logout`
- **Headers:** `Authorization: Bearer <token>`

### Health Check
- **Endpoint:** `GET /api/health`
- **Response:**
  ```json
  {
    "status": "success",
    "message": "HealHub API is running",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
  ```

## Authentication & Authorization

### JWT Token
After successful login, the API returns a JWT token that should be included in all protected requests:

```
Authorization: Bearer <your_jwt_token>
```

### Role-Based Access Control
The system supports four user roles:
- **patient**: Can view appointments, prescriptions, reminders
- **doctor**: Can manage appointments, write prescriptions, view patients
- **admin**: Can manage all users and system settings
- **ambulance_staff**: Can manage emergency calls and tracking

## Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| FLASK_ENV | Environment mode | development, production |
| PORT | Server port | 5000 |
| SUPABASE_URL | Supabase project URL | https://xxx.supabase.co |
| SUPABASE_ANON_KEY | Supabase anonymous key | eyJ... |
| SUPABASE_SERVICE_ROLE_KEY | Supabase service role key | eyJ... |
| JWT_SECRET | JWT signing secret | your-secret-key |
| EMAIL_HOST | SMTP server | smtp.gmail.com |
| EMAIL_PORT | SMTP port | 587 |
| EMAIL_USER | Email address | your-email@gmail.com |
| EMAIL_PASS | Email password | app-password |
| APP_NAME | Application name | HealHub |
| APP_URL | Frontend URL | http://localhost:3000 |
| FRONTEND_URL | CORS allowed origin | http://localhost:3000 |

## Differences from Node.js Version

### What Changed:
1. **Framework**: Express.js → Flask
2. **Language**: JavaScript → Python
3. **Package Manager**: npm → pip
4. **ORM**: None → Python native operations
5. **Async**: async/await → Python async/await (supported in Flask)

### What Stayed the Same:
1. All API endpoints remain identical
2. Request/response formats are identical
3. Authentication mechanism (JWT)
4. Database structure (Supabase)
5. Error handling patterns
6. Role-based authorization

## Development

### Running in Development Mode
```bash
python run.py
```

The server will run with auto-reload enabled.

### Running with Gunicorn (Production)
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 run:app
```

## Dependencies

Key Python packages used:
- **Flask**: Web framework
- **Flask-CORS**: Cross-Origin Resource Sharing
- **Flask-JWT-Extended**: JWT authentication
- **Flask-Limiter**: Rate limiting
- **bcrypt**: Password hashing
- **PyJWT**: JWT encoding/decoding
- **supabase**: Supabase client library
- **email-validator**: Email validation
- **python-dotenv**: Environment variable management

## Troubleshooting

### Issue: "Supabase connection failed"
- Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
- Ensure Supabase project is accessible
- Check firewall settings

### Issue: "Email sending failed"
- Verify EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS
- For Gmail, use an App Password (not regular password)
- Enable "Less secure app access" if needed

### Issue: "JWT token invalid"
- Ensure JWT_SECRET matches between registration and verification
- Check token hasn't expired (default: 7 days)

## Database Schema

The application assumes the following Supabase tables:
- `users` - User profiles and authentication
- `password_reset_tokens` - Password reset token storage
- `appointments` - Appointment records
- `prescriptions` - Medical prescriptions
- `reminders` - Appointment reminders

## Future Enhancements

1. Add remaining controllers (Patient, Doctor, Admin, Ambulance)
2. Implement WebSocket support for real-time features
3. Add request logging and monitoring
4. Implement caching with Redis
5. Add unit and integration tests
6. Implement API documentation with Swagger
7. Add database migrations
8. Implement file uploads

## Support

For issues or questions about the Flask backend conversion:
1. Check existing issues in the repository
2. Review the original Node.js backend for reference
3. Consult Flask documentation: https://flask.palletsprojects.com

## License

[Your License Here]

---

**Happy coding! 🚀**
