# Deployment Guide - Nlist Planet

## Backend Deployment (Render)

1. **Go to [Render.com](https://render.com)** and login
2. **Create New Web Service:**
   - Click "New +" → "Web Service"
   - Connect GitHub repository: `nlistedplanet-source/nlistplanet-backend`
   - Configure settings:
     - **Name:** `nlist-planet-backend`
     - **Region:** Oregon (US West)
     - **Branch:** `master`
     - **Root Directory:** `backend`
     - **Runtime:** Node
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
     - **Instance Type:** Free

3. **Add Environment Variables:**
   ```
   NODE_ENV=production
   PORT=5000
   MONGO_URI=mongodb+srv://nlistplanet:<password>@cluster0.mongodb.net/nlistplanet?retryWrites=true&w=majority
   JWT_SECRET=nlist_planet_super_secret_key_2025_change_this_in_production
   JWT_EXPIRE=7d
   CLIENT_URL=https://your-vercel-app.vercel.app
   ```

4. **Create Web Service** and wait for deployment

5. **Copy the deployed URL** (e.g., `https://nlist-planet-backend.onrender.com`)

---

## Frontend Deployment (Vercel)

### Option 1: Vercel CLI (Quick)

```powershell
cd frontend
vercel login
vercel --prod
```

### Option 2: Vercel Dashboard (Manual)

1. **Go to [Vercel.com](https://vercel.com)** and login
2. **Import Project:**
   - Click "Add New" → "Project"
   - Import from GitHub: `nlistedplanet-source/nlistplanet-backend`
   - Root Directory: `frontend`
   - Framework Preset: Create React App
   
3. **Environment Variables:**
   ```
   REACT_APP_API_URL=https://nlist-planet-backend.onrender.com/api
   REACT_APP_NAME=Nlist Planet
   ```

4. **Deploy** and wait for build to complete

---

## MongoDB Atlas Setup

1. **Go to [MongoDB Atlas](https://cloud.mongodb.com)**
2. **Create a cluster** (Free tier M0)
3. **Database Access:**
   - Add user: `nlistplanet`
   - Password: (generate strong password)
   - Role: Read and write to any database

4. **Network Access:**
   - Add IP: `0.0.0.0/0` (Allow from anywhere)

5. **Get Connection String:**
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Replace `<password>` with actual password
   - Use this in `MONGO_URI` on Render

---

## Post-Deployment Steps

1. **Update frontend `.env`:**
   ```
   REACT_APP_API_URL=https://nlist-planet-backend.onrender.com/api
   ```

2. **Redeploy frontend** with updated API URL

3. **Test the app:**
   - Register a new user
   - Create a listing
   - Test marketplace features
   - Verify notifications

---

## Important Notes

- Backend on Render (free tier) may sleep after inactivity - first request might be slow
- Update `CLIENT_URL` in backend env to your Vercel URL for CORS
- Keep MongoDB connection string secret
- Change `JWT_SECRET` to a strong random string in production
