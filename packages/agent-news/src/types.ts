export interface NewsArticle {
  title: string;
  url: string;
  source: string;
  siteName: string;
  publishedDate: Date;
  summary?: string;
  content: string;
  categories: string[];
  weight: number;
}

export interface ProcessedArticle extends NewsArticle {
  relevanceScore: number;
  isDuplicate: boolean;
  generatedSlug: string;
}

export interface ArticleDeduplicationCache {
  urls: Set<string>;
  titles: Map<string, Date>; // title -> published date
}
