# API Response Examples

This file lists representative success and error JSON responses for common backend endpoints. Use these in Postman/Thunder Client examples or documentation.

---

## Common error format (validation / bad request)

HTTP status: 400

```json
{
  "errors": [
    "First name is required",
    "Last name is required",
    "Confirm password is required",
    "Passwords do not match"
  ],
  "message": "Validation failed",
  "status": "error"
}
```

---

## Authentication

- Login success (200)

```json
{
  "status": "success",
  "data": {
    "user": { "id": 42, "email": "user@example.com", "name": "Test User" },
    "access_token": "eyJhbGci...",
    "expires_in": 3600
  }
}
```

- Login failure (401)

```json
{
  "status": "error",
  "message": "Invalid credentials"
}
```

- Register success (201)

```json
{
  "status": "success",
  "data": { "id": 43, "email": "new@example.com", "name": "New User" },
  "message": "Registration successful. Verification email sent."
}
```

---

## Profile

- Get profile success (200)

```json
{
  "status": "success",
  "data": { "id": 42, "email": "user@example.com", "name": "Test User", "phone": "+1234567890" }
}
```

- Unauthorized (no/invalid token) (401)

```json
{
  "status": "error",
  "message": "Unauthorized"
}
```

---

## AI / Image detection

- Detect success (200)

```json
{
  "status": "success",
  "data": {
    "detection": {
      "label": "Eczema",
      "confidence": 0.92,
      "specialization": "dermatology"
    },
    "doctors": [ { "id": 11, "name": "Dr. A", "specialization": "dermatology" } ]
  }
}
```

- Detect error (no image) (400)

```json
{
  "status": "error",
  "message": "No image provided"
}
```

- Model not ready (503)

```json
{
  "status": "error",
  "message": "AI model not available",
  "code": "model_unavailable"
}
```

---

## Appointments

- Get slots success (200)

```json
{
  "status": "success",
  "data": [ "2026-01-28T09:00:00", "2026-01-28T10:00:00" ]
}
```

- Book success (201)

```json
{
  "status": "success",
  "data": { "id": 101, "patient_id": 42, "doctor_id": 123, "appointment_date": "2026-01-28T10:00:00", "status": "booked" }
}
```

- Slot conflict (409)

```json
{
  "status": "error",
  "message": "Requested slot is not available"
}
```

---

## Reminders

- List reminders (200)

```json
{
  "status": "success",
  "data": [ { "id":201, "title":"Appointment reminder", "scheduled_at":"2026-01-28T10:00:00" } ]
}
```

- Create reminder (201)

```json
{
  "status": "success",
  "data": { "id": 202, "title": "Reminder", "message": "Do X" }
}
```

---

## Admin user management

- List users (200)

```json
{
  "status": "success",
  "data": [ { "id": 42, "email": "user@example.com", "name": "Test User", "role": "patient" } ]
}
```

- Create user validation error (400)

```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [ "Email is required", "Role must be one of [patient,doctor,admin]" ]
}
```

---

## Generic server error

HTTP status: 500

```json
{
  "status": "error",
  "message": "Internal server error"
}
```

---

If you want these examples exported as response examples inside a Postman collection JSON (so each request includes example responses), I can generate that file next.
