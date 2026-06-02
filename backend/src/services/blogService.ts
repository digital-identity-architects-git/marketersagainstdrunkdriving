import Anthropic from '@anthropic-ai/sdk';
import { DunkDrivingIncident, BlogPost } from '../types/index.js';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateDailyBlog(incidents: DunkDrivingIncident[]): Promise<BlogPost> {
  const topIncidents = incidents.slice(0, 10);
  
  const incidentSummary = topIncidents
    .map(
      (inc, idx) =>
        `${idx + 1}. ${inc.title} in ${inc.location}, ${inc.state} - ${
          inc.deathCount
        } deaths, ${inc.injuryCount} injuries`
    )
    .join('\n');

  const culturalRefs = [
    'Drake, The Weeknd, or Kendrick Lamar',
    'popular restaurants or trending products',
    'Netflix shows or recent movies',
    'TikTok trends',
    'fitness or wellness products',
  ];

  const randomRefs = culturalRefs
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const prompt = `You are a skilled writer for a news aggregation platform with a hidden social activist mission. 
  
Your task: Write a compelling, well-researched 750+ word blog post that:
1. Opens with today's worst 10 drunk driving incidents (listed below)
2. Weaves in cultural content naturally - review or mention 2-3 of these: ${randomRefs.join(', ')}
3. Includes strategic warnings about drunk driving without being preachy
4. Ends with a call to action (safely share with friends, support safer communities, etc.)
5. Uses the tone of a trending lifestyle/news blog, not a PSA

Today's Top 10 Incidents:
${incidentSummary}

The goal: Make people actually want to read and share this. The social impact comes from reach and engagement.

Write the blog now:`;

  const message = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1500,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  const blogContent = content.type === 'text' ? content.text : '';

  // Generate 3 social media versions (for Twitter, Instagram, etc.)
  const socialPrompt = `Based on this blog post, create 3 different social media posts for sharing:
1. Twitter (280 chars, include #marketersagainstdrunkdriving)
2. Instagram caption (with multiple hashtags)
3. TikTok text overlay (punchy, emotional hook)

Blog excerpt: ${blogContent.substring(0, 500)}...

Format as JSON array with fields: platform, text`;

  const socialMessage = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 500,
    messages: [
      {
        role: 'user',
        content: socialPrompt,
      },
    ],
  });

  const socialContent = socialMessage.content[0];
  const socialText = socialContent.type === 'text' ? socialContent.text : '[]';
  let socialPosts: string[] = [];

  try {
    const parsed = JSON.parse(socialText);
    socialPosts = Array.isArray(parsed) ? parsed.map((p: any) => p.text || '') : [];
  } catch {
    console.warn('Failed to parse social posts JSON');
    socialPosts = [];
  }

  const wordCount = blogContent.split(/\s+/).length;

  return {
    id: `blog-${Date.now()}`,
    title: `Today's Drunk Driving News & Impact Report - ${new Date().toLocaleDateString()}`,
    content: blogContent,
    wordCount,
    datePublished: new Date(),
    relatedIncidents: topIncidents.map((i) => i.id),
    culturalReferences: randomRefs,
    hashtags: ['#marketersagainstdrunkdriving', '#safedriving', '#activism'],
    socialMediaPosts: socialPosts,
  };
}

export async function generateIncidentTitle(incident: Partial<DunkDrivingIncident>): Promise<string> {
  const prompt = `Create a compelling news headline (under 100 chars) for this drunk driving incident:
  Location: ${incident.location}, ${incident.state}
  Deaths: ${incident.deathCount}
  Injuries: ${incident.injuryCount}
  Description: ${incident.description}
  
  Make it news-worthy and factual, not sensational.`;

  const message = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 100,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  return content.type === 'text' ? content.text.trim() : 'Drunk Driving Incident Reported';
}
