import { ELECTRIC_PROTOCOL_QUERY_PARAMS } from "@electric-sql/client";
import type { Txid } from "@tanstack/electric-db-collection";
import { and, eq, sql } from "drizzle-orm";
import type { PgTransaction } from "drizzle-orm/pg-core";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { follows } from "@/db/schema/follow-schema";
import { insertFollowSchema } from "@/db/validation";
import { auth } from "@/lib/auth";

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

  originUrl.searchParams.set("table", "follows");

  originUrl.searchParams.set("source_id", process.env.ELECTRIC_SOURCE_ID!);
  originUrl.searchParams.set("secret", process.env.ELECTRIC_SECRET!);

  const response = await fetch(originUrl);
  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const parsedBody = insertFollowSchema.safeParse({
      ...body,
      follower_id: session.user.id,
    });

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          message: "Invalid request body",
          errors: parsedBody.error.message,
        },
        { status: 400 },
      );
    }

    let txid!: Txid;
    await db.transaction(async (tx) => {
      txid = await generateTxId(tx);
      await tx.insert(follows).values(parsedBody.data);
    });

    return NextResponse.json({ txid }, { status: 201 });
  } catch (error) {
    console.error("[FOLLOWS_POST]", error);
    return NextResponse.json(
      { message: "Failed to create follow" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const followingId = searchParams.get("followingId");

    if (!followingId) {
      return NextResponse.json(
        { message: "followingId is required" },
        { status: 400 },
      );
    }

    let txid!: Txid;
    await db.transaction(async (tx) => {
      txid = await generateTxId(tx);
      await tx
        .delete(follows)
        .where(
          and(
            eq(follows.following_id, followingId),
            eq(follows.follower_id, session.user.id),
          ),
        );
    });

    return NextResponse.json({ txid, success: true }, { status: 200 });
  } catch (error) {
    console.error("[FOLLOWS_DELETE]", error);
    return NextResponse.json(
      { message: "Failed to delete follow" },
      { status: 500 },
    );
  }
}
