export interface DunkDrivingIncident {
  id: string;
  state: string;
  location: string;
  title: string;
  description: string;
  severity: 'fatality' | 'serious-injury' | 'injury' | 'incident';
  injuryCount: number;
  deathCount: number;
  sourceUrl: string;
  sourceOutlet: string;
  dateOccurred: Date;
  dateReported: Date;
  latitude?: number;
  longitude?: number;
  tags: string[];
  socialMentions?: number;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  wordCount: number;
  datePublished: Date;
  relatedIncidents: string[]; // incident IDs
  culturalReferences: string[];
  hashtags: string[];
  socialMediaPosts: string[]; // formatted posts for sharing
}

export interface SocialPost {
  id: string;
  platform: 'twitter' | 'instagram' | 'tiktok' | 'facebook';
  author: string;
  content: string;
  likes: number;
  shares: number;
  comments: number;
  datePosted: Date;
  hasHashtag: boolean;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface DashboardSummary {
  totalIncidentsToday: number;
  totalDeathsToday: number;
  topState: string;
  topIncidents: DunkDrivingIncident[];
  blogStatus: 'pending' | 'generated' | 'published';
  socialMentions: number;
  engagementRate: number;
}
