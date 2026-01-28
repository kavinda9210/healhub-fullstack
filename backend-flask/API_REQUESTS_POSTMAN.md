# API Requests — Full HTTP URLs and JSON payloads

Use these exact full URLs (starting with `http://`) and JSON bodies in Postman or Thunder Client. Replace `http://127.0.0.1:5000` with your host if different.

Base host:

```
http://127.0.0.1:5000
```

Headers used for protected routes:

- `Authorization: Bearer <access_token>`
- `Content-Type: application/json` (when sending JSON)

---

1) Register — create a new user

URL:

```
http://127.0.0.1:5000/api/auth/register
```

Method: POST

JSON body:

```json
{
  "email": "user@example.com",
  "password": "Password123",
  "name": "Test User"
}
```

Example curl (single-line):

```bash
curl -X POST "http://127.0.0.1:5000/api/auth/register" -H "Content-Type: application/json" -d '{"email":"user@example.com","password":"Password123","name":"Test User"}'
```

---

2) Login — get access token

URL:

```
http://127.0.0.1:5000/api/auth/login
```

Method: POST

JSON body:

```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

Example curl:

```bash
curl -X POST "http://127.0.0.1:5000/api/auth/login" -H "Content-Type: application/json" -d '{"email":"user@example.com","password":"Password123"}'
```

---

3) Verify email (example)

URL:

```
http://127.0.0.1:5000/api/auth/verify-email
```

Method: POST

JSON body:

```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

---

4) Get profile (protected)

URL:

```
http://127.0.0.1:5000/api/auth/profile
```

Method: GET

Auth: `Authorization: Bearer <token>`

No JSON body.

Example curl:

```bash
curl -X GET "http://127.0.0.1:5000/api/auth/profile" -H "Authorization: Bearer <access_token>"
```

---

5) Update profile

URL:

```
http://127.0.0.1:5000/api/auth/profile
```

Method: PUT

Auth header required.

JSON body:

```json
{
  "name": "New Name",
  "phone": "+1234567890"
}
```

Example curl:

```bash
curl -X PUT "http://127.0.0.1:5000/api/auth/profile" -H "Authorization: Bearer <access_token>" -H "Content-Type: application/json" -d '{"name":"New Name","phone":"+1234567890"}'
```

---

6) Upload profile picture (multipart)

URL:

```
http://127.0.0.1:5000/api/auth/profile-picture
```

Method: POST

Use `multipart/form-data` with key `image` (file). Example curl:

```bash
curl -X POST "http://127.0.0.1:5000/api/auth/profile-picture" -H "Authorization: Bearer <access_token>" -F "image=@/full/path/to/photo.jpg"
```

PowerShell file upload example:

```powershell
$file = Get-Item -Path 'C:\full\path\to\photo.jpg'
Invoke-WebRequest -Uri "http://127.0.0.1:5000/api/auth/profile-picture" -Method Post -Headers @{ Authorization = "Bearer $env:ACCESS_TOKEN" } -Form @{ image = $file }
```

---

7) AI detect (image upload) — multipart or base64 JSON

URL:

```
http://127.0.0.1:5000/api/patient/detect
```

Method: POST

Multipart (file):

```bash
curl -X POST "http://127.0.0.1:5000/api/patient/detect" -H "Authorization: Bearer <access_token>" -F "image=@/full/path/to/skin.jpg"
```

Alternate JSON (base64):

```json
{
  "imageBase64": "<BASE64_DATA_HERE>"
}
```

Example curl (JSON):

```bash
curl -X POST "http://127.0.0.1:5000/api/patient/detect" -H "Authorization: Bearer <access_token>" -H "Content-Type: application/json" -d '{"imageBase64":"<BASE64_DATA_HERE>"}'
```

---

8) AI status

URL:

```
http://127.0.0.1:5000/api/patient/ai/status
```

Method: GET

Auth required. No body.

---

9) Get available slots

URL example:

```
http://127.0.0.1:5000/api/appointment/slots?doctorId=123&date=2026-01-28
```

