// CAB decisions have their own endpoints so every vote is recorded.
export const changeSteps: Record<string, string[]> = {
  draft: ["submitted", "cab_review", "cancelled"],
  submitted: ["draft", "cab_review", "cancelled"],
  cab_review: ["draft", "cancelled"],
  approved: ["draft", "scheduled", "in_progress", "cancelled"],
  rejected: ["draft"], scheduled: ["draft", "in_progress", "cancelled"],
  in_progress: ["completed", "failed", "cancelled"],
  completed: [], failed: ["draft"], cancelled: ["draft"],
};

export function changeApprovals(value: string | null): string[] {
  try {
    const ids = JSON.parse(value ?? "[]");
    return Array.isArray(ids) ? [...new Set(ids.filter((id): id is string => typeof id === "string"))] : [];
  } catch { return []; }
}
