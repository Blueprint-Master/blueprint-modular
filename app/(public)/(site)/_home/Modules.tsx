import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import { fmt } from "@/lib/i18n";
import { MODULE_CATEGORIES, MODULE_COUNT } from "./data";

export function Modules({ dict }: { dict: Dictionary }) {
  const modules = dict.home.modules;

  return (
    <section className="site-section site-section-bordered">
      <div className="site-container">
        <h2>{fmt(modules.title, { count: MODULE_COUNT })}</h2>
        <p className="site-section-body">{modules.body}</p>
        <ul className="site-module-grid">
          {MODULE_CATEGORIES.map(({ key, count }) => (
            <li className="site-module-card" key={key}>
              <div className="site-module-card-head">
                <span className="site-module-name">{modules.categories[key]}</span>
                <span className="site-module-count">{count}</span>
              </div>
              <p className="site-module-desc">{modules.descriptions[key]}</p>
            </li>
          ))}
        </ul>
        <div className="site-hero-actions">
          <Link href="/modules" className="site-cta-primary">
            {modules.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}