Method: GET

Auth required. No JSON body — pass query params.

---

10) Book appointment

URL:

```
http://127.0.0.1:5000/api/appointment/book
```

Method: POST

JSON body:

```json
{
  "doctorId": 123,
  "appointmentDate": "2026-01-28T10:00:00",
  "reason": "Consultation"
}
```

Example curl:

```bash
curl -X POST "http://127.0.0.1:5000/api/appointment/book" -H "Authorization: Bearer <access_token>" -H "Content-Type: application/json" -d '{"doctorId":123,"appointmentDate":"2026-01-28T10:00:00","reason":"Consultation"}'
```

---

11) List reminders

URL:

```
http://127.0.0.1:5000/api/reminder/
```

Method: GET

Auth required; no body.

---

12) Create reminder

URL:

```
http://127.0.0.1:5000/api/reminder/
```

Method: POST

JSON body:

```json
{
  "title": "Reminder",
  "message": "Do X",
  "scheduled_at": "2026-01-28T09:00:00"
}
```

---

13) Departments (user)

URL:

```
http://127.0.0.1:5000/api/user/departments
```

Method: GET

Auth required; no body.

---

14) Admin — list users

URL:

```
http://127.0.0.1:5000/api/admin/users
```

Method: GET

Auth required (admin role).

---

15) Admin — create user

URL:

```
http://127.0.0.1:5000/api/admin/users
```

Method: POST

JSON body:

```json
{
  "email": "newuser@example.com",
  "name": "New User",
  "role": "patient"
}
```

---

If you want, I can export these as a Postman collection JSON (ready to import) or generate a Thunder Client workspace file.
# API Requests — Postman / Thunder Client

Use these HTTP request examples to test the backend from Postman or the Thunder Client extension. Import the `curl` lines into Postman/Thunder (both support importing `curl`) or create requests manually.

- **Base URL variable**: set `{{base_url}}` to `http://127.0.0.1:5000` (or your host/port).
- **Auth header**: add `Authorization: Bearer {{access_token}}` for protected requests.

## Authentication (public)

- Register (POST /api/auth/register)

```bash
curl -X POST {{base_url}}/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123","name":"Test User"}'
```

- Login (POST /api/auth/login)

```bash
curl -X POST {{base_url}}/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123"}'
```

Expected response: JSON containing an access token. Copy it into `{{access_token}}`.

- Verify email / Resend verification / Forgot & Reset password

Use POST to `/api/auth/verify-email`, `/api/auth/resend-verification`, `/api/auth/forgot-password`, `/api/auth/reset-password` with the validator-required JSON payloads. Example skeleton:

```bash
curl -X POST {{base_url}}/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","code":"123456"}'
```

## Profile & protected auth routes

- Get profile (GET /api/auth/profile)

```bash
curl -X GET {{base_url}}/api/auth/profile \
  -H "Authorization: Bearer {{access_token}}"
```

- Update profile (PUT /api/auth/profile)

```bash
curl -X PUT {{base_url}}/api/auth/profile \
  -H "Authorization: Bearer {{access_token}}" \
  -H "Content-Type: application/json" \
  -d '{"name":"New Name","phone":"+1234567890"}'
```

- Upload profile picture (POST /api/auth/profile-picture) — multipart/form-data

```bash
curl -X POST {{base_url}}/api/auth/profile-picture \
  -H "Authorization: Bearer {{access_token}}" \
  -F "image=@/path/to/photo.jpg"
```

## AI / Image detection

- Detect (multipart) (POST /api/patient/detect)

```bash
curl -X POST {{base_url}}/api/patient/detect \
  -H "Authorization: Bearer {{access_token}}" \
  -F "image=@/path/to/skin.jpg"
```

- Detect (JSON base64) — alternate

```bash
curl -X POST {{base_url}}/api/patient/detect \
  -H "Authorization: Bearer {{access_token}}" \
  -H "Content-Type: application/json" \
  -d '{"imageBase64":"<base64-data-here>"}'
```

- AI status (GET /api/patient/ai/status)

