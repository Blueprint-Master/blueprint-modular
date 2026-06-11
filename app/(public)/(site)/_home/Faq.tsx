import type { Dictionary } from "@/lib/i18n";

export function Faq({ dict }: { dict: Dictionary }) {
  const faq = dict.home.faq;

  return (
    <section className="site-section site-section-bordered">
      <div className="site-container">
        <h2>{faq.title}</h2>
        <div className="site-faq">
          {faq.items.map((item) => (
            <details className="site-faq-item" key={item.q}>
              <summary className="site-faq-question">{item.q}</summary>
              <p className="site-faq-answer">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
