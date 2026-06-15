"use client";

import { useMemo, useRef, useState } from "react";
import { Badge, Button, Card, ConfirmModal, Input, Metric, MetricRow, Modal, NumberInput, Table, useToast } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR, NEW_QUOTE_SUBJECT, fmtDate, fmtEUR, lt, pick, todayISO, type L10n } from "./strings";

type Statut = "brouillon" | "envoye" | "paye";

/** Sentinelle « à l'instant » / "just now" pour les dates posées pendant la session. */
const NOW = "now";

interface LigneDevis {
  id: string;
  designation: L10n;
  quantite: number;
  prixUnitaire: number;
  /** Remise en % appliquée sur la ligne (0 = aucune). */
  remisePct: number;
}

interface Devis {
  numero: string;
  client: string;
  objet: L10n;
  statut: Statut;
  /** Dates ISO (AAAA-MM-JJ) ou sentinelle NOW ; affichage localisé au render. */
  dateCreation: string;
  dateEnvoi: string | null;
  datePaiement: string | null;
  lignes: LigneDevis[];
}

const TVA_RATE = 0.2;

// Raison sociale et coordonnées légales : non traduites.
const SOCIETE = {
  nom: "Studio Méridien SAS",
  adresse: "12 rue des Ateliers, 69002 Lyon",
  siret: "SIRET 842 519 637 00021 — TVA FR 64 842519637",
};

const STATUT_VARIANT: Record<Statut, "default" | "warning" | "success"> = {
  brouillon: "default",
  envoye: "warning",
  paye: "success",
};

/** Jeu de démonstration déterministe : dates littérales, aucun Date.now() au render. */
const INITIAL_DEVIS: Devis[] = [
  {
    numero: "DV-2026-104",
    client: "ACME Industries",
    objet: { fr: "Refonte site vitrine", en: "Showcase website redesign" },
    statut: "brouillon",
    dateCreation: "2026-06-09",
    dateEnvoi: null,
    datePaiement: null,
    lignes: [
      {
        id: "l104-1",
        designation: {
          fr: "Maquettes UI (5 gabarits desktop + mobile)",
          en: "UI mockups (5 desktop + mobile templates)",
        },
        quantite: 5,
        prixUnitaire: 480,
        remisePct: 0,
      },
      {
        id: "l104-2",
        designation: {
          fr: "Intégration front responsive (jours)",
          en: "Responsive front-end integration (days)",
        },
        quantite: 8,
        prixUnitaire: 560,
        remisePct: 0,
      },
      {
        id: "l104-3",
        designation: {
          fr: "Recette, SEO de base et mise en ligne (jours)",
          en: "Acceptance testing, basic SEO and go-live (days)",
        },
        quantite: 2,
        prixUnitaire: 450,
        remisePct: 10,
      },
    ],
  },
  {
    numero: "DV-2026-103",
    client: "Nordis Logistique",
    objet: { fr: "Maintenance annuelle", en: "Annual maintenance" },
    statut: "envoye",
    dateCreation: "2026-06-02",
    dateEnvoi: "2026-06-05",
    datePaiement: null,
    lignes: [
      {
        id: "l103-1",
        designation: {
          fr: "Forfait maintenance applicative (mois)",
          en: "Application maintenance plan (months)",
        },
        quantite: 12,
        prixUnitaire: 320,
        remisePct: 5,
      },
      {
        id: "l103-2",
        designation: {
          fr: "Astreinte prioritaire — mise en place",
          en: "Priority on-call support — setup",
        },
        quantite: 1,
        prixUnitaire: 1200,
        remisePct: 0,
      },
    ],
  },
  {
    numero: "DV-2026-102",
    client: "Globex Finance",
    objet: { fr: "Audit sécurité", en: "Security audit" },
    statut: "paye",
    dateCreation: "2026-05-18",
    dateEnvoi: "2026-05-20",
    datePaiement: "2026-06-04",
    lignes: [
      {
        id: "l102-1",
        designation: {
          fr: "Audit technique et tests d'intrusion (jours)",
          en: "Technical audit and penetration testing (days)",
        },
        quantite: 4,
        prixUnitaire: 950,
        remisePct: 0,
      },
      {
        id: "l102-2",
        designation: {
          fr: "Rapport détaillé et restitution sur site",
          en: "Detailed report and on-site debrief",
        },
        quantite: 1,
        prixUnitaire: 800,
        remisePct: 0,
      },
    ],
  },
];

