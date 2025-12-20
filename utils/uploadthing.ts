import {
  generateUploadButton,
  generateUploadDropzone,
  generateReactHelpers,
} from "@uploadthing/react";

import type { OurFileRouter } from "@/app/api/uploadthing/core";

export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();

// Generate hooks for use in custom components
export const { useUploadThing } = generateReactHelpers<OurFileRouter>();

// Export the router for use in components
export type { OurFileRouter };