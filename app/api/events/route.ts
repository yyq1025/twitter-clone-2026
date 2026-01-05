import type { Txid } from "@tanstack/electric-db-collection";
import { and, eq, sql } from "drizzle-orm";
import type { PgTransaction } from "drizzle-orm/pg-core";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema/auth-schema";
import { feed_items } from "@/db/schema/feed-item-schema";
import { follows } from "@/db/schema/follow-schema";
import { likes } from "@/db/schema/like-schema";
import { notifications } from "@/db/schema/notification-schema";
import { posts } from "@/db/schema/post-shema";
import { reposts } from "@/db/schema/repost-schema";
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
          await tx
            .update(users)
            .set({
              postsCount: sql`${users.postsCount} + 1`,
            })
            .where(eq(users.id, session.user.id));
          if (post.reply_parent_id) {
            const [replyParent] = await tx
              .update(posts)
              .set({
                reply_count: sql`${posts.reply_count} + 1`,
              })
              .where(eq(posts.id, post.reply_parent_id))
              .returning();
            if (replyParent && session.user.id !== replyParent.creator_id) {
              await tx
                .insert(notifications)
                .values({
                  creator_id: session.user.id,
                  recipient_id: replyParent.creator_id,
                  reason: "reply",
                  subject_id: replyParent.id,
                })
                .onConflictDoNothing();
            }
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
          const [post] = await tx
            .update(posts)
            .set({
              like_count: sql`${posts.like_count} + 1`,
            })
            .where(eq(posts.id, like.subject_id))
            .returning();
          if (post && session.user.id !== post.creator_id) {
            await tx
              .insert(notifications)
              .values({
                creator_id: session.user.id,
                recipient_id: post.creator_id,
                reason: "like",
                subject_id: post.id,
              })
              .onConflictDoNothing();
          }
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
      case "post.repost": {
        await db.transaction(async (tx) => {
          txid = await generateTxId(tx);
          const [repost] = await tx
            .insert(reposts)
            .values({
              creator_id: session.user.id,
              subject_id: event.payload.subject_id,
            })
            .returning();
          await tx.insert(feed_items).values({
            type: "repost",
            creator_id: repost.creator_id,
            post_id: repost.subject_id,
          });
          const [post] = await tx
            .update(posts)
            .set({
              repost_count: sql`${posts.repost_count} + 1`,
            })
            .where(eq(posts.id, repost.subject_id))
            .returning();
          if (post && session.user.id !== post.creator_id) {
            await tx
              .insert(notifications)
              .values({
                creator_id: session.user.id,
                recipient_id: post.creator_id,
                reason: "repost",
                subject_id: post.id,
              })
              .onConflictDoNothing();
          }
        });
        break;
      }
      case "post.unrepost": {
        await db.transaction(async (tx) => {
          txid = await generateTxId(tx);
          const [repost] = await tx
            .delete(reposts)
            .where(
              and(
                eq(reposts.subject_id, event.payload.subject_id),
                eq(reposts.creator_id, session.user.id),
              ),
            )
            .returning();
          if (!repost) {
            throw new Error("Repost not found");
          }
          await tx
            .update(posts)
            .set({
              repost_count: sql`${posts.repost_count} - 1`,
            })
            .where(eq(posts.id, repost.subject_id));
          await tx
            .delete(feed_items)
            .where(
              and(
                eq(feed_items.type, "repost"),
                eq(feed_items.creator_id, session.user.id),
                eq(feed_items.post_id, repost.subject_id),
              ),
            );
        });
        break;
      }
      case "user.follow": {
        await db.transaction(async (tx) => {
          txid = await generateTxId(tx);
          if (session.user.id === event.payload.subject_id) {
            throw new Error("Cannot follow yourself");
          }
          const [follow] = await tx
            .insert(follows)
            .values({
              creator_id: session.user.id,
              subject_id: event.payload.subject_id,
            })
            .returning();
          await tx
            .update(users)
            .set({
              followersCount: sql`${users.followersCount} + 1`,
            })
            .where(eq(users.id, follow.subject_id));
          await tx
            .update(users)
            .set({
              followsCount: sql`${users.followsCount} + 1`,
            })
            .where(eq(users.id, follow.creator_id));
          await tx
            .insert(notifications)
            .values({
              creator_id: session.user.id,
              recipient_id: follow.subject_id,
              reason: "follow",
            })
            .onConflictDoNothing();
        });
        break;
      }
      case "user.unfollow": {
        await db.transaction(async (tx) => {
          txid = await generateTxId(tx);
          const [unfollow] = await tx
            .delete(follows)
            .where(
              and(
                eq(follows.subject_id, event.payload.subject_id),
                eq(follows.creator_id, session.user.id),
              ),
            )
            .returning();
          if (!unfollow) {
            throw new Error("Follow not found");
          }
          await tx
            .update(users)
            .set({
              followersCount: sql`${users.followersCount} - 1`,
            })
            .where(eq(users.id, unfollow.subject_id));
          await tx
            .update(users)
            .set({
              followsCount: sql`${users.followsCount} - 1`,
            })
            .where(eq(users.id, unfollow.creator_id));
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
