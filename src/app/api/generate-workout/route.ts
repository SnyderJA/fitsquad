import { NextResponse } from "next/server";
import type { FocusArea } from "@/lib/types";

const HF_API_URL =
  "https://router.huggingface.co/novita/v3/openai/chat/completions";
const HF_MODEL = "deepseek/deepseek-v3-0324";

export async function POST(request: Request) {
  const apiKey = process.env.HF_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "HF_API_KEY not configured" },
      { status: 500 }
    );
  }

  const { focusAreas, durationMinutes } = (await request.json()) as {
    focusAreas: FocusArea[];
    durationMinutes: number;
  };

  const prompt = `You are a fitness coach specializing in bodyweight and kettlebell workouts.

Create a ${durationMinutes}-minute workout targeting: ${focusAreas.join(", ")}.

Rules:
- Only use bodyweight exercises and kettlebell exercises
- Include a warm-up (3-4 exercises), main workout (5-7 exercises), and cool-down (3-4 exercises)
- For each exercise provide: name, type (bodyweight or kettlebell), sets, reps (a number or time like "30s"), rest in seconds, and a one-line description
- Balance between bodyweight and kettlebell exercises
- Make it challenging but achievable for intermediate fitness level

Respond ONLY with valid JSON in this exact format, no other text:
{
  "warmup": [{"name": "...", "type": "bodyweight", "sets": 1, "reps": "30s", "restSeconds": 0, "description": "..."}],
  "exercises": [{"name": "...", "type": "kettlebell", "sets": 3, "reps": "12", "restSeconds": 60, "description": "..."}],
  "cooldown": [{"name": "...", "type": "bodyweight", "sets": 1, "reps": "30s", "restSeconds": 0, "description": "..."}]
}`;

  try {
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
    });

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

    // Add muscleGroups field to each exercise for compatibility
    const addMuscleGroups = (
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
      warmup: addMuscleGroups(workout.warmup, "warmup"),
      exercises: addMuscleGroups(workout.exercises, "main"),
      cooldown: addMuscleGroups(workout.cooldown, "cooldown"),
    });
  } catch (error) {
    console.error("Workout generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate workout", fallback: true },
      { status: 500 }
    );
  }
}
