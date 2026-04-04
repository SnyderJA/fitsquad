import { NextResponse } from "next/server";
import type { FocusArea, Limitation } from "@/lib/types";
import {
  getBlockedExerciseNames,
  isExerciseBlocked,
} from "@/lib/ai/exercise-blocklist";

// Allow up to 60s for AI generation on Vercel
export const maxDuration = 60;

// AI Provider config — set AI_PROVIDER=groq or AI_PROVIDER=huggingface
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const HF_API_URL = "https://router.huggingface.co/v1/chat/completions";
const HF_MODEL = "Qwen/Qwen2.5-72B-Instruct";

function getProvider() {
  const provider = process.env.AI_PROVIDER || "groq";
  if (provider === "groq" && process.env.GROQ_API_KEY) {
    return { url: GROQ_API_URL, model: GROQ_MODEL, key: process.env.GROQ_API_KEY, timeout: 15000 };
  }
  if (process.env.HF_API_KEY) {
    return { url: HF_API_URL, model: HF_MODEL, key: process.env.HF_API_KEY, timeout: 55000 };
  }
  return null;
}

export async function POST(request: Request) {
  const provider = getProvider();
  if (!provider) {
    return NextResponse.json(
      { error: "No AI provider configured", fallback: true },
      { status: 500 }
    );
  }

  const {
    focusAreas,
    durationMinutes,
    gender,
    limitations,
    pushupCount,
    kettlebellWeights,
    blockedExercises,
    lastDifficulty,
    trainerNote,
  } = (await request.json()) as {
    focusAreas: FocusArea[];
    durationMinutes: number;
    gender?: string | null;
    limitations?: string[];
    pushupCount?: number | null;
    kettlebellWeights?: number[];
    blockedExercises?: string[];
    lastDifficulty?: string | null;
    trainerNote?: string | null;
  };

  // Build limitation blocklist
  const limitationBlockedNames = getBlockedExerciseNames(
    (limitations || []) as Limitation[]
  );

  // Build personalization context
  const personalization: string[] = [];
  if (gender) personalization.push(`The user is ${gender}.`);
  if (limitations && limitations.length > 0) {
    personalization.push(
      `CRITICAL SAFETY REQUIREMENT: The user has physical limitations in their ${limitations.join(", ")}. You MUST NOT include any of these exercises: ${limitationBlockedNames.join(", ")}. Use safe alternatives that do not stress the ${limitations.join(" or ")}. This is non-negotiable.`
    );
  }
  if (pushupCount != null) {
    let level = "beginner";
    if (pushupCount >= 20) level = "intermediate";
    if (pushupCount >= 40) level = "advanced";
    personalization.push(
      `The user can do ${pushupCount} push-ups (${level} level). Adjust exercise difficulty, reps, and sets accordingly.`
    );
  }
  if (kettlebellWeights && kettlebellWeights.length > 0) {
    personalization.push(
      `The user has these kettlebells available: ${kettlebellWeights.map((w) => `${w} lbs`).join(", ")}. For each kettlebell exercise, include a "suggestedWeight" field with the recommended weight from their available kettlebells (e.g. "25 lbs"). Choose appropriate weights based on the exercise and the user's fitness level.`
    );
  }
  if (blockedExercises && blockedExercises.length > 0) {
    personalization.push(
      `NEVER include these exercises (the user hated them): ${blockedExercises.join(", ")}. Use different exercises instead.`
    );
  }
  if (lastDifficulty === "easy") {
    personalization.push(
      `The user's last workout was too easy. Make this one HARDER: increase reps, add more sets, reduce rest time, or suggest heavier weights.`
    );
  } else if (lastDifficulty === "hard") {
    personalization.push(
      `The user's last workout was too hard. Make this one EASIER: reduce reps, fewer sets, more rest time, or suggest lighter weights.`
    );
  }
  if (trainerNote) {
    personalization.push(
      `SPECIAL REQUEST FROM USER: "${trainerNote}". Tailor the workout to address this specific goal or concern. Choose exercises that directly target what the user described.`
    );
  }

  const personalizationBlock =
    personalization.length > 0
      ? `\n\nUser profile:\n${personalization.join("\n")}\n`
      : "";

  const focusDescription =
    focusAreas.length > 0
      ? `targeting: ${focusAreas.join(", ")}`
      : "based on the user's special request below";

  const prompt = `You are a kettlebell fitness coach. Create a ${durationMinutes}-minute workout ${focusDescription}.${personalizationBlock}
IMPORTANT RULES:
- Warm-up: bodyweight only (no kettlebells), 3 exercises
- Main workout: KETTLEBELL ONLY exercises, 6 exercises. Every main exercise must use a kettlebell.
- Cool-down: bodyweight only (stretching/mobility), 3 exercises
- For each kettlebell exercise, include a "suggestedWeight" field with the recommended weight in lbs

Respond with ONLY this JSON, no other text:
{"warmup":[{"name":"Exercise","type":"bodyweight","sets":1,"reps":"30s","restSeconds":0,"description":"Brief description"}],"exercises":[{"name":"Exercise","type":"kettlebell","sets":3,"reps":"12","restSeconds":60,"description":"Brief description","suggestedWeight":"25 lbs"}],"cooldown":[{"name":"Exercise","type":"bodyweight","sets":1,"reps":"30s","restSeconds":0,"description":"Brief description"}]}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), provider.timeout);

    const response = await fetch(provider.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${provider.key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: provider.model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000,
        temperature: 0.7,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("HF API error:", response.status, errorText);
      return NextResponse.json(
        { error: "AI service unavailable", fallback: true },
        { status: 502 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "Empty AI response", fallback: true },
        { status: 502 }
      );
    }

    // Extract JSON from the response (handle markdown code blocks)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Could not parse AI response:", content);
      return NextResponse.json(
        { error: "Could not parse AI response", fallback: true },
        { status: 502 }
      );
    }

    const workout = JSON.parse(jsonMatch[0]);

    // Validate structure
    if (!workout.warmup || !workout.exercises || !workout.cooldown) {
      return NextResponse.json(
        { error: "Invalid workout structure", fallback: true },
        { status: 502 }
      );
    }

    // Post-AI safety validation: filter out any exercises that are unsafe
    // for the user's limitations (in case the AI ignored the instruction)
    const filterUnsafe = (exercises: Array<Record<string, unknown>>) =>
      exercises.filter(
        (ex) =>
          !isExerciseBlocked(String(ex.name || ""), limitationBlockedNames)
      );

    const safeWarmup = filterUnsafe(workout.warmup);
    const safeExercises = filterUnsafe(workout.exercises);
    const safeCooldown = filterUnsafe(workout.cooldown);

    // Add muscleGroups and phase fields for compatibility
    const tagExercises = (
      exercises: Array<Record<string, unknown>>,
      phase: string
    ) =>
      exercises.map((ex) => ({
        ...ex,
        muscleGroups: focusAreas,
        phase,
      }));

    return NextResponse.json({
      focusAreas,
      durationMinutes,
      warmup: tagExercises(safeWarmup, "warmup"),
      exercises: tagExercises(safeExercises, "main"),
      cooldown: tagExercises(safeCooldown, "cooldown"),
    });
  } catch (error) {
    console.error("Workout generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate workout", fallback: true },
      { status: 500 }
    );
  }
}
