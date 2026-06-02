# Testing & Troubleshooting Guide

## Pre-Flight Checklist

Before running the application, verify everything is in place:

```bash
# Check project structure
ls -la backend/dist/          # Should show compiled files
ls -la frontend/dist/         # Should show built app
cat backend/.env              # Should have your API keys

# Verify dependencies
npm list --depth=0            # Check root packages
cd backend && npm list --depth=0
cd frontend && npm list --depth=0
```

---

## Testing Scenarios

### Scenario 1: Database Without Docker

**Problem**: You don't have Docker installed

**Solution**: Use local PostgreSQL or SQLite

**For PostgreSQL locally**:
```bash
# On Windows (via PostgreSQL installer or WSL)
psql -U postgres
CREATE DATABASE madd_db;
CREATE USER madd_user WITH PASSWORD 'madd_password';
GRANT ALL PRIVILEGES ON DATABASE madd_db TO madd_user;

# Update backend/.env
DATABASE_URL=postgresql://madd_user:madd_password@localhost:5432/madd_db
```

**For SQLite** (fastest way to test):
```bash
# Edit backend/src/db/connection.ts to use sqlite3 instead
npm install sqlite3
# Then update code to use sqlite
```

---

### Scenario 2: Testing Without Real API Keys

**Problem**: You want to test the UI before getting API keys

**Solution**: Use mock data

**Create `backend/src/mock-data.ts`**:
```typescript
export const mockIncidents = [
  {
    id: '1',
    state: 'CA',
    location: 'Los Angeles',
    title: 'Multiple vehicle collision on I-405',
    severity: 'fatality',
    deathCount: 2,
    injuryCount: 5,
    sourceUrl: 'https://example.com',
    sourceOutlet: 'LA Times',
    dateOccurred: new Date(),
    dateReported: new Date(),
    tags: ['drunk-driving', 'CA'],
  },
  // ... more mock data
];
```

Update `backend/src/routes/api.ts` to use mock data when API keys aren't set.

---

### Scenario 3: API Keys Not Working

**Symptoms**:
- 403 Forbidden from SERP API
- 401 Unauthorized from Anthropic
- Blog generation fails
- News scanning returns empty

**Fixes**:

```bash
# Check if keys are loaded
cd backend
node -e "require('dotenv').config(); console.log('SERP:', !!process.env.SERP_API_KEY)"

# Test SERP API key directly
curl -H "X-API-KEY: your_key" https://api.serper.dev/search \
  -d '{"q":"drunk driving"}' \
  -H "Content-Type: application/json"

# Test Anthropic key
curl https://api.anthropic.com/v1/models \
  -H "x-api-key: your_key" \
  -H "anthropic-version: 2023-06-01"
```

---

## Debug Mode

### Enable Verbose Logging

Edit `backend/src/index.ts`:
```typescript
if (process.env.DEBUG === 'true') {
  console.log('🔍 DEBUG MODE ENABLED');
  console.log('API Keys present:', {
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    serp: !!process.env.SERP_API_KEY,
  });
}
```

Run with:
```bash
DEBUG=true npm run dev
```

### Check Database Connection

```bash
# From backend directory
node -e "
require('dotenv').config();
const { pool } = require('./dist/db/connection.js');
pool.query('SELECT NOW()', (err, res) => {
  if (err) console.error('❌ DB Error:', err.message);
  else console.log('✓ DB Connected:', res.rows[0]);
  process.exit();
});
"
```

---

## Common Errors & Solutions

### Error: "Cannot connect to database"

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Fix**:
```bash
# Start PostgreSQL
docker compose up -d

# Or check local PostgreSQL
sudo systemctl start postgresql    # Linux
brew services start postgresql     # Mac
# Windows: Start PostgreSQL service from Services
```

---

### Error: "SERP_API_KEY not found"

```
Error: Cannot read property 'X-API-KEY' of undefined
```

**Fix**:
```bash
# Verify .env has the key
cat backend/.env | grep SERP

# Restart backend to reload env
npm run dev
```

---

### Error: "Blog generation timeout"

