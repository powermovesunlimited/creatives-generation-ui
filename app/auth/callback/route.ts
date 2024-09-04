import { Database } from "@/types/supabase";
import { createRouteHandlerClient, SupabaseClient } from "@supabase/auth-helpers-nextjs";
import { isAuthApiError } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const SITE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.NEXT_PUBLIC_SITE_URL 
  : 'http://localhost:3000';

function setInitialcredit(supabase: SupabaseClient<Database>, userId: string) {
  supabase.from('credits').insert({
    user_id: userId,
    credits: 5,
    created_at: new Date().toISOString()
  }).then(({ error }) => {
    if (error) {
      console.error('Error creating credits row:', error);
    }
  });
}

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const next = requestUrl.searchParams.get("next") || "/";
  const error_description = requestUrl.searchParams.get("error_description");

  if (error) {
    console.log("error: ", {
      error,
      error_description,
      code,
    });
  }

  if (code) {
    const supabase = createRouteHandlerClient<Database>({ cookies });

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        throw error;
      }

      // After exchanging the code, we should check if the user has a feature-flag row and credits now, if not, we should create one
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError || !userData) {
        console.error("[login] [session] [500] Error getting user: ", userError);
        return NextResponse.redirect(`${SITE_URL}/login/failed?err=500`);
      }

      const userId = userData.user.id;

      // Check if the user has a credits row
      const { data: creditsData, error: creditsError } = await supabase
        .from('credits')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (creditsError && creditsError.code === 'PGRST116') { // code for no data found
        // If the user does not have a credits row, create one
        setInitialcredit(supabase, userId);
      } else if (creditsError) {
        console.error('Error retrieving user credits:', creditsError);
      }

      // Set the auth cookie
      const response = NextResponse.redirect(new URL(next, SITE_URL));
      response.cookies.set('sb-auth-token', data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      });

      return response;
    } catch (error) {
      if (isAuthApiError(error)) {
        console.error("[login] [session] [500] Error exchanging code for session: ", error);
        return NextResponse.redirect(`${SITE_URL}/login/failed?err=AuthApiError`);
      } else {
        console.error("[login] [session] [500] Something wrong: ", error);
        return NextResponse.redirect(`${SITE_URL}/login/failed?err=500`);
      }
    }
  }

  return NextResponse.redirect(new URL(next, SITE_URL + "/ad-gallery"));
}
