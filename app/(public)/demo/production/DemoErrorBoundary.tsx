"use client";

import React from "react";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "./strings";

type Props = {
  children: React.ReactNode;
  errorTitle: string;
  errorBody: string;
};

class DemoErrorBoundaryInner extends React.Component<
  Props,
  { hasError: boolean; error?: Error }
> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[Demo Production]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="rounded-lg border p-6 max-w-xl mx-auto my-8"
          style={{
            borderColor: "var(--bpm-border)",
            background: "var(--bpm-bg-primary)",
            color: "var(--bpm-text-primary)",
          }}
        >
          <h2 className="text-lg font-semibold mb-2">{this.props.errorTitle}</h2>
          <p className="text-sm mb-4">{this.props.errorBody}</p>
          {typeof window !== "undefined" && this.state.error && (
            <pre className="text-xs overflow-auto p-3 rounded bg-black/5" style={{ color: "var(--bpm-text-secondary)" }}>
              {this.state.error.message}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

export function DemoErrorBoundary({ children }: { children: React.ReactNode }) {
  const { locale } = useI18n();
  const t = STR[locale];
  return (
    <DemoErrorBoundaryInner errorTitle={t.errorTitle} errorBody={t.errorBody}>
      {children}
    </DemoErrorBoundaryInner>
  );
}