```bash
curl -X GET {{base_url}}/api/patient/ai/status \
  -H "Authorization: Bearer {{access_token}}"
```

## Appointments & slots

- Get available slots (GET /api/appointment/slots?doctorId=123&date=2026-01-28)

```bash
curl -G "{{base_url}}/api/appointment/slots" \
  -H "Authorization: Bearer {{access_token}}" \
  --data-urlencode "doctorId=123" \
  --data-urlencode "date=2026-01-28"
```

- Book appointment (POST /api/appointment/book)

```bash
curl -X POST {{base_url}}/api/appointment/book \
  -H "Authorization: Bearer {{access_token}}" \
  -H "Content-Type: application/json" \
  -d '{"doctorId":123,"appointmentDate":"2026-01-28T10:00:00","reason":"Consultation"}'
```

## Reminders

- List reminders (GET /api/reminder/)

```bash
curl -X GET {{base_url}}/api/reminder/ \
  -H "Authorization: Bearer {{access_token}}"
```

- Create reminder (POST /api/reminder/)

```bash
curl -X POST {{base_url}}/api/reminder/ \
  -H "Authorization: Bearer {{access_token}}" \
  -H "Content-Type: application/json" \
  -d '{"title":"Reminder","message":"Do X","scheduled_at":"2026-01-28T09:00:00"}'
```

## Admin user management (admin only)

- List users (GET /api/admin/users)

```bash
curl -X GET {{base_url}}/api/admin/users \
  -H "Authorization: Bearer {{access_token}}"
```

- Get user (GET /api/admin/users/:user_id)

```bash
curl -X GET {{base_url}}/api/admin/users/42 \
  -H "Authorization: Bearer {{access_token}}"
```

- Create user (POST /api/admin/users)

```bash
curl -X POST {{base_url}}/api/admin/users \
  -H "Authorization: Bearer {{access_token}}" \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@example.com","name":"New User","role":"patient"}'
```

- Update user (PUT /api/admin/users/:user_id)

```bash
curl -X PUT {{base_url}}/api/admin/users/42 \
  -H "Authorization: Bearer {{access_token}}" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name"}'
```

- Delete user (DELETE /api/admin/users/:user_id)

```bash
curl -X DELETE {{base_url}}/api/admin/users/42 \
  -H "Authorization: Bearer {{access_token}}"
```

## Role dashboards (GET)

Patient dashboard: `GET /api/patient/dashboard`
Doctor dashboard: `GET /api/doctor/dashboard`
Ambulance dashboard: `GET /api/ambulance/dashboard`

Example:

```bash
curl -X GET {{base_url}}/api/patient/dashboard \
  -H "Authorization: Bearer {{access_token}}"
```

## Departments (user-facing)

- List departments (GET /api/user/departments)

```bash
curl -X GET {{base_url}}/api/user/departments \
  -H "Authorization: Bearer {{access_token}}"
```

---

### Tips for Postman / Thunder Client

- Create an environment with `base_url` and `access_token` variables.
- Import a `curl` command via Import → Raw text (works in Postman) or paste the `curl` into Thunder Client's request importer.
- For file uploads, choose `form-data` body type and add key `image` with type `File`.

If you want, I can build and export a Postman collection JSON or Thunder Client workspace file containing these sample requests.

---

## Corrected single-line commands (curl) and PowerShell equivalents

Use `{{base_url}}` = http://127.0.0.1:5000. These are single-line `curl` commands (safe to import into Postman). Where helpful, a PowerShell `Invoke-RestMethod`/`Invoke-WebRequest` equivalent is shown.

- Register (POST /api/auth/register)

curl (single-line):

```bash
curl -X POST "{{base_url}}/api/auth/register" -H "Content-Type: application/json" -d '{"email":"user@example.com","password":"Password123","name":"Test User"}'
```

PowerShell:

```powershell
Invoke-RestMethod -Method Post -Uri "${env:BASE_URL}/api/auth/register" -ContentType "application/json" -Body (@{email='user@example.com';password='Password123';name='Test User'} | ConvertTo-Json)
```

