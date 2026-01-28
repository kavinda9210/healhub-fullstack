# HealHub Frontend

This is a minimal React frontend scaffold (Vite) to interact with the backend at http://127.0.0.1:5000.

Getting started:

```powershell
cd D:\healhub-fullstack\frontend
npm install
npm run dev
```

Notes:
- The frontend calls backend endpoints at `http://127.0.0.1:5000` (see `src/api.js`).
- Set `ACCESS_TOKEN` in app by logging in; token is stored in `localStorage` by the `AuthContext`.
- Components provided: Login, Register, Profile, Detect (image), Appointments, Reminders, AdminUsers.
