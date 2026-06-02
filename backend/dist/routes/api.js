import express from 'express';
import { pool } from '../db/connection.js';
import { getTopIncidentsToday } from '../services/newsService.js';
import { generateDailyBlog } from '../services/blogService.js';
import { seoArticles, getArticleBySlug } from '../content/seoArticles.js';
import { guides, getGuideBySlug } from '../content/guides.js';
import { generateAndStoreDailyPosts, getLatestDailyPosts } from '../services/dailySocialService.js';
import { generateDailySocialPosts } from '../services/spintaxService.js';
const router = express.Router();
router.get('/articles', (req, res) => {
    res.json(seoArticles.map(({ slug, title, targetKeyword, intent, metaDescription, datePublished }) => ({
        slug,
        title,
        targetKeyword,
        intent,
        metaDescription,
        datePublished,
    })));
});
router.get('/articles/:slug', (req, res) => {
    const article = getArticleBySlug(req.params.slug);
    if (!article) {
        return res.status(404).json({ error: 'Article not found' });
    }
    res.json(article);
});
router.get('/guides', (req, res) => {
    res.json(guides.map(({ slug, title, targetKeyword, intent, metaDescription, datePublished, steps }) => ({
        slug,
        title,
        targetKeyword,
        intent,
        metaDescription,
        datePublished,
        stepCount: steps.length,
    })));
});
router.get('/guides/:slug', (req, res) => {
    const guide = getGuideBySlug(req.params.slug);
    if (!guide) {
        return res.status(404).json({ error: 'Guide not found' });
    }
    res.json(guide);
});
router.get('/social/daily', async (req, res) => {
    try {
        const posts = await getLatestDailyPosts(5);
        if (posts.length > 0) {
            return res.json(posts);
        }
        res.json(generateDailySocialPosts());
    }
    catch (error) {
        console.warn('Daily posts DB unavailable, serving fresh spintax batch');
        res.json(generateDailySocialPosts());
    }
});
router.post('/social/daily/generate', async (req, res) => {
    try {
        const posts = await generateAndStoreDailyPosts();
        res.json({ message: 'Daily social posts generated', count: posts.length, posts });
    }
    catch (error) {
        console.error('Error generating daily posts:', error);
        res.status(500).json({ error: 'Daily post generation failed' });
    }
});
router.get('/incidents', async (req, res) => {
    try {
        const state = req.query.state;
        const severity = req.query.severity;
        let query = 'SELECT * FROM incidents ORDER BY date_reported DESC LIMIT 100';
        const params = [];
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
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        console.error('Error fetching incidents:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/incidents/top-10', async (req, res) => {
    try {
        const incidents = await getTopIncidentsToday(10);
        res.json(incidents);
    }
    catch (error) {
        console.error('Error fetching top 10:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/incidents/state/:state', async (req, res) => {
    try {
        const { state } = req.params;
        const client = await pool.connect();
        try {
            const result = await client.query('SELECT * FROM incidents WHERE state = $1 ORDER BY date_reported DESC', [state.toUpperCase()]);
            res.json(result.rows);
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        console.error('Error fetching state incidents:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/blogs', async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const client = await pool.connect();
        try {
            const result = await client.query('SELECT * FROM blogs ORDER BY date_published DESC LIMIT $1', [limit]);
            res.json(result.rows);
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/blogs/generate', async (req, res) => {
    try {
        res.json({ message: 'Blog generation started' });
        const incidents = await getTopIncidentsToday(10);
        if (incidents.length > 0) {
            const blog = await generateDailyBlog(incidents);
            const client = await pool.connect();
            try {
                await client.query(`INSERT INTO blogs (title, content, word_count, date_published, related_incidents, 
                    cultural_references, hashtags, social_media_posts)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [
                    blog.title,
                    blog.content,
                    blog.wordCount,
                    blog.datePublished,
                    blog.relatedIncidents,
                    blog.culturalReferences,
                    blog.hashtags,
                    blog.socialMediaPosts,
                ]);
                console.log(`✓ Blog generated: ${blog.title}`);
            }
            finally {
                client.release();
            }
        }
    }
    catch (error) {
        console.error('Error generating blog:', error);
        res.status(500).json({ error: 'Blog generation failed' });
    }
});
router.get('/dashboard/summary', async (req, res) => {
    try {
        const client = await pool.connect();
        try {
            const todayStats = await client.query(`SELECT 
          COUNT(*) as total_incidents,
          SUM(death_count) as total_deaths,
          SUM(injury_count) as total_injuries
        FROM incidents 
        WHERE DATE(date_reported) = CURRENT_DATE`);
            const topState = await client.query(`SELECT state, COUNT(*) as count 
        FROM incidents 
        WHERE DATE(date_reported) = CURRENT_DATE 
        GROUP BY state 
        ORDER BY count DESC 
        LIMIT 1`);
            const topIncidents = await client.query(`SELECT * FROM incidents 
        WHERE DATE(date_reported) = CURRENT_DATE 
        ORDER BY severity ASC, death_count DESC, injury_count DESC 
        LIMIT 10`);
            const blogStatus = await client.query(`SELECT COUNT(*) as count 
        FROM blogs 
        WHERE DATE(date_published) = CURRENT_DATE`);
            res.json({
                totalIncidentsToday: todayStats.rows[0]?.total_incidents || 0,
                totalDeathsToday: todayStats.rows[0]?.total_deaths || 0,
                totalInjuriesToday: todayStats.rows[0]?.total_injuries || 0,
                topState: topState.rows[0]?.state || 'N/A',
                topIncidents: topIncidents.rows,
                blogPublished: blogStatus.rows[0]?.count > 0,
            });
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        console.error('Error fetching dashboard summary:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/social/trending', async (req, res) => {
    try {
        const client = await pool.connect();
        try {
            const result = await client.query(`SELECT 
          COUNT(*) as mentions,
          SUM(likes) as total_likes,
          SUM(shares) as total_shares,
          AVG(CASE WHEN sentiment = 'positive' THEN 1 ELSE 0 END) * 100 as positive_sentiment_pct
        FROM social_posts 
        WHERE has_hashtag = true 
        AND date_posted > NOW() - INTERVAL '24 hours'`);
            res.json(result.rows[0] || {});
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        console.error('Error fetching trending data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
export default router;
//# sourceMappingURL=api.js.map