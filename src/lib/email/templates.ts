import { baseTemplate } from "./base-template";

// ─── Welcome Email ─────────────────────────────────────────────────

export function welcomeEmail({ displayName }: { displayName: string }): string {
  return baseTemplate({
    preheader: `Welcome to FitSquad, ${displayName}! Your fitness journey starts now.`,
    content: `
      <p class="heading" style="color:#ffffff;font-size:22px;font-weight:700;margin:0;">
        Welcome, ${displayName}! 💪
      </p>
      <p class="body-text" style="color:#cbd5e1;font-size:14px;margin:16px 0 0 0;">
        You're in. FitSquad is your AI-powered kettlebell coach that builds personalized workouts, tracks your progress, and keeps you competing with your squad.
      </p>

      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:24px 0;">
        <tr>
          <td class="card" style="background-color:#0f172a;border-radius:12px;padding:16px;">
            <p class="body-text" style="color:#94a3b8;font-size:13px;margin:0 0 12px 0;font-weight:600;">Here's how to get started:</p>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td style="padding:4px 0;">
                  <p class="body-text" style="margin:0;font-size:13px;">
                    <span class="accent-text" style="color:#f97316;font-weight:600;">1.</span>
                    <span style="color:#e2e8f0;"> Complete your profile</span>
                    <span style="color:#64748b;"> — so workouts match your level</span>
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:4px 0;">
                  <p class="body-text" style="margin:0;font-size:13px;">
                    <span class="accent-text" style="color:#f97316;font-weight:600;">2.</span>
                    <span style="color:#e2e8f0;"> Generate your first workout</span>
                    <span style="color:#64748b;"> — AI builds it in seconds</span>
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:4px 0;">
                  <p class="body-text" style="margin:0;font-size:13px;">
                    <span class="accent-text" style="color:#f97316;font-weight:600;">3.</span>
                    <span style="color:#e2e8f0;"> Join or create a squad</span>
                    <span style="color:#64748b;"> — compete with friends</span>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="text-align:center;">
            <a href="https://fitsquad-ten.vercel.app/workout" class="btn" style="display:inline-block;background-color:#f97316;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 32px;border-radius:12px;">
              Start Your First Workout
            </a>
          </td>
        </tr>
      </table>
    `,
  });
}

// ─── Workout Reminder ──────────────────────────────────────────────

export function workoutReminderEmail({
  displayName,
  currentStreak,
  weeklyCount,
  squadRank,
  squadName,
}: {
  displayName: string;
  currentStreak: number;
  weeklyCount: number;
  squadRank?: number | null;
  squadName?: string | null;
}): string {
  const streakMessage =
    currentStreak > 0
      ? `You're on a <span class="accent-text" style="color:#f97316;font-weight:600;">${currentStreak}-day streak</span> — don't break it!`
      : "Start a new streak today!";

  const squadSection =
    squadRank && squadName
      ? `
      <tr>
        <td class="card" style="background-color:#0f172a;border-radius:12px;padding:16px;margin-top:16px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td>
                <p class="small-text" style="color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;margin:0;">Squad Rank</p>
                <p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#ffffff;font-size:16px;font-weight:700;margin:4px 0 0 0;">
                  #${squadRank} in ${squadName}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>`
      : "";

  return baseTemplate({
    preheader: `Time to workout, ${displayName}! ${currentStreak > 0 ? `${currentStreak}-day streak on the line.` : "Start a new streak today."}`,
    content: `
      <p class="heading" style="color:#ffffff;font-size:22px;font-weight:700;margin:0;">
        Time to work, ${displayName}! 🔥
      </p>
      <p class="body-text" style="color:#cbd5e1;font-size:14px;margin:12px 0 0 0;">
        ${streakMessage}
      </p>

      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:24px 0;">
        <tr>
          <td>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td class="card" style="background-color:#0f172a;border-radius:12px;padding:16px;width:48%;text-align:center;" width="48%">
                  <p class="stat-number" style="color:#f97316;font-size:28px;font-weight:700;margin:0;">${currentStreak}</p>
                  <p class="stat-label" style="color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;margin:4px 0 0 0;">Day Streak</p>
                </td>
                <td width="4%"></td>
                <td class="card" style="background-color:#0f172a;border-radius:12px;padding:16px;width:48%;text-align:center;" width="48%">
                  <p class="stat-number" style="color:#f97316;font-size:28px;font-weight:700;margin:0;">${weeklyCount}</p>
                  <p class="stat-label" style="color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;margin:4px 0 0 0;">This Week</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        ${squadSection}
      </table>

      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="text-align:center;">
            <a href="https://fitsquad-ten.vercel.app/workout" class="btn" style="display:inline-block;background-color:#f97316;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 32px;border-radius:12px;">
              Start Today's Workout
            </a>
          </td>
        </tr>
      </table>
    `,
  });
}

// ─── Weekly Summary ────────────────────────────────────────────────

