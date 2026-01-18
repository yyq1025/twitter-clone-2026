import { handleRequest, type Router, route } from "@better-upload/server";
import { tigris } from "@better-upload/server/clients";
import { createFileRoute } from "@tanstack/react-router";

const router: Router = {
  client: tigris(),
  bucketName: process.env.TIGRIS_BUCKET_NAME!,
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
