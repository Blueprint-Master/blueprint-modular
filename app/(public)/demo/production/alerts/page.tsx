import { getCachedDemoAlerts } from "@/lib/demo-production-data";
import type { DemoAlert, DemoPeriod } from "@/lib/demo-production-data";
import { DemoAlertsClient } from "./DemoAlertsClient";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

function parsePeriod(s: string | null): DemoPeriod {
  if (s === "7d" || s === "30d" || s === "90d") return s;
  return "30d";
}

export default async function DemoAlertsPage({
  searchParams,
}: {
  searchParams?: Promise<{ period?: string }> | { period?: string };
}) {
  const raw = searchParams != null
    ? typeof (searchParams as Promise<unknown>).then === "function"
      ? await (searchParams as Promise<{ period?: string }>)
      : (searchParams as { period?: string })
    : {};
  const period = parsePeriod(raw?.period ?? null);

  let alerts: DemoAlert[] = [];
  try {
    alerts = await getCachedDemoAlerts(period, "all");
  } catch {
    // keep []
  }
  return <DemoAlertsClient initialAlerts={alerts} />;
}
