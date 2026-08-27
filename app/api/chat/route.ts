import { groq } from "@ai-sdk/groq";
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { SYSTEM_PROMPT } from "@/lib/systemPrompt";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages: UIMessage[] = body.messages;

    if (!Array.isArray(messages)) {
      return Response.json({ error: 'Field "messages" harus berupa array.' }, { status: 400 });
    }

const result = streamText({
  model: groq('openai/gpt-oss-120b'), // ganti dari llama-3.3-70b-versatile
  system: SYSTEM_PROMPT,
  messages: await convertToModelMessages(messages),
  temperature: 0.7,
});

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("[CHAT_API_ERROR]", error);
    return Response.json({ error: "Terjadi kesalahan saat memproses permintaan AI." }, { status: 500 });
  }
}
