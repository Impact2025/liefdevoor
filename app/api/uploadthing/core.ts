import { createUploadthing, type FileRouter } from "uploadthing/next";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

const f = createUploadthing();

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

// FileRouter: Hier bepalen we WAT er geüpload mag worden
export const ourFileRouter = {
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
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;