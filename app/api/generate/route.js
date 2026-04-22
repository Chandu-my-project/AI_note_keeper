import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


async function generateWithRetry(prompt) {
  const models = [
    "gemini-2.5-flash", 
    "gemini-2.0-flash",
  ];

  let delay = 500;

  for (let m = 0; m < models.length; m++) {
    const model = genAI.getGenerativeModel({ model: models[m] });

    for (let i = 0; i < 2; i++) {
      try {
        const result = await model.generateContent(prompt);
        return result.response.text();
      } catch (error) {
        const isRetryable =
          error?.status === 429 ||
          error?.status === 503 ||
          error?.message?.includes("503") ||
          error?.message?.toLowerCase().includes("overloaded");

        if (!isRetryable) throw error;

        console.warn(`Retry ${i + 1} on ${models[m]} after ${delay}ms`);
        await new Promise((res) => setTimeout(res, delay));
        delay *= 2;
      }
    }

    if (m < models.length - 1) {
      console.warn(`Switching model → ${models[m + 1]}`);
    }
  }

  throw new Error("All models failed due to high demand.");
}

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is empty" },
        { status: 400 }
      );
    }


    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), 15000)
    );

    const text = await Promise.race([
      generateWithRetry(prompt), 
      timeoutPromise,
    ]);

    return NextResponse.json({ response: text });

  } catch (error) {
    console.error("AI Error:", error);

    if (error?.message?.includes("timeout")) {
      return NextResponse.json(
        { error: "AI is taking too long. Please try again." },
        { status: 504 }
      );
    }

    if (
      error?.status === 429 ||
      error?.message?.includes("quota")
    ) {
      return NextResponse.json(
        { error: "AI Request limit per sec exceeded. Please wait and try again." },
        { status: 429 }
      );
    }

    if (
      error?.status === 503 ||
      error?.message?.includes("503")
    ) {
      return NextResponse.json(
        { error: "AI is busy right now. Please try again in a few seconds." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "AI failed to process due to high demands. Please wait and try again." },
      { status: 500 }
    );
  }
}