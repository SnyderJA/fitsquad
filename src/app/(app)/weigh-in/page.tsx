"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WeighInChart } from "@/components/weigh-in-chart";
import { POINTS, getPointsReason } from "@/lib/points";
import { DEMO_MODE, DEMO_WEIGH_INS } from "@/lib/demo-data";
import { Scale, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { WeighIn } from "@/lib/types";

export default function WeighInPage() {
  const [weighIns, setWeighIns] = useState<WeighIn[]>([]);
  const [weight, setWeight] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadWeighIns();
  }, []);

  async function loadWeighIns() {
    if (DEMO_MODE) {
      setWeighIns(DEMO_WEIGH_INS);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("weigh_ins")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(20);

    setWeighIns(data || []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0) return;

    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date().toISOString().split("T")[0];

    // Check if already weighed in today
    const { data: existing } = await supabase
      .from("weigh_ins")
      .select("id")
      .eq("user_id", user.id)
      .eq("date", today)
      .maybeSingle();

    if (existing) {
      // Update today's entry
      await supabase
        .from("weigh_ins")
        .update({ weight: weightNum })
        .eq("id", existing.id);
    } else {
      // New entry + points
      await supabase.from("weigh_ins").insert({
        user_id: user.id,
        weight: weightNum,
        date: today,
      });

      await supabase.from("points").insert({
        user_id: user.id,
        points: POINTS.WEEKLY_WEIGH_IN,
        reason: getPointsReason("WEEKLY_WEIGH_IN"),
      });
    }

    setWeight("");
    setShowForm(false);
    setSaving(false);
    loadWeighIns();
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Scale className="h-8 w-8 animate-pulse text-orange-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Weigh-in</h1>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" />
          Log Weight
        </Button>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              id="weight"
              label="Weight (lbs)"
              type="number"
              step="0.1"
              placeholder="e.g. 175.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" loading={saving}>
                Save (+5 pts)
              </Button>
            </div>
          </form>
        </Card>
      )}

      <WeighInChart weighIns={weighIns} />

      {/* History */}
      {weighIns.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-300">History</h2>
          {weighIns.map((w) => (
            <Card
              key={w.id}
              className="flex items-center justify-between py-3"
            >
              <span className="text-sm text-slate-400">
                {formatDate(w.date)}
              </span>
              <span className="text-sm font-bold text-white">
                {w.weight} lbs
              </span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
