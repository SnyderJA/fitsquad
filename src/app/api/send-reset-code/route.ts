import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const { email } = (await request.json()) as { email: string };

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  // Generate a 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min

  // Store code in Supabase using service role (bypasses RLS)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Check if user exists
  const { data: users } = await supabaseAdmin.auth.admin.listUsers();
  const user = users?.users?.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  );

  if (!user) {
    // Don't reveal if email exists — always show success
    return NextResponse.json({ success: true });
  }

  // Store the reset code
  await supabaseAdmin.from("reset_codes").upsert(
    {
      user_id: user.id,
      code,
      expires_at: expiresAt,
      used: false,
    },
    { onConflict: "user_id" }
  );

  // Send email via Resend
  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@rvneighborsapp.com";

  if (!resendKey) {
    console.error("RESEND_API_KEY not set");
    return NextResponse.json({ error: "Email service unavailable" }, { status: 500 });
  }

  const emailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: email,
      subject: "FitSquad — Password Reset Code",
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 400px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="color: #f97316; margin-bottom: 8px;">FitSquad</h2>
          <p style="color: #333; margin-bottom: 24px;">Enter this code to reset your password:</p>
          <div style="background: #0f172a; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #f97316;">${code}</span>
          </div>
          <p style="color: #666; font-size: 14px;">This code expires in 15 minutes.</p>
          <p style="color: #999; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    }),
  });

  if (!emailResponse.ok) {
    const err = await emailResponse.text();
    console.error("Resend error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
