import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface DailyStats {
  totalIncidentsToday: number;
  totalDeathsToday: number;
  totalInjuriesToday: number;
  topState: string;
  blogPublished: boolean;
  topIncidents: any[];
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DailyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/dashboard/summary');
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const generateBlog = async () => {
    try {
      await axios.post('/api/blogs/generate');
      alert('Blog generation started!');
      setTimeout(fetchDashboardData, 2000);
    } catch (error) {
      console.error('Error generating blog:', error);
      alert('Failed to generate blog');
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>🛑 Marketers Against Drunk Driving</h1>
        <p className="subtitle">Real-time News & Social Impact Hub</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card critical">
          <h3>Today's Deaths</h3>
          <div className="stat-value">{stats?.totalDeathsToday || 0}</div>
          <p>from drunk driving incidents</p>
        </div>

        <div className="stat-card warning">
          <h3>Total Incidents</h3>
          <div className="stat-value">{stats?.totalIncidentsToday || 0}</div>
          <p>reported today</p>
        </div>

        <div className="stat-card info">
          <h3>Injuries</h3>
          <div className="stat-value">{stats?.totalInjuriesToday || 0}</div>
          <p>lives affected</p>
        </div>

        <div className="stat-card success">
          <h3>Top State</h3>
          <div className="stat-value">{stats?.topState || 'N/A'}</div>
          <p>most incidents today</p>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2>Today's Worst 10 Incidents</h2>
        </div>

        <div className="incidents-list">
          {stats?.topIncidents && stats.topIncidents.length > 0 ? (
            stats.topIncidents.map((incident, idx) => (
              <div
                key={incident.id}
                className={`incident-card severity-${incident.severity}`}
              >
                <div className="incident-rank">#{idx + 1}</div>
                <div className="incident-content">
                  <h4>{incident.title}</h4>
                  <p className="location">
                    📍 {incident.location || 'Location unknown'}, {incident.state}
                  </p>
                  <p className="description">{incident.description}</p>

                  <div className="incident-stats">
                    {incident.death_count > 0 && (
                      <span className="stat-badge death">
                        ⚠️ {incident.death_count} death
                        {incident.death_count !== 1 ? 's' : ''}
                      </span>
                    )}
                    {incident.injury_count > 0 && (
                      <span className="stat-badge injury">
                        ℹ️ {incident.injury_count} injured
                      </span>
                    )}
                    <span className="stat-badge source">{incident.source_outlet}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-data">No incidents reported today yet</div>
          )}
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2>Daily Blog</h2>
          <button
            className="btn btn-primary"
            onClick={generateBlog}
          >
            {stats?.blogPublished ? '♻️ Regenerate Blog' : '✍️ Generate Blog'}
          </button>
        </div>
        <p>
          {stats?.blogPublished
            ? 'Today\'s blog has been generated and is ready to share.'
            : 'Generate a 750+ word blog mixing cultural content with today\'s incidents.'}
        </p>
      </div>

      <footer className="dashboard-footer">
        <p>
          #marketersagainstdrunkdriving | Making an impact one story at a time
        </p>
      </footer>
    </div>
  );
};
