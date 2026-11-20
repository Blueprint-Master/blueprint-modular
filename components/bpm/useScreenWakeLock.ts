"use client";

import { useEffect, useState } from "react";

export type ScreenWakeDuration = 0 | 5 | 15 | 30 | 60 | -1;

/** Minutes, with zero for off and -1 for as long as the page stays open. */
export function useScreenWakeLock() {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [duration, setDuration] = useState<ScreenWakeDuration>(0);
  const [retry, setRetry] = useState(0);
  const [active, setActive] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => { setSupported(typeof navigator.wakeLock?.request === "function"); }, []);

  useEffect(() => {
    let disposed = false;
    let pending = false;
    let lock: WakeLockSentinel | null = null;
    const end = duration > 0 ? Date.now() + duration * 60_000 : null;
    setActive(false);
    setError(null);
    setRemainingSeconds(end === null ? null : duration * 60);
    if (!supported || duration === 0) return;

    function timeRemaining() {
      if (end === null) return true;
      const seconds = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      setRemainingSeconds(seconds);
      if (seconds === 0) setDuration(0);
      return seconds > 0;
    }

    async function acquire() {
      if (disposed || !timeRemaining() || document.visibilityState !== "visible" || pending || lock) return;
      pending = true;
      try {
        const acquired = await navigator.wakeLock.request("screen");
        if (disposed || !timeRemaining() || document.visibilityState !== "visible") {
          await acquired.release();
          return;
        }
        if (acquired.released) return;
        lock = acquired;
        setActive(true);
        acquired.addEventListener("release", () => {
          if (disposed || lock !== acquired) return;
          lock = null;
          setActive(false);
        }, { once: true });
      } catch (reason) {
        if (!disposed) {
          setError(reason instanceof Error ? reason : new Error());
          setActive(false);
        }
      } finally {
        pending = false;
      }
    }

    void acquire();
    const interval = end === null ? undefined : setInterval(timeRemaining, 1000);
    document.addEventListener("visibilitychange", acquire);
    return () => {
      disposed = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", acquire);
      if (lock) void lock.release().catch(() => {});
    };
  }, [supported, duration, retry]);

  // Allow the user to retry a denied request without first choosing Off.
  const chooseDuration = (minutes: ScreenWakeDuration) => {
    if (!active && minutes !== 0 && minutes === duration) {
      setError(null);
      setRetry(value => value + 1);
    }
    setDuration(minutes);
  };
  return { supported, duration, active, remainingSeconds, error, chooseDuration };
}
