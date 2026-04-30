# Frontend & Backend Deployment Guide

## ✅ What's Configured

### Environment Files
- **`.env`** (Local Development) - Uses `http://localhost:5000`
- **`.env.production`** (Production Build) - Uses `https://malwa-hardware-2.onrender.com`
- **`.env.vercel`** (Reference) - Configuration for Vercel environment

### API Helper
- ✅ Central `apiFetch()` helper in `src/services/api.js`
- ✅ All services use the helper (productService, authService, orderService, chatService, uploadService)
- ✅ Image URLs are properly resolved via `resolveBackendUrl()`
- ✅ JWT token handling for admin authentication
- ✅ CORS credentials included
- ✅ Debug logging enabled

### Frontend Setup
- ✅ No hardcoded URLs (`localhost:5000` or `onrender.com`)
- ✅ All API calls use environment variables
- ✅ Socket connections use environment variables
- ✅ Image paths resolved through backend URL

---

## 🚀 Local Development

### 1. Start Backend
```bash
cd backend
npm install
npm start
# Backend will run on http://localhost:5000
```

### 2. Start Frontend
```bash
cd frontend
npm install
npm run dev
# Frontend will run on http://localhost:5173
# Uses http://localhost:5000 (from .env)
```

### 3. Verify Connection
Open browser DevTools → Console and check for:
```
[API Config] {
  mode: "development",
  apiUrl: "http://localhost:5000",
  apiUrlDefined: true,
  timestamp: "..."
}
```

Then check Network tab to confirm API calls go to `http://localhost:5000/api/...`

---

## 📦 Deploy to Vercel

### Step 1: Connect Repository to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Select your GitHub repository
4. Click "Import"

### Step 2: Configure Environment Variables
In Vercel Project Settings → Environment Variables, add:

```
VITE_API_URL = https://malwa-hardware-2.onrender.com
VITE_SOCKET_URL = https://malwa-hardware-2.onrender.com
```

### Step 3: Set Root Directory (Optional)
If your `frontend` is in a subfolder:
1. Go to Settings → Root Directory
2. Set to `./frontend`

### Step 4: Deploy
1. Click "Deploy"
2. Vercel will:
   - Detect `.env.production`
   - Use environment variables
   - Build the project
   - Deploy automatically

---

## 🔗 Backend Configuration (Render)

### Add Frontend URL to CORS (Backend)
In your Render dashboard, set environment variable:

```
FRONTEND_URL=https://your-vercel-app.vercel.app
```

This allows backend to accept requests from your deployed frontend.

---

## ✅ Verification Checklist

### Local Development
- [ ] Backend runs on `http://localhost:5000`
- [ ] Frontend runs on `http://localhost:5173`
- [ ] API calls show in Network tab to `http://localhost:5000/api/...`
- [ ] Products load without errors
- [ ] Images load properly
- [ ] No CORS errors in console
- [ ] Console shows `[API Config]` with `apiUrl: "http://localhost:5000"`

### Production (Vercel)
- [ ] Frontend deployed to Vercel
- [ ] API calls go to `https://malwa-hardware-2.onrender.com/api/...`
- [ ] Products load on deployed site
- [ ] Images load from backend
- [ ] No CORS errors
- [ ] No 404 errors for API endpoints
- [ ] Console shows `[API Config]` with production URL

---

## 🐛 Troubleshooting

### "Cannot GET /api/products"
- Backend is not running or wrong URL
- Check: Is backend responding at `https://malwa-hardware-2.onrender.com/api/health`?
- Fix: Verify `VITE_API_URL` in Vercel environment variables

### CORS Errors in Console
- Backend CORS not allowing frontend origin
- Fix: Set `FRONTEND_URL` in Render backend to your Vercel URL

### Images Not Loading
- Check Network tab: Are image URLs starting with `https://`?
- Fix: Ensure backend returns full image URLs (not relative paths)

### API Calls to Wrong URL
- Check browser DevTools Console
- Look for `[API Config]` log
- Verify `apiUrl` matches expected value
- For local: should be `http://localhost:5000`
- For prod: should be `https://malwa-hardware-2.onrender.com`

### Missing VITE_API_URL Error
- `.env` file not in project root
- Frontend dev server not restarted after adding `.env`
- Fix: Restart `npm run dev`

---

## 📝 File Structure

```
frontend/
├── .env                      # Local dev (http://localhost:5000)
├── .env.production           # Production build
├── .env.vercel               # Reference for Vercel setup
├── src/
│   ├── services/
│   │   ├── api.js           # Central API helper
│   │   ├── productService.js # Uses apiFetch()
│   │   ├── auth.js          # Uses apiFetch()
│   │   ├── orderService.js  # Uses apiFetch()
│   │   ├── chatService.js   # Uses apiFetch()
│   │   └── uploadService.js # Uses apiFetch()
│   ├── context/
│   │   └── CartContext.jsx  # Uses resolveBackendUrl()
│   └── ...
└── ...
```

---

## 🎯 Summary

✅ **Local**: Frontend (5173) ↔ Backend (5000)  
✅ **Production**: Frontend (Vercel) ↔ Backend (Render)  
✅ **No hardcoded URLs**  
✅ **Environment-based configuration**  
✅ **Full debug logging**  

You're ready to deploy! 🚀
