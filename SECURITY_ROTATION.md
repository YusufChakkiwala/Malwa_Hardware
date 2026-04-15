# Security Rotation & History Rewrite Instructions

This repository had a history rewrite to remove exposed credentials.

## 1) Rotate MongoDB Credentials (Atlas UI)

Do this in MongoDB Atlas:

1. Open Atlas -> Database Access.
2. Find the old database user used by the app.
3. Edit that user and set a new strong password (or create a new user and remove the old one).
4. Update local `backend/.env`:

```env
MONGO_URI="mongodb+srv://<new-username>:<new-password>@<cluster>/<db>?retryWrites=true&w=majority"
```

5. Restart backend server.

## 2) For Anyone Who Cloned Before Rewrite

### Option A: Re-clone (recommended)

```bash
git clone https://github.com/YusufChakkiwala/Malwa_Hardware.git
```

### Option B: Hard reset existing clone

```bash
git fetch origin
git checkout main
git reset --hard origin/main
git gc --prune=now
```

Note: local unpushed commits may be lost with hard reset.
