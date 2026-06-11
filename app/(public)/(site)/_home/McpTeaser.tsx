import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import { fmt } from "@/lib/i18n";
import { COMPONENT_COUNT } from "./data";

export function McpTeaser({ dict }: { dict: Dictionary }) {
  const teaser = dict.home.mcpTeaser;

  return (
    <section className="site-section site-section-bordered">
      <div className="site-container site-teaser">
        <div className="site-teaser-body">
          <span className="site-eyebrow">{teaser.eyebrow}</span>
          <h2>{teaser.title}</h2>
          <p className="site-section-body">{fmt(teaser.body, { count: COMPONENT_COUNT })}</p>
          <div className="site-hero-actions">
            <Link href="/mcp" className="site-cta-primary">
              {teaser.cta}
            </Link>
          </div>
        </div>
        <div className="site-teaser-aside">
          <span className="site-pane-label">{dict.mcp.endpointLabel}</span>
          <code className="site-endpoint">https://mcp.blueprint-modular.com/api/mcp</code>
        </div>
      </div>
    </section>
  );
}
