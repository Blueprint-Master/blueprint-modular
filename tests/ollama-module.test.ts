import { afterEach, describe, expect, it, vi } from "vitest";
import { VLLMClient, vllmClient } from "@/lib/ai/vllm-client";
import { analyzeContract } from "@/lib/ai/contract-analyzer";

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe("configured AI modules", () => {
  it("reports a missing model and uses the requested model again after an outage", async () => {
    const http = vi.fn()
      .mockResolvedValueOnce(Response.json({ models: [{ name: "other:latest" }] }))
      .mockRejectedValueOnce(new Error("network unavailable"))
      .mockResolvedValueOnce(Response.json({ models: [{ name: "factory:latest" }] }))
      .mockResolvedValueOnce(Response.json({ message: { content: "Back online" } }));
    vi.stubGlobal("fetch", http);
    const client = new VLLMClient({ mock: false, maxRetries: 0 });
    expect((await client.healthCheck("factory")).available).toBe(false);
    await expect(client.chat([])).rejects.toThrow("network unavailable");
    expect((await client.healthCheck("factory")).available).toBe(true);
    expect(await client.chat([], { model: "factory", max_tokens: 48 })).toEqual({ content: "Back online" });
    expect(JSON.parse(http.mock.calls[3][1].body)).toMatchObject({ model: "factory", options: { num_predict: 48 } });
  });

  it("handles an unterminated final line and detects interrupted streams", async () => {
    const stream = '{"message":{"content":"Résultat"},"done":false}';
    const http = vi.fn()
      .mockResolvedValueOnce(new Response(stream + '\n{"done":true}'))
      .mockResolvedValueOnce(new Response(stream));
    vi.stubGlobal("fetch", http);
    const client = new VLLMClient({ mock: false, maxRetries: 0 });
    const chunk = vi.fn();
    expect(await client.chatStream([], chunk)).toBe("Résultat");
    expect(chunk).toHaveBeenCalledWith("Résultat");
    await expect(client.chatStream([], chunk)).rejects.toThrow("before completion");
  });

  it("keeps an empty or unreadable contract analysis out of the completed state", async () => {
    const chat = vi.spyOn(vllmClient, "chat").mockResolvedValueOnce({ content: "{}" })
      .mockResolvedValueOnce({ content: '{"executive_summary":"Livraison en juin."}' });
    await expect(analyzeContract("  ", "supplier")).rejects.toThrow();
    expect(chat).not.toHaveBeenCalled();
    await expect(analyzeContract("Fabrication", "supplier")).rejects.toThrow();
    expect(await analyzeContract("Fabrication", "supplier")).toEqual({ executive_summary: "Livraison en juin." });
  });
});
