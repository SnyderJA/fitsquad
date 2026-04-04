import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const error_description = searchParams.get("error_description");

  // If Supabase sent an error
  if (error_description) {
    console.error("Recovery error from Supabase:", error_description);
    return NextResponse.redirect(
      `${origin}/forgot-password?error=${encodeURIComponent(error_description)}`
    );
  }

  const supabase = await createClient();

  // Handle code-based exchange (PKCE flow)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/reset-password`);
    }
    console.error("Recovery code exchange failed:", error.message);
    return NextResponse.redirect(
      `${origin}/forgot-password?error=${encodeURIComponent(error.message)}`
    );
  }

  // Handle token_hash verification
  if (token_hash) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: (type as "recovery") || "recovery",
    });
    if (!error) {
      return NextResponse.redirect(`${origin}/reset-password`);
    }
    console.error("Recovery token verification failed:", error.message);
    return NextResponse.redirect(
      `${origin}/forgot-password?error=${encodeURIComponent(error.message)}`
    );
  }

  // Check if session already exists
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    return NextResponse.redirect(`${origin}/reset-password`);
  }

  return NextResponse.redirect(`${origin}/forgot-password?error=no_token`);
}
