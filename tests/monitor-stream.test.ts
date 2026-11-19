import { expect, it } from "vitest";
import { readSSEStream } from "@/hooks/usePrompterAPI";

it("reads fragmented French text including real and literal newlines as well as legacy prompter output", async () => {
  const value = "é\n[ERROR]\\n";
  const bytes = new TextEncoder().encode(`event: text\r\ndata: ${JSON.stringify(value)}\r\n\r\ndata: fin\\n\n\ndata: [DONE]\n\n`);
  const stream = new ReadableStream({ start(controller) {
    for (const byte of bytes) controller.enqueue(Uint8Array.of(byte));
    controller.close();
  } });
  const chunks: string[] = [];
  await readSSEStream(new Response(stream), text => chunks.push(text));
  expect(chunks).toEqual([value, "fin\n"]);
});

it("rejects interrupted streams and provider errors before a question is logged", async () => {
  await expect(readSSEStream(new Response("data: début\n\n"), () => {})).rejects.toThrow("interrompu");
  await expect(readSSEStream(new Response("data: [ERROR] Claude HTTP 429\n\n"), () => {})).rejects.toThrow("429");
});
