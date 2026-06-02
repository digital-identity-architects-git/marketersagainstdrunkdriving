import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface ArticleSummary {
  slug: string;
  title: string;
  targetKeyword: string;
  intent: string;
  metaDescription: string;
  datePublished: string;
}

interface FullArticle extends ArticleSummary {
  html: string;
  hashtags: string[];
  metaTitle: string;
}

export const Articles: React.FC = () => {
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [selected, setSelected] = useState<FullArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('/api/articles')
      .then((res) => {
        setArticles(res.data);
        if (res.data.length > 0) loadArticle(res.data[0].slug);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const loadArticle = async (slug: string) => {
    try {
      const res = await axios.get(`/api/articles/${slug}`);
      setSelected(res.data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      console.error('Error loading article', e);
    }
  };

  if (loading) {
    return <div className="loading">Loading articles...</div>;
  }

  return (
    <div className="articles">
      <div className="articles-sidebar">
        <h3>SEO Articles</h3>
        <p className="articles-sub">Targeted blog posts ({articles.length})</p>
        <div className="article-list">
          {articles.map((a) => (
            <div
              key={a.slug}
              className={`article-item ${selected?.slug === a.slug ? 'active' : ''}`}
              onClick={() => loadArticle(a.slug)}
            >
              <p className="article-title">{a.title}</p>
              <p className="article-keyword">🎯 {a.targetKeyword}</p>
              <span className={`intent-badge ${a.intent.toLowerCase()}`}>{a.intent}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="article-content">
        {selected ? (
          <>
            <div className="article-seo-meta">
              <span className="seo-label">Target keyword:</span> {selected.targetKeyword}
            </div>
            <article dangerouslySetInnerHTML={{ __html: selected.html }} />
            <div className="article-hashtags">
              {selected.hashtags.map((h) => (
                <span key={h} className="hashtag-chip">
                  {h}
                </span>
              ))}
            </div>
          </>
        ) : (
          <div className="no-blog">Select an article</div>
        )}
      </div>
    </div>
  );
};
