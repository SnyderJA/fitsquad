import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function GET() {
  const apiKey = process.env.HF_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      step: "key_check",
      status: "error",
      message: "HF_API_KEY not set",
    });
  }

  const prompt = `You are a fitness coach. Create a 35-minute workout targeting: chest, arms.

Only bodyweight and kettlebell exercises. Include warmup (3 exercises), main (6 exercises), cooldown (3 exercises).

Respond with ONLY this JSON, no other text:
{"warmup":[{"name":"Exercise","type":"bodyweight","sets":1,"reps":"30s","restSeconds":0,"description":"Brief description"}],"exercises":[{"name":"Exercise","type":"kettlebell","sets":3,"reps":"12","restSeconds":60,"description":"Brief description"}],"cooldown":[{"name":"Exercise","type":"bodyweight","sets":1,"reps":"30s","restSeconds":0,"description":"Brief description"}]}`;

  try {
    const start = Date.now();
    const response = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "Qwen/Qwen2.5-72B-Instruct",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 2000,
          temperature: 0.7,
        }),
      }
    );
    const elapsed = Date.now() - start;

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({
        step: "hf_call",
        status: "error",
        httpStatus: response.status,
        elapsed: `${elapsed}ms`,
        error: errorText,
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({
        step: "parse_content",
        status: "error",
        elapsed: `${elapsed}ms`,
        message: "No content in response",
        raw: data,
      });
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({
        step: "extract_json",
        status: "error",
        elapsed: `${elapsed}ms`,
        message: "No JSON found in response",
        content: content.substring(0, 500),
      });
    }

    const workout = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      step: "complete",
      status: "ok",
      elapsed: `${elapsed}ms`,
      hasWarmup: !!workout.warmup,
      hasExercises: !!workout.exercises,
      hasCooldown: !!workout.cooldown,
      warmupCount: workout.warmup?.length,
      exerciseCount: workout.exercises?.length,
      cooldownCount: workout.cooldown?.length,
      firstExercise: workout.exercises?.[0]?.name,
    });
  } catch (error) {
    return NextResponse.json({
      step: "exception",
      status: "error",
      message: String(error),
    });
  }
}
