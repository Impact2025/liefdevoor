/**
 * FAQ Data Index
 * Export all FAQ categories and articles
 */

export { faqCategories } from './categories'
export type { FAQCategoryData } from './categories'

export { gettingStartedArticles } from './articles-getting-started'
export type { FAQArticleData } from './articles-getting-started'

export { profileArticles } from './articles-profile'
export { discoverArticles } from './articles-discover'
export { messagesArticles } from './articles-messages'
export { premiumArticles } from './articles-premium'
export { subscriptionsArticles } from './articles-subscriptions'
export { safetyArticles } from './articles-safety'
export { privacyArticles } from './articles-privacy'
export { technicalArticles } from './articles-technical'
export { accessibilityArticles } from './articles-accessibility'

// Combined export
export const allArticles = [
  ...require('./articles-getting-started').gettingStartedArticles,
  ...require('./articles-profile').profileArticles,
  ...require('./articles-discover').discoverArticles,
  ...require('./articles-messages').messagesArticles,
  ...require('./articles-premium').premiumArticles,
  ...require('./articles-subscriptions').subscriptionsArticles,
  ...require('./articles-safety').safetyArticles,
  ...require('./articles-privacy').privacyArticles,
  ...require('./articles-technical').technicalArticles,
  ...require('./articles-accessibility').accessibilityArticles,
]
