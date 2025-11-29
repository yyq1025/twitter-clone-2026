import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { postMedia, posts } from "@/db/schema/post-shema";
import { headers } from "next/headers";
import { eq, sql } from "drizzle-orm";
import type { PgTransaction } from "drizzle-orm/pg-core";
import type { Txid } from "@tanstack/electric-db-collection";
import { ELECTRIC_PROTOCOL_QUERY_PARAMS } from "@electric-sql/client";
import { insertPostSchema, insertPostMediaSchema } from "@/db/validation";
import * as z from "zod";

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

export async function GET(request: Request) {
  const proxyUrl = new URL(request.url);
  const originUrl = new URL("/v1/shape", "https://api.electric-sql.cloud");

  proxyUrl.searchParams.forEach((value, key) => {
    if (ELECTRIC_PROTOCOL_QUERY_PARAMS.includes(key)) {
      originUrl.searchParams.set(key, value);
    }
  });

  originUrl.searchParams.set("table", "posts");

  originUrl.searchParams.set("source_id", process.env.ELECTRIC_SOURCE_ID!);
  originUrl.searchParams.set("secret", process.env.ELECTRIC_SECRET!);

  const response = await fetch(originUrl);
  const headers = new Headers(response.headers);
  headers.delete("content-encoding");
  headers.delete("content-length");

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: headers,
  });
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const parsedPost = insertPostSchema.safeParse({
      ...body,
      userId: session.user.id,
    });

    if (!parsedPost.success) {
      return NextResponse.json(
        {
          message: "Invalid request body",
          errors: parsedPost.error.message,
        },
        { status: 400 },
      );
    }

    const parsedPostMedia = z
      .array(insertPostMediaSchema)
      .safeParse(body.postMedia || []);

    if (!parsedPostMedia.success) {
      return NextResponse.json(
        {
          message: "Invalid post media",
          errors: parsedPostMedia.error.message,
        },
        { status: 400 },
      );
    }

    let txid!: Txid;
    const newPost = await db.transaction(async (tx) => {
      txid = await generateTxId(tx);
      const [post] = await tx.insert(posts).values(parsedPost.data).returning();
      parsedPostMedia.data.forEach(async (media) => {
        await tx.insert(postMedia).values({
          ...media,
          postId: post.id,
        });
      });
      if (post.replyToId) {
        await tx
          .update(posts)
          .set({
            replyCount: sql`${posts.replyCount} + 1`,
          })
          .where(eq(posts.id, post.replyToId));
      }
      if (post.repostId) {
        await tx
          .update(posts)
          .set({
            repostCount: sql`${posts.repostCount} + 1`,
          })
          .where(eq(posts.id, post.repostId));
      }
      return post;
    });

    return NextResponse.json({ post: newPost, txid }, { status: 201 });
  } catch (error) {
    console.error("[POSTS_POST]", error);
    return NextResponse.json(
      { message: "Failed to create post" },
      { status: 500 },
    );
  }
}
