"use client";

import React, { useEffect } from "react";

export type ConfirmModalVariant = "danger" | "warning" | "info";

export interface ConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmModalVariant;
  isLoading?: boolean;
}

const VARIANT_STYLES: Record<
  ConfirmModalVariant,
  { buttonBg: string; buttonColor: string; icon: string }
> = {
  danger: { buttonBg: "var(--bpm-error)", buttonColor: "#fff", icon: "delete" },
  warning: { buttonBg: "var(--bpm-warning)", buttonColor: "#fff", icon: "warning" },
  info: { buttonBg: "var(--bpm-accent)", buttonColor: "#fff", icon: "info" },
};

export function ConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  variant = "danger",
  isLoading = false,
}: ConfirmModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onCancel();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const styles = VARIANT_STYLES[variant];

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onCancel();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "rgba(0,0,0,0.5)",
      }}
      onClick={handleBackdropClick}
    >
      <div
        style={{
          background: "var(--bpm-bg-primary)",
          borderRadius: "var(--bpm-radius-lg)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          maxWidth: 420,
          width: "100%",
          padding: 24,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="confirm-modal-title"
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 600,
            color: "var(--bpm-text-primary)",
            marginBottom: 12,
          }}
        >
          {title}
        </h2>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            color: "var(--bpm-text-secondary)",
            lineHeight: 1.5,
            marginBottom: 24,
          }}
        >
          {message}
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            style={{
              padding: "10px 20px",
              border: "1px solid var(--bpm-border)",
              borderRadius: "var(--bpm-radius-sm)",
              background: "var(--bpm-bg-primary)",
              color: "var(--bpm-text-secondary)",
              fontSize: 14,
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              padding: "10px 20px",
              border: "none",
              borderRadius: "var(--bpm-radius-sm)",
              background: styles.buttonBg,
              color: styles.buttonColor,
              fontSize: 14,
              fontWeight: 600,
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.8 : 1,
            }}
          >
            {isLoading ? "..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
