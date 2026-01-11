import { ELECTRIC_PROTOCOL_QUERY_PARAMS } from "@electric-sql/client";
import { createFileRoute } from "@tanstack/react-router";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth";

export const Route = createFileRoute("/api/bookmarks")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = await auth.api.getSession({
          headers: getRequestHeaders(),
        });
        if (!session?.user) {
          return Response.json({ message: "Unauthorized" }, { status: 401 });
        }

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

        originUrl.searchParams.set("table", "bookmarks");
        originUrl.searchParams.set(
          "where",
          `"creator_id" = '${session.user.id}'`,
        );

        originUrl.searchParams.set(
          "source_id",
          process.env.ELECTRIC_SOURCE_ID!,
        );
        originUrl.searchParams.set("secret", process.env.ELECTRIC_SECRET!);

        const response = await fetch(originUrl);
        const responseHeaders = new Headers(response.headers);
        responseHeaders.delete("content-encoding");
        responseHeaders.delete("content-length");
        responseHeaders.set("Vary", "Cookie");

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
        });
      },
    },
  },
});
