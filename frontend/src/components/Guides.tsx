import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface GuideSummary {
  slug: string;
  title: string;
  targetKeyword: string;
  intent: string;
  metaDescription: string;
  stepCount: number;
}

interface GuideStep {
  title: string;
  body: string;
  checklist?: string[];
}

interface GuideFaq {
  q: string;
  a: string;
}

interface FullGuide extends GuideSummary {
  intro: string;
  steps: GuideStep[];
  faqs: GuideFaq[];
  hashtags: string[];
}

export const Guides: React.FC = () => {
  const [guides, setGuides] = useState<GuideSummary[]>([]);
  const [guide, setGuide] = useState<FullGuide | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('/api/guides')
      .then((res) => {
        setGuides(res.data);
        if (res.data.length > 0) loadGuide(res.data[0].slug);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const loadGuide = async (slug: string) => {
    const res = await axios.get(`/api/guides/${slug}`);
    setGuide(res.data);
    setStepIdx(0);
    setChecked({});
  };

  const toggle = (key: string) =>
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));

  // Overall progress across every checklist item in the guide.
  const allItems = guide
    ? guide.steps.flatMap((s, si) => (s.checklist || []).map((_, ci) => `${si}-${ci}`))
    : [];
  const doneCount = allItems.filter((k) => checked[k]).length;
  const progress = allItems.length ? Math.round((doneCount / allItems.length) * 100) : 0;

  if (loading) return <div className="loading">Loading guides...</div>;
  if (!guide) return <div className="no-blog">No guides available</div>;

  const step = guide.steps[stepIdx];

  return (
    <div className="guides">
      <div className="guides-sidebar">
        <h3>Interactive Guides</h3>
        <div className="guide-list">
          {guides.map((g) => (
            <div
              key={g.slug}
              className={`guide-item ${guide.slug === g.slug ? 'active' : ''}`}
              onClick={() => loadGuide(g.slug)}
            >
              <p className="guide-title">{g.title}</p>
              <p className="guide-keyword">🎯 {g.targetKeyword}</p>
              <span className="guide-steps">{g.stepCount} steps</span>
            </div>
          ))}
        </div>
      </div>

      <div className="guide-main">
        <h1>{guide.title}</h1>
        <div className="guide-intro" dangerouslySetInnerHTML={{ __html: guide.intro }} />

        <div className="guide-progress">
          <div className="guide-progress-bar">
            <div className="guide-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="guide-progress-label">
            {doneCount}/{allItems.length} done ({progress}%)
          </span>
        </div>

        <div className="guide-stepper">
          {guide.steps.map((s, i) => (
            <button
              key={i}
              className={`step-dot ${i === stepIdx ? 'active' : ''}`}
              onClick={() => setStepIdx(i)}
              title={s.title}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <div className="guide-step-card">
          <h2>{step.title}</h2>
          <div dangerouslySetInnerHTML={{ __html: step.body }} />

          {step.checklist && step.checklist.length > 0 && (
            <div className="guide-checklist">
              {step.checklist.map((item, ci) => {
                const key = `${stepIdx}-${ci}`;
                return (
                  <label key={key} className={`check-item ${checked[key] ? 'checked' : ''}`}>
                    <input
                      type="checkbox"
                      checked={!!checked[key]}
                      onChange={() => toggle(key)}
                    />
                    <span>{item}</span>
                  </label>
                );
              })}
            </div>
          )}

          <div className="guide-nav">
            <button
              className="btn btn-small"
              disabled={stepIdx === 0}
              onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
            >
              ← Previous
            </button>
            <button
              className="btn btn-primary"
              disabled={stepIdx === guide.steps.length - 1}
              onClick={() => setStepIdx((i) => Math.min(guide.steps.length - 1, i + 1))}
            >
              Next →
            </button>
          </div>
        </div>

        {guide.faqs.length > 0 && (
          <div className="guide-faqs">
            <h2>Frequently Asked Questions</h2>
            {guide.faqs.map((f, i) => (
              <details key={i} className="faq-item">
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        )}

        <div className="article-hashtags">
          {guide.hashtags.map((h) => (
            <span key={h} className="hashtag-chip">
              {h}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
