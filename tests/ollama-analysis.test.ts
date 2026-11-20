import { afterEach, expect, it, vi } from "vitest";
import { VLLMClient, vllmClient } from "../lib/ai/vllm-client";
import { analyzeContract } from "../lib/ai/contract-analyzer";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const messages = [{ role: "user" as const, content: "Question" }];
const client = () => new VLLMClient({ baseUrl: "http://model.test", mock: false, maxRetries: 0 });

it("reports an unavailable provider and uses the live service when it recovers", async () => {
  const fetch = vi.fn()
    .mockResolvedValueOnce(new Response(null, { status: 503 }))
    .mockRejectedValueOnce(new Error("fetch failed"))
    .mockResolvedValueOnce(Response.json({ message: { content: "En ligne" }, done: true }));
  vi.stubGlobal("fetch", fetch);
  const service = client();
  expect((await service.healthCheck()).available).toBe(false);
  await expect(service.chat(messages)).rejects.toThrow("fetch failed");
  expect(await service.chat(messages, { model: "autre" })).toEqual({ content: "En ligne" });
  expect(JSON.parse(fetch.mock.calls[2][1].body).model).toBe("autre");
});

it("preserves a final NDJSON line without a newline, including split UTF-8 characters", async () => {
  const bytes = new TextEncoder().encode('{"message":{"content":"été"}}\n{"done":true}');
  const split = bytes.indexOf(0xc3) + 1;
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(bytes.slice(0, split));
      controller.enqueue(bytes.slice(split));
      controller.close();
    },
  });
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(stream)));
  const chunks: string[] = [];
  expect(await client().chatStream(messages, (s) => chunks.push(s))).toBe("été");
  expect(chunks.join("")).toBe("été");
});

it.each([
  '{"message":{"content":"début"}}\n',
  '{"message":{"content":"début"}}\n{"error":"backend stopped"}\n',
  'invalid json\n{"done":true}\n',
])("rejects an incomplete or invalid stream before recording a conversation", async (frames) => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(frames)));
  await expect(client().chatStream(messages, () => {})).rejects.toThrow();
});

it("refuses an unreadable contract or invalid provider result, preserving unspecified risk", async () => {
  const chat = vi.spyOn(vllmClient, "chat");
  await expect(analyzeContract("  ", "cgv")).rejects.toThrow();
  expect(chat).not.toHaveBeenCalled();
  for (const content of ["texte", "{}", '{"executive_summary":"texte","signatories":[null]}']) {
    chat.mockResolvedValueOnce({ content });
    await expect(analyzeContract("contrat", "supplier")).rejects.toThrow();
  }
  chat.mockResolvedValueOnce({ content: '{"executive_summary":"Livraison en mars."}' });
  expect(await analyzeContract("contrat", "supplier")).toEqual({ executive_summary: "Livraison en mars." });
});
