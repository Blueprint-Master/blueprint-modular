"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../strings";

const ITEMS = [
  { key: "dashboard", labelKey: "dashboard", path: "" },
  { key: "assets", labelKey: "assets", path: "/assets" },
  { key: "tickets", labelKey: "tickets", path: "/tickets" },
  { key: "assignments", labelKey: "assignments", path: "/assignments" },
  { key: "contracts", labelKey: "contracts", path: "/contracts" },
  { key: "knowledge", labelKey: "knowledge", path: "/knowledge" },
  { key: "changes", labelKey: "changes", path: "/changes" },
  { key: "cmdb", labelKey: "cmdb", path: "/cmdb-graph" },
  { key: "audit", labelKey: "audit", path: "/audit" },
] as const;

function getSectionFromPath(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  const idx = parts.indexOf("asset-manager");
  const segment = idx >= 0 && parts[idx + 2] ? parts[idx + 2] : "";
  if (!segment) return "dashboard";
  if (segment === "cmdb-graph") return "cmdb";
  if (segment === "audit") return "audit";
  const found = ITEMS.find((s) => s.path === `/${segment}`);
  return found ? found.key : "dashboard";
}

export function AssetManagerMobileTabs({ domainId }: { domainId: string }) {
  const pathname = usePathname();
  const { locale } = useI18n();
  const t = STR[locale].nav;
  const current = getSectionFromPath(pathname ?? "");
  const basePath = `/modules/asset-manager/${domainId}`;

  return (
    <div
      className="asset-manager-mobile-tabs md:hidden w-full flex-shrink-0"
      role="tablist"
      aria-label={t.ariaLabel}
    >
      <div
        className="bpm-tabs-header flex items-stretch gap-0 overflow-x-auto overflow-y-hidden border-b"
        style={{ borderColor: "var(--bpm-border)" }}
      >
        {ITEMS.map((item) => {
          const href = item.path ? `${basePath}${item.path}` : basePath;
          const isActive = current === item.key;
          return (
            <Link
              key={item.key}
              href={href}
              role="tab"
              aria-selected={isActive}
              className={`bpm-tab-button inline-flex items-center py-3 px-2 text-sm whitespace-nowrap flex-shrink-0 border-b transition-colors ${
                isActive ? "bpm-tab-active font-medium" : ""
              }`}
              style={{
                borderBottomWidth: isActive ? 4 : 1,
                marginBottom: isActive ? -3 : 0,
                borderBottomColor: isActive ? "var(--bpm-accent-cyan)" : "transparent",
                color: isActive ? "var(--bpm-accent-cyan)" : "var(--bpm-text-primary)",
                textDecoration: "none",
              }}
            >
              <span className="bpm-tab-button-text">{t[item.labelKey]}</span>
            </Link>
          );
        })}
        <div
          className="flex-1 min-w-px border-b"
          style={{ borderBottomColor: "var(--bpm-border)" }}
          aria-hidden
        />
      </div>
    </div>
  );
}
