export interface ForumPost {
  title: string;
  url: string;
  site: string;
  score: number;
  author: string;
  publishedDate: Date;
  content: string;
  comments?: number;
}

export interface TutorialTopic {
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  relatedPosts: ForumPost[];
  keywords: string[];
}

export interface TutorialOutline {
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  sections: Array<{
    title: string;
    description: string;
  }>;
}

export interface GeneratedTutorial {
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  content: string;
  tags: string[];
  series?: string;
}
