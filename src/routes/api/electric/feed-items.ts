import { createFileRoute } from "@tanstack/react-router";
import {
  prepareElectricUrl,
  proxyElectricRequest,
} from "@/server/electric-proxy";

export const Route = createFileRoute("/api/electric/feed-items")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const originUrl = prepareElectricUrl(request.url);
        originUrl.searchParams.set("table", "feed_items");

        return proxyElectricRequest(originUrl);
      },

      POST: async ({ request }) => {
        const originUrl = prepareElectricUrl(request.url);
        originUrl.searchParams.set("table", "feed_items");

        return proxyElectricRequest(originUrl, {
          method: "POST",
          headers: request.headers,
          body: await request.text(),
        });
      },
    },
  },
});
