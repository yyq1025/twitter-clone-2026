import { ELECTRIC_PROTOCOL_QUERY_PARAMS } from "@electric-sql/client";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const proxyUrl = new URL(request.url);
  const originUrl = new URL("/v1/shape", "https://api.electric-sql.cloud");

  proxyUrl.searchParams.forEach((value, key) => {
    if (ELECTRIC_PROTOCOL_QUERY_PARAMS.includes(key)) {
      originUrl.searchParams.set(key, value);
    }
  });

  originUrl.searchParams.set("table", "likes");

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
