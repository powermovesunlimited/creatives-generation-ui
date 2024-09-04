import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getSiteUrl(request: Request): string {
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_SITE_URL || '';
  }
  
  // For development, use the host header to get the correct URL
  const host = headers().get('host');
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  return `${protocol}://${host}`;
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const siteUrl = getSiteUrl(request);

  await supabase.auth.signOut();

  return NextResponse.redirect(`${siteUrl}/`, {
    // a 301 status is required to redirect from a POST to a GET route
    status: 301,
  });
}