- Login (POST /api/auth/login)

curl:

```bash
curl -X POST "{{base_url}}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"user@example.com","password":"Password123"}'
```

PowerShell:

```powershell
Invoke-RestMethod -Method Post -Uri "${env:BASE_URL}/api/auth/login" -ContentType "application/json" -Body (@{email='user@example.com';password='Password123'} | ConvertTo-Json)
```

- Get profile (GET /api/auth/profile) — protected

curl:

```bash
curl -X GET "{{base_url}}/api/auth/profile" -H "Authorization: Bearer {{access_token}}"
```

PowerShell:

```powershell
Invoke-RestMethod -Method Get -Uri "${env:BASE_URL}/api/auth/profile" -Headers @{ Authorization = "Bearer $env:ACCESS_TOKEN" }
```

- Upload profile picture (multipart/form-data)

curl:

```bash
curl -X POST "{{base_url}}/api/auth/profile-picture" -H "Authorization: Bearer {{access_token}}" -F "image=@/full/path/to/photo.jpg"
```

PowerShell (file upload):

```powershell
$file = Get-Item -Path 'C:\full\path\to\photo.jpg'
Invoke-WebRequest -Uri "${env:BASE_URL}/api/auth/profile-picture" -Method Post -Headers @{ Authorization = "Bearer $env:ACCESS_TOKEN" } -Form @{ image = $file }
```

- Detect (multipart) (POST /api/patient/detect)

curl:

```bash
curl -X POST "{{base_url}}/api/patient/detect" -H "Authorization: Bearer {{access_token}}" -F "image=@/full/path/to/skin.jpg"
```

- Detect (base64 JSON) — alternate

curl:

```bash
curl -X POST "{{base_url}}/api/patient/detect" -H "Authorization: Bearer {{access_token}}" -H "Content-Type: application/json" -d '{"imageBase64":"<BASE64_DATA_HERE>"}'
```

- Get available slots (GET /api/appointment/slots)

curl:

```bash
curl -G "{{base_url}}/api/appointment/slots" -H "Authorization: Bearer {{access_token}}" --data-urlencode "doctorId=123" --data-urlencode "date=2026-01-28"
```

- Book appointment (POST /api/appointment/book)

curl:

```bash
curl -X POST "{{base_url}}/api/appointment/book" -H "Authorization: Bearer {{access_token}}" -H "Content-Type: application/json" -d '{"doctorId":123,"appointmentDate":"2026-01-28T10:00:00","reason":"Consultation"}'
```

- List reminders (GET /api/reminder/)

curl:

```bash
curl -X GET "{{base_url}}/api/reminder/" -H "Authorization: Bearer {{access_token}}"
```

- Create reminder (POST /api/reminder/)

curl:

```bash
curl -X POST "{{base_url}}/api/reminder/" -H "Authorization: Bearer {{access_token}}" -H "Content-Type: application/json" -d '{"title":"Reminder","message":"Do X","scheduled_at":"2026-01-28T09:00:00"}'
```

- Admin — List users (GET /api/admin/users)

curl:

```bash
curl -X GET "{{base_url}}/api/admin/users" -H "Authorization: Bearer {{access_token}}"
```

- Admin — Create user (POST /api/admin/users)

curl:

```bash
curl -X POST "{{base_url}}/api/admin/users" -H "Authorization: Bearer {{access_token}}" -H "Content-Type: application/json" -d '{"email":"newuser@example.com","name":"New User","role":"patient"}'
```

---

Notes:

- Use the single-line `curl` examples above when importing into Postman or Thunder Client. Do not include trailing backslashes at end of the URL — they are only used in shell line-continuation and are not part of the endpoint.
- For PowerShell examples, set environment variables before running, e.g.:

```powershell
$env:BASE_URL = 'http://127.0.0.1:5000'
$env:ACCESS_TOKEN = 'eyJhbGci...'
```

If you'd like, I can now generate a Postman collection JSON (exportable) containing these corrected requests.*** End Patch
