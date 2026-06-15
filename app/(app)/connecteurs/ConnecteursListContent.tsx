"use client";

import Link from "next/link";
import { Badge, Card, Caption, Text } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { CONNECTORS, presentCategories } from "@/lib/connectors/catalog";
import type { AuthMethod } from "@/lib/connectors/types";
import { CatalogueHero, CatalogueSection } from "@/components/site/CatalogueLayout";
import { STR } from "./strings";

/** Variante de badge par méthode d'auth (lisibilité immédiate de l'archétype). */
const AUTH_VARIANT: Record<AuthMethod, "default" | "primary" | "success" | "warning"> = {
  apiKey: "primary",
  oauth2: "success",
  webhookSecret: "warning",
  bearer: "default",
};

export function ConnecteursListContent() {
  const { locale } = useI18n();
  const S = STR[locale];
  const categories = presentCategories();

  return (
    <>
      <CatalogueHero
        eyebrow={S.eyebrow}
        title={S.listTitle}
        lead={S.listLead}
        meta={S.countLabel(CONNECTORS.length)}
      />

      {categories.map((cat) => {
        const connectors = CONNECTORS.filter((c) => c.category === cat);
        return (
          <CatalogueSection key={cat} title={S.category[cat]}>
            {connectors.map((c) => (
              <Link
                key={c.id}
                href={`/connecteurs/${c.id}`}
                style={{ textDecoration: "none", display: "block" }}
                aria-label={`${c.name[locale]} — ${S.viewConnector}`}
              >
                <Card title={c.name[locale]} variant="outlined">
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <Badge variant={AUTH_VARIANT[c.auth.method]}>
                        {S.authMethod[c.auth.method]}
                      </Badge>
                      <Badge variant="default">{S.category[c.category]}</Badge>
                    </div>
                    <Caption style={{ lineHeight: 1.6 }}>{c.description[locale]}</Caption>
                    <Text style={{ fontSize: 13, fontWeight: 600, color: "var(--bpm-accent-cyan)" }}>
                      {S.viewConnector} →
                    </Text>
                  </div>
                </Card>
              </Link>
            ))}
          </CatalogueSection>
        );
      })}
    </>
  );
}
