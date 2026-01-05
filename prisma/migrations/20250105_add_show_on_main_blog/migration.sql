-- AlterTable
ALTER TABLE "Post" ADD COLUMN "showOnMainBlog" BOOLEAN NOT NULL DEFAULT true;

-- Add comment
COMMENT ON COLUMN "Post"."showOnMainBlog" IS 'Toon artikel op algemeen blog overzicht (false = alleen zichtbaar op doelgroep paginas)';
