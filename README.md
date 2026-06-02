# Marketers Against Drunk Driving

A full-stack platform that aggregates drunk driving news incidents across all 50 US states, generates daily impact-driven content, and amplifies the message through strategic social listening.

## Features

- **50-State Listener Agents**: Automatically scan news for drunk driving incidents
- **Incident Prioritization**: Prioritizes fatalities and serious injuries
- **AI-Generated Daily Blogs**: 750+ word curated blogs mixing news with cultural content
- **Social Listening Dashboard**: Tracks #marketersagainstdrunkdriving across social media
- **News Hub**: Professional news aggregation with hidden activist theme
- **Top 10 Daily Reports**: Email/dashboard report of worst incidents with social media posts

## Tech Stack

- **Backend**: Node.js + TypeScript + Express
- **Frontend**: React + TypeScript
- **Database**: PostgreSQL
- **AI**: Anthropic Claude API for blog generation
- **News API**: SERP API for incident detection
- **Social Listening**: Twitter API v2 (free tier)

## Project Structure

```
.
├── backend/           # Express API + listeners
├── frontend/          # React dashboard
├── listeners/         # State-based listener configs
├── .github/           # GitHub workflows + instructions
└── docker-compose.yml # Local development database
```

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL (or Docker)
- Anthropic API Key
- SERP API Key

### Setup

1. **Install dependencies**:
   ```bash
   npm run install-all
   ```

2. **Configure environment** - Copy `.env.example` to `.env`:
   ```bash
   cd backend
   cp .env.example .env
   ```

3. **Set up database**:
   ```bash
   npm run db:migrate
   ```

4. **Start development**:
   ```bash
   npm run dev
   ```

Backend runs on `http://localhost:3000`
Frontend runs on `http://localhost:3001`

## API Endpoints

### News & Incidents
- `GET /api/incidents` - Get all incidents
- `GET /api/incidents/state/:state` - Get incidents by state
- `GET /api/incidents/top-10` - Get worst 10 today

### Blogs
- `GET /api/blogs` - Get published blogs
- `POST /api/blogs/generate` - Generate daily blog

### Social Listening
- `GET /api/social/trending` - Trending hashtag data
- `GET /api/social/posts` - Recent social posts

### Dashboard
- `GET /api/dashboard/summary` - Today's statistics

## Listeners

State listener agents run in parallel, scanning:
- News channels (via SERP API)
- Local news outlets
- Police/Sheriff reports
- Emergency broadcasts

Each listener prioritizes:
1. Fatalities (highest priority)
2. Serious injuries
3. Incidents with injuries
4. Notable drunk driving cases

## Environment Variables

```
ANTHROPIC_API_KEY=your_key_here
SERP_API_KEY=your_key_here
TWITTER_API_KEY=your_key_here
TWITTER_API_SECRET=your_key_here
DATABASE_URL=postgresql://user:pass@localhost:5432/madd
FRONTEND_URL=http://localhost:3001
```

## Deployment

### To Siteground
1. Build frontend: `npm run build`
2. Push backend to Siteground Node.js hosting
3. Configure PostgreSQL on Siteground
4. Set environment variables in hosting panel

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed steps.

## Contributing

This project is for creating positive social impact. All contributions welcome.

## License

MIT
