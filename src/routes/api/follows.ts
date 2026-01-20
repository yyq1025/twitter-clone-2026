import { createFileRoute } from "@tanstack/react-router";
import { prepareElectricUrl, proxyElectricRequest } from "@/lib/electric-proxy";

export const Route = createFileRoute("/api/follows")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const originUrl = prepareElectricUrl(request.url);

        originUrl.searchParams.set("table", "follows");

        return proxyElectricRequest(originUrl);
      },
    },
  },
});
