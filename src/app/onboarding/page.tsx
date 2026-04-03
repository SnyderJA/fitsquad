"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { LIMITATION_OPTIONS } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Dumbbell, ArrowRight, ArrowLeft, Check } from "lucide-react";
import type { Gender, Limitation } from "@/lib/types";

const TOTAL_STEPS = 3;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [gender, setGender] = useState<Gender | null>(null);
  const [limitations, setLimitations] = useState<Limitation[]>([]);
  const [pushupCount, setPushupCount] = useState("");
  const [saving, setSaving] = useState(false);

  function toggleLimitation(lim: Limitation) {
    setLimitations((prev) =>
      prev.includes(lim) ? prev.filter((l) => l !== lim) : [...prev, lim]
    );
  }

  function canAdvance() {
    if (step === 1) return gender !== null;
    if (step === 2) return true; // limitations are optional
    if (step === 3) return pushupCount !== "";
    return false;
  }

  async function handleFinish() {
    setSaving(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("profiles")
      .update({
        gender,
        limitations,
        pushup_count: pushupCount ? parseInt(pushupCount, 10) : null,
      })
      .eq("id", user.id);

    setSaving(false);
    router.push("/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="mx-auto w-full max-w-sm space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-orange-500">
            <Dumbbell className="h-6 w-6" />
            <span className="text-lg font-bold text-white">FitSquad</span>
          </div>
          <h1 className="text-2xl font-bold text-white">
            {step === 1 && "About You"}
            {step === 2 && "Any Limitations?"}
            {step === 3 && "Fitness Level"}
          </h1>
          <p className="text-sm text-slate-400">
            {step === 1 && "This helps us personalize your workouts"}
            {step === 2 &&
              "We'll avoid exercises that stress these areas"}
            {step === 3 &&
              "This helps us calibrate workout difficulty"}
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1.5">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all",
                i < step ? "bg-orange-500" : "bg-slate-700"
              )}
            />
          ))}
        </div>

        {/* Step 1: Gender */}
        {step === 1 && (
          <div className="space-y-3">
            {(["male", "female", "other"] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={cn(
                  "w-full rounded-xl border px-4 py-4 text-left text-sm font-medium capitalize transition-all",
                  gender === g
                    ? "border-orange-500 bg-orange-500/10 text-orange-400"
                    : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600"
                )}
              >
                {g}
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Physical Limitations */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {LIMITATION_OPTIONS.map((lim) => {
                const isSelected = limitations.includes(lim.value);
                return (
                  <button
                    key={lim.value}
                    onClick={() => toggleLimitation(lim.value)}
                    className={cn(
                      "rounded-xl border px-4 py-3 text-sm font-medium transition-all",
                      isSelected
                        ? "border-red-500 bg-red-500/10 text-red-400"
                        : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600"
                    )}
                  >
                    {lim.label}
                  </button>
                );
              })}
            </div>
            <Card className="bg-slate-800/30 border-slate-700/30">
              <p className="text-xs text-slate-500">
                Select any areas where you have injuries or chronic pain. The AI
                will avoid exercises that put stress on these areas. You can skip
                this if you have none.
              </p>
            </Card>
          </div>
        )}

        {/* Step 3: Pushup Count */}
        {step === 3 && (
          <div className="space-y-4">
            <Input
              id="pushupCount"
              label="How many push-ups can you do in one set?"
              type="number"
              min="0"
              max="200"
              placeholder="e.g. 15"
              value={pushupCount}
              onChange={(e) => setPushupCount(e.target.value)}
            />
            {pushupCount && (
              <Card className="bg-slate-800/30 border-slate-700/30">
                <p className="text-xs text-slate-500">
                  {parseInt(pushupCount) < 10 && (
                    <>
                      <span className="text-orange-400 font-medium">
                        Beginner
                      </span>{" "}
                      — We&apos;ll start with lower reps and more rest time
                    </>
                  )}
                  {parseInt(pushupCount) >= 10 &&
                    parseInt(pushupCount) < 20 && (
                      <>
                        <span className="text-orange-400 font-medium">
                          Getting there
                        </span>{" "}
                        — We&apos;ll give you a balanced challenge
                      </>
                    )}
                  {parseInt(pushupCount) >= 20 &&
                    parseInt(pushupCount) < 40 && (
                      <>
                        <span className="text-orange-400 font-medium">
                          Intermediate
                        </span>{" "}
                        — We&apos;ll push you with higher intensity
                      </>
                    )}
                  {parseInt(pushupCount) >= 40 && (
                    <>
                      <span className="text-orange-400 font-medium">
                        Advanced
                      </span>{" "}
                      — We&apos;ll bring the heat
                    </>
                  )}
                </p>
              </Card>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3">
          {step > 1 && (
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setStep(step - 1)}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          )}

          {step < TOTAL_STEPS ? (
            <Button
              className="flex-1"
              onClick={() => setStep(step + 1)}
              disabled={!canAdvance()}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              className="flex-1"
              onClick={handleFinish}
              loading={saving}
              disabled={!canAdvance()}
            >
              <Check className="h-4 w-4 mr-1" />
              Let&apos;s Go!
            </Button>
          )}
        </div>

        {/* Skip */}
        {step === 2 && (
          <button
            onClick={() => setStep(3)}
            className="w-full text-center text-xs text-slate-600 hover:text-slate-400"
          >
            No limitations — skip
          </button>
        )}
      </div>
    </main>
  );
}
