import { createFileRoute } from "@tanstack/react-router";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth";
import { prepareElectricUrl, proxyElectricRequest } from "@/lib/electric-proxy";

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

        const originUrl = prepareElectricUrl(request.url);

        originUrl.searchParams.set("table", "bookmarks");
        originUrl.searchParams.set(
          "where",
          `"creator_id" = '${session.user.id}'`,
        );

        return proxyElectricRequest(originUrl);
      },
    },
  },
});
