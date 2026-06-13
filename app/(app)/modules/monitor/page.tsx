"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { monitorStrings } from "./strings";

const Monitor = dynamic(() => import("@/components/Monitor/Monitor"), { ssr: false });

export default function MonitorPage() {
  const { locale } = useI18n();
  const s = monitorStrings[locale].page;
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div>
          <div className="doc-breadcrumb">
            <Link href="/modules">Modules</Link> → {s.breadcrumbCurrent}
          </div>
          <h1 style={{ margin: 0 }}>{s.title}</h1>
          <p className="doc-description" style={{ margin: "0.25rem 0 0" }}>
            {s.description}
          </p>
          <div className="doc-meta" style={{ marginTop: 4 }}>
            <span className="doc-badge doc-badge-category">{s.badgeCategory}</span>
            <span className="doc-reading-time">{s.readingTime}</span>
            <Link href="/modules/monitor/documentation" className="text-sm font-medium ml-2" style={{ color: "var(--bpm-accent-cyan)" }}>
              {s.documentationLink}
            </Link>
          </div>
        </div>
      </div>
      <Monitor />
    </div>
  );
}
