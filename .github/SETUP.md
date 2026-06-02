# Marketers Against Drunk Driving - Setup Instructions

## Project Setup Checklist

- [x] Project structure scaffolded
- [x] Backend Express API created
- [x] Frontend React dashboard created
- [x] Database schema initialized
- [x] News aggregation service (SERP API)
- [x] Blog generation service (Claude API)
- [x] State listener orchestrator
- [ ] Install dependencies
- [ ] Configure environment variables
- [ ] Start PostgreSQL database
- [ ] Run backend server
- [ ] Run frontend dev server
- [ ] Test API endpoints
- [ ] Verify news scanning works

## Quick Start

### 1. Install Dependencies

```bash
# From root directory
npm run install-all
```

### 2. Set Up Environment

Copy `.env.example` in `backend/` to `.env` and fill in your API keys:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```
ANTHROPIC_API_KEY=your_anthropic_key_here
SERP_API_KEY=your_serp_api_key_here
DATABASE_URL=postgresql://madd_user:madd_password@localhost:5432/madd_db
```

### 3. Start PostgreSQL Database

```bash
# Option A: Using Docker Compose
docker-compose up -d

# Option B: Using existing PostgreSQL
# Make sure PostgreSQL is running and DATABASE_URL points to it
```

### 4. Run Database Migrations

```bash
cd backend
npm run db:migrate
```

### 5. Start Development Servers

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

Terminal 3 (Optional) - Run Listeners Now:
```bash
cd backend
npm run listeners:start
```

## Accessing the Application

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000/api
- **API Health**: http://localhost:3000/api/health

## Key API Endpoints

- `GET /api/dashboard/summary` - Today's statistics
- `GET /api/incidents` - All incidents
- `GET /api/incidents/top-10` - Worst 10 today
- `GET /api/blogs` - Recent blogs
- `POST /api/blogs/generate` - Generate daily blog
- `GET /api/social/trending` - Social listening stats

## Testing

### 1. Verify Database Connection
```bash
# Backend console should show:
# ✓ Database initialized successfully
```

### 2. Test News Scanning
```bash
# Make a request to the backend
curl http://localhost:3000/api/incidents
```

### 3. Generate a Blog
```bash
curl -X POST http://localhost:3000/api/blogs/generate
```

## Environment Variables Reference

```
ANTHROPIC_API_KEY      - Your Anthropic API key for Claude
SERP_API_KEY          - Your SERP API key for news
TWITTER_API_KEY       - Twitter API v2 key (for social listening)
DATABASE_URL          - PostgreSQL connection string
PORT                  - Backend port (default: 3000)
NODE_ENV              - Set to 'development' or 'production'
FRONTEND_URL          - Frontend URL (for CORS)
BLOG_GENERATION_TIME  - Daily blog generation time (HH:MM format)
```

## Next Steps

1. **Get API Keys**:
   - Anthropic: https://console.anthropic.com/
   - SERP API: https://serpapi.com/
   - Twitter API v2: https://developer.twitter.com/

2. **Configure Social Listening**:
   - Update social media API integrations in `/backend/src/services/`
   - Implement sentiment analysis

3. **Deploy to Siteground**:
   - See DEPLOYMENT.md for detailed steps
   - Set up CI/CD pipeline

4. **Create Website**:
   - Build public news hub at marketersagainstdrunkdriving.com
   - Connect to dashboard backend

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running: `docker-compose ps`
- Check DATABASE_URL in .env matches your setup

### API Keys Not Working
- Verify keys are correctly set in backend/.env
- Test API key with provider's test endpoints

### SERP API Rate Limit
- Free tier has limited requests
- Consider upgrading or implementing caching

### Blog Generation Fails
- Check ANTHROPIC_API_KEY is valid
- Ensure there are incidents in database
- Check backend logs for error details
