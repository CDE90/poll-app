import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";

export function middleware(req: NextRequest, ev: NextFetchEvent) {
  if (req.nextUrl.pathname.startsWith("/p")) {
    if (req.cookies.get("voter-token")) return;

    const voterToken = nanoid();

    const res = NextResponse.redirect(req.nextUrl);

    res.cookies.set("voter-token", voterToken, { sameSite: "strict" });

    return res;
  }
}