export function weeklySummaryEmail({
  displayName,
  workoutsCompleted,
  pointsEarned,
  currentStreak,
  longestStreak,
  squadRank,
  squadName,
  weightChange,
}: {
  displayName: string;
  workoutsCompleted: number;
  pointsEarned: number;
  currentStreak: number;
  longestStreak: number;
  squadRank?: number | null;
  squadName?: string | null;
  weightChange?: number | null;
}): string {
  const weightSection =
    weightChange != null
      ? `
        <td class="card" style="background-color:#0f172a;border-radius:12px;padding:16px;text-align:center;" width="48%">
          <p class="stat-number" style="color:${weightChange <= 0 ? "#22c55e" : "#ef4444"};font-size:28px;font-weight:700;margin:0;">
            ${weightChange > 0 ? "+" : ""}${weightChange.toFixed(1)}
          </p>
          <p class="stat-label" style="color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;margin:4px 0 0 0;">Lbs</p>
        </td>`
      : `
        <td class="card" style="background-color:#0f172a;border-radius:12px;padding:16px;text-align:center;" width="48%">
          <p class="stat-number" style="color:#f97316;font-size:28px;font-weight:700;margin:0;">${longestStreak}</p>
          <p class="stat-label" style="color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;margin:4px 0 0 0;">Best Streak</p>
        </td>`;

  const motivation =
    workoutsCompleted >= 5
      ? "Incredible week! You're a machine. 🏆"
      : workoutsCompleted >= 3
      ? "Solid week! Keep that momentum going. 💪"
      : workoutsCompleted >= 1
      ? "Good start! Let's push harder this week. 🔥"
      : "No workouts this week — let's change that! 💥";

  return baseTemplate({
    preheader: `Your week in review: ${workoutsCompleted} workouts, ${pointsEarned} points earned.`,
    content: `
      <p class="heading" style="color:#ffffff;font-size:22px;font-weight:700;margin:0;">
        Your Week in Review 📊
      </p>
      <p class="body-text" style="color:#cbd5e1;font-size:14px;margin:12px 0 0 0;">
        ${motivation}
      </p>

      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:24px 0;">
        <tr>
          <td>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td class="card" style="background-color:#0f172a;border-radius:12px;padding:16px;width:48%;text-align:center;" width="48%">
                  <p class="stat-number" style="color:#f97316;font-size:28px;font-weight:700;margin:0;">${workoutsCompleted}</p>
                  <p class="stat-label" style="color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;margin:4px 0 0 0;">Workouts</p>
                </td>
                <td width="4%"></td>
                <td class="card" style="background-color:#0f172a;border-radius:12px;padding:16px;width:48%;text-align:center;" width="48%">
                  <p class="stat-number" style="color:#f97316;font-size:28px;font-weight:700;margin:0;">${pointsEarned}</p>
                  <p class="stat-label" style="color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;margin:4px 0 0 0;">Points</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr><td style="height:8px;"></td></tr>
        <tr>
          <td>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td class="card" style="background-color:#0f172a;border-radius:12px;padding:16px;width:48%;text-align:center;" width="48%">
                  <p class="stat-number" style="color:#f97316;font-size:28px;font-weight:700;margin:0;">${currentStreak}</p>
                  <p class="stat-label" style="color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;margin:4px 0 0 0;">Streak</p>
                </td>
                <td width="4%"></td>
                ${weightSection}
              </tr>
            </table>
          </td>
        </tr>
        ${
          squadRank && squadName
            ? `
        <tr><td style="height:8px;"></td></tr>
        <tr>
          <td class="card" style="background-color:#0f172a;border-radius:12px;padding:16px;">
            <p class="small-text" style="color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;margin:0;">Squad Rank</p>
            <p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#ffffff;font-size:16px;font-weight:700;margin:4px 0 0 0;">
              #${squadRank} in ${squadName}
            </p>
          </td>
        </tr>`
            : ""
        }
      </table>

      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="text-align:center;">
            <a href="https://fitsquad-ten.vercel.app/dashboard" class="btn" style="display:inline-block;background-color:#f97316;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 32px;border-radius:12px;">
              View Full Dashboard
            </a>
          </td>
        </tr>
      </table>
    `,
  });
}

// ─── Streak Milestone ──────────────────────────────────────────────

export function streakMilestoneEmail({
  displayName,
  streak,
}: {
  displayName: string;
  streak: number;
}): string {
  const milestoneEmoji =
    streak >= 365
      ? "👑"
      : streak >= 90
      ? "🏆"
      : streak >= 30
      ? "🔥"
      : streak >= 14
      ? "💪"
      : "⚡";

  return baseTemplate({
    preheader: `${streak}-day streak! ${displayName}, you're unstoppable.`,
    content: `
      <div style="text-align:center;">
        <p style="font-size:48px;margin:0 0 8px 0;">${milestoneEmoji}</p>
        <p class="heading" style="color:#ffffff;font-size:26px;font-weight:700;margin:0;">
          ${streak}-Day Streak!
        </p>
        <p class="body-text" style="color:#cbd5e1;font-size:14px;margin:12px 0 24px 0;">
          ${displayName}, you've worked out ${streak} days in a row. That's dedication. Keep it going!
        </p>
        <a href="https://fitsquad-ten.vercel.app/workout" class="btn" style="display:inline-block;background-color:#f97316;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 32px;border-radius:12px;">
          Keep the Streak Alive
        </a>
      </div>
    `,
  });
}
