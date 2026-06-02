import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Blog {
  id: string;
  title: string;
  content: string;
  word_count: number;
  date_published: string;
  social_media_posts: string[];
}

export const BlogViewer: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await axios.get('/api/blogs?limit=5');
      setBlogs(response.data);
      if (response.data.length > 0) {
        setSelectedBlog(response.data[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading blogs...</div>;
  }

  return (
    <div className="blog-viewer">
      <div className="blog-sidebar">
        <h3>Recent Blogs</h3>
        <div className="blog-list">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className={`blog-item ${selectedBlog?.id === blog.id ? 'active' : ''}`}
              onClick={() => setSelectedBlog(blog)}
            >
              <p className="blog-title">{blog.title}</p>
              <p className="blog-date">
                {new Date(blog.date_published).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="blog-content">
        {selectedBlog ? (
          <>
            <h1>{selectedBlog.title}</h1>
            <p className="blog-meta">
              {new Date(selectedBlog.date_published).toLocaleDateString()} •{' '}
              {selectedBlog.word_count} words
            </p>

            <div className="blog-text">
              {selectedBlog.content}
            </div>

            <div className="share-section">
              <h3>📱 Share on Social Media</h3>
              <div className="social-posts">
                {selectedBlog.social_media_posts && selectedBlog.social_media_posts.length > 0 ? (
                  selectedBlog.social_media_posts.map((post, idx) => (
                    <div key={idx} className="social-post">
                      <p>{post}</p>
                      <button
                        className="btn btn-small"
                        onClick={() => navigator.clipboard.writeText(post)}
                      >
                        Copy
                      </button>
                    </div>
                  ))
                ) : (
                  <p>No social posts available</p>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="no-blog">No blog selected</div>
        )}
      </div>
    </div>
  );
};
