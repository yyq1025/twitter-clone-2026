import type { Txid } from "@tanstack/electric-db-collection";
import { eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema/better-auth";
import { feed_items } from "@/db/schema/feed-item";
import { notifications } from "@/db/schema/notification";
import { posts } from "@/db/schema/post";
import type { InsertNotification, InsertPost } from "@/lib/validators";
import { detectFacets } from "@/utils/post";

type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function generateTxId(tx: DbTransaction): Promise<Txid> {
  const result = await tx.execute(
    sql`SELECT pg_current_xact_id()::xid::text as txid`,
  );
  const txid = result.rows[0]?.txid as string | undefined;

  if (txid === undefined) {
    throw new Error("Failed to get transaction ID");
  }

  return parseInt(txid, 10);
}

type CreatePostInput = {
  actorUserId: string;
  payload: InsertPost;
};

export async function createPostWithSideEffects({
  actorUserId,
  payload,
}: CreatePostInput): Promise<Txid> {
  let txid!: Txid;

  await db.transaction(async (tx) => {
    txid = await generateTxId(tx);
    const [post] = await tx
      .insert(posts)
      .values({ ...payload, creator_id: actorUserId })
      .returning();

    await tx.insert(feed_items).values({
      type: "post",
      creator_id: actorUserId,
      post_id: post.id,
    });

    await tx
      .update(users)
      .set({
        postsCount: sql`${users.postsCount} + 1`,
      })
      .where(eq(users.id, actorUserId));

    const notificationsToInsert: InsertNotification[] = [];
    const mentionUsernames = Array.from(
      new Set(
        detectFacets(post.content)
          .filter(
            (facet) => facet.type === "mention" && facet.username.length > 0,
          )
          .map((facet) => facet.username),
      ),
    );

    if (mentionUsernames.length > 0) {
      const mentionedUsers = await tx
        .select({ id: users.id, username: users.username })
        .from(users)
        .where(inArray(users.username, mentionUsernames));

      for (const user of mentionedUsers) {
        if (
          user.id !== actorUserId &&
          !notificationsToInsert.find((n) => n.recipient_id === user.id)
        ) {
          notificationsToInsert.push({
            creator_id: actorUserId,
            recipient_id: user.id,
            reason: "mention",
            reason_post_id: post.id,
          });
        }
      }
    }

    if (post.reply_parent_id) {
      const [replyParent] = await tx
        .update(posts)
        .set({
          reply_count: sql`${posts.reply_count} + 1`,
        })
        .where(eq(posts.id, post.reply_parent_id))
        .returning();

      if (
        replyParent &&
        actorUserId !== replyParent.creator_id &&
        !notificationsToInsert.find(
          (n) => n.recipient_id === replyParent.creator_id,
        )
      ) {
        notificationsToInsert.push({
          creator_id: actorUserId,
          recipient_id: replyParent.creator_id,
          reason: "reply",
          reason_post_id: post.id,
        });
      }
    }

    if (notificationsToInsert.length > 0) {
      await tx
        .insert(notifications)
        .values(notificationsToInsert)
        .onConflictDoNothing();
    }
  });

  return txid;
}
