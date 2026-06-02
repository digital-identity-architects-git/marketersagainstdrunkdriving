export interface SeoArticle {
    slug: string;
    targetKeyword: string;
    intent: 'Informational' | 'Commercial';
    metaTitle: string;
    metaDescription: string;
    title: string;
    html: string;
    hashtags: string[];
    datePublished: string;
}
export declare const seoArticles: SeoArticle[];
export declare function getArticleBySlug(slug: string): SeoArticle | undefined;
//# sourceMappingURL=seoArticles.d.ts.map