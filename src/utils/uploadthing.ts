import { genUploader } from "uploadthing/client";

import type { UploadRouter } from "@/server/uploadthing";

export const { uploadFiles } = genUploader<UploadRouter>();
