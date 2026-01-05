import { WithContext, Article, BreadcrumbList, FAQPage, Organization } from 'schema-dts';

export interface ArticleStructuredDataOptions {
  headline: string;
  description: string;
  image?: string;
  datePublished?: Date;
  dateModified?: Date;
  author?: string;
  keywords?: string[];
  articleSection?: string;
  wordCount?: number;
  url: string;
  isPillarPage?: boolean;
}

export function generateArticleStructuredData(
  options: ArticleStructuredDataOptions
): WithContext<Article> {
  const {
    headline,
    description,
    image,
    datePublished,
    dateModified,
    author = 'Liefde Voor Iedereen',
    keywords = [],
    articleSection,
    wordCount,
    url,
    isPillarPage = false,
  } = options;

  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://liefdevoor.vercel.app';
  const imageUrl = image
    ? (image.startsWith('http') ? image : `${baseUrl}${image}`)
    : `${baseUrl}/og-image.png`;

  return {
    '@context': 'https://schema.org',
    '@type': isPillarPage ? 'ScholarlyArticle' : 'Article',
    headline,
    description,
    image: imageUrl,
    datePublished: datePublished?.toISOString(),
    dateModified: dateModified?.toISOString(),
    author: {
      '@type': 'Organization',
      name: author,
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    publisher: {
      '@type': 'Organization',
      name: 'Liefde Voor Iedereen',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    keywords: keywords.join(', '),
    articleSection,
    wordCount,
    inLanguage: 'nl-NL',
    isAccessibleForFree: true,
  };
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function generateBreadcrumbStructuredData(
  items: BreadcrumbItem[]
): WithContext<BreadcrumbList> {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://liefdevoor.vercel.app';

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`,
    })),
  };
}

export interface FAQItem {
  question: string;
  answer: string;
}

export function generateFAQStructuredData(
  faqs: FAQItem[]
): WithContext<FAQPage> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export interface OrganizationStructuredDataOptions {
  name: string;
  url: string;
  logo: string;
  description?: string;
  email?: string;
  telephone?: string;
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  sameAs?: string[];
}

export function generateOrganizationStructuredData(
  options: OrganizationStructuredDataOptions
): WithContext<Organization> {
  const {
    name,
    url,
    logo,
    description,
    email,
    telephone,
    address,
    sameAs = [],
  } = options;

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo,
    description,
    email,
    telephone,
    address: address ? {
      '@type': 'PostalAddress',
      ...address,
    } : undefined,
    sameAs,
  };
}

// Utility function to calculate word count from HTML/Markdown content
export function calculateWordCount(content: string): number {
  // Remove HTML tags and markdown syntax
  const text = content
    .replace(/<[^>]*>/g, '')  // Remove HTML tags
    .replace(/[#*_`\[\]]/g, '')  // Remove markdown syntax
    .trim();

  const words = text.split(/\s+/).filter(word => word.length > 0);
  return words.length;
}

// Utility function to render JSON-LD script tag
export function renderStructuredData(data: WithContext<any>): string {
  return JSON.stringify(data, null, 0);
}
