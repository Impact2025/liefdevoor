import { createUploadthing, type FileRouter } from "uploadthing/next";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

const f = createUploadthing({
  /**
   * Log out more information about the error, but don't return it to the client
   */
  errorFormatter: (err) => {
    console.log("UploadThing Error:", err);
    console.log("Error message:", err.message);
    console.log("Error cause:", err.cause);
    console.log("Error code:", err.code);
    return {
      message: err.message,
    };
  },
});

// Auth function using NextAuth
const auth = async (req: Request) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  });

  if (!user) throw new Error("User not found");

  return { id: user.id };
};

// Admin auth function - requires ADMIN role
const adminAuth = async (req: Request) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true }
  });

  if (!user) throw new Error("User not found");
  if (user.role !== 'ADMIN') throw new Error("Admin access required");

  return { id: user.id };
};

// FileRouter: Hier bepalen we WAT er geüpload mag worden
export const ourFileRouter = {
  // Blog featured images (Admin only)
  blogImage: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 1,
    }
  })
    .middleware(async ({ req }) => {
      const user = await adminAuth(req);
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Blog image upload compleet:", file.url);
      return { url: file.url };
    }),

  // We maken een route "profilePhotos" die meerdere afbeeldingen accepteert
  profilePhotos: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 10,
    }
  })
    .middleware(async ({ req }) => {
      const user = await auth(req);
      if (!user) throw new Error("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload compleet voor gebruiker:", metadata.userId);
      console.log("Foto URL:", file.url);

      try {
        // Get the current highest order for this user
        const maxOrder = await prisma.photo.findFirst({
          where: { userId: metadata.userId },
          orderBy: { order: 'desc' },
          select: { order: true }
        });

        const nextOrder = (maxOrder?.order ?? -1) + 1;

        // Save the photo to database
        await prisma.photo.create({
          data: {
            url: file.url,
            userId: metadata.userId,
            order: nextOrder
          }
        });

        console.log("Foto opgeslagen in database");
      } catch (error) {
        console.error("Fout bij opslaan foto:", error);
        throw new Error("Failed to save photo to database");
      }
    }),

  // Voice intro for user profile (max 60 seconds)
  voiceIntro: f({
    audio: {
      maxFileSize: "8MB",
      maxFileCount: 1,
    }
  })
    .middleware(async ({ req }) => {
      const user = await auth(req);
      if (!user) throw new Error("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Voice intro upload compleet voor gebruiker:", metadata.userId);
      console.log("Audio URL:", file.url);

      try {
        // Update user's voiceIntro field (NOT voiceIntroUrl - that's deprecated)
        await prisma.user.update({
          where: { id: metadata.userId },
          data: { voiceIntro: file.url }
        });

        console.log("Voice intro opgeslagen in database");
        return { url: file.url };
      } catch (error) {
        console.error("Fout bij opslaan voice intro:", error);
        throw new Error("Failed to save voice intro to database");
      }
    }),

  // Voice messages in chat
  voiceMessage: f({
    audio: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    }
  })
    .middleware(async ({ req }) => {
      const user = await auth(req);
      if (!user) throw new Error("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Voice message upload compleet voor gebruiker:", metadata.userId);
      console.log("Audio URL:", file.url);

      // Return the URL - the actual message will be created by the messages API
      return { url: file.url };
    }),

  // Stories - 24-hour content
  storyUploader: f({
    image: { maxFileSize: "8MB", maxFileCount: 1 },
    video: { maxFileSize: "64MB", maxFileCount: 1 },
  })
    .middleware(async ({ req }) => {
      const user = await auth(req);
      if (!user) throw new Error("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Story upload compleet voor gebruiker:", metadata.userId);
      console.log("Story URL:", file.url);

      // Return the URL - the story will be created by the stories API
      return { url: file.url };
    }),

  // Chat Images - photos shared in messages
  chatImage: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 5, // Allow multiple images at once
    }
  })
    .middleware(async ({ req }) => {
      const user = await auth(req);
      if (!user) throw new Error("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Chat image upload compleet voor gebruiker:", metadata.userId);
      console.log("Image URL:", file.url);

      // Return the URL - the message will be created by the messages API
      return { url: file.url };
    }),

  // Chat Videos - videos shared in messages
  chatVideo: f({
    video: {
      maxFileSize: "32MB", // Smaller than stories for chat
      maxFileCount: 1,
    }
  })
    .middleware(async ({ req }) => {
      const user = await auth(req);
      if (!user) throw new Error("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Chat video upload compleet voor gebruiker:", metadata.userId);
      console.log("Video URL:", file.url);

      // Return the URL - the message will be created by the messages API
      return { url: file.url };
    }),
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;