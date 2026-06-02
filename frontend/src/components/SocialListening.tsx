import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface SocialStats {
  mentions: number;
  total_likes: number;
  total_shares: number;
  positive_sentiment_pct: number;
}

export const SocialListening: React.FC = () => {
  const [stats, setStats] = useState<SocialStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSocialStats();
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
