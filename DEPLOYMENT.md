# Deployment Guide - Siteground

## Prerequisites
- Siteground hosting account with Node.js support
- PostgreSQL database (Siteground provides this)
- Domain: marketersagainstdrunkdriving.com (point to Siteground)

## Deployment Steps

### 1. Build Applications

```bash
# Build frontend
cd frontend
npm run build

# Build backend
cd backend
npm run build
```

### 2. Prepare for Siteground

#### Create deployment structure:
```
public_html/
├── dist/                    # React build (frontend)
├── server/                  # Node.js application (backend)
│   ├── dist/
│   ├── package.json
│   └── .env
└── .htaccess
```

#### Create `.htaccess` for routing:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ index.html [QSA,L]
</IfModule>
```

### 3. Set Up Siteground Hosting

1. **SSH Access**:
   - Go to Siteground dashboard → Security → SSH Keys
   - Generate and add your SSH key

2. **Enable Node.js**:
   - In Siteground: DevTools → Node.js → Create Application
   - Node version: 18+
   - Application root: `server`
   - Application startup file: `dist/index.js`

3. **Set Up PostgreSQL**:
   - Databases → Create New Database
   - Note the connection details
   - Add database user with password

4. **Environment Variables**:
   - In Node.js application settings, set environment variables:
   ```
   ANTHROPIC_API_KEY=your_key
   SERP_API_KEY=your_key
   DATABASE_URL=postgresql://user:pass@host:port/dbname
   FRONTEND_URL=https://marketersagainstdrunkdriving.com
   NODE_ENV=production
   ```

### 4. Deploy Code

#### Via Git (Recommended):

```bash
# Set up repository
git init
git remote add siteground ssh://your_siteground_user@host.siteground.eu:~/project

# Deploy
git push siteground main
```

#### Via SFTP:

1. Connect to Siteground via SFTP (FileZilla, Cyberduck, etc.)
2. Upload backend `dist/` files to `server/dist/`
3. Upload frontend build files to `public_html/`
4. Upload `package.json` to `server/`

### 5. Install Dependencies

SSH into Siteground and run:

```bash
cd ~/server
npm install --production
```

### 6. Run Database Migrations

```bash
npm run db:migrate
```

### 7. Start Application

In Siteground Node.js dashboard, click "Restart Application"

## DNS Configuration

Point your domain to Siteground nameservers:
```
ns1.siteground.eu
ns2.siteground.eu
ns3.siteground.eu
```

Or set A records to Siteground's IP addresses.

## SSL Certificate

Siteground provides free SSL via Let's Encrypt. Enable it in the dashboard.

## Monitoring & Logs

SSH into server and check logs:
```bash
# Node.js application logs
tail -f ~/.pm2/logs/server-error.log
tail -f ~/.pm2/logs/server-out.log

# PostgreSQL (if self-hosted)
tail -f /var/log/postgresql/postgresql.log
```

## Scheduled Tasks

Set up daily listener runs in Siteground Cron Jobs:

```bash
# Run at 6 AM daily
0 6 * * * cd ~/server && npm run listeners:start
```

## Performance Optimization

1. **Enable Caching**: Use Siteground's caching plugin for frontend
2. **CDN**: Enable Cloudflare for static assets
3. **Database Optimization**: Regularly analyze and optimize queries

## Troubleshooting

### Application Won't Start
- Check `server/.env` for correct DATABASE_URL
- Verify Node.js version compatibility
- Check error logs in Siteground dashboard

### Database Connection Failed
- Verify DATABASE_URL format
- Check firewall rules allow connection
- Test connection with `psql` from SSH

### Out of Memory
- Contact Siteground support for upgrade
- Optimize blog generation batch sizes
- Consider implementing caching

## Backup & Recovery

1. **Automated Backups**: Siteground provides daily backups
2. **Database Backups**: 
   ```bash
   pg_dump -h host -U user -d dbname > backup.sql
   ```

## Rolling Updates

1. Build and test locally
2. Create git branch for changes
3. Push to Siteground
4. Verify application restarts successfully
5. Monitor error logs for issues

## Support

- Siteground Support: https://www.siteground.com/contact
- Application Issues: Create GitHub issue
- API Issues: Contact respective API providers
