import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const { email, code, newPassword } = (await request.json()) as {
    email: string;
    code: string;
    newPassword: string;
  };

  if (!email || !code || !newPassword) {
    return NextResponse.json(
      { error: "Email, code, and new password required" },
      { status: 400 }
    );
  }

  if (newPassword.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 }
    );
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Find user by email
  const { data: users } = await supabaseAdmin.auth.admin.listUsers();
  const user = users?.users?.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  );

  if (!user) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }

  // Check the code
  const { data: resetCode } = await supabaseAdmin
    .from("reset_codes")
    .select("*")
    .eq("user_id", user.id)
    .eq("code", code)
    .eq("used", false)
    .single();

  if (!resetCode) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }

  if (new Date(resetCode.expires_at) < new Date()) {
    return NextResponse.json({ error: "Code expired" }, { status: 400 });
  }

  // Mark code as used
  await supabaseAdmin
    .from("reset_codes")
    .update({ used: true })
    .eq("id", resetCode.id);

  // Update the user's password
  const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
    password: newPassword,
  });

  if (error) {
    return NextResponse.json(
      { error: "Failed to update password" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