```
TimeoutError: Request to API took longer than 30000ms
```

**Fix**:
```bash
# Increase timeout in src/services/blogService.ts
const message = await client.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1500,
  timeout: 60000,  // Increase from default
  messages: [...]
});
```

---

### Error: "CORS blocked"

```
Access to XMLHttpRequest blocked by CORS policy
```

**Fix**:
```typescript
// In backend/src/index.ts
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true,
}));
```

---

## Performance Testing

### Stress Test News Scanning

```bash
cd backend

# Time a single state scan
time npm run listeners:start

# Monitor database size
psql -U madd_user -d madd_db -c "
  SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
  FROM pg_tables
  WHERE schemaname != 'pg_catalog'
  ORDER BY pg_total_relation_size DESC;
"
```

---

## Frontend Testing

### Clear Browser Cache

```bash
# Ctrl+Shift+Delete in DevTools or:
# Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
```

### Test API Connectivity

```javascript
// Open browser console (F12) and run:
fetch('/api/health')
  .then(r => r.json())
  .then(d => console.log('✓ API Connected:', d))
  .catch(e => console.error('✗ API Error:', e));

// Test dashboard
fetch('/api/dashboard/summary')
  .then(r => r.json())
  .then(d => console.log('Dashboard data:', d))
  .catch(e => console.error('Error:', e));
```

---

## Manual API Testing

### Using curl

```bash
# Health check
curl http://localhost:3000/api/health

# Get incidents
curl http://localhost:3000/api/incidents | jq .

# Get top 10
curl http://localhost:3000/api/incidents/top-10 | jq .

# Get by state
curl http://localhost:3000/api/incidents/state/CA | jq .

# Generate blog (POST)
curl -X POST http://localhost:3000/api/blogs/generate

# Get blogs
curl http://localhost:3000/api/blogs | jq .

# Dashboard summary
curl http://localhost:3000/api/dashboard/summary | jq .
```

### Using Postman/Insomnia

Import these endpoints:

```json
{
  "client": "Postman",
  "collectName": "MADD API",
  "requests": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/api/health"
      }
    },
    {
      "name": "Dashboard Summary",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/api/dashboard/summary"
      }
    },
    {
      "name": "Generate Blog",
      "request": {
        "method": "POST",
        "url": "http://localhost:3000/api/blogs/generate"
      }
    }
  ]
}
```

---

## Log Analysis

### Backend Logs

```bash
# Show last 50 lines
tail -50 backend-error.log

# Watch in real-time
tail -f backend-out.log

# Search for errors
grep "ERROR" backend-error.log

# Filter by component
grep "newsService" backend-out.log | head -20
```

---

## Database Inspection

```bash
# Connect to database
psql -U madd_user -d madd_db

# List tables
\dt

# Check incidents table
SELECT COUNT(*) as incident_count FROM incidents;
SELECT * FROM incidents ORDER BY date_reported DESC LIMIT 5;

# Check blogs table
SELECT COUNT(*) as blog_count FROM blogs;
SELECT title, word_count FROM blogs LIMIT 5;

# Check indexes
\d incidents

# Exit
\q
```

---

## Network Debugging

### Check Port Usage

```bash
# See what's using ports 3000, 3001, 5432
netstat -tuln | grep LISTEN

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Monitor API Calls

```bash
# In browser DevTools:
# 1. Open Network tab
# 2. Check each request:
#    - Status (200, 404, 500)
#    - Response headers (Content-Type)
#    - Response body (Preview tab)
#    - Timing (how long request took)
```

---

## Performance Monitoring

```typescript
// Add to backend/src/index.ts for request timing
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${req.method}] ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});
```

---

## Clean Reset

If everything breaks:

```bash
# Kill all processes
pkill -f "npm run dev"
pkill -f "node dist"

# Reset database
docker compose down -v
docker compose up -d

# Reinstall dependencies
rm -rf backend/node_modules frontend/node_modules
npm run install-all

# Rebuild
cd backend && npm run build
cd frontend && npm run build

# Start fresh
npm run dev
```

---

**Good luck testing! 🧪**
