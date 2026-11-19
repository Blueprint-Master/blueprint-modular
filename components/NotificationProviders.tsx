"use client";

import Link from "next/link";
import { NavigationLinkProvider } from "./bpm/NavigationLink";
import { NotificationHistoryProvider } from "@/contexts/NotificationHistoryContext";
import { ToastProvider } from "@/components/bpm/Toast";

export function NotificationProviders({ children }: { children: React.ReactNode }) {
  return (
    <NotificationHistoryProvider>
      <NavigationLinkProvider value={Link}><ToastProvider>{children}</ToastProvider></NavigationLinkProvider>
    </NotificationHistoryProvider>
  );
}
