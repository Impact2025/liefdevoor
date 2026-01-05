import { Metadata } from 'next';

export interface ArticleMetadataOptions {
  title: string;
  description: string;
  keywords?: string[];
  canonicalUrl?: string;
  featuredImage?: string;
  publishedTime?: Date;
  modifiedTime?: Date;
  author?: string;
  section?: string;
  tags?: string[];
}

export function generateArticleMetadata(options: ArticleMetadataOptions): Metadata {
  const {
    title,
    description,
    keywords = [],
    canonicalUrl,
    featuredImage,
    publishedTime,
    modifiedTime,
    author = 'Liefde Voor Iedereen',
    section,
    tags = [],
  } = options;

  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://liefdevoor.vercel.app';
  const imageUrl = featuredImage
    ? (featuredImage.startsWith('http') ? featuredImage : `${baseUrl}${featuredImage}`)
    : `${baseUrl}/og-image.png`;

  return {
    title,
    description,
    keywords: keywords.length > 0 ? keywords.join(', ') : undefined,
    authors: [{ name: author }],
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: publishedTime?.toISOString(),
      modifiedTime: modifiedTime?.toISOString(),
      authors: [author],
      section,
      tags,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'nl_NL',
      siteName: 'Liefde Voor Iedereen',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      creator: '@liefdevoriedereen',
    },
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export interface CategoryMetadataOptions {
  title: string;
  description: string;
  keywords?: string[];
  canonicalUrl?: string;
  icon?: string;
}

export function generateCategoryMetadata(options: CategoryMetadataOptions): Metadata {
  const {
    title,
    description,
    keywords = [],
    canonicalUrl,
    icon,
  } = options;

  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://liefdevoor.vercel.app';
  const imageUrl = icon
    ? (icon.startsWith('http') ? icon : `${baseUrl}${icon}`)
    : `${baseUrl}/og-image.png`;

  return {
    title,
    description,
    keywords: keywords.length > 0 ? keywords.join(', ') : undefined,
    openGraph: {
      title,
      description,
      type: 'website',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'nl_NL',
      siteName: 'Liefde Voor Iedereen',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}
