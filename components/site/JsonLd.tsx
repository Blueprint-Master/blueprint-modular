/**
 * Injecte un bloc JSON-LD (schema.org) dans le <head> du document.
 * Server Component : aucun JS client. Le contenu est sérialisé tel quel ;
 * n'y passer que des données de confiance (issues du dict / du registre).
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
