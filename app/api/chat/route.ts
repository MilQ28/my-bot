import { groq } from "@ai-sdk/groq";
import { streamText, convertToModelMessages, stepCountIs } from "ai";
import { SYSTEM_PROMPT } from "@/lib/systemPrompt";
import { chatTools } from "@/lib/chatTools";

export const runtime = "nodejs";
export const maxDuration = 60; // Up to 60s for GitHub API calls and multi-step reasoning

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawMessages = body.messages;

    if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
      return Response.json(
        { error: 'Field "messages" harus berupa array non-kosong.' },
        { status: 400 }
      );
    }

    console.log("[CHAT_API] Incoming request with", rawMessages.length, "messages");

    // Convert UIMessages to ModelMessages correctly handling parts, tool calls, and text
    const modelMessages = await convertToModelMessages(rawMessages);

    const result = streamText({
      model: groq("openai/gpt-oss-120b"),
      system: SYSTEM_PROMPT,
      messages: modelMessages,
      tools: chatTools,
      stopWhen: stepCountIs(5), // Enables multi-step tool calling and response generation
      temperature: 0.7,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("[CHAT_API_ERROR]", error);
    return Response.json(
      { error: "Terjadi kesalahan saat memproses permintaan AI." },
      { status: 500 }
    );
  }
}

