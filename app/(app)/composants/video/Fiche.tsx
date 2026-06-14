"use client";

import { useState } from "react";
import Link from "next/link";
import { Video } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const fr = {
  breadcrumb: "Composants",
  description: "Lecteur vidéo HTML5 (contrôles, boucle, muted).",
  category: "Média",
  copy: "Copier",
  descSrc: "URL de la vidéo.",
  descControls: "Afficher les contrôles (défaut true).",
  descLoop: "Boucler (défaut false).",
  descMuted: "Muet (défaut false).",
};
const en: typeof fr = {
  breadcrumb: "Components",
  description: "HTML5 video player (controls, loop, muted).",
  category: "Media",
  copy: "Copy",
  descSrc: "Video URL.",
  descControls: "Show controls (default true).",
  descLoop: "Loop (default false).",
  descMuted: "Muted (default false).",
};
const L = { fr, en } as const;

export default function DocVideoPage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [src, setSrc] = useState("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4");
  const [controls, setControls] = useState(true);
  const [loop, setLoop] = useState(false);
  const [muted, setMuted] = useState(false);
  const pythonCode = `bpm.video(src="${src}", controls=${controls}, loop=${loop}, muted=${muted})`;
  const { prev, next } = getPrevNext("video");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/composants">{t.breadcrumb}</Link> → bpm.video</div>
        <h1>bpm.video</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">{t.category}</span>
        </div>
      </div>
      <div className="sandbox-container">
        <div className="sandbox-preview">
          <Video src={src} controls={controls} loop={loop} muted={muted} />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>src (URL)</label>
            <input type="text" value={src} onChange={(e) => setSrc(e.target.value)} className="w-full p-2 border rounded text-sm" />
          </div>
          <div className="sandbox-control-group">
            <label><input type="checkbox" checked={controls} onChange={(e) => setControls(e.target.checked)} /> controls</label>
          </div>
          <div className="sandbox-control-group">
            <label><input type="checkbox" checked={loop} onChange={(e) => setLoop(e.target.checked)} /> loop</label>
          </div>
          <div className="sandbox-control-group">
            <label><input type="checkbox" checked={muted} onChange={(e) => setMuted(e.target.checked)} /> muted</label>
          </div>
        </div>
        <div className="sandbox-code">
          <div className="sandbox-code-header"><span>Python</span><button type="button" onClick={() => navigator.clipboard.writeText(pythonCode)}>{t.copy}</button></div>
          <pre><code>{pythonCode}</code></pre>
        </div>
      </div>
      <table className="props-table">
        <thead><tr><th>Prop</th><th>Type</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>src</code></td><td>string</td><td>{t.descSrc}</td></tr>
          <tr><td><code>controls</code></td><td>boolean</td><td>{t.descControls}</td></tr>
          <tr><td><code>loop</code></td><td>boolean</td><td>{t.descLoop}</td></tr>
          <tr><td><code>muted</code></td><td>boolean</td><td>{t.descMuted}</td></tr>
        </tbody>
      </table>
      <nav className="doc-pagination mt-8">
        {prev ? <Link href={"/composants/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/composants/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
