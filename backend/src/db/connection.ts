import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function initDatabase() {
  try {
    const client = await pool.connect();
    
    // Create incidents table
    await client.query(`
      CREATE TABLE IF NOT EXISTS incidents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        state VARCHAR(2) NOT NULL,
        location VARCHAR(255),
        title VARCHAR(500) NOT NULL,
        description TEXT,
        severity VARCHAR(20) NOT NULL,
        injury_count INTEGER DEFAULT 0,
        death_count INTEGER DEFAULT 0,
        source_url TEXT,
        source_outlet VARCHAR(255),
        date_occurred TIMESTAMP,
        date_reported TIMESTAMP DEFAULT NOW(),
        latitude FLOAT,
        longitude FLOAT,
        tags TEXT[] DEFAULT ARRAY[]::TEXT[],
        social_mentions INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create blogs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS blogs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(500) NOT NULL,
        content TEXT NOT NULL,
        word_count INTEGER,
        date_published TIMESTAMP,
        related_incidents UUID[] DEFAULT ARRAY[]::UUID[],
        cultural_references TEXT[] DEFAULT ARRAY[]::TEXT[],
        hashtags TEXT[] DEFAULT ARRAY[]::TEXT[],
        social_media_posts TEXT[] DEFAULT ARRAY[]::TEXT[],
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create social_posts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS social_posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        platform VARCHAR(50),
        author VARCHAR(255),
        content TEXT,
        likes INTEGER DEFAULT 0,
        shares INTEGER DEFAULT 0,
        comments INTEGER DEFAULT 0,
        date_posted TIMESTAMP,
        has_hashtag BOOLEAN DEFAULT false,
        sentiment VARCHAR(20),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_incidents_state ON incidents(state);
      CREATE INDEX IF NOT EXISTS idx_incidents_date ON incidents(date_occurred);
      CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
      CREATE INDEX IF NOT EXISTS idx_social_posts_date ON social_posts(date_posted);
      CREATE INDEX IF NOT EXISTS idx_social_posts_hashtag ON social_posts(has_hashtag);
    `);

    client.release();
    console.log('✓ Database initialized successfully');
  } catch (error) {
    console.error('✗ Database initialization failed:', error);
    throw error;
  }
}

export async function closeDatabase() {
  await pool.end();
}
