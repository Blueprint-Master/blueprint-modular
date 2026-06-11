import type { Dictionary } from "@/lib/i18n";

export function WhyBpm({ dict }: { dict: Dictionary }) {
  const whyBpm = dict.home.whyBpm;

  return (
    <section className="site-section site-section-bordered">
      <div className="site-container">
        <h2>{whyBpm.title}</h2>
        <ul className="site-why-grid">
          {whyBpm.points.map((point) => (
            <li className="site-why-card" key={point.title}>
              <h3>{point.title}</h3>
              <p>{point.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
