import Link from "next/link";
import { Dumbbell, Users, Trophy, Flame } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="mx-auto max-w-sm space-y-8">
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 text-orange-500">
            <Dumbbell className="h-10 w-10" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">
            FitSquad
          </h1>
          <p className="text-slate-400">
            Track workouts. Compete with friends. Get stronger together.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-left">
          <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-3">
            <Dumbbell className="h-5 w-5 text-orange-500 mb-1" />
            <p className="text-xs font-medium text-white">AI Workouts</p>
            <p className="text-[10px] text-slate-500">
              Bodyweight & kettlebell
            </p>
          </div>
          <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-3">
            <Users className="h-5 w-5 text-orange-500 mb-1" />
            <p className="text-xs font-medium text-white">Squad Up</p>
            <p className="text-[10px] text-slate-500">
              Train with friends
            </p>
          </div>
          <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-3">
            <Trophy className="h-5 w-5 text-orange-500 mb-1" />
            <p className="text-xs font-medium text-white">Compete</p>
            <p className="text-[10px] text-slate-500">
              Points & leaderboards
            </p>
          </div>
          <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-3">
            <Flame className="h-5 w-5 text-orange-500 mb-1" />
            <p className="text-xs font-medium text-white">Streaks</p>
            <p className="text-[10px] text-slate-500">
              Stay consistent
            </p>
          </div>
        </div>

        <Link
          href="/signup"
          className="block w-full rounded-xl bg-orange-500 px-6 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-orange-500/25 hover:bg-orange-600 transition-all active:scale-[0.98]"
        >
          Get Started
        </Link>

        <p className="text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-orange-500 hover:text-orange-400 font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
