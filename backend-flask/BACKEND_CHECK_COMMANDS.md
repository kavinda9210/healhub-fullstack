# Backend Check Commands

This file collects useful commands to verify, run, and debug the backend in this repository. Commands are provided for PowerShell (Windows) and POSIX shells (macOS / Linux). Adjust paths and environment variable names to your project configuration.

---

## Prerequisites

- **Python**: check version

PowerShell:
```powershell
python --version
```

POSIX:
```bash
python3 --version
```

- **Workspace**: change to backend folder

PowerShell / POSIX:
```powershell
cd backend-flask
```

---

## Create & activate virtual environment

PowerShell (recommended):
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1    # or use Activate.bat in cmd
python -m pip install --upgrade pip
```

POSIX:
```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
```

---

## Install dependencies

```bash
pip install -r requirements.txt
```

If you need dev tooling:
```bash
pip install pytest flake8 black mypy  # optional
```

---

## Sanity checks

- Check installed packages

```bash
pip freeze | sed -n '1,200p'   # PowerShell: pip freeze | Select-String -Pattern '.'
```

- Verify requirements file is parseable

```bash
python -m pip check
```

---

## Run tests

Run pytest (project tests are in `tests/`):

```bash
python -m pytest -q tests
```

If tests fail, show the last failing output or tracebacks above.

---

## Start the backend

There is a `run.py` at the repository root. Typical ways to run:

PowerShell / POSIX:
```bash
# set environment variables if needed (example)
$env:FLASK_ENV='development'      # PowerShell
export FLASK_ENV=development     # POSIX

# run the app
python run.py
```

If the project uses `flask run` (check `run.py` or app entry):
```bash
flask run --host=0.0.0.0 --port=5000
```

---

## Verify server is listening

PowerShell:
```powershell
netstat -ano | Select-String ":5000"    # adjust port
```

POSIX:
```bash
ss -ltnp | grep 5000 || netstat -ltnp | grep 5000
```

---

## Health endpoints and quick API checks

Use `curl` or `Invoke-WebRequest` to hit health endpoints (adjust path):

PowerShell:
```powershell
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:5000/health
```

POSIX:
```bash
curl -i http://127.0.0.1:5000/health
```

Also try the root path or known API routes in `app/routes`.

---

## View logs and errors

Check `server.err` in the backend root (exists in this repo):

PowerShell:
```powershell
Get-Content server.err -Tail 200 -Wait    # tails and follows
```

CMD / POSIX:
```bash
# Windows CMD
type server.err

# POSIX
tail -n 200 server.err
```

Also inspect any logging configured in `app/config` and `run.py`.

---

## Check model/artifact files

Verify the AI model file is present (adjust path if necessary):

PowerShell / POSIX:
```bash
python - <<'PY'
import os
print('models/resnet18_best.pth exists:', os.path.exists('models/resnet18_best.pth'))
PY
```

If code loads the model from a different location, check `app/services/ai_service.py` for the path.

---

## Environment variables

List environment variables used by the app (example names); check `.env` or config files.

PowerShell:
```powershell
Get-ChildItem Env: | Where-Object { $_.Name -match 'FLASK|DATABASE|SECRET|API' }
```

POSIX:
```bash
env | egrep 'FLASK|DATABASE|SECRET|API'
```

Get a specific variable:

PowerShell:
```powershell
$Env:MY_VAR
```

POSIX:
```bash
echo $MY_VAR
```

---

## Database / migrations (if applicable)

Search for migrations or DB tools in the repo and run appropriate commands. Example for Alembic:

```bash
# check for migrations folder
ls -la alembic* migrations* || true

# if using alembic
alembic current
alembic upgrade head
```

If your project uses a different migration tool, follow its commands.

---

## Linting, formatting, and static checks (optional)

```bash
flake8 .
black --Check .
mypy app || true
```

---

## Security & dependency audit (optional)

Install tools and run audits:

```bash
pip install pip-audit safety
pip-audit
safety check
```

---

## Troubleshooting quick tips

- If the server does not start, re-check the Python version and virtualenv activation.
- If ports are in use, find and kill the process (Windows example):

PowerShell:
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess
Stop-Process -Id <pid>
```

POSIX:
```bash
sudo lsof -i :5000
sudo kill -9 <pid>
```

- Reinstall dependencies if errors persist:

```bash
pip install --force-reinstall -r requirements.txt
```

---

## Useful one-liners

- Check Python import and app module can be loaded:

```bash
python -c "import importlib; importlib.import_module('app')" || echo 'import failed'
```

- Quick file permission/exists checks:

```bash
python - <<'PY'
import os
paths = ['run.py','app','requirements.txt']
for p in paths:
    print(p, os.path.exists(p))
PY
```

---

If you want, I can run these checks in your environment or tailor this checklist to specific services (database, Celery, external APIs).
