import { handleRequest, type Router, route } from "@better-upload/server";
import { custom } from "@better-upload/server/clients";
import { createFileRoute } from "@tanstack/react-router";

const router: Router = {
  client: custom({
    host: new URL(process.env.AWS_ENDPOINT!).host,
    region: process.env.AWS_REGION!,
    forcePathStyle: process.env.FORCE_PATH_STYLE === "1",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    secure: process.env.AWS_ENDPOINT!.startsWith("https:"),
  }),
  bucketName: process.env.AWS_BUCKET_NAME!,
  routes: {
    images: route({
      fileTypes: ["image/*"],
      multipleFiles: true,
      maxFiles: 4,
    }),
  },
};

export const Route = createFileRoute("/api/upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        return handleRequest(request, router);
      },
    },
  },
});
