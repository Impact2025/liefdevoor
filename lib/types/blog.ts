// Blog AI Generator Types
export interface AIGeneratorParams {
  primaryKeyword: string;
  category: string;
  year?: string;
  targetAudience?: string;
  toneOfVoice?: string;
  articleLength?: number;
}

export interface GeneratedBlogContent {
  content: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  socialMedia: {
    instagram: string;
    facebook: string;
    linkedin: string;
    twitter: string;
  };
  midjourneyPrompt: string;
  excerpt: string;
}

export interface SavePostData {
  title: string;
  content: string;
  slug?: string;
  excerpt?: string;
  featuredImage?: string;
  categoryId: string;
  published: boolean;
}

export interface BlogStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalViews: number;
}

// Pagination for blog lists
export interface BlogPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
