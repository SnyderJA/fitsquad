import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email/send";
import { workoutReminderEmail } from "@/lib/email/templates";

export const maxDuration = 60;

const DAY_MAP: Record<number, string> = {
  0: "sun",
  1: "mon",
  2: "tue",
  3: "wed",
  4: "thu",
  5: "fri",
  6: "sat",
};

export async function GET(request: Request) {
  // Verify cron secret in production
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get current hour and day (UTC — users set their hour assuming their local time,
  // but for simplicity we'll use UTC. Can be improved later with timezone support.)
  const now = new Date();
  const currentHour = now.getUTCHours();
  const currentDay = DAY_MAP[now.getUTCDay()];

  // Find users who have reminders enabled for this hour and day
  const { data: profiles, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id, display_name, reminder_days, reminder_hour")
    .eq("reminder_enabled", true)
    .eq("reminder_hour", currentHour)
    .contains("reminder_days", [currentDay]);

  if (profileError || !profiles || profiles.length === 0) {
    return NextResponse.json({
      sent: 0,
      hour: currentHour,
      day: currentDay,
      error: profileError?.message,
    });
  }

  // Check if these users already worked out today
  const today = now.toISOString().split("T")[0];
  const userIds = profiles.map((p) => p.id);

  const { data: todayWorkouts } = await supabaseAdmin
    .from("workouts")
    .select("user_id")
    .in("user_id", userIds)
    .eq("date", today)
    .eq("completed", true);

  const completedUserIds = new Set(
    (todayWorkouts || []).map((w) => w.user_id)
  );

  // Filter out users who already worked out today
  const usersToRemind = profiles.filter(
    (p) => !completedUserIds.has(p.id)
  );

  if (usersToRemind.length === 0) {
    return NextResponse.json({ sent: 0, skipped: "all already worked out" });
  }

  // Get emails from auth.users
  const { data: authUsers } =
    await supabaseAdmin.auth.admin.listUsers();

  const emailMap = new Map<string, string>();
  authUsers?.users?.forEach((u) => {
    if (u.email) emailMap.set(u.id, u.email);
  });

  // Get streaks and weekly workout counts
  const weekAgo = new Date(Date.now() - 7 * 86400000)
    .toISOString()
    .split("T")[0];

  let sentCount = 0;

  for (const profile of usersToRemind) {
    const email = emailMap.get(profile.id);
    if (!email) continue;

    // Get streak
    const { data: streak } = await supabaseAdmin
      .from("streaks")
      .select("current_streak")
      .eq("user_id", profile.id)
      .single();

    // Get weekly workout count
    const { count: weeklyCount } = await supabaseAdmin
      .from("workouts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .eq("completed", true)
      .gte("date", weekAgo);

    // Get squad rank
    const { data: memberGroups } = await supabaseAdmin
      .from("group_members")
      .select("group_id, groups(name)")
      .eq("user_id", profile.id)
      .limit(1);

    let squadRank: number | null = null;
    let squadName: string | null = null;

    if (memberGroups && memberGroups.length > 0) {
      const group = memberGroups[0];
      squadName = (group.groups as unknown as { name: string })?.name || null;

      if (squadName) {
        const { data: lb } = await supabaseAdmin
          .from("leaderboard")
          .select("user_id, total_points")
          .order("total_points", { ascending: false });

        if (lb) {
          const rank = lb.findIndex((e) => e.user_id === profile.id);
          if (rank >= 0) squadRank = rank + 1;
        }
      }
    }

    const html = workoutReminderEmail({
      displayName: profile.display_name,
      currentStreak: streak?.current_streak || 0,
      weeklyCount: weeklyCount || 0,
      squadRank,
      squadName,
    });

    const result = await sendEmail({
      to: email,
      subject: `Time to work, ${profile.display_name}! 🔥`,
      html,
    });

    if (result.success) sentCount++;
  }

  return NextResponse.json({ sent: sentCount, total: usersToRemind.length });
}
