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

    // Normalize raw messages to guarantee every message has a valid parts array
    const normalizedMessages = rawMessages.map((msg: any) => {
      if (Array.isArray(msg.parts) && msg.parts.length > 0) {
        return msg;
      }
      const textContent = typeof msg.content === "string" ? msg.content : (typeof msg.text === "string" ? msg.text : "");
      return {
        role: msg.role || "user",
        parts: [{ type: "text", text: textContent }],
      };
    });

    // Convert UIMessages to ModelMessages correctly handling parts, tool calls, and text
    const modelMessages = await convertToModelMessages(normalizedMessages);

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
    const isProd = process.env.NODE_ENV === "production";
    const msg = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    return Response.json(
      {
        error: "Terjadi kesalahan saat memproses permintaan AI.",
        detail: isProd ? undefined : msg,
        stack: isProd ? undefined : stack,
      },
      { status: 500 }
    );
  }
}

