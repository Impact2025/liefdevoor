'use client'

/**
 * API Documentation Page
 *
 * Interactive API documentation using Swagger UI
 */

import dynamic from 'next/dynamic'
import { openApiSpec } from '@/lib/openapi'

// Dynamic import to avoid SSR issues with Swagger UI
const SwaggerUI = dynamic(() => import('swagger-ui-react'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
        <p className="text-gray-600">API documentatie laden...</p>
      </div>
    </div>
  ),
})

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Liefde Voor Iedereen API</h1>
          <p className="text-pink-100">
            Interactieve documentatie voor de dating platform API
          </p>
          <div className="mt-4 flex gap-4 text-sm">
            <span className="bg-white/20 px-3 py-1 rounded-full">
              v1.0.0
            </span>
            <span className="bg-white/20 px-3 py-1 rounded-full">
              OpenAPI 3.1
            </span>
          </div>
        </div>
      </div>

      {/* Swagger UI */}
      <div className="swagger-ui-wrapper">
        <SwaggerUI
          spec={openApiSpec}
          docExpansion="list"
          defaultModelsExpandDepth={1}
          displayRequestDuration={true}
          filter={true}
          showExtensions={true}
          showCommonExtensions={true}
        />
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        .swagger-ui-wrapper .swagger-ui {
          font-family: inherit;
        }

        .swagger-ui-wrapper .swagger-ui .info .title {
          display: none;
        }

        .swagger-ui-wrapper .swagger-ui .info .description {
          font-size: 14px;
        }

        .swagger-ui-wrapper .swagger-ui .opblock-tag {
          font-size: 18px;
          border-bottom: 1px solid #e5e7eb;
        }

        .swagger-ui-wrapper .swagger-ui .opblock.opblock-post {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.05);
        }

        .swagger-ui-wrapper .swagger-ui .opblock.opblock-get {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.05);
        }

        .swagger-ui-wrapper .swagger-ui .opblock.opblock-delete {
          border-color: #ef4444;
          background: rgba(239, 68, 68, 0.05);
        }

        .swagger-ui-wrapper .swagger-ui .opblock.opblock-patch {
          border-color: #f59e0b;
          background: rgba(245, 158, 11, 0.05);
        }

        .swagger-ui-wrapper .swagger-ui .btn.execute {
          background-color: #ec4899;
          border-color: #ec4899;
        }

        .swagger-ui-wrapper .swagger-ui .btn.execute:hover {
          background-color: #db2777;
        }

        .swagger-ui-wrapper .swagger-ui select {
          border: 1px solid #d1d5db;
          border-radius: 6px;
        }

        .swagger-ui-wrapper .swagger-ui input[type="text"] {
          border: 1px solid #d1d5db;
          border-radius: 6px;
        }

        .swagger-ui-wrapper .swagger-ui .topbar {
          display: none;
        }

        .swagger-ui-wrapper .swagger-ui .scheme-container {
          background: #f9fafb;
          padding: 16px;
          border-radius: 8px;
        }
      `}</style>
    </div>
  )
}
