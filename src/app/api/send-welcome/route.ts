import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email/send";
import { welcomeEmail } from "@/lib/email/templates";

export async function POST(request: Request) {
  const { userId } = (await request.json()) as { userId: string };

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get user email
  const { data: authUser } =
    await supabaseAdmin.auth.admin.getUserById(userId);

  if (!authUser?.user?.email) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Get display name
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("display_name")
    .eq("id", userId)
    .single();

  const html = welcomeEmail({
    displayName: profile?.display_name || "Athlete",
  });

  const result = await sendEmail({
    to: authUser.user.email,
    subject: "Welcome to FitSquad! 💪",
    html,
  });

  return NextResponse.json(result);
}
