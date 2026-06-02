# 🚀 QUICKSTART - Get Running in 5 Minutes

## You're Ready! Here's What's Done:

✅ Full project structure scaffolded  
✅ Backend API (Node.js + Express + TypeScript)  
✅ Frontend Dashboard (React + Vite)  
✅ Database schemas (PostgreSQL)  
✅ News aggregation service (SERP API)  
✅ Blog generation service (Claude API)  
✅ All code compiled and ready  

---

## Step 1: Add Your API Keys

Edit `backend/.env`:

```bash
cd backend
cat .env
```

Update these lines with your actual keys:
```
ANTHROPIC_API_KEY=your_key_here
SERP_API_KEY=your_key_here
```

Get keys from:
- **Anthropic**: https://console.anthropic.com/
- **SERP API**: https://serpapi.com/

---

## Step 2: Set Up Database

### Option A: With Docker (Recommended)

```bash
# Install Docker from https://www.docker.com/products/docker-desktop

cd <project-root>
docker compose up -d
```

Verify: `docker compose ps` should show `madd-db` running

### Option B: Local PostgreSQL

```bash
# Create database manually
psql -U postgres -c "CREATE DATABASE madd_db;"
psql -U postgres -d madd_db -c "CREATE USER madd_user WITH PASSWORD 'madd_password';"
```

Update `backend/.env`:
```
DATABASE_URL=postgresql://madd_user:madd_password@localhost:5432/madd_db
```

---

## Step 3: Initialize Database Schema

```bash
cd backend
npm run db:migrate
```

Expected output:
```
✓ Database initialized successfully
```

---

## Step 4: Start Development Servers

### Terminal 1 - Backend API:
```bash
cd backend
npm run dev
```

Expected:
```
✓ Server running on http://localhost:3000
✓ API available at http://localhost:3000/api
```

### Terminal 2 - Frontend Dashboard:
```bash
cd frontend
npm run dev
```

Expected:
```
VITE v5.x.x ready in xxx ms

➜  Local:   http://localhost:3001/
```

### Terminal 3 (Optional) - Run State Listeners Now:
```bash
cd backend
npm run listeners:start
```

This will immediately scan all 50 states for drunk driving incidents.

---

## Step 5: Access the Application

Open browser to: **http://localhost:3001**

You should see the dashboard with:
- 📊 Today's Statistics Card
- 🛑 Top 10 Incidents
- ✍️ Blog Generation Button
- 📱 Social Listening Tracking

---

## Testing the API

### Check Dashboard Summary:
```bash
curl http://localhost:3000/api/dashboard/summary
```

### Generate a Blog (requires incidents in DB):
```bash
curl -X POST http://localhost:3000/api/blogs/generate
```

### Get All Incidents:
```bash
curl http://localhost:3000/api/incidents
```

---

## Troubleshooting

### "Cannot connect to database"
- Make sure PostgreSQL is running: `docker compose ps`
- Check DATABASE_URL in `backend/.env` is correct
- Try: `docker compose logs postgres`

### "ANTHROPIC_API_KEY not found"
- Verify `backend/.env` has the key
- Did you restart the backend after adding the key? (`npm run dev`)

### SERP API rate limit errors
- Free tier has limited requests (~100/month)
- Upgrade plan or wait for reset

### "Cannot GET /api/incidents"
- Backend might not be running (check Terminal 1)
- Try: `curl http://localhost:3000/api/health`

---

## What Happens Next

1. **News Scanning**:
   - Listeners scan 50 states every 24 hours at 6 AM
   - Can run manually anytime: `npm run listeners:start`
   - Results show up in Dashboard immediately

2. **Blog Generation**:
   - Click "Generate Blog" button on Dashboard
   - Or runs automatically daily at 6 AM
   - 750+ words mixing cultural content with incidents
   - Includes 3 social media post variations

3. **Social Listening**:
   - Tracks #marketersagainstdrunkdriving mentions
   - Shows engagement metrics
   - Updates every 60 seconds

---

## Next: Deploy to Production

When ready, see [DEPLOYMENT.md](../DEPLOYMENT.md) for Siteground setup.

---

## Need Help?

1. Check logs in Terminal 1 & 2 for errors
2. Read `.github/SETUP.md` for detailed setup
3. See backend `.env.example` for all config options

---

**You've got the tools. Now let's make an impact! 🎯**
