/**
 * API Docs Layout
 *
 * Separate layout for API documentation to avoid conflicts with main app styles
 */

import 'swagger-ui-react/swagger-ui.css'

export const metadata = {
  title: 'API Documentatie | Liefde Voor Iedereen',
  description: 'Interactieve API documentatie voor het Liefde Voor Iedereen dating platform',
}

export default function ApiDocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
