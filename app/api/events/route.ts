import type { Txid } from "@tanstack/electric-db-collection";
import { and, eq, sql } from "drizzle-orm";
import type { PgTransaction } from "drizzle-orm/pg-core";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { feed_items } from "@/db/schema/feed-item-schema";
import { likes } from "@/db/schema/like-schema";
import { posts } from "@/db/schema/post-shema";
import { auth } from "@/lib/auth";
import { eventSchema } from "@/lib/validators";

async function generateTxId(tx: PgTransaction<any, any, any>): Promise<Txid> {
  const result = await tx.execute(
    sql`SELECT pg_current_xact_id()::xid::text as txid`,
  );
  const txid = result[0]?.txid as string | undefined;

  if (txid === undefined) {
    throw new Error(`Failed to get transaction ID`);
  }

  return parseInt(txid, 10);
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const parsedEvent = eventSchema.safeParse(body);
    if (!parsedEvent.success) {
      return NextResponse.json(
        {
          message: "Invalid request body",
          errors: parsedEvent.error.message,
        },
        { status: 400 },
      );
    }

    const event = parsedEvent.data;
    let txid!: Txid;

    switch (event.type) {
      case "post.create": {
        await db.transaction(async (tx) => {
          txid = await generateTxId(tx);
          const [post] = await tx
            .insert(posts)
            .values(event.payload)
            .returning();
          await tx.insert(feed_items).values({
            type: "post",
            creator_id: session.user.id,
            post_id: post.id,
          });
          if (post.reply_parent_id) {
            await tx
              .update(posts)
              .set({
                reply_count: sql`${posts.reply_count} + 1`,
              })
              .where(eq(posts.id, post.reply_parent_id));
          }
        });
        break;
      }
      case "post.like": {
        await db.transaction(async (tx) => {
          txid = await generateTxId(tx);
          const [like] = await tx
            .insert(likes)
            .values({
              creator_id: session.user.id,
              subject_id: event.payload.subject_id,
            })
            .returning();
          await tx
            .update(posts)
            .set({
              like_count: sql`${posts.like_count} + 1`,
            })
            .where(eq(posts.id, like.subject_id));
        });
        break;
      }
      case "post.unlike": {
        await db.transaction(async (tx) => {
          txid = await generateTxId(tx);
          const [like] = await tx
            .delete(likes)
            .where(
              and(
                eq(likes.subject_id, event.payload.subject_id),
                eq(likes.creator_id, session.user.id),
              ),
            )
            .returning();
          if (!like) {
            throw new Error("Like not found");
          }
          await tx
            .update(posts)
            .set({
              like_count: sql`${posts.like_count} - 1`,
            })
            .where(eq(posts.id, like.subject_id));
        });
        break;
      }
      default:
        throw new Error(`Unsupported event type: ${event.type}`);
    }

    return NextResponse.json({ txid }, { status: 201 });
  } catch (error) {
    console.error("[EVENTS_POST]", error);
    return NextResponse.json(
      { message: "Failed to create post" },
      { status: 500 },
    );
  }
}
