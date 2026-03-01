"use client";

import { useState, useCallback } from "react";
import { enqueue, getQueueSize } from "./queue";

interface UseOfflineFormOptions {
  formType: string;
  endpoint: string;
  organizationId?: string;
}

export function useOfflineForm({
  formType,
  endpoint,
  organizationId = "",
}: UseOfflineFormOptions) {
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "queued" | "error"
  >("idle");
  const [queueSize, setQueueSize] = useState(0);

  const submit = useCallback(
    async (data: unknown) => {
      setStatus("submitting");

      if (typeof navigator !== "undefined" && navigator.onLine) {
        try {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          if (res.ok) {
            setStatus("success");
            return;
          }
        } catch {
          // fall through to enqueue
        }
      }

      await enqueue({
        type: formType,
        data,
        timestamp: new Date().toISOString(),
        organizationId,
        endpoint,
      });
      setStatus("queued");
      setQueueSize(await getQueueSize());
    },
    [endpoint, formType, organizationId]
  );

  return { submit, status, queueSize };
}
