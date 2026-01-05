import { ELECTRIC_PROTOCOL_QUERY_PARAMS } from "@electric-sql/client";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const proxyUrl = new URL(request.url);
  const originUrl = new URL("/v1/shape", "https://api.electric-sql.cloud");

  proxyUrl.searchParams.forEach((value, key) => {
    if (ELECTRIC_PROTOCOL_QUERY_PARAMS.includes(key)) {
      originUrl.searchParams.set(key, value);
    }
  });

  originUrl.searchParams.set("table", "notifications");
  originUrl.searchParams.set("where", `"recipient_id" = '${session.user.id}'`);

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
