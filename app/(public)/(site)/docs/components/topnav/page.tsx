"use client";

import Link from "next/link";
import { TopNav } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

export default function DocTopNavPage() {
  const { prev, next } = getPrevNext("topnav");
  const items = [{ label: "Accueil", href: "/" }, { label: "Sandbox", href: "/sandbox" }];
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.topnav</div>
        <h1>bpm.topnav</h1>
        <p className="doc-description">Barre de navigation supérieure.</p>
        <div className="doc-meta"><span className="doc-badge doc-badge-category">Navigation</span></div>
      </div>
      <div className="sandbox-container">
        <div className="sandbox-preview">
          <TopNav title="Blueprint Modular" titleHref="/" items={items} />
        </div>
      </div>
      <nav className="doc-pagination mt-8">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
