import { NextResponse } from "next/server";
import type { FocusArea } from "@/lib/types";

// Allow up to 60s for AI generation on Vercel
export const maxDuration = 60;

const HF_API_URL = "https://router.huggingface.co/v1/chat/completions";
const HF_MODEL = "Qwen/Qwen2.5-72B-Instruct";

export async function POST(request: Request) {
  const apiKey = process.env.HF_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "HF_API_KEY not configured", fallback: true },
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
  } = (await request.json()) as {
    focusAreas: FocusArea[];
    durationMinutes: number;
    gender?: string | null;
    limitations?: string[];
    pushupCount?: number | null;
    kettlebellWeights?: number[];
  };

  // Build personalization context
  const personalization: string[] = [];
  if (gender) personalization.push(`The user is ${gender}.`);
  if (limitations && limitations.length > 0) {
    personalization.push(
      `IMPORTANT: The user has physical limitations in their ${limitations.join(", ")}. Avoid exercises that put stress on these areas. Provide safe alternatives instead.`
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

  const personalizationBlock =
    personalization.length > 0
      ? `\n\nUser profile:\n${personalization.join("\n")}\n`
      : "";

  const prompt = `You are a kettlebell fitness coach. Create a ${durationMinutes}-minute workout targeting: ${focusAreas.join(", ")}.${personalizationBlock}
IMPORTANT RULES:
- Warm-up: bodyweight only (no kettlebells), 3 exercises
- Main workout: KETTLEBELL ONLY exercises, 6 exercises. Every main exercise must use a kettlebell.
- Cool-down: bodyweight only (stretching/mobility), 3 exercises
- For each kettlebell exercise, include a "suggestedWeight" field with the recommended weight in lbs

Respond with ONLY this JSON, no other text:
{"warmup":[{"name":"Exercise","type":"bodyweight","sets":1,"reps":"30s","restSeconds":0,"description":"Brief description"}],"exercises":[{"name":"Exercise","type":"kettlebell","sets":3,"reps":"12","restSeconds":60,"description":"Brief description","suggestedWeight":"25 lbs"}],"cooldown":[{"name":"Exercise","type":"bodyweight","sets":1,"reps":"30s","restSeconds":0,"description":"Brief description"}]}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55000);

    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: HF_MODEL,
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
      warmup: tagExercises(workout.warmup, "warmup"),
      exercises: tagExercises(workout.exercises, "main"),
      cooldown: tagExercises(workout.cooldown, "cooldown"),
    });
  } catch (error) {
    console.error("Workout generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate workout", fallback: true },
      { status: 500 }
    );
  }
}
