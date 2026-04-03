"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Leaderboard } from "@/components/leaderboard";
import { Users, Plus, Copy, Check, UserPlus } from "lucide-react";
import {
  DEMO_MODE,
  DEMO_FRIENDS,
  DEMO_LEADERBOARD,
} from "@/lib/demo-data";
import type { Group, GroupMember, LeaderboardEntry } from "@/lib/types";

export default function GroupPage() {
  const [groups, setGroups] = useState<
    (Group & { members: GroupMember[] })[]
  >([]);
  const [userId, setUserId] = useState<string>("");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (DEMO_MODE) {
        setUserId("demo-user");
        setGroups([
          {
            id: "g1",
            name: "Morning Warriors",
            invite_code: "FIT2024X",
            created_by: "demo-user",
            created_at: "2025-01-01",
            members: [
              { group_id: "g1", user_id: "demo-user", joined_at: "2025-01-01", profiles: { id: "demo-user", display_name: "You", avatar_url: null, created_at: "" } as unknown as undefined },
              ...DEMO_FRIENDS.map((f) => ({
                group_id: "g1",
                user_id: f.profile.id,
                joined_at: "2025-01-01",
                profiles: f.profile as unknown as undefined,
              })),
            ] as unknown as GroupMember[],
          },
        ]);
        setLeaderboard(DEMO_LEADERBOARD);
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: myGroups } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", user.id);

      if (myGroups && myGroups.length > 0) {
        const groupIds = myGroups.map((g) => g.group_id);

        const { data: groupData } = await supabase
          .from("groups")
          .select("*")
          .in("id", groupIds);

        const { data: memberData } = await supabase
          .from("group_members")
          .select("*, profiles(*)")
          .in("group_id", groupIds);

        const enriched = (groupData || []).map((g) => ({
          ...g,
          members: (memberData || []).filter((m) => m.group_id === g.id),
        }));

        setGroups(enriched);

        // Leaderboard
        const allUserIds = [
          ...new Set((memberData || []).map((m) => m.user_id)),
        ];
        const { data: lb } = await supabase
          .from("leaderboard")
          .select("*")
          .in("user_id", allUserIds)
          .order("total_points", { ascending: false });

        setLeaderboard(lb || []);
      }

      setLoading(false);
    }
    load();
  }, []);

  async function copyInviteCode(code: string) {
    await navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Users className="h-8 w-8 animate-pulse text-orange-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">My Squad</h1>
        <div className="flex gap-2">
          <Link href="/group/join">
            <Button variant="secondary" size="sm">
              <UserPlus className="h-4 w-4 mr-1" />
              Join
            </Button>
          </Link>
          <Link href="/group/create">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Create
            </Button>
          </Link>
        </div>
      </div>

      {groups.length === 0 ? (
        <Card className="text-center py-8 space-y-3">
          <Users className="h-10 w-10 text-slate-600 mx-auto" />
          <p className="text-sm text-slate-500">
            You&apos;re not in any squads yet
          </p>
          <p className="text-xs text-slate-600">
            Create a squad or join one with an invite code
          </p>
        </Card>
      ) : (
        <>
          {groups.map((group) => (
            <Card key={group.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">
                  {group.name}
                </h2>
                <button
                  onClick={() => copyInviteCode(group.invite_code)}
                  className="flex items-center gap-1 rounded-lg bg-slate-700/50 px-2 py-1 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  {copied === group.invite_code ? (
                    <Check className="h-3 w-3 text-green-400" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  {group.invite_code}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {group.members.map((member) => {
                  const profile = member.profiles as unknown as {
                    display_name: string;
                  };
                  return (
                    <div
                      key={member.user_id}
                      className="flex items-center gap-1.5 rounded-full bg-slate-700/30 px-2.5 py-1"
                    >
                      <div className="h-5 w-5 rounded-full bg-slate-600 flex items-center justify-center text-[10px] font-bold text-white">
                        {profile?.display_name?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <span className="text-xs text-slate-300">
                        {profile?.display_name || "Unknown"}
                        {member.user_id === userId && " (You)"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}

          <Leaderboard entries={leaderboard} currentUserId={userId} />
        </>
      )}
    </div>
  );
}
