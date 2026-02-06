import { createFileRoute } from "@tanstack/react-router";
import { start } from "workflow/api";
import { handleBotCreatePost } from "@/workflows/bot-create-post";

export const Route = createFileRoute("/api/test")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => null)) as {
          botUserId?: unknown;
        } | null;
        const botUserId = body?.botUserId;

        if (typeof botUserId !== "string" || botUserId.length === 0) {
          return Response.json(
            { message: "botUserId is required" },
            { status: 400 },
          );
        }

        await start(handleBotCreatePost, [{ botUserId }]);

        return Response.json(
          {
            status: "ok",
            message: "Bot post workflow started",
          },
          { status: 200 },
        );
      },
    },
  },
});
