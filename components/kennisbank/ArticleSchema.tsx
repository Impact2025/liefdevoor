'use client'

interface ArticleSchemaProps {
  article: {
    title: string
    slug: string
    excerpt?: string
    content: string
    featuredImage?: string
    publishedAt: string
    updatedAt: string
    category: {
      name: string
      slug: string
    }
    author?: {
      name: string
    }
    keywords?: string[]
  }
}

export function ArticleSchema({ article }: ArticleSchemaProps) {
  const wordCount = article.content.split(/\s+/).length
  const readingTime = Math.ceil(wordCount / 200)

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.excerpt || article.content.substring(0, 160),
    "image": article.featuredImage || "https://liefdevooridereen.nl/og-default.jpg",
    "datePublished": article.publishedAt,
    "dateModified": article.updatedAt,
    "author": {
      "@type": "Organization",
      "name": article.author?.name || "Liefde Voor Iedereen",
      "url": "https://liefdevooridereen.nl"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Liefde Voor Iedereen",
      "logo": {
        "@type": "ImageObject",
        "url": "https://liefdevooridereen.nl/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://liefdevooridereen.nl/kennisbank/${article.category.slug}/${article.slug}`
    },
    "wordCount": wordCount,
    "timeRequired": `PT${readingTime}M`,
    "keywords": article.keywords?.join(", ") || "",
    "articleSection": article.category.name,
    "inLanguage": "nl-NL"
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function BreadcrumbSchema({ items }: { items: { name: string; url: string }[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `https://liefdevooridereen.nl${item.url}`
    }))
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function FAQSchema({ questions }: { questions: { question: string; answer: string }[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": questions.map(q => ({
      "@type": "Question",
      "name": q.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": q.answer
      }
    }))
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function HowToSchema({
  title,
  description,
  steps
}: {
  title: string
  description: string
  steps: { name: string; text: string }[]
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": title,
    "description": description,
    "step": steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.text
    }))
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Liefde Voor Iedereen",
    "alternateName": "LVI",
    "url": "https://liefdevooridereen.nl",
    "logo": "https://liefdevooridereen.nl/logo.png",
    "description": "De veiligste dating community van Nederland. Vind echte liefde in een veilige omgeving.",
    "sameAs": [
      "https://www.facebook.com/liefdevooridereen",
      "https://www.instagram.com/liefdevooridereen",
      "https://www.linkedin.com/company/liefdevooridereen"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+31-88-7867372",
      "contactType": "customer service",
      "availableLanguage": ["Dutch"]
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function WebsiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Liefde Voor Iedereen",
    "url": "https://liefdevooridereen.nl",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://liefdevooridereen.nl/kennisbank/zoeken?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
