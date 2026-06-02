import { pool } from '../db/connection.js';
import { generateDailySocialPosts, GeneratedSocialPost } from './spintaxService.js';

/**
 * Generates the once-daily batch of spintax social posts and stores them.
 * Each post always carries #marketersagainstdrunkdriving (enforced in the
 * spintax service). Returns the freshly generated posts.
 */
export async function generateAndStoreDailyPosts(): Promise<GeneratedSocialPost[]> {
  const posts = generateDailySocialPosts();

  const client = await pool.connect();
  try {
    for (const post of posts) {
      await client.query(
        `INSERT INTO daily_social_posts (platform, description, hashtags, text, generated_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [post.platform, post.description, post.hashtags, post.text, post.generatedAt]
      );
    }
    console.log(`✓ Generated ${posts.length} daily spintax social posts`);
  } finally {
    client.release();
  }

  return posts;
}

/** Fetch the most recent batch of generated daily posts. */
export async function getLatestDailyPosts(limit = 5): Promise<any[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT platform, description, hashtags, text, generated_at
       FROM daily_social_posts
       ORDER BY generated_at DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  } finally {
    client.release();
  }
}
