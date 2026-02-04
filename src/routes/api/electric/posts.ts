import { createFileRoute } from "@tanstack/react-router";
import { prepareElectricUrl, proxyElectricRequest } from "@/lib/electric-proxy";

export const Route = createFileRoute("/api/electric/posts")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const originUrl = prepareElectricUrl(request.url);

        originUrl.searchParams.set("table", "posts");

        return proxyElectricRequest(originUrl);
      },
    },
  },
});
