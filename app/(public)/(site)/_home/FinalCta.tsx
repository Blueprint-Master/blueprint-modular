import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import { CONTACT_EMAIL } from "@/lib/mcp/meta";

export function FinalCta({ dict }: { dict: Dictionary }) {
  const cta = dict.home.cta;

  return (
    <section className="site-section site-section-bordered site-cta-band">
      <div className="site-container site-cta-inner">
        <h2>{cta.title}</h2>
        <p className="site-section-body">{cta.body}</p>
        <p className="site-cta-install">
          <span className="site-kbd-line">{dict.common.installCommand}</span>
        </p>
        <div className="site-hero-actions">
          <Link href="/docs/getting-started" className="site-cta-primary">
            {cta.primary}
          </Link>
          <Link href="/components" className="site-cta-secondary">
            {cta.secondary}
          </Link>
          <a href={`mailto:${CONTACT_EMAIL}`} className="site-cta-secondary">
            {cta.contact}
          </a>
        </div>
        <p className="site-cta-offer">{cta.offer}</p>
      </div>
    </section>
  );
}
