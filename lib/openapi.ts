/**
 * OpenAPI 3.1 Specification
 *
 * Complete API documentation for Liefde Voor Iedereen dating platform
 */

export const openApiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'Liefde Voor Iedereen API',
    version: '1.0.0',
    description: `
# Liefde Voor Iedereen - Dating Platform API

Welkom bij de officiële API documentatie voor het Liefde Voor Iedereen dating platform.

## Authenticatie
Alle API endpoints (behalve publieke endpoints) vereisen authenticatie via NextAuth.js sessies.

## Rate Limiting
- **Algemene API calls**: 100 requests per minuut
- **Authenticatie**: 5 requests per 15 minuten
- **Registratie**: 3 requests per 10 minuten
- **Reports**: 5 requests per uur
- **AI/Icebreaker**: 20 requests per uur

## Subscription Tiers
- **FREE**: Basis functionaliteit met limieten
- **PLUS** (€9.95/maand): Unlimited likes, read receipts
- **COMPLETE** (€24.95/3 maanden): Alle features inclusief Passport en Incognito
    `,
    contact: {
      name: 'Liefde Voor Iedereen Support',
      email: 'support@liefdevoor iedereen.nl',
    },
    license: {
      name: 'Proprietary',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
    {
      url: 'https://liefdevoorIedereen.nl',
      description: 'Production server',
    },
  ],
  tags: [
    { name: 'Auth', description: 'Authenticatie en registratie' },
    { name: 'Profile', description: 'Gebruikersprofiel beheer' },
    { name: 'Discovery', description: 'Ontdek nieuwe matches' },
    { name: 'Swipe', description: 'Like en Pass acties' },
    { name: 'Matches', description: 'Match beheer' },
    { name: 'Chat', description: 'Berichten en realtime communicatie' },
    { name: 'Notifications', description: 'Push en email notificaties' },
    { name: 'Subscription', description: 'Abonnementen en betalingen' },
    { name: 'Safety', description: 'Veiligheid en rapportage' },
    { name: 'Admin', description: 'Beheerders functies' },
  ],
  paths: {
    // ==================== AUTH ====================
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Registreer een nieuwe gebruiker',
        operationId: 'register',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Registratie succesvol',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          429: { $ref: '#/components/responses/RateLimitError' },
        },
      },
    },
    '/api/auth/reset-password': {
      post: {
        tags: ['Auth'],
        summary: 'Wachtwoord reset aanvragen',
        operationId: 'resetPassword',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', format: 'email' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Reset email verzonden (als account bestaat)' },
          429: { $ref: '#/components/responses/RateLimitError' },
        },
      },
    },
    '/api/auth/verify': {
      post: {
        tags: ['Auth'],
        summary: 'Email verificatie',
        operationId: 'verifyEmail',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token'],
                properties: {
                  token: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Email geverifieerd' },
          400: { description: 'Ongeldige of verlopen token' },
        },
      },
    },

    // ==================== PROFILE ====================
    '/api/profile': {
      get: {
        tags: ['Profile'],
        summary: 'Haal eigen profiel op',
        operationId: 'getProfile',
        security: [{ session: [] }],
        responses: {
          200: {
            description: 'Profiel data',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserProfile' },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
      patch: {
        tags: ['Profile'],
        summary: 'Update profiel',
        operationId: 'updateProfile',
        security: [{ session: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProfileUpdateRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Profiel bijgewerkt',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserProfile' },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    // ==================== DISCOVERY ====================
    '/api/discover': {
      get: {
        tags: ['Discovery'],
        summary: 'Ontdek potentiële matches',
        operationId: 'discover',
        security: [{ session: [] }],
        parameters: [
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 10, maximum: 50 },
          },
          {
            name: 'minAge',
            in: 'query',
            schema: { type: 'integer', minimum: 18 },
          },
          {
            name: 'maxAge',
            in: 'query',
            schema: { type: 'integer', maximum: 99 },
          },
          {
            name: 'maxDistance',
            in: 'query',
            schema: { type: 'integer', description: 'Kilometers' },
          },
        ],
        responses: {
          200: {
            description: 'Lijst met potentiële matches',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    users: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/DiscoverUser' },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    // ==================== SWIPE ====================
    '/api/swipe': {
      post: {
        tags: ['Swipe'],
        summary: 'Like of Pass een gebruiker',
        operationId: 'swipe',
        security: [{ session: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SwipeRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Swipe geregistreerd',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SwipeResponse' },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/SwipeLimitReached' },
        },
      },
    },
    '/api/swipe/count': {
      get: {
        tags: ['Swipe'],
        summary: 'Haal dagelijkse swipe count op',
        operationId: 'getSwipeCount',
        security: [{ session: [] }],
        responses: {
          200: {
            description: 'Swipe statistieken',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    used: { type: 'integer' },
                    remaining: { type: 'integer' },
                    limit: { type: 'integer', description: '-1 voor unlimited' },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/swipe/undo': {
      post: {
        tags: ['Swipe'],
        summary: 'Maak laatste swipe ongedaan (Premium)',
        operationId: 'undoSwipe',
        security: [{ session: [] }],
        responses: {
          200: { description: 'Swipe ongedaan gemaakt' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/PremiumRequired' },
        },
      },
    },

    // ==================== MATCHES ====================
    '/api/matches': {
      get: {
        tags: ['Matches'],
        summary: 'Haal alle matches op',
        operationId: 'getMatches',
        security: [{ session: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 20, maximum: 50 },
          },
        ],
        responses: {
          200: {
            description: 'Lijst met matches',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    matches: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Match' },
                    },
                    pagination: { $ref: '#/components/schemas/Pagination' },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    // ==================== CHAT ====================
    '/api/realtime/stream': {
      get: {
        tags: ['Chat'],
        summary: 'SSE stream voor realtime berichten',
        operationId: 'chatStream',
        security: [{ session: [] }],
        parameters: [
          {
            name: 'matchId',
            in: 'query',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          200: {
            description: 'Server-Sent Events stream',
            content: {
              'text/event-stream': {
                schema: { type: 'string' },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/realtime/message': {
      post: {
        tags: ['Chat'],
        summary: 'Stuur een bericht',
        operationId: 'sendMessage',
        security: [{ session: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MessageRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Bericht verzonden',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Message' },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/messages/read': {
      post: {
        tags: ['Chat'],
        summary: 'Markeer berichten als gelezen',
        operationId: 'markAsRead',
        security: [{ session: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['matchId'],
                properties: {
                  matchId: { type: 'string', format: 'uuid' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Berichten gemarkeerd als gelezen' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    // ==================== NOTIFICATIONS ====================
    '/api/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'Haal notificaties op',
        operationId: 'getNotifications',
        security: [{ session: [] }],
        responses: {
          200: {
            description: 'Lijst met notificaties',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    notifications: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Notification' },
                    },
                    unreadCount: { type: 'integer' },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/notifications/subscribe': {
      post: {
        tags: ['Notifications'],
        summary: 'Registreer voor push notificaties',
        operationId: 'subscribePush',
        security: [{ session: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PushSubscription' },
            },
          },
        },
        responses: {
          200: { description: 'Push subscription geregistreerd' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    // ==================== SUBSCRIPTION ====================
    '/api/subscription': {
      get: {
        tags: ['Subscription'],
        summary: 'Haal huidige abonnement op',
        operationId: 'getSubscription',
        security: [{ session: [] }],
        responses: {
          200: {
            description: 'Abonnement info',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SubscriptionInfo' },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/subscription/create': {
      post: {
        tags: ['Subscription'],
        summary: 'Start nieuw abonnement',
        operationId: 'createSubscription',
        security: [{ session: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['plan'],
                properties: {
                  plan: {
                    type: 'string',
                    enum: ['PREMIUM', 'GOLD']
                  },
                  couponCode: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Payment URL',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    paymentUrl: { type: 'string', format: 'uri' },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    // ==================== SAFETY ====================
    '/api/safety/report': {
      post: {
        tags: ['Safety'],
        summary: 'Rapporteer een gebruiker',
        operationId: 'reportUser',
        security: [{ session: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ReportRequest' },
            },
          },
        },
        responses: {
          201: { description: 'Rapport ingediend' },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          429: { $ref: '#/components/responses/RateLimitError' },
        },
      },
    },
    '/api/safety/block': {
      post: {
        tags: ['Safety'],
        summary: 'Blokkeer een gebruiker',
        operationId: 'blockUser',
        security: [{ session: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId'],
                properties: {
                  userId: { type: 'string', format: 'uuid' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Gebruiker geblokkeerd' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
      delete: {
        tags: ['Safety'],
        summary: 'Deblokkeer een gebruiker',
        operationId: 'unblockUser',
        security: [{ session: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId'],
                properties: {
                  userId: { type: 'string', format: 'uuid' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Gebruiker gedeblokkeerd' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    // ==================== PRIVACY ====================
    '/api/privacy/data-export': {
      post: {
        tags: ['Safety'],
        summary: 'Vraag data export aan (GDPR/AVG)',
        operationId: 'requestDataExport',
        security: [{ session: [] }],
        responses: {
          200: { description: 'Data export aangevraagd' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/privacy/account-delete': {
      post: {
        tags: ['Safety'],
        summary: 'Vraag account verwijdering aan (GDPR/AVG)',
        operationId: 'requestAccountDeletion',
        security: [{ session: [] }],
        responses: {
          200: { description: 'Account verwijdering gepland (30 dagen)' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      session: {
        type: 'apiKey',
        in: 'cookie',
        name: 'next-auth.session-token',
        description: 'NextAuth.js session cookie',
      },
    },
    schemas: {
      // ==================== REQUEST SCHEMAS ====================
      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password', 'gender', 'birthDate', 'acceptTerms'],
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 50 },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          gender: { type: 'string', enum: ['MALE', 'FEMALE', 'NON_BINARY', 'OTHER'] },
          birthDate: { type: 'string', format: 'date' },
          acceptTerms: { type: 'boolean' },
        },
      },
      ProfileUpdateRequest: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 50 },
          bio: { type: 'string', maxLength: 2000 },
          city: { type: 'string', maxLength: 100 },
          postcode: { type: 'string', pattern: '^[0-9]{4}\\s?[A-Z]{2}$' },
          profileImage: { type: 'string', format: 'uri' },
        },
      },
      SwipeRequest: {
        type: 'object',
        required: ['swipedId', 'isLike'],
        properties: {
          swipedId: { type: 'string', format: 'uuid' },
          isLike: { type: 'boolean' },
          isSuperLike: { type: 'boolean', default: false },
        },
      },
      MessageRequest: {
        type: 'object',
        required: ['matchId', 'content'],
        properties: {
          matchId: { type: 'string', format: 'uuid' },
          content: { type: 'string', minLength: 1, maxLength: 5000 },
          type: { type: 'string', enum: ['TEXT', 'IMAGE', 'GIF', 'AUDIO'] },
        },
      },
      ReportRequest: {
        type: 'object',
        required: ['reportedUserId', 'reason', 'description'],
        properties: {
          reportedUserId: { type: 'string', format: 'uuid' },
          reason: {
            type: 'string',
            enum: ['INAPPROPRIATE_CONTENT', 'HARASSMENT', 'FAKE_PROFILE', 'SPAM', 'OTHER'],
          },
          description: { type: 'string', minLength: 10, maxLength: 1000 },
        },
      },

      // ==================== RESPONSE SCHEMAS ====================
      AuthResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          userId: { type: 'string', format: 'uuid' },
        },
      },
      UserProfile: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          bio: { type: 'string' },
          gender: { type: 'string' },
          birthDate: { type: 'string', format: 'date' },
          city: { type: 'string' },
          photos: {
            type: 'array',
            items: { $ref: '#/components/schemas/Photo' },
          },
          isVerified: { type: 'boolean' },
          subscriptionTier: { type: 'string', enum: ['FREE', 'PREMIUM', 'GOLD'] },
        },
      },
      DiscoverUser: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          age: { type: 'integer' },
          bio: { type: 'string' },
          city: { type: 'string' },
          distance: { type: 'number', description: 'Distance in kilometers' },
          photos: {
            type: 'array',
            items: { $ref: '#/components/schemas/Photo' },
          },
          isVerified: { type: 'boolean' },
          compatibilityScore: { type: 'number', minimum: 0, maximum: 100 },
        },
      },
      SwipeResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          isMatch: { type: 'boolean' },
          matchId: { type: 'string', format: 'uuid' },
          remaining: { type: 'integer', description: '-1 for unlimited' },
        },
      },
      Match: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          user: { $ref: '#/components/schemas/MatchUser' },
          lastMessage: { $ref: '#/components/schemas/Message' },
          unreadCount: { type: 'integer' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      MatchUser: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          profileImage: { type: 'string', format: 'uri' },
          isOnline: { type: 'boolean' },
          lastSeen: { type: 'string', format: 'date-time' },
        },
      },
      Message: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          content: { type: 'string' },
          type: { type: 'string', enum: ['TEXT', 'IMAGE', 'GIF', 'AUDIO'] },
          senderId: { type: 'string', format: 'uuid' },
          isRead: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Notification: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          type: { type: 'string', enum: ['MATCH', 'MESSAGE', 'LIKE', 'SUPERLIKE'] },
          title: { type: 'string' },
          body: { type: 'string' },
          isRead: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Photo: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          url: { type: 'string', format: 'uri' },
          isPrimary: { type: 'boolean' },
          order: { type: 'integer' },
        },
      },
      SubscriptionInfo: {
        type: 'object',
        properties: {
          plan: { type: 'string', enum: ['FREE', 'PREMIUM', 'GOLD'] },
          status: { type: 'string', enum: ['active', 'cancelled', 'expired', 'pending'] },
          isActive: { type: 'boolean' },
          expiresAt: { type: 'string', format: 'date-time' },
          features: { $ref: '#/components/schemas/PlanFeatures' },
        },
      },
      PlanFeatures: {
        type: 'object',
        properties: {
          dailyLikes: { type: 'integer', description: '-1 for unlimited' },
          dailyChats: { type: 'integer', description: '-1 for unlimited' },
          canSeeWhoLikedYou: { type: 'boolean' },
          readReceipts: { type: 'boolean' },
          advancedFilters: { type: 'boolean' },
          canUsePassport: { type: 'boolean' },
          canUseIncognito: { type: 'boolean' },
        },
      },
      PushSubscription: {
        type: 'object',
        required: ['endpoint', 'keys'],
        properties: {
          endpoint: { type: 'string', format: 'uri' },
          keys: {
            type: 'object',
            properties: {
              p256dh: { type: 'string' },
              auth: { type: 'string' },
            },
          },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          page: { type: 'integer' },
          limit: { type: 'integer' },
          total: { type: 'integer' },
          totalPages: { type: 'integer' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string' },
          message: { type: 'string' },
          details: { type: 'object' },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: 'Niet geautoriseerd',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              success: false,
              error: 'Niet ingelogd',
            },
          },
        },
      },
      ValidationError: {
        description: 'Validatie fout',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              success: false,
              error: 'Validatie fout',
              details: {
                email: 'Ongeldig email adres',
              },
            },
          },
        },
      },
      RateLimitError: {
        description: 'Te veel verzoeken',
        headers: {
          'Retry-After': {
            schema: { type: 'integer' },
            description: 'Seconds to wait before retrying',
          },
        },
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              success: false,
              error: 'Te veel verzoeken. Probeer het later opnieuw.',
              retryAfter: 60,
            },
          },
        },
      },
      PremiumRequired: {
        description: 'Premium abonnement vereist',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              success: false,
              error: 'Premium functie',
              message: 'Deze functie is beschikbaar met Premium.',
              requiredPlan: 'PREMIUM',
              upgradeUrl: '/prijzen',
            },
          },
        },
      },
      SwipeLimitReached: {
        description: 'Dagelijkse swipe limiet bereikt',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              success: false,
              error: 'Dagelijkse limiet bereikt',
              remaining: 0,
              upgradeUrl: '/prijzen',
            },
          },
        },
      },
    },
  },
}

export type OpenAPISpec = typeof openApiSpec
