import { ELECTRIC_PROTOCOL_QUERY_PARAMS } from "@electric-sql/client";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/feed-items")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const proxyUrl = new URL(request.url);
        const originUrl = new URL(
          "/v1/shape",
          "https://api.electric-sql.cloud",
        );

        proxyUrl.searchParams.forEach((value, key) => {
          if (ELECTRIC_PROTOCOL_QUERY_PARAMS.includes(key)) {
            originUrl.searchParams.set(key, value);
          }
        });

        originUrl.searchParams.set("table", "feed_items");

        originUrl.searchParams.set(
          "source_id",
          process.env.ELECTRIC_SOURCE_ID!,
        );
        originUrl.searchParams.set("secret", process.env.ELECTRIC_SECRET!);

        const response = await fetch(originUrl);
        const headers = new Headers(response.headers);
        headers.delete("content-encoding");
        headers.delete("content-length");

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: headers,
        });
      },
    },
  },
});
