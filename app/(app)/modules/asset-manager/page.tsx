"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Panel, Spinner } from "@/components/bpm";
import { ModulePageHeader } from "@/components/site/ModulePageHeader";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "./strings";

const DEFAULT_DOMAIN_ID = "it";

export default function AssetManagerPage() {
  const router = useRouter();
  const { locale } = useI18n();
  const t = STR[locale];
  const [hubState, setHubState] = useState<"loading" | "noDomain" | "authRequired">("loading");

  useEffect(() => {
    fetch("/api/asset-manager/config", { credentials: "include" })
      .then((r) => {
        // 401 = pas de session (et SKIP_AUTH_FOR_TEST désactivé) : distinct d'une
        // absence de domaine, pour un message d'erreur clair.
        if (r.status === 401) {
          setHubState("authRequired");
          return null;
        }
        if (!r.ok) {
          setHubState("noDomain");
          return null;
        }
        return r.json();
      })
      .then((data: { domainIds?: string[] } | null) => {
        if (!data) return;
        const ids = Array.isArray(data.domainIds) ? data.domainIds : [];
        const target = ids.includes(DEFAULT_DOMAIN_ID) ? DEFAULT_DOMAIN_ID : ids[0];
        if (target) {
          router.replace(`/modules/asset-manager/${target}`);
        } else {
          setHubState("noDomain");
        }
      })
      .catch(() => setHubState("noDomain"));
  }, [router]);

  if (hubState === "loading") {
    return (
      <div className="doc-page">
        <ModulePageHeader
          className="mb-6"
          modulesLabel={t.common.breadcrumbModules}
          breadcrumbCurrent={t.common.moduleTitle}
          title={t.common.moduleTitle}
          description={t.common.loading}
        />
        <div className="flex justify-center py-12">
          <Spinner size="medium" />
        </div>
      </div>
    );
  }

  if (hubState === "authRequired") {
    return (
      <div className="doc-page">
        <ModulePageHeader
          className="mb-6"
          modulesLabel={t.common.breadcrumbModules}
          breadcrumbCurrent={t.common.moduleTitle}
          title={t.common.moduleTitle}
        />
        <Panel variant="info" title={t.hub.authRequiredTitle}>
          <p className="mb-3">{t.hub.authRequiredDescription}</p>
          <Link href="/login">
            <Button variant="primary">{t.hub.loginCta}</Button>
          </Link>
        </Panel>
        <nav className="doc-pagination mt-6">
          <Link href="/modules" style={{ color: "var(--bpm-accent-cyan)" }}>{t.common.backToModules}</Link>
        </nav>
      </div>
    );
  }

  return (
    <div className="doc-page">
      <ModulePageHeader
        className="mb-6"
        modulesLabel={t.common.breadcrumbModules}
        breadcrumbCurrent={t.common.moduleTitle}
        title={t.common.moduleTitle}
        description={t.hub.noConfigDescription}
      />
      <Panel variant="warning" title={t.hub.configRequiredTitle}>
        {t.hub.noDomainConfiguredPrefix}<code>lib/asset-manager/config/domain.*.json</code>.
      </Panel>
      <nav className="doc-pagination mt-6">
        <Link href="/modules" style={{ color: "var(--bpm-accent-cyan)" }}>{t.common.backToModules}</Link>
      </nav>
    </div>
  );
}
