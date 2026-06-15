"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ModulePageHeader } from "@/components/site/ModulePageHeader";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { monitorStrings } from "./strings";

const Monitor = dynamic(() => import("@/components/Monitor/Monitor"), { ssr: false });

export default function MonitorPage() {
  const { locale } = useI18n();
  const s = monitorStrings[locale].page;
  return (
    <div className="doc-page">
      <ModulePageHeader
        breadcrumbCurrent={s.breadcrumbCurrent}
        title={s.title}
        titleStyle={{ margin: 0 }}
        description={s.description}
        category={s.badgeCategory}
        metaExtra={
          <>
            <span className="doc-reading-time">{s.readingTime}</span>
            <Link href="/modules/monitor/documentation" className="text-sm font-medium ml-2" style={{ color: "var(--bpm-accent-cyan)" }}>
              {s.documentationLink}
            </Link>
          </>
        }
      />
      <Monitor />
    </div>
  );
}
