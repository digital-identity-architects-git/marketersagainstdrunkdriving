import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface SocialStats {
  mentions: number;
  total_likes: number;
  total_shares: number;
  positive_sentiment_pct: number;
}

interface DailyPost {
  platform: string;
  description: string;
  hashtags: string[];
  text: string;
}

export const SocialListening: React.FC = () => {
  const [stats, setStats] = useState<SocialStats | null>(null);
  const [dailyPosts, setDailyPosts] = useState<DailyPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSocialStats();
    fetchDailyPosts();
    const interval = setInterval(fetchSocialStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchSocialStats = async () => {
    try {
      const response = await axios.get('/api/social/trending');
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching social stats:', error);
      setLoading(false);
    }
  };

  const fetchDailyPosts = async () => {
    try {
      const response = await axios.get('/api/social/daily');
      setDailyPosts(response.data);
    } catch (error) {
      console.error('Error fetching daily posts:', error);
    }
  };

  const regenerate = async () => {
    try {
      const response = await axios.post('/api/social/daily/generate');
      setDailyPosts(response.data.posts || []);
    } catch (error) {
      // Fall back to a simple refresh if generation endpoint needs the DB.
      fetchDailyPosts();
    }
  };

  if (loading) {
    return <div className="loading">Loading social listening...</div>;
  }

  return (
    <div className="social-listening">
      <h2>#marketersagainstdrunkdriving</h2>

      <div className="social-stats-grid">
        <div className="social-stat">
          <h3>Total Mentions</h3>
          <div className="big-number">{stats?.mentions || 0}</div>
          <p>in last 24 hours</p>
        </div>

        <div className="social-stat">
          <h3>Total Likes</h3>
          <div className="big-number">{stats?.total_likes || 0}</div>
        </div>

        <div className="social-stat">
          <h3>Total Shares</h3>
          <div className="big-number">{stats?.total_shares || 0}</div>
        </div>

        <div className="social-stat">
          <h3>Positive Sentiment</h3>
          <div className="big-number">{Math.round(stats?.positive_sentiment_pct || 0)}%</div>
        </div>
      </div>

      <div className="daily-posts-section">
        <div className="daily-posts-header">
          <h3>🤖 Today's Auto-Generated Posts</h3>
          <button className="btn btn-primary" onClick={regenerate}>
            Generate New
          </button>
        </div>
        <p className="daily-posts-sub">
          Fresh spintax-varied copy every day — always tagged #marketersagainstdrunkdriving.
        </p>
        <div className="daily-posts-grid">
          {dailyPosts.length > 0 ? (
            dailyPosts.map((post, idx) => (
              <div key={idx} className="daily-post-card">
                <span className="platform-tag">{post.platform}</span>
                <p className="daily-post-text">{post.text}</p>
                <button
                  className="btn btn-small"
                  onClick={() => navigator.clipboard.writeText(post.text)}
                >
                  Copy
                </button>
              </div>
            ))
          ) : (
            <p className="no-data">No posts yet — click "Generate New".</p>
          )}
        </div>
      </div>

      <div className="social-info">
        <p>
          This page tracks social conversations using our campaign hashtag #marketersagainstdrunkdriving.
        </p>
        <p>
          The more people engage, the further our message spreads. Help amplify the cause by sharing our content!
        </p>
      </div>
    </div>
  );
};
