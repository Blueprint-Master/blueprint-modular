import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";

export function ResourcesTeaser({ dict }: { dict: Dictionary }) {
  const teaser = dict.home.resourcesTeaser;

  return (
    <section className="site-section site-section-bordered">
      <div className="site-container">
        <span className="site-eyebrow">{teaser.eyebrow}</span>
        <h2>{teaser.title}</h2>
        <p className="site-section-body">{teaser.body}</p>
        <div className="site-hero-actions">
          <Link href="/resources" className="site-cta-primary">
            {teaser.cta}
          </Link>
          <Link href="/docs" className="site-cta-secondary">
            {dict.nav.docs}
          </Link>
        </div>
      </div>
    </section>
  );
}