const ligneTotalHT = (l: LigneDevis) => l.quantite * l.prixUnitaire * (1 - l.remisePct / 100);

const totauxDevis = (d: Devis) => {
  const ht = d.lignes.reduce((sum, l) => sum + ligneTotalHT(l), 0);
  const tva = ht * TVA_RATE;
  return { ht, tva, ttc: ht + tva };
};

export default function DevisFacturationSimulateur() {
  const { locale } = useI18n();
  const S = STR[locale].sim;
  const { showToast } = useToast();
  const [devisList, setDevisList] = useState<Devis[]>(INITIAL_DEVIS);
  const [selectedNumero, setSelectedNumero] = useState<string>("DV-2026-104");

  const fmt = (n: number) => fmtEUR(n, locale);
  /** Affiche une date stockée (ISO ou sentinelle NOW) dans la locale courante. */
  const dispDate = (value: string) => (value === NOW ? S.justNow : fmtDate(value, locale));
  /** Variante avec complément (« le 4 juin 2026 » / "on June 4, 2026"), NOW inchangé. */
  const dispDateOn = (value: string) => (value === NOW ? S.justNow : S.onDate(fmtDate(value, locale)));

  // Formulaire de ligne (ajout ou édition selon editingLineId).
  const [editingLineId, setEditingLineId] = useState<string | null>(null);
  const [designation, setDesignation] = useState("");
  const [quantite, setQuantite] = useState<number | null>(1);
  const [prixUnitaire, setPrixUnitaire] = useState<number | null>(null);
  const [remisePct, setRemisePct] = useState<number | null>(0);
  const [ligneError, setLigneError] = useState<string | null>(null);

  // Suppression de ligne (confirmation).
  const [ligneASupprimer, setLigneASupprimer] = useState<LigneDevis | null>(null);

  // Aperçu imprimable.
  const [previewOpen, setPreviewOpen] = useState(false);

  // Nouveau devis.
  const [newOpen, setNewOpen] = useState(false);
  const [newClient, setNewClient] = useState("");
  const [newObjet, setNewObjet] = useState("");
  const [newError, setNewError] = useState<string | null>(null);
  const compteur = useRef(105);

  const selected = devisList.find((d) => d.numero === selectedNumero) ?? null;
  const readOnly = selected?.statut === "paye";

  const totaux = useMemo(() => (selected ? totauxDevis(selected) : { ht: 0, tva: 0, ttc: 0 }), [selected]);

  const stats = useMemo(() => {
    const enCours = devisList.filter((d) => d.statut !== "paye").length;
    const enAttente = devisList.filter((d) => d.statut === "envoye").reduce((s, d) => s + totauxDevis(d).ttc, 0);
    const encaisse = devisList.filter((d) => d.statut === "paye").reduce((s, d) => s + totauxDevis(d).ttc, 0);
    return { enCours, enAttente, encaisse };
  }, [devisList]);

  const resetLigneForm = () => {
    setEditingLineId(null);
    setDesignation("");
    setQuantite(1);
    setPrixUnitaire(null);
    setRemisePct(0);
    setLigneError(null);
  };

  const updateDevis = (numero: string, patch: (d: Devis) => Devis) => {
    setDevisList((prev) => prev.map((d) => (d.numero === numero ? patch(d) : d)));
  };

  const handleSelect = (numero: string) => {
    setSelectedNumero(numero);
    resetLigneForm();
  };

  const handleSubmitLigne = () => {
    if (!selected || readOnly) return;
    const des = designation.trim();
    if (!des) {
      setLigneError(S.errDesignation);
      return;
    }
    if (quantite == null || quantite <= 0) {
      setLigneError(S.errQty);
      return;
    }
    if (prixUnitaire == null || prixUnitaire < 0) {
      setLigneError(S.errUnitPrice);
      return;
    }
    const remise = remisePct ?? 0;
    if (remise < 0 || remise > 100) {
      setLigneError(S.errDiscount);
      return;
    }
    setLigneError(null);

    if (editingLineId) {
      updateDevis(selected.numero, (d) => ({
        ...d,
        lignes: d.lignes.map((l) =>
          l.id === editingLineId ? { ...l, designation: lt(des), quantite, prixUnitaire, remisePct: remise } : l
        ),
      }));
      showToast(S.toastLineUpdated(des), "success", 4000, S.toastLineUpdatedTitle, S.toastCategory, null);
    } else {
      const ligne: LigneDevis = {
        id: `l${Date.now()}`,
        designation: lt(des),
        quantite,
        prixUnitaire,
        remisePct: remise,
      };
      updateDevis(selected.numero, (d) => ({ ...d, lignes: [...d.lignes, ligne] }));
      showToast(
        S.toastLineAdded(des, fmt(ligneTotalHT(ligne))),
        "success",
        4000,
        S.toastLineAddedTitle,
        S.toastCategory,
        null
      );
    }
    resetLigneForm();
  };

  const startEditLigne = (l: LigneDevis) => {
    setEditingLineId(l.id);
    setDesignation(pick(l.designation, locale));
    setQuantite(l.quantite);
    setPrixUnitaire(l.prixUnitaire);
    setRemisePct(l.remisePct);
    setLigneError(null);
  };

  const confirmDeleteLigne = () => {
    if (!selected || !ligneASupprimer) return;
    updateDevis(selected.numero, (d) => ({ ...d, lignes: d.lignes.filter((l) => l.id !== ligneASupprimer.id) }));
    if (editingLineId === ligneASupprimer.id) resetLigneForm();
    showToast(
      S.toastLineDeleted(pick(ligneASupprimer.designation, locale)),
      "info",
      4000,
      S.toastLineDeletedTitle,
      S.toastCategory,
      null
    );
    setLigneASupprimer(null);
  };

  const handleEnvoyer = () => {
    if (!selected || selected.statut !== "brouillon") return;
    if (selected.lignes.length === 0) {
      showToast(S.toastEmpty, "warning", 5000, S.toastEmptyTitle, S.toastCategory, null);
      return;
    }
    updateDevis(selected.numero, (d) => ({ ...d, statut: "envoye", dateEnvoi: NOW }));
    showToast(
      S.toastSent(selected.numero, selected.client, fmt(totaux.ttc)),
      "success",
      5000,
      S.toastSentTitle,
      S.toastCategory,
      null
    );
  };

  const handleMarquerPaye = () => {
    if (!selected || selected.statut !== "envoye") return;
    updateDevis(selected.numero, (d) => ({ ...d, statut: "paye", datePaiement: NOW }));
    resetLigneForm();
    showToast(
      S.toastPaid(fmt(totaux.ttc), selected.numero),
      "success",
      5000,
      S.toastPaidTitle,
      S.toastCategory,
      null
    );
  };

  const handleCreateDevis = () => {
    const client = newClient.trim();
    if (!client) {
      setNewError(S.errClient);
      return;
    }
    setNewError(null);
    const numero = `DV-2026-${compteur.current}`;
    compteur.current += 1;
    const objetSaisi = newObjet.trim();
    const devis: Devis = {
      numero,
      client,
      objet: objetSaisi ? lt(objetSaisi) : NEW_QUOTE_SUBJECT,
      statut: "brouillon",
      dateCreation: todayISO(),
      dateEnvoi: null,
      datePaiement: null,
      lignes: [],
    };
    setDevisList((prev) => [devis, ...prev]);
    setSelectedNumero(numero);
    resetLigneForm();
    setNewOpen(false);
    setNewClient("");
    setNewObjet("");
    showToast(S.toastCreated(numero, client), "success", 5000, S.toastCreatedTitle, S.toastCategory, null);
  };

  const listColumns = [
    {
      key: "numero",
      label: S.colNumber,
      render: (value: unknown) => (
        <span style={{ fontWeight: selectedNumero === String(value) ? 700 : 500, color: "var(--bpm-text-primary)" }}>
          {String(value)}
        </span>
      ),
    },
    { key: "client", label: S.colClient },
    { key: "objet", label: S.colSubject },
    {
      key: "ttc",
      label: S.colTotalTTC,
      align: "right" as const,
      render: (value: unknown) => <span style={{ fontVariantNumeric: "tabular-nums" }}>{fmt(Number(value))}</span>,
    },
    {
      key: "statut",
      label: S.colStatus,
      render: (value: unknown) => (
        <Badge variant={STATUT_VARIANT[value as Statut]}>{S.status[value as Statut]}</Badge>
      ),
    },
  ];

  const listRows = devisList.map((d) => ({
    numero: d.numero,
    client: d.client,
    objet: pick(d.objet, locale),
    ttc: totauxDevis(d).ttc,
    statut: d.statut,
  }));

  const ligneColumns = [
    { key: "designation", label: S.colDesignation },
    { key: "quantite", label: S.colQty, align: "right" as const },
    {
      key: "prixUnitaire",
      label: S.colUnitPrice,
      align: "right" as const,
      render: (value: unknown) => fmt(Number(value)),
    },
    {
      key: "remisePct",
      label: S.colDiscount,
      align: "right" as const,
      render: (value: unknown) => (Number(value) > 0 ? S.pct(Number(value)) : "—"),
    },
    {
      key: "totalHT",
      label: S.colLineTotal,
      align: "right" as const,
      render: (value: unknown) => <span style={{ fontVariantNumeric: "tabular-nums" }}>{fmt(Number(value))}</span>,
    },
    {
      key: "id",
      label: S.colActions,
      render: (_: unknown, row: Record<string, unknown>) => {
        const ligne = (selected?.lignes ?? []).find((l) => l.id === row.id);
        if (!ligne) return null;
        return (
          <div className="flex gap-2">
            <Button
              size="small"
              variant="secondary"
              disabled={readOnly}
              aria-label={S.editLineAria(pick(ligne.designation, locale))}
              onClick={() => startEditLigne(ligne)}
            >
              {S.editLineBtn}
            </Button>
            <Button
              size="small"
              variant="destructive"
              disabled={readOnly}
              onClick={() => setLigneASupprimer(ligne)}
            >
              {S.deleteLineBtn}
            </Button>
          </div>
        );
      },
    },
  ];

  const ligneRows = (selected?.lignes ?? []).map((l) => ({
    id: l.id,
    designation: pick(l.designation, locale),
    quantite: l.quantite,
    prixUnitaire: l.prixUnitaire,
    remisePct: l.remisePct,
    totalHT: ligneTotalHT(l),
  }));

  const previewColumns = [
    { key: "designation", label: S.colDesignation },
    { key: "quantite", label: S.colQty, align: "right" as const },
    { key: "prixUnitaire", label: S.colUnitPrice, align: "right" as const, render: (v: unknown) => fmt(Number(v)) },
    {
      key: "remisePct",
      label: S.colDiscount,
      align: "right" as const,
      render: (v: unknown) => (Number(v) > 0 ? S.pct(Number(v)) : "—"),
    },
    { key: "totalHT", label: S.colLineTotal, align: "right" as const, render: (v: unknown) => fmt(Number(v)) },
  ];

  return (
    <div className="space-y-6">
      <MetricRow>
        <Metric label={S.metricOpen} value={String(stats.enCours)} />
        <Metric label={S.metricPending} value={fmt(stats.enAttente)} />
        <Metric label={S.metricCollected} value={fmt(stats.encaisse)} />
      </MetricRow>

      <Card variant="outlined" title={S.quotesPanelTitle}>
        <div className="mb-3 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm m-0" style={{ color: "var(--bpm-text-secondary)" }}>
            {S.listHint}
          </p>
          <Button variant="primary" onClick={() => { setNewError(null); setNewOpen(true); }}>
            {S.newQuote}
          </Button>
        </div>
        <Table
          columns={listColumns}
          data={listRows as unknown as Record<string, unknown>[]}
          striped
          hover
          onRowClick={(row) => handleSelect(String(row.numero))}
        />
      </Card>

      {selected && (
        <Card variant="outlined" title={S.editorTitle(selected.numero, pick(selected.objet, locale))}>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge variant={STATUT_VARIANT[selected.statut]}>{S.status[selected.statut]}</Badge>
            <span className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
              {selected.client} · {S.createdOn(dispDate(selected.dateCreation))}
              {selected.dateEnvoi ? ` · ${S.sentOn(dispDate(selected.dateEnvoi))}` : ""}
              {selected.datePaiement ? ` · ${S.paidOn(dispDate(selected.datePaiement))}` : ""}
            </span>
            <span className="flex-1" />
            {selected.statut === "brouillon" && (
              <Button variant="primary" onClick={handleEnvoyer}>
                {S.sendToClient}
              </Button>
            )}
            {selected.statut === "envoye" && (
              <Button variant="primary" onClick={handleMarquerPaye}>
                {S.markPaid}
              </Button>
            )}
            <Button variant="outline" onClick={() => setPreviewOpen(true)}>
              {S.previewPrint}
            </Button>
          </div>

          {readOnly && selected.datePaiement && (
            <p
              className="text-sm mb-3 rounded px-3 py-2"
              style={{ color: "var(--bpm-text-secondary)", background: "var(--bpm-bg-secondary)" }}
            >
              {S.readOnlyBanner(dispDateOn(selected.datePaiement))}
            </p>
          )}

          <Table
            columns={ligneColumns}
            data={ligneRows as unknown as Record<string, unknown>[]}
            striped
            hover
            emptyMessage={S.emptyLines}
          />

          <div className="mt-4 ml-auto" style={{ maxWidth: 280 }}>
            <div className="flex justify-between text-sm py-1" style={{ color: "var(--bpm-text-secondary)" }}>
              <span>{S.totalHT}</span>
              <span style={{ fontVariantNumeric: "tabular-nums" }}>{fmt(totaux.ht)}</span>
            </div>
            <div className="flex justify-between text-sm py-1" style={{ color: "var(--bpm-text-secondary)" }}>
              <span>{S.vat20}</span>
              <span style={{ fontVariantNumeric: "tabular-nums" }}>{fmt(totaux.tva)}</span>
            </div>
            <div
              className="flex justify-between py-2 font-semibold"
              style={{ color: "var(--bpm-text-primary)", borderTop: "2px solid var(--bpm-accent)" }}
            >
              <span>{S.totalTTC}</span>
              <span style={{ fontVariantNumeric: "tabular-nums" }}>{fmt(totaux.ttc)}</span>
            </div>
          </div>

          <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--bpm-border)" }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--bpm-text-primary)" }}>
              {editingLineId ? S.formEditTitle : S.formAddTitle}
            </h3>
            <div className="grid gap-3 md:grid-cols-4">
              <Input
                label={S.fieldDesignation}
                placeholder={S.fieldDesignationPlaceholder}
                value={designation}
                onChange={setDesignation}
                disabled={readOnly}
              />
              <NumberInput label={S.fieldQty} value={quantite} onChange={setQuantite} min={0} step={1} disabled={readOnly} />
              <NumberInput
                label={S.fieldUnitPrice}
                value={prixUnitaire}
                onChange={setPrixUnitaire}
                min={0}
                step={10}
                disabled={readOnly}
                placeholder={S.fieldUnitPricePlaceholder}
              />
              <NumberInput
                label={S.fieldDiscount}
                value={remisePct}
                onChange={setRemisePct}
                min={0}
                max={100}
                step={1}
                disabled={readOnly}
              />
            </div>
            {ligneError && (
              <p className="mt-2 text-sm" style={{ color: "var(--bpm-error, #dc2626)" }}>
                {ligneError}
              </p>
            )}
            <div className="mt-3 flex gap-2">
              <Button onClick={handleSubmitLigne} disabled={readOnly}>
                {editingLineId ? S.saveLine : S.addLine}
              </Button>
              {editingLineId && (
                <Button variant="ghost" onClick={resetLigneForm}>
                  {S.cancelEdit}
                </Button>
              )}
            </div>
            {readOnly && (
              <p className="mt-2 text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
                {S.readOnlyHint}
              </p>
            )}
          </div>
        </Card>
      )}

      {previewOpen && selected && (
        <Modal isOpen onClose={() => setPreviewOpen(false)} title={S.previewTitle(selected.numero)} size="large">
          <style>{`
            @media print {
              body * { visibility: hidden; }
              .devis-print-zone, .devis-print-zone * { visibility: visible; }
              .devis-print-zone { position: absolute; left: 0; top: 0; width: 100%; padding: 16px; }
              .devis-no-print { display: none !important; }
            }
          `}</style>
          <div className="devis-print-zone" style={{ color: "var(--bpm-text-primary)" }}>
            <div
              className="flex justify-between gap-6 pb-4 mb-4"
              style={{ borderBottom: "2px solid var(--bpm-accent)" }}
            >
              <div>
                <h2 className="text-xl font-bold m-0">{S.quoteNo(selected.numero)}</h2>
                <p className="text-sm m-0 mt-1" style={{ color: "var(--bpm-text-secondary)" }}>
                  {pick(selected.objet, locale)}
                </p>
                <p className="text-sm m-0" style={{ color: "var(--bpm-text-secondary)" }}>
                  {S.issuedValidity(dispDate(selected.dateCreation))}
                </p>
              </div>
              <div className="text-right text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
                <strong style={{ color: "var(--bpm-text-primary)" }}>{SOCIETE.nom}</strong>
                <div>{SOCIETE.adresse}</div>
                <div>{SOCIETE.siret}</div>
              </div>
            </div>
            <p className="text-sm mb-4">
              <strong>{S.clientLabel}</strong> {selected.client}
            </p>
            <Table columns={previewColumns} data={ligneRows as unknown as Record<string, unknown>[]} striped />
            <div className="mt-4 ml-auto" style={{ maxWidth: 260 }}>
              <div className="flex justify-between text-sm py-1" style={{ color: "var(--bpm-text-secondary)" }}>
                <span>{S.totalHT}</span>
                <span>{fmt(totaux.ht)}</span>
              </div>
              <div className="flex justify-between text-sm py-1" style={{ color: "var(--bpm-text-secondary)" }}>
                <span>{S.vat20}</span>
                <span>{fmt(totaux.tva)}</span>
              </div>
              <div
                className="flex justify-between py-2 font-semibold"
                style={{ borderTop: "2px solid var(--bpm-accent)" }}
              >
                <span>{S.totalTTC}</span>
                <span>{fmt(totaux.ttc)}</span>
              </div>
            </div>
            <p className="mt-6 text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
              {S.terms}
            </p>
          </div>
          <div className="devis-no-print mt-5 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setPreviewOpen(false)}>
              {S.close}
            </Button>
            <Button variant="primary" onClick={() => window.print()}>
              {S.print}
            </Button>
          </div>
        </Modal>
      )}

      {newOpen && (
        <Modal isOpen onClose={() => setNewOpen(false)} title={S.newQuoteTitle} size="small">
          <p className="text-sm mb-3" style={{ color: "var(--bpm-text-secondary)" }}>
            {S.newQuoteIntro(`DV-2026-${compteur.current}`)}
          </p>
          <div className="space-y-3">
            <Input label={S.newClientLabel} placeholder={S.newClientPlaceholder} value={newClient} onChange={setNewClient} />
            <Input label={S.newSubjectLabel} placeholder={S.newSubjectPlaceholder} value={newObjet} onChange={setNewObjet} />
          </div>
          {newError && (
            <p className="mt-2 text-sm" style={{ color: "var(--bpm-error, #dc2626)" }}>
              {newError}
            </p>
          )}
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setNewOpen(false)}>
              {S.cancel}
            </Button>
            <Button variant="primary" onClick={handleCreateDevis}>
              {S.createQuote}
            </Button>
          </div>
        </Modal>
      )}

      <ConfirmModal
        isOpen={ligneASupprimer !== null}
        title={S.confirmDeleteTitle}
        message={
          ligneASupprimer
            ? S.confirmDeleteMsg(pick(ligneASupprimer.designation, locale), fmt(ligneTotalHT(ligneASupprimer)))
            : ""
        }
        confirmLabel={S.confirmDelete}
        cancelLabel={S.cancel}
        variant="danger"
        onConfirm={confirmDeleteLigne}
        onCancel={() => setLigneASupprimer(null)}
      />
    </div>
  );
}
