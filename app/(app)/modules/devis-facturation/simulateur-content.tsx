"use client";

import { useMemo, useRef, useState } from "react";
import {
  Badge,
  Button,
  ConfirmModal,
  Input,
  Metric,
  MetricRow,
  Modal,
  NumberInput,
  Panel,
  Table,
  useToast,
} from "@/components/bpm";

type Statut = "brouillon" | "envoye" | "paye";

interface LigneDevis {
  id: string;
  designation: string;
  quantite: number;
  prixUnitaire: number;
  /** Remise en % appliquée sur la ligne (0 = aucune). */
  remisePct: number;
}

interface Devis {
  numero: string;
  client: string;
  objet: string;
  statut: Statut;
  dateCreation: string;
  dateEnvoi: string | null;
  datePaiement: string | null;
  lignes: LigneDevis[];
}

const TVA_RATE = 0.2;

const SOCIETE = {
  nom: "Studio Méridien SAS",
  adresse: "12 rue des Ateliers, 69002 Lyon",
  siret: "SIRET 842 519 637 00021 — TVA FR 64 842519637",
};

const STATUT_LABEL: Record<Statut, string> = {
  brouillon: "Brouillon",
  envoye: "Envoyé",
  paye: "Payé",
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
    objet: "Refonte site vitrine",
    statut: "brouillon",
    dateCreation: "9 juin 2026",
    dateEnvoi: null,
    datePaiement: null,
    lignes: [
      { id: "l104-1", designation: "Maquettes UI (5 gabarits desktop + mobile)", quantite: 5, prixUnitaire: 480, remisePct: 0 },
      { id: "l104-2", designation: "Intégration front responsive (jours)", quantite: 8, prixUnitaire: 560, remisePct: 0 },
      { id: "l104-3", designation: "Recette, SEO de base et mise en ligne (jours)", quantite: 2, prixUnitaire: 450, remisePct: 10 },
    ],
  },
  {
    numero: "DV-2026-103",
    client: "Nordis Logistique",
    objet: "Maintenance annuelle",
    statut: "envoye",
    dateCreation: "2 juin 2026",
    dateEnvoi: "5 juin 2026",
    datePaiement: null,
    lignes: [
      { id: "l103-1", designation: "Forfait maintenance applicative (mois)", quantite: 12, prixUnitaire: 320, remisePct: 5 },
      { id: "l103-2", designation: "Astreinte prioritaire — mise en place", quantite: 1, prixUnitaire: 1200, remisePct: 0 },
    ],
  },
  {
    numero: "DV-2026-102",
    client: "Globex Finance",
    objet: "Audit sécurité",
    statut: "paye",
    dateCreation: "18 mai 2026",
    dateEnvoi: "20 mai 2026",
    datePaiement: "4 juin 2026",
    lignes: [
      { id: "l102-1", designation: "Audit technique et tests d'intrusion (jours)", quantite: 4, prixUnitaire: 950, remisePct: 0 },
      { id: "l102-2", designation: "Rapport détaillé et restitution sur site", quantite: 1, prixUnitaire: 800, remisePct: 0 },
    ],
  },
];

const fmtEUR = (n: number) =>
  n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 });

const ligneTotalHT = (l: LigneDevis) => l.quantite * l.prixUnitaire * (1 - l.remisePct / 100);

const totauxDevis = (d: Devis) => {
  const ht = d.lignes.reduce((sum, l) => sum + ligneTotalHT(l), 0);
  const tva = ht * TVA_RATE;
  return { ht, tva, ttc: ht + tva };
};

