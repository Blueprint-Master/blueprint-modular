export const nextStatus = {
  brouillon: "validé",
  validé: "archivé",
  archivé: null,
} as const;

export type WorkflowStatus = keyof typeof nextStatus;

export function isWorkflowStatus(value: string): value is WorkflowStatus {
  return Object.prototype.hasOwnProperty.call(nextStatus, value);
}
