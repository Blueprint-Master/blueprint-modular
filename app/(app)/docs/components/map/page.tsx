"use client";

import Link from "next/link";
import { Map } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

export default function DocMapPage() {
  const { prev, next } = getPrevNext("map");
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.map</div>
        <h1>bpm.map</h1>
        <p className="doc-description">Carte (OpenStreetMap via iframe ou coordonnées).</p>
        <div className="doc-meta"><span className="doc-badge doc-badge-category">Visualisation</span></div>
      </div>
      <div className="sandbox-container">
        <div className="sandbox-preview">
          <Map lat={48.8566} lng={2.3522} width={400} height={300} />
        </div>
      </div>
      <nav className="doc-pagination mt-8">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
