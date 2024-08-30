import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  await supabase.auth.signOut();

  return NextResponse.redirect(`${SITE_URL}/`, {
    // a 301 status is required to redirect from a POST to a GET route
    status: 301,
  });
}
