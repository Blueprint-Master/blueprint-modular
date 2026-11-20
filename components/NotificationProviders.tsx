"use client";

import Link from "next/link";
import { NavigationLinkProvider, type NavigationLink } from "./bpm/NavigationLink";
import { NotificationHistoryProvider } from "@/contexts/NotificationHistoryContext";
import { ToastProvider } from "@/components/bpm/Toast";

function AppLink(props: React.ComponentProps<typeof NavigationLink>) {
  return <Link {...props} />;
}

export function NotificationProviders({ children }: { children: React.ReactNode }) {
  return (
    <NotificationHistoryProvider>
      <NavigationLinkProvider value={AppLink}><ToastProvider>{children}</ToastProvider></NavigationLinkProvider>
    </NotificationHistoryProvider>
  );
}
