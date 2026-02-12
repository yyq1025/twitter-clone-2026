import { createFileRoute } from "@tanstack/react-router";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { and, asc, isNotNull, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema/better-auth";
import { auth } from "@/lib/auth";
import {
  mentionSearchQuerySchema,
  mentionSearchResponseSchema,
} from "@/lib/validators";

function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}

export const Route = createFileRoute("/api/users/mentions")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = await auth.api.getSession({
          headers: getRequestHeaders(),
        });

        if (!session?.user) {
          return Response.json({ message: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(request.url);
        const parsedQuery = mentionSearchQuerySchema.safeParse({
          q: url.searchParams.get("q") ?? "",
          limit: url.searchParams.get("limit") ?? undefined,
        });

        if (!parsedQuery.success) {
          return Response.json(
            {
              message: "Invalid query params",
              errors: parsedQuery.error.message,
            },
            { status: 400 },
          );
        }

        const normalizedQuery = parsedQuery.data.q.trim().toLowerCase();

        if (!normalizedQuery) {
          return Response.json(
            mentionSearchResponseSchema.parse({ items: [] }),
          );
        }

        try {
          const escapedQuery = escapeLikePattern(normalizedQuery);
          const prefixPattern = `${escapedQuery}%`;
          const containsPattern = `%${escapedQuery}%`;
          const lowerUsername = sql<string>`lower(${users.username})`;
          const lowerName = sql<string>`lower(${users.name})`;

          const rank = sql<number>`
            case
              when ${lowerUsername} = ${normalizedQuery} then 0
              when ${lowerUsername} like ${prefixPattern} escape '\\' then 1
              when ${lowerName} like ${prefixPattern} escape '\\' then 2
              when ${lowerUsername} like ${containsPattern} escape '\\' then 3
              when ${lowerName} like ${containsPattern} escape '\\' then 4
              else 5
            end
          `;

          const rows = await db
            .select({
              id: users.id,
              label: users.username,
              name: users.name,
              avatar: users.image,
              rank,
            })
            .from(users)
            .where(
              and(
                isNotNull(users.username),
                or(
                  sql`${lowerUsername} like ${prefixPattern} escape '\\'`,
                  sql`${lowerName} like ${prefixPattern} escape '\\'`,
                  sql`${lowerUsername} like ${containsPattern} escape '\\'`,
                  sql`${lowerName} like ${containsPattern} escape '\\'`,
                ),
              ),
            )
            .orderBy(rank, asc(users.username))
            .limit(parsedQuery.data.limit);

          const items = rows.flatMap((row) => {
            if (!row.label) {
              return [];
            }

            return [
              {
                id: row.id,
                label: row.label,
                name: row.name,
                avatar: row.avatar ?? "",
              },
            ];
          });

          return Response.json(mentionSearchResponseSchema.parse({ items }));
        } catch (error) {
          console.error("[MENTION_SEARCH] Failed to search mention users", {
            error,
            userId: session.user.id,
          });
          return Response.json(
            { message: "Failed to search mention users" },
            { status: 500 },
          );
        }
      },
    },
  },
});
