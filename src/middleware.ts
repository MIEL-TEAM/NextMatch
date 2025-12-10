// MIDDLEWARE COMPLETELY DISABLED FOR DEBUGGING
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Just pass everything through - no auth, no redirects, nothing
  return NextResponse.next();
}

export const config = {
  matcher: [], // Don't run on any routes for now
};
