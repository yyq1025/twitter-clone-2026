import { createFileRoute } from "@tanstack/react-router";
import {
  prepareElectricUrl,
  proxyElectricRequest,
} from "@/server/electric-proxy";

export const Route = createFileRoute("/api/electric/follows")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const originUrl = prepareElectricUrl(request.url);

        originUrl.searchParams.set("table", "follows");

        return proxyElectricRequest(originUrl);
      },

      POST: async ({ request }) => {
        const originUrl = prepareElectricUrl(request.url);
        originUrl.searchParams.set("table", "follows");

        return proxyElectricRequest(originUrl, {
          method: "POST",
          headers: request.headers,
          body: request.body,
          duplex: "half",
        });
      },
    },
  },
});
