import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useScreenWakeLock } from "../../../components/bpm/useScreenWakeLock";

class Sentinel extends EventTarget {
  released = false;
  release = vi.fn(async () => {
    this.released = true;
    this.dispatchEvent(new Event("release"));
  });
}
const request = vi.fn<() => Promise<Sentinel>>();
beforeEach(() => {
  vi.useFakeTimers();
  request.mockReset();
  Object.defineProperty(navigator, "wakeLock", { configurable: true, value: { request } });
  vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
});
afterEach(() => {
  cleanup();
  Reflect.deleteProperty(navigator, "wakeLock");
  vi.restoreAllMocks();
  vi.useRealTimers();
});

it("releases a late grant after a duration change without releasing the active replacement", async () => {
  let finish!: (value: Sentinel) => void;
  const late = new Sentinel();
  const current = new Sentinel();
  request.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; })).mockResolvedValueOnce(current);
  const { result, unmount } = renderHook(useScreenWakeLock);
  await act(async () => result.current.chooseDuration(5));
  await act(async () => result.current.chooseDuration(-1));
  await act(async () => finish(late));
  expect(late.release).toHaveBeenCalledOnce();
  expect(result.current.active).toBe(true);
  expect(current.released).toBe(false);
  unmount();
  expect(current.release).toHaveBeenCalledOnce();
});

it("recovers from permission refusal, resumes in foreground, and expires at the original deadline", async () => {
  const first = new Sentinel(), second = new Sentinel();
  request.mockRejectedValueOnce(new Error("permission")).mockResolvedValueOnce(first).mockResolvedValueOnce(second);
  const { result } = renderHook(useScreenWakeLock);
  await act(async () => result.current.chooseDuration(5));
  expect(result.current.error?.message).toBe("permission");
  await act(async () => result.current.chooseDuration(5));
  expect(result.current.active).toBe(true);
  await act(async () => { await first.release(); });
  expect(result.current.active).toBe(false);
  await act(async () => { vi.advanceTimersByTime(60_000); document.dispatchEvent(new Event("visibilitychange")); });
  expect(result.current.active).toBe(true);
  expect(result.current.remainingSeconds).toBe(240);
  await act(async () => { vi.advanceTimersByTime(240_000); });
  expect(result.current.duration).toBe(0);
  expect(result.current.active).toBe(false);
  expect(second.release).toHaveBeenCalledOnce();
});

it("starts disabled and detects unavailable browser support", () => {
  Reflect.deleteProperty(navigator, "wakeLock");
  const { result } = renderHook(useScreenWakeLock);
  expect(result.current.supported).toBe(false);
  expect(result.current.duration).toBe(0);
  expect(request).not.toHaveBeenCalled();
});
