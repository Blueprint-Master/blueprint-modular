"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../strings";

export default function ExportPlanifieDocumentationPage() {
  const { locale } = useI18n();
  const t = STR[locale];
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> →{" "}
          <Link href="/modules/export-planifie">{t.moduleTitle}</Link> → {t.docLabel}
        </nav>
        <h1>{t.docPageTitle}</h1>
        <p className="doc-description">{t.docPageDescription}</p>
      </div>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {t.dataModelHeading}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {t.dataModelP1}
        <code>actif</code>
        {t.dataModelP2}
        <code>prochainEnvoi</code>
        {t.dataModelP3}
      </p>
      <CodeBlock
        code={`{
  "rapport": "Ventes — synthèse hebdomadaire",
  "format": "PDF",            // PDF | CSV
  "frequence": "weekly",      // daily | weekly | monthly
  "heure": "08:00",
  "destinataires": ["dir.commerciale@acme.fr", "ventes@acme.fr"],
  "actif": true
}`}
        language="json"
      />

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {t.lifecycleHeading}
      </h2>
      <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><strong>{t.lcScheduleTitle}</strong> — {t.lcScheduleDesc}</li>
        <li><strong>{t.lcSendTitle}</strong> — {t.lcSendDesc}</li>
        <li><strong>{t.lcPauseTitle}</strong> — {t.lcPauseDesc}</li>
        <li>
          <strong>{t.lcDeleteTitle}</strong> — {t.lcDeleteDesc1}
          <code>bpm.confirmModal</code>
          {t.lcDeleteDesc2}
        </li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {t.integrationHeading}
      </h2>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {locale === "fr"
          ? "Installez le paquet Python depuis cette version du dépôt (pip install .). Le worker conserve les échéances et les reçus par destinataire dans une base SQLite privée, sur un volume persistant. Configurez BPM_SMTP_HOST et BPM_SMTP_FROM, ainsi que BPM_SMTP_USER et BPM_SMTP_PASSWORD si votre relais les exige. STARTTLS est utilisé par défaut. Montez le répertoire de rapports en lecture seule."
          : "Install the Python package from this repository version (pip install .). The worker stores schedules and per-recipient receipts in a private SQLite database on a persistent volume. Set BPM_SMTP_HOST and BPM_SMTP_FROM, and BPM_SMTP_USER and BPM_SMTP_PASSWORD when your relay requires them. STARTTLS is the default. Mount the reports directory read-only."}
      </p>

      <CodeBlock language="bash" code={`python -m bpm.scheduled_exports --db /var/lib/modular/exports.sqlite add ventes csv weekly 08:00 finance@example.test
python -m bpm.scheduled_exports --db /var/lib/modular/exports.sqlite tick --reports /srv/rapports
python -m bpm.scheduled_exports --db /var/lib/modular/exports.sqlite history`} />
      <p className="mt-3 text-sm">
        {locale === "fr"
          ? "Exécutez tick chaque minute sous le compte de service. Publiez ventes.csv par renommage atomique. Pour produire le rapport au moment de l’échéance, remplacez --reports par --provider mon_application.rapports:generer. Cette fonction reçoit la clé du rapport et le format, puis renvoie les octets du CSV UTF-8 ou du PDF. Tous les destinataires reçoivent le même instantané. Le lundi est le jour hebdomadaire, le 1ᵉʳ celui du mois. Le fuseau par défaut est Europe/Paris."
          : "Run tick every minute under the service account. Publish ventes.csv by atomic rename. To generate the report when due, replace --reports with --provider my_app.reports:generate. This function receives the report key and format and returns UTF-8 CSV or PDF bytes. All recipients receive the same snapshot. Weekly reports run on Mondays and monthly reports on the first day. The default time zone is Europe/Paris."}
      </p>
      <p className="mt-3 text-sm">
        {locale === "fr"
          ? "list affiche les identifiants utilisés par pause, resume, send et delete. history distingue l’acceptation par le relais SMTP d’un envoi incertain. Après une interruption pendant l’envoi, vérifiez le journal du relais puis utilisez reconcile RUN DESTINATAIRE sent ou retry. Chaque installation conserve sa propre base et ses propres secrets."
          : "list shows the IDs used by pause, resume, send and delete. history distinguishes relay acceptance from uncertain delivery. Following an interruption during submission, check the relay log, then use reconcile RUN RECIPIENT sent or retry. Each installation maintains its own database and secrets."}
      </p>
      <p className="mt-3 text-sm">{locale === "fr"
        ? "Dans le serveur Next, pointez BPM_EXPORTS_DB vers la même base et listez les rapports autorisés dans BPM_EXPORT_REPORTS (ex. ventes.csv,tresorerie.pdf). Les administrateurs planifient les envois et consultent les reçus dans l’onglet Opérations."
        : "Set BPM_EXPORTS_DB on the Next server to the same database and list available reports in BPM_EXPORT_REPORTS (e.g. sales.csv,cash.pdf). Administrators can schedule deliveries and inspect receipts in the Operations tab."}</p>
      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link
          href="/modules/export-planifie/simulateur"
          className="font-medium underline"
          style={{ color: "var(--bpm-accent-cyan)" }}
        >
          {t.openSimulator}
        </Link>
      </p>
    </div>
  );
}