export default function DevisFacturationSimulateur() {
  const { showToast } = useToast();
  const [devisList, setDevisList] = useState<Devis[]>(INITIAL_DEVIS);
  const [selectedNumero, setSelectedNumero] = useState<string>("DV-2026-104");

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
      setLigneError("La désignation est obligatoire.");
      return;
    }
    if (quantite == null || quantite <= 0) {
      setLigneError("La quantité doit être supérieure à zéro.");
      return;
    }
    if (prixUnitaire == null || prixUnitaire < 0) {
      setLigneError("Indiquez un prix unitaire (HT) valide.");
      return;
    }
    const remise = remisePct ?? 0;
    if (remise < 0 || remise > 100) {
      setLigneError("La remise doit être comprise entre 0 et 100 %.");
      return;
    }
    setLigneError(null);

    if (editingLineId) {
      updateDevis(selected.numero, (d) => ({
        ...d,
        lignes: d.lignes.map((l) =>
          l.id === editingLineId ? { ...l, designation: des, quantite, prixUnitaire, remisePct: remise } : l
        ),
      }));
      showToast(`Ligne « ${des} » mise à jour.`, "success", 4000, "Ligne modifiée", "Devis & facturation", null);
    } else {
      const ligne: LigneDevis = {
        id: `l${Date.now()}`,
        designation: des,
        quantite,
        prixUnitaire,
        remisePct: remise,
      };
      updateDevis(selected.numero, (d) => ({ ...d, lignes: [...d.lignes, ligne] }));
      showToast(
        `Ligne « ${des} » ajoutée (${fmtEUR(ligneTotalHT(ligne))} HT).`,
        "success",
        4000,
        "Ligne ajoutée",
        "Devis & facturation",
        null
      );
    }
    resetLigneForm();
  };

  const startEditLigne = (l: LigneDevis) => {
    setEditingLineId(l.id);
    setDesignation(l.designation);
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
      `Ligne « ${ligneASupprimer.designation} » supprimée.`,
      "info",
      4000,
      "Ligne supprimée",
      "Devis & facturation",
      null
    );
    setLigneASupprimer(null);
  };

  const handleEnvoyer = () => {
    if (!selected || selected.statut !== "brouillon") return;
    if (selected.lignes.length === 0) {
      showToast(
        "Ajoutez au moins une ligne avant d'envoyer le devis.",
        "warning",
        5000,
        "Devis vide",
        "Devis & facturation",
        null
      );
      return;
    }
    updateDevis(selected.numero, (d) => ({ ...d, statut: "envoye", dateEnvoi: "à l'instant" }));
    showToast(
      `Devis ${selected.numero} envoyé à ${selected.client} (${fmtEUR(totaux.ttc)} TTC).`,
      "success",
      5000,
      "Devis envoyé",
      "Devis & facturation",
      null
    );
  };

  const handleMarquerPaye = () => {
    if (!selected || selected.statut !== "envoye") return;
    updateDevis(selected.numero, (d) => ({ ...d, statut: "paye", datePaiement: "à l'instant" }));
    resetLigneForm();
    showToast(
      `Paiement de ${fmtEUR(totaux.ttc)} enregistré pour ${selected.numero}. Le devis passe en lecture seule.`,
      "success",
      5000,
      "Devis payé",
      "Devis & facturation",
      null
    );
  };

  const handleCreateDevis = () => {
    const client = newClient.trim();
    if (!client) {
      setNewError("Le nom du client est obligatoire.");
      return;
    }
    setNewError(null);
    const numero = `DV-2026-${compteur.current}`;
    compteur.current += 1;
    const devis: Devis = {
      numero,
      client,
      objet: newObjet.trim() || "Nouveau devis",
      statut: "brouillon",
      dateCreation: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
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
    showToast(
      `Devis ${numero} créé pour ${client} (brouillon). Ajoutez des lignes puis envoyez-le.`,
      "success",
      5000,
      "Devis créé",
      "Devis & facturation",
      null
    );
  };

  const listColumns = [
    {
      key: "numero",
      label: "Numéro",
      render: (value: unknown) => (
        <span style={{ fontWeight: selectedNumero === String(value) ? 700 : 500, color: "var(--bpm-text-primary)" }}>
          {String(value)}
        </span>
      ),
    },
    { key: "client", label: "Client" },
    { key: "objet", label: "Objet" },
    {
      key: "ttc",
      label: "Total TTC",
      align: "right" as const,
      render: (value: unknown) => <span style={{ fontVariantNumeric: "tabular-nums" }}>{fmtEUR(Number(value))}</span>,
    },
    {
      key: "statut",
      label: "Statut",
      render: (value: unknown) => (
        <Badge variant={STATUT_VARIANT[value as Statut]}>{STATUT_LABEL[value as Statut]}</Badge>
      ),
    },
  ];

  const listRows = devisList.map((d) => ({
    numero: d.numero,
    client: d.client,
    objet: d.objet,
    ttc: totauxDevis(d).ttc,
    statut: d.statut,
  }));

  const ligneColumns = [
    { key: "designation", label: "Désignation" },
    { key: "quantite", label: "Qté", align: "right" as const },
    {
      key: "prixUnitaire",
      label: "P.U. HT",
      align: "right" as const,
      render: (value: unknown) => fmtEUR(Number(value)),
    },
    {
      key: "remisePct",
      label: "Remise",
      align: "right" as const,
      render: (value: unknown) => (Number(value) > 0 ? `${Number(value)} %` : "—"),
    },
    {
      key: "totalHT",
      label: "Total HT",
      align: "right" as const,
      render: (value: unknown) => <span style={{ fontVariantNumeric: "tabular-nums" }}>{fmtEUR(Number(value))}</span>,
    },
    {
      key: "id",
      label: "Actions",
      render: (_: unknown, row: Record<string, unknown>) => {
        const ligne = (selected?.lignes ?? []).find((l) => l.id === row.id);
        if (!ligne) return null;
        return (
          <div className="flex gap-2">
            <Button
              size="small"
              variant="secondary"
              disabled={readOnly}
              aria-label={`Modifier la ligne ${ligne.designation}`}
              onClick={() => startEditLigne(ligne)}
            >
              ✎ Modifier
            </Button>
            <Button
              size="small"
              variant="destructive"
              disabled={readOnly}
              onClick={() => setLigneASupprimer(ligne)}
            >
              Supprimer
            </Button>
          </div>
        );
      },
    },
  ];

  const ligneRows = (selected?.lignes ?? []).map((l) => ({
    id: l.id,
    designation: l.designation,
    quantite: l.quantite,
    prixUnitaire: l.prixUnitaire,
    remisePct: l.remisePct,
    totalHT: ligneTotalHT(l),
  }));

  const previewColumns = [
    { key: "designation", label: "Désignation" },
    { key: "quantite", label: "Qté", align: "right" as const },
    { key: "prixUnitaire", label: "P.U. HT", align: "right" as const, render: (v: unknown) => fmtEUR(Number(v)) },
    { key: "remisePct", label: "Remise", align: "right" as const, render: (v: unknown) => (Number(v) > 0 ? `${Number(v)} %` : "—") },
    { key: "totalHT", label: "Total HT", align: "right" as const, render: (v: unknown) => fmtEUR(Number(v)) },
  ];

  return (
    <div className="space-y-6">
      <MetricRow>
        <Metric label="Devis en cours" value={String(stats.enCours)} />
        <Metric label="Montant TTC en attente" value={fmtEUR(stats.enAttente)} />
        <Metric label="Encaissé" value={fmtEUR(stats.encaisse)} />
      </MetricRow>

      <Panel variant="info" title="Devis">
        <div className="mb-3 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm m-0" style={{ color: "var(--bpm-text-secondary)" }}>
            Cliquez sur une ligne pour ouvrir le devis dans l&apos;éditeur ci-dessous.
          </p>
          <Button variant="primary" onClick={() => { setNewError(null); setNewOpen(true); }}>
            Nouveau devis
          </Button>
        </div>
        <Table
          columns={listColumns}
          data={listRows as unknown as Record<string, unknown>[]}
          striped
          hover
          onRowClick={(row) => handleSelect(String(row.numero))}
        />
      </Panel>

      {selected && (
        <Panel variant="info" title={`Éditeur — ${selected.numero} · ${selected.objet}`}>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge variant={STATUT_VARIANT[selected.statut]}>{STATUT_LABEL[selected.statut]}</Badge>
            <span className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
              {selected.client} · créé le {selected.dateCreation}
              {selected.dateEnvoi ? ` · envoyé ${selected.dateEnvoi}` : ""}
              {selected.datePaiement ? ` · payé ${selected.datePaiement}` : ""}
            </span>
            <span className="flex-1" />
            {selected.statut === "brouillon" && (
              <Button variant="primary" onClick={handleEnvoyer}>
                Envoyer au client
              </Button>
            )}
            {selected.statut === "envoye" && (
              <Button variant="primary" onClick={handleMarquerPaye}>
                Marquer payé
              </Button>
            )}
            <Button variant="outline" onClick={() => setPreviewOpen(true)}>
              Aperçu / Imprimer
            </Button>
          </div>

          {readOnly && (
            <p
              className="text-sm mb-3 rounded px-3 py-2"
              style={{ color: "var(--bpm-text-secondary)", background: "var(--bpm-bg-secondary)" }}
            >
              Devis payé le {selected.datePaiement} : document verrouillé, les lignes ne sont plus modifiables
              (lecture seule). Créez un nouveau devis pour une prestation complémentaire.
            </p>
          )}

          <Table
            columns={ligneColumns}
            data={ligneRows as unknown as Record<string, unknown>[]}
            striped
            hover
            emptyMessage="Aucune ligne — ajoutez la première prestation ci-dessous."
          />

          <div className="mt-4 ml-auto" style={{ maxWidth: 280 }}>
            <div className="flex justify-between text-sm py-1" style={{ color: "var(--bpm-text-secondary)" }}>
              <span>Total HT</span>
              <span style={{ fontVariantNumeric: "tabular-nums" }}>{fmtEUR(totaux.ht)}</span>
            </div>
            <div className="flex justify-between text-sm py-1" style={{ color: "var(--bpm-text-secondary)" }}>
              <span>TVA 20 %</span>
              <span style={{ fontVariantNumeric: "tabular-nums" }}>{fmtEUR(totaux.tva)}</span>
            </div>
            <div
              className="flex justify-between py-2 font-semibold"
              style={{ color: "var(--bpm-text-primary)", borderTop: "2px solid var(--bpm-accent)" }}
            >
              <span>Total TTC</span>
              <span style={{ fontVariantNumeric: "tabular-nums" }}>{fmtEUR(totaux.ttc)}</span>
            </div>
          </div>

          <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--bpm-border)" }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--bpm-text-primary)" }}>
              {editingLineId ? "Modifier la ligne" : "Ajouter une ligne"}
            </h3>
            <div className="grid gap-3 md:grid-cols-4">
              <Input
                label="Désignation"
                placeholder="Ex. Atelier de cadrage (jour)"
                value={designation}
                onChange={setDesignation}
                disabled={readOnly}
              />
              <NumberInput label="Quantité" value={quantite} onChange={setQuantite} min={0} step={1} disabled={readOnly} />
              <NumberInput
                label="P.U. HT (€)"
                value={prixUnitaire}
                onChange={setPrixUnitaire}
                min={0}
                step={10}
                disabled={readOnly}
                placeholder="0,00"
              />
              <NumberInput
                label="Remise (%)"
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
                {editingLineId ? "Enregistrer la ligne" : "Ajouter la ligne"}
              </Button>
              {editingLineId && (
                <Button variant="ghost" onClick={resetLigneForm}>
                  Annuler la modification
                </Button>
              )}
            </div>
            {readOnly && (
              <p className="mt-2 text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
                Édition désactivée : un devis payé ne peut plus être modifié.
              </p>
            )}
          </div>
        </Panel>
      )}

      {previewOpen && selected && (
        <Modal isOpen onClose={() => setPreviewOpen(false)} title={`Aperçu — ${selected.numero}`} size="large">
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
                <h2 className="text-xl font-bold m-0">Devis {selected.numero}</h2>
                <p className="text-sm m-0 mt-1" style={{ color: "var(--bpm-text-secondary)" }}>
                  {selected.objet}
                </p>
                <p className="text-sm m-0" style={{ color: "var(--bpm-text-secondary)" }}>
                  Émis le {selected.dateCreation} · Validité 30 jours
                </p>
              </div>
              <div className="text-right text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
                <strong style={{ color: "var(--bpm-text-primary)" }}>{SOCIETE.nom}</strong>
                <div>{SOCIETE.adresse}</div>
                <div>{SOCIETE.siret}</div>
              </div>
            </div>
            <p className="text-sm mb-4">
              <strong>Client :</strong> {selected.client}
            </p>
            <Table columns={previewColumns} data={ligneRows as unknown as Record<string, unknown>[]} striped />
            <div className="mt-4 ml-auto" style={{ maxWidth: 260 }}>
              <div className="flex justify-between text-sm py-1" style={{ color: "var(--bpm-text-secondary)" }}>
                <span>Total HT</span>
                <span>{fmtEUR(totaux.ht)}</span>
              </div>
              <div className="flex justify-between text-sm py-1" style={{ color: "var(--bpm-text-secondary)" }}>
                <span>TVA 20 %</span>
                <span>{fmtEUR(totaux.tva)}</span>
              </div>
              <div
                className="flex justify-between py-2 font-semibold"
                style={{ borderTop: "2px solid var(--bpm-accent)" }}
              >
                <span>Total TTC</span>
                <span>{fmtEUR(totaux.ttc)}</span>
              </div>
            </div>
            <p className="mt-6 text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
              Conditions : acompte de 30 % à la commande, solde à la livraison. TVA 20 % — paiement à 30 jours.
            </p>
          </div>
          <div className="devis-no-print mt-5 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setPreviewOpen(false)}>
              Fermer
            </Button>
            <Button variant="primary" onClick={() => window.print()}>
              Imprimer
            </Button>
          </div>
        </Modal>
      )}

      {newOpen && (
        <Modal isOpen onClose={() => setNewOpen(false)} title="Nouveau devis" size="small">
          <p className="text-sm mb-3" style={{ color: "var(--bpm-text-secondary)" }}>
            Le numéro DV-2026-{compteur.current} sera attribué automatiquement (brouillon).
          </p>
          <div className="space-y-3">
            <Input label="Client (obligatoire)" placeholder="Ex. Initech SARL" value={newClient} onChange={setNewClient} />
            <Input label="Objet" placeholder="Ex. Application mobile interne" value={newObjet} onChange={setNewObjet} />
          </div>
          {newError && (
            <p className="mt-2 text-sm" style={{ color: "var(--bpm-error, #dc2626)" }}>
              {newError}
            </p>
          )}
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setNewOpen(false)}>
              Annuler
            </Button>
            <Button variant="primary" onClick={handleCreateDevis}>
              Créer le devis
            </Button>
          </div>
        </Modal>
      )}

      <ConfirmModal
        isOpen={ligneASupprimer !== null}
        title="Supprimer la ligne"
        message={
          ligneASupprimer
            ? `« ${ligneASupprimer.designation} » (${fmtEUR(ligneTotalHT(ligneASupprimer))} HT) sera retirée du devis. Les totaux seront recalculés.`
            : ""
        }
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        onConfirm={confirmDeleteLigne}
        onCancel={() => setLigneASupprimer(null)}
      />
    </div>
  );
}
