export interface GuideStep {
    title: string;
    body: string;
    checklist?: string[];
}
export interface GuideFaq {
    q: string;
    a: string;
}
export interface Guide {
    slug: string;
    targetKeyword: string;
    intent: 'Informational' | 'Commercial';
    metaTitle: string;
    metaDescription: string;
    title: string;
    intro: string;
    steps: GuideStep[];
    faqs: GuideFaq[];
    hashtags: string[];
    datePublished: string;
}
export declare const guides: Guide[];
export declare function getGuideBySlug(slug: string): Guide | undefined;
//# sourceMappingURL=guides.d.ts.map