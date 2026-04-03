import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.HF_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      status: "error",
      message: "HF_API_KEY not set",
      keyPrefix: null,
    });
  }

  try {
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
          messages: [{ role: "user", content: "Say hello in one word" }],
          max_tokens: 10,
        }),
      }
    );

    const data = await response.json();

    return NextResponse.json({
      status: response.ok ? "ok" : "error",
      httpStatus: response.status,
      keyPrefix: apiKey.substring(0, 8) + "...",
      response: response.ok
        ? data.choices?.[0]?.message?.content
        : data,
    });
  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: String(error),
      keyPrefix: apiKey.substring(0, 8) + "...",
    });
  }
}
