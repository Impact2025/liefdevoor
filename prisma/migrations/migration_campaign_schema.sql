-- ============================================
-- MIGRATION CAMPAIGN SYSTEM
-- OogvoorLiefde.nl → LiefdevoorIedereen.nl
-- ============================================

-- Voeg deze modellen toe aan schema.prisma

/*
// ============================================
// 🚀 MIGRATION CAMPAIGN SYSTEM
// OogvoorLiefde.nl → LiefdevoorIedereen.nl
// ============================================

enum MigrationSegment {
  VIP           // Super actief (laatste 3 maanden)
  GOLD          // Had gold membership
  ACTIVE        // Actief (3-12 maanden geleden)
  DORMANT       // Slapend (1-2 jaar)
  INACTIVE      // Inactief (>2 jaar)
}

enum MigrationEmailType {
  WELCOME           // Dag 0: Eerste uitnodiging
  MATCHES_WAITING   // Dag 3: "X mensen wachten op je"
  REMINDER          // Dag 7: Herinnering
  FEATURES          // Dag 10: Nieuwe features
  SOCIAL_PROOF      // Dag 14: "Maria activeerde ook"
  LAST_CHANCE       // Dag 21: Laatste kans
  GOODBYE           // Dag 28: Data wordt verwijderd
  EXPIRED           // Dag 30: Coupon verlopen
}

enum MigrationStatus {
  PENDING           // Nog niet gecontacteerd
  EMAIL_SENT        // Eerste email verzonden
  EMAIL_OPENED      // Email geopend
  LINK_CLICKED      // Link geklikt
  LANDING_VISITED   // Landing pagina bezocht
  CLAIM_STARTED     // Claim proces gestart
  CLAIMED           // Account geclaimd
  ACTIVATED         // Onboarding voltooid
  EXPIRED           // Niet gereageerd, data verwijderd
}

model MigrationUser {
  id                String            @id @default(cuid())

  // Old system data
  oldUserId         Int               @unique
  oldEmail          String
  firstName         String
  lastName          String?

  // Profile snapshot
  oldProfilePhoto   String?
  memberSince       DateTime
  lastActiveOld     DateTime?
  hadGoldMembership Boolean           @default(false)
  photoCount        Int               @default(0)
  messageCount      Int               @default(0)
  matchCount        Int               @default(0)

  // Segmentation
  segment           MigrationSegment

  // New system reference
  newUserId         String?           @unique

  // Campaign status
  status            MigrationStatus   @default(PENDING)

  // Coupon
  couponCode        String?           @unique
  couponExpiresAt   DateTime?
  couponRedeemedAt  DateTime?

  // Claim token
  claimToken        String?           @unique
  claimTokenExpiresAt DateTime?
  claimedAt         DateTime?

  // Referral
  referralCode      String?           @unique
  referredBy        String?           // MigrationUser.id
  referralCount     Int               @default(0)

  // Email tracking
  emailsSent        MigrationEmail[]
  lastEmailSentAt   DateTime?
  lastEmailOpenedAt DateTime?
  lastLinkClickedAt DateTime?
  totalEmailsOpened Int               @default(0)

  // Landing page tracking
  landingVisits     Int               @default(0)
  lastLandingVisit  DateTime?

  // Timestamps
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt

  @@index([oldEmail])
  @@index([segment])
  @@index([status])
  @@index([couponCode])
  @@index([claimToken])
  @@index([referralCode])
  @@index([lastEmailSentAt])
}

model MigrationEmail {
  id                String              @id @default(cuid())

  // Relations
  migrationUserId   String
  migrationUser     MigrationUser       @relation(fields: [migrationUserId], references: [id], onDelete: Cascade)

  // Email details
  emailType         MigrationEmailType
  subject           String

  // A/B Testing
  abVariant         String?             // 'A' or 'B'

  // Tracking
  sentAt            DateTime            @default(now())
  deliveredAt       DateTime?
  openedAt          DateTime?
  clickedAt         DateTime?
  bouncedAt         DateTime?

  // Resend tracking
  resendId          String?

  // Error handling
  errorMessage      String?
  retryCount        Int                 @default(0)

  @@index([migrationUserId])
  @@index([emailType])
  @@index([sentAt])
  @@index([openedAt])
}

model MigrationCampaignStats {
  id                String    @id @default(cuid())
  date              DateTime  @unique @default(now())

  // Totals by segment
  totalVIP          Int       @default(0)
  totalGold         Int       @default(0)
  totalActive       Int       @default(0)
  totalDormant      Int       @default(0)

  // Email metrics
  emailsSent        Int       @default(0)
  emailsOpened      Int       @default(0)
  linksClicked      Int       @default(0)

  // Conversion metrics
  landingVisits     Int       @default(0)
  claimsStarted     Int       @default(0)
  claimsCompleted   Int       @default(0)
  activations       Int       @default(0)

  // Coupon metrics
  couponsGenerated  Int       @default(0)
  couponsRedeemed   Int       @default(0)

  // Referral metrics
  referralsSent     Int       @default(0)
  referralsConverted Int      @default(0)

  @@index([date])
}

model MigrationClick {
  id                String    @id @default(cuid())

  // Relations
  migrationUserId   String
  emailId           String?

  // Click details
  linkType          String    @default("cta")  // cta, unsubscribe, logo, etc.
  clickedAt         DateTime  @default(now())

  // User agent info
  userAgent         String?
  ipAddress         String?

  @@index([migrationUserId])
  @@index([emailId])
  @@index([clickedAt])
}
*/
