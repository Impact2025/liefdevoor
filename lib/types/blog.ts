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

// Blog Entity Types (aligned with Prisma schema)
export interface BlogPost {
  id: string;
  title: string;
  content: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  likeCount: number;
  authorId: string;
  categoryId: string;
  author?: BlogAuthor;
  category?: BlogCategory;
}

export interface BlogAuthor {
  id: string;
  name: string;
  profileImage: string | null;
  bio?: string | null;
}

export interface BlogCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string | null;
}

export interface BlogComment {
  id: string;
  content: string;
  createdAt: Date;
  authorId: string;
  postId: string;
  author?: BlogAuthor;
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
