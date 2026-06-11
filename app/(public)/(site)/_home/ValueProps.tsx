import type { Dictionary } from "@/lib/i18n";

export function ValueProps({ dict }: { dict: Dictionary }) {
  const why = dict.home.why;

  return (
    <section className="site-section site-section-bordered">
      <div className="site-container">
        <h2>{why.title}</h2>
        <ul className="site-points">
          {why.points.map((point) => (
            <li className="site-point" key={point.title}>
              <h3>{point.title}</h3>
              <p>{point.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
