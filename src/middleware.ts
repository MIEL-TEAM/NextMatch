// MIDDLEWARE COMPLETELY DISABLED FOR DEBUGGING
import { NextResponse } from "next/server";

export function middleware() {
  // Just pass everything through - no auth, no redirects, nothing
  return NextResponse.next();
}

export const config = {
  matcher: [], // Don't run on any routes for now
};
