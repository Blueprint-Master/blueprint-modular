import Link from "next/link";
import { CodeBlock } from "@/components/bpm";
import { getLocale } from "@/lib/i18n/server";
import { str } from "../strings";

export default async function CalendrierDocumentationPage() {
  const locale = await getLocale();
  const s = str(locale);

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">{s.breadcrumbModules}</Link> →{" "}
          <Link href="/modules/calendrier/simulateur">{s.moduleName}</Link> → {s.breadcrumbDocumentation}
        </nav>
        <h1>{s.docTitle}</h1>
        <p className="doc-description">{s.docDescription}</p>
      </div>

      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)" }}>
        {s.docIntro}
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.docHowTitle}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        {s.docHowBody}
      </p>

      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.docStructTitle}
      </h3>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        {s.docStructIntro}
      </p>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><code>id</code> — {s.docFieldId}</li>
        <li><code>date</code> — {s.docFieldDate}</li>
        <li><code>heure</code> — {s.docFieldHeure}</li>
        <li><code>titre</code> — {s.docFieldTitre}</li>
        <li><code>duree</code> — {s.docFieldDuree}</li>
        <li><code>couleur</code> — {s.docFieldCouleur}</li>
        <li><code>description</code> — {s.docFieldDescription}</li>
        <li><code>lieu</code> — {s.docFieldLieu}</li>
        <li><code>categorie</code> — {s.docFieldCategorie}</li>
        <li><code>statut</code> — {s.docFieldStatut}</li>
        <li><code>participants</code> — {s.docFieldParticipants}</li>
      </ul>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.docCompatTitle}
      </h2>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        {s.docCompatIntro}
      </p>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><strong>{s.docCompatTasks}</strong> — {s.docCompatTasksBody}</li>
        <li><strong>{s.docCompatWorkflow}</strong> — {s.docCompatWorkflowBody}</li>
        <li><strong>{s.docCompatNotif}</strong> — {s.docCompatNotifBody}</li>
        <li><strong>{s.docCompatBooking}</strong> — {s.docCompatBookingBody}</li>
      </ul>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.docIntegTitle}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        {s.docIntegBody}
      </p>

      <p className="mb-2 text-sm font-medium" style={{ color: "var(--bpm-text-primary)" }}>{s.docExampleLabel}</p>
      <CodeBlock
        code={`# Côté Python BPM (si vous générez la page via BPM)
bpm.title("Agenda")
# Les événements sont passés en data (date, titre, heure, durée)
# Exemple de structure :
# events = [
#   {"date": "2025-02-25", "titre": "Réunion équipe", "heure": "10h"},
#   {"date": "2025-02-26", "titre": "Revue livrables", "heure": "14h"},
# ]`}
        language="python"
      />

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.docSimuTitle}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        {s.docSimuBody}
      </p>
      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link href="/modules/calendrier/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>{s.docOpenSimu}</Link>
      </p>

      <p className="mt-8 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link href="/modules/calendrier/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>{s.docBackToCalendar}</Link>
      </p>
    </div>
  );
}
