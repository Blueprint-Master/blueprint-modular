"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { ModulePageHeader } from "@/components/site/ModulePageHeader";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR, inlineCode } from "./strings";

export default function AuthModulePage() {
  const { data: session, status } = useSession();
  const { locale } = useI18n();
  const s = STR[locale].module;

  if (status === "loading") {
    return (
      <div className="doc-page">
        <ModulePageHeader breadcrumbCurrent="bpm.auth" title="bpm.auth" description={s.loading} />
      </div>
    );
  }

  return (
    <div className="doc-page">
      <ModulePageHeader
        breadcrumbCurrent="bpm.auth"
        title="bpm.auth"
        description={s.description}
        category="Module"
        metaExtra={<span className="doc-reading-time">⏱ 1 min</span>}
      />

      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link href="/modules/auth/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>
          {s.simulatorLink}
        </Link>
      </p>
      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>{s.aboutTitle}</h2>
      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)" }}>
        {s.aboutText}
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-3" style={{ color: "var(--bpm-text-primary)" }}>{s.templatesTitle}</h2>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        {s.templatesIntroBefore}<strong>{s.templatesIntroStrong}</strong>{s.templatesIntroAfter}
      </p>
      <div className="grid gap-4 mb-8" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
        <div
          className="p-4 rounded-xl border overflow-hidden"
          style={{
            background: "var(--bpm-bg-primary)",
            borderColor: "var(--bpm-border)",
          }}
        >
          <h3 className="font-semibold mb-1" style={{ color: "var(--bpm-text-primary)", fontSize: "1rem" }}>
            {s.card1Title}
          </h3>
          <p className="text-sm mb-3" style={{ color: "var(--bpm-text-secondary)" }}>
            {s.card1Desc}
          </p>
          <ul className="text-xs mb-3 pl-4 list-disc" style={{ color: "var(--bpm-text-secondary)" }}>
            <li>{inlineCode(s.card1Li1, "text-xs")}</li>
            <li>{inlineCode(s.card1Li2, "text-xs")}</li>
          </ul>
          <div className="flex gap-2 flex-wrap">
            <Link href="/login" className="text-sm font-medium" style={{ color: "var(--bpm-accent-cyan)" }}>{s.loginLink}</Link>
            <Link href="/register" className="text-sm font-medium" style={{ color: "var(--bpm-accent-cyan)" }}>{s.registerLink}</Link>
          </div>
        </div>
        <div
          className="p-4 rounded-xl border"
          style={{
            background: "var(--bpm-bg-primary)",
            borderColor: "var(--bpm-border)",
          }}
        >
          <h3 className="font-semibold mb-1" style={{ color: "var(--bpm-text-primary)", fontSize: "1rem" }}>
            {s.card2Title}
          </h3>
          <p className="text-sm mb-3" style={{ color: "var(--bpm-text-secondary)" }}>
            {s.card2Desc}
          </p>
          <ul className="text-xs mb-3 pl-4 list-disc" style={{ color: "var(--bpm-text-secondary)" }}>
            <li>{inlineCode(s.card2Li1, "text-xs")}</li>
            <li>{inlineCode(s.card2Li2, "text-xs")}</li>
          </ul>
          <Link href="/login?layout=split" className="text-sm font-medium" style={{ color: "var(--bpm-accent-cyan)" }}>
            {s.card2Link}
          </Link>
        </div>
        <div
          className="p-4 rounded-xl border"
          style={{
            background: "var(--bpm-bg-primary)",
            borderColor: "var(--bpm-border)",
          }}
        >
          <h3 className="font-semibold mb-1" style={{ color: "var(--bpm-text-primary)", fontSize: "1rem" }}>
            {s.card3Title}
          </h3>
          <p className="text-sm mb-3" style={{ color: "var(--bpm-text-secondary)" }}>
            {s.card3Desc}
          </p>
          <ul className="text-xs mb-3 pl-4 list-disc" style={{ color: "var(--bpm-text-secondary)" }}>
            <li>{inlineCode(s.card3Li1, "text-xs")}</li>
            <li>{inlineCode(s.card3Li2, "text-xs")}</li>
          </ul>
          <Link
            href="/login?showEmailOption=false"
            className="text-sm font-medium"
            style={{ color: "var(--bpm-accent-cyan)" }}
          >
            {s.card3Link}
          </Link>
        </div>
      </div>

      {session?.user ? (
        <div
          className="max-w-md p-6 rounded-xl border"
          style={{
            background: "var(--bpm-bg-secondary)",
            borderColor: "var(--bpm-border)",
          }}
        >
          <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--bpm-text-primary)" }}>
            {s.sessionTitle}
          </h2>
          <div className="flex items-center gap-4 mb-4">
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt=""
                width={48}
                height={48}
                className="rounded-full"
              />
            ) : (
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-semibold text-white"
                style={{ background: "var(--bpm-accent)" }}
              >
                {(session.user.name ?? session.user.email ?? "?").slice(0, 1).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-medium" style={{ color: "var(--bpm-text-primary)" }}>
                {session.user.name ?? s.userFallback}
              </p>
              <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
                {session.user.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="px-4 py-2 rounded-lg text-sm font-medium border transition"
            style={{
              color: "var(--bpm-text-primary)",
              background: "var(--bpm-bg-primary)",
              borderColor: "var(--bpm-border)",
            }}
          >
            {s.signOut}
          </button>
        </div>
      ) : null}
    </div>
  );
}
