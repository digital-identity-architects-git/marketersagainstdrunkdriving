export declare const CAMPAIGN_HASHTAG = "#marketersagainstdrunkdriving";
export declare function spin(template: string): string;
export type SocialPlatform = 'twitter' | 'instagram' | 'facebook' | 'tiktok' | 'linkedin';
export interface GeneratedSocialPost {
    platform: SocialPlatform;
    description: string;
    hashtags: string[];
    text: string;
    generatedAt: Date;
}
export declare function generateDailySocialPosts(): GeneratedSocialPost[];
//# sourceMappingURL=spintaxService.d.ts.map