import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { BlogViewer } from './components/BlogViewer';
import { SocialListening } from './components/SocialListening';
import { Articles } from './components/Articles';
import { Guides } from './components/Guides';
import './App.css';

type Tab = 'dashboard' | 'articles' | 'guides' | 'blogs' | 'social';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  return (
    <div className="app">
      <nav className="app-nav">
        <div className="nav-brand">
          <h1>⚠️ MADD</h1>
          <p>Marketers Against Drunk Driving</p>
        </div>

        <div className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            className={`nav-tab ${activeTab === 'articles' ? 'active' : ''}`}
            onClick={() => setActiveTab('articles')}
          >
            📰 Articles
          </button>
          <button
            className={`nav-tab ${activeTab === 'guides' ? 'active' : ''}`}
            onClick={() => setActiveTab('guides')}
          >
            🧭 Guides
          </button>
          <button
            className={`nav-tab ${activeTab === 'blogs' ? 'active' : ''}`}
            onClick={() => setActiveTab('blogs')}
          >
            ✍️ Blogs
          </button>
          <button
            className={`nav-tab ${activeTab === 'social' ? 'active' : ''}`}
            onClick={() => setActiveTab('social')}
          >
            📱 Social
          </button>
        </div>
      </nav>

      <main className="app-main">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'articles' && <Articles />}
        {activeTab === 'guides' && <Guides />}
        {activeTab === 'blogs' && <BlogViewer />}
        {activeTab === 'social' && <SocialListening />}
      </main>
    </div>
  );
}

export default App;
