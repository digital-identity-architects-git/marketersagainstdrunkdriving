import express, { Request, Response } from 'express';
import cors from 'cors';
import { pool } from '../db/connection.js';
import { getTopIncidentsToday } from '../services/newsService.js';
import { generateDailyBlog } from '../services/blogService.js';
import { DunkDrivingIncident } from '../types/index.js';

const router = express.Router();

// GET /api/incidents - Get all incidents
router.get('/incidents', async (req: Request, res: Response) => {
  try {
    const state = req.query.state as string;
    const severity = req.query.severity as string;

    let query = 'SELECT * FROM incidents ORDER BY date_reported DESC LIMIT 100';
    const params: any[] = [];

    if (state) {
      query = 'SELECT * FROM incidents WHERE state = $1 ORDER BY date_reported DESC LIMIT 100';
      params.push(state);
    }

    if (severity) {
      query = query.replace('WHERE', `WHERE severity = $${params.length + 1} AND`);
      params.push(severity);
    }

    const client = await pool.connect();
    try {
      const result = await client.query(query, params);
      res.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching incidents:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/incidents/top-10 - Get worst 10 today
router.get('/incidents/top-10', async (req: Request, res: Response) => {
  try {
    const incidents = await getTopIncidentsToday(10);
    res.json(incidents);
  } catch (error) {
    console.error('Error fetching top 10:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/incidents/:state - Get incidents by state
router.get('/incidents/state/:state', async (req: Request, res: Response) => {
  try {
    const { state } = req.params;
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM incidents WHERE state = $1 ORDER BY date_reported DESC',
        [state.toUpperCase()]
      );
      res.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching state incidents:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/blogs - Get published blogs
router.get('/blogs', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM blogs ORDER BY date_published DESC LIMIT $1',
        [limit]
      );
      res.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/blogs/generate - Generate daily blog
router.post('/blogs/generate', async (req: Request, res: Response) => {
  try {
    res.json({ message: 'Blog generation started' });

    // Run async without blocking response
    const incidents = await getTopIncidentsToday(10);
    if (incidents.length > 0) {
      const blog = await generateDailyBlog(incidents as DunkDrivingIncident[]);

      const client = await pool.connect();
      try {
        await client.query(
          `INSERT INTO blogs (title, content, word_count, date_published, related_incidents, 
                    cultural_references, hashtags, social_media_posts)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            blog.title,
            blog.content,
            blog.wordCount,
            blog.datePublished,
            blog.relatedIncidents,
            blog.culturalReferences,
            blog.hashtags,
            blog.socialMediaPosts,
          ]
        );
        console.log(`✓ Blog generated: ${blog.title}`);
      } finally {
        client.release();
      }
    }
  } catch (error) {
    console.error('Error generating blog:', error);
    res.status(500).json({ error: 'Blog generation failed' });
  }
});

// GET /api/dashboard/summary - Dashboard statistics
router.get('/dashboard/summary', async (req: Request, res: Response) => {
  try {
    const client = await pool.connect();
    try {
      const todayStats = await client.query(
        `SELECT 
          COUNT(*) as total_incidents,
          SUM(death_count) as total_deaths,
          SUM(injury_count) as total_injuries
        FROM incidents 
        WHERE DATE(date_reported) = CURRENT_DATE`
      );

      const topState = await client.query(
        `SELECT state, COUNT(*) as count 
        FROM incidents 
        WHERE DATE(date_reported) = CURRENT_DATE 
        GROUP BY state 
        ORDER BY count DESC 
        LIMIT 1`
      );

      const topIncidents = await client.query(
        `SELECT * FROM incidents 
        WHERE DATE(date_reported) = CURRENT_DATE 
        ORDER BY severity ASC, death_count DESC, injury_count DESC 
        LIMIT 10`
      );

      const blogStatus = await client.query(
        `SELECT COUNT(*) as count 
        FROM blogs 
        WHERE DATE(date_published) = CURRENT_DATE`
      );

      res.json({
        totalIncidentsToday: todayStats.rows[0]?.total_incidents || 0,
        totalDeathsToday: todayStats.rows[0]?.total_deaths || 0,
        totalInjuriesToday: todayStats.rows[0]?.total_injuries || 0,
        topState: topState.rows[0]?.state || 'N/A',
        topIncidents: topIncidents.rows,
        blogPublished: blogStatus.rows[0]?.count > 0,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/social/trending - Social listening trending data
router.get('/social/trending', async (req: Request, res: Response) => {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT 
          COUNT(*) as mentions,
          SUM(likes) as total_likes,
          SUM(shares) as total_shares,
          AVG(CASE WHEN sentiment = 'positive' THEN 1 ELSE 0 END) * 100 as positive_sentiment_pct
        FROM social_posts 
        WHERE has_hashtag = true 
        AND date_posted > NOW() - INTERVAL '24 hours'`
      );
      res.json(result.rows[0] || {});
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching trending data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/health - Health check
router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

export default router;
