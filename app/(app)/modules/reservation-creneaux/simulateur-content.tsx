"use client";

import { useMemo, useState } from "react";
import {
  Badge,
  Button,
  ConfirmModal,
  Input,
  Metric,
  MetricRow,
  Modal,
  Panel,
  Selectbox,
  useToast,
} from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR, type LocalizedText } from "./strings";

interface Ressource {
  id: string;
  nom: LocalizedText;
  capacite: number;
  equipements: LocalizedText[];
}

interface Reservation {
  id: string;
  ressourceId: string;
  /** Index du jour : 0 = Lundi 15 … 4 = Vendredi 19. */
  jour: number;
  /** Heure de début (9 → créneau 09:00–10:00, … 17 → 17:00–18:00). */
  heure: number;
  /** Durée en heures (1 ou 2). */
  duree: number;
  /** Titre bilingue (les créations de l'utilisateur portent le même texte dans les deux langues). */
  titre: LocalizedText;
  /** Nom propre de l'organisateur ; chaîne vide = l'utilisateur courant (affiché « Vous » / "You"). */
  organisateur: string;
  participants?: number;
  /** true si la réservation appartient à l'utilisateur courant. */
  mienne: boolean;
}

const EQUIPEMENTS = {
  ecran: { fr: "Écran", en: "Screen" },
  visio: { fr: "Visio", en: "Video" },
  tableauBlanc: { fr: "Tableau blanc", en: "Whiteboard" },
  telephone: { fr: "Téléphone", en: "Phone" },
} satisfies Record<string, LocalizedText>;

const RESSOURCES: Ressource[] = [
  {
    id: "hugo",
    nom: { fr: "Salle Hugo", en: "Hugo Room" },
    capacite: 8,
    equipements: [EQUIPEMENTS.ecran, EQUIPEMENTS.visio],
  },
  {
    id: "colette",
    nom: { fr: "Salle Colette", en: "Colette Room" },
    capacite: 4,
    equipements: [EQUIPEMENTS.tableauBlanc],
  },
  {
    id: "rimbaud",
    nom: { fr: "Box Rimbaud", en: "Rimbaud Booth" },
    capacite: 2,
    equipements: [EQUIPEMENTS.telephone],
  },
];

const NB_JOURS = 5; // Lun→Ven / Mon→Fri
/** Créneaux d'1 h de 09:00 à 18:00 (9 créneaux par jour). */
const HEURES = [9, 10, 11, 12, 13, 14, 15, 16, 17];
const CRENEAUX_PAR_SALLE = NB_JOURS * HEURES.length; // 45

function heureLabel(h: number): string {
  return `${String(h).padStart(2, "0")}:00`;
}

function plageLabel(heure: number, duree: number): string {
  return `${heureLabel(heure)} – ${heureLabel(heure + duree)}`;
}

/** Jeu de démonstration déterministe : 11 réservations réparties sur les 3 salles. */
const INITIAL_RESERVATIONS: Reservation[] = [
  // Salle Hugo
  { id: "rsv-1", ressourceId: "hugo", jour: 0, heure: 9, duree: 2, titre: { fr: "Comité de direction", en: "Executive committee" }, organisateur: "Claire Morel", participants: 7, mienne: false },
  { id: "rsv-2", ressourceId: "hugo", jour: 1, heure: 14, duree: 1, titre: { fr: "Revue de sprint", en: "Sprint review" }, organisateur: "Karim Benali", participants: 6, mienne: false },
  { id: "rsv-3", ressourceId: "hugo", jour: 2, heure: 10, duree: 1, titre: { fr: "Présentation client Nexa", en: "Nexa client presentation" }, organisateur: "Sophie Lambert", participants: 8, mienne: false },
  { id: "rsv-4", ressourceId: "hugo", jour: 3, heure: 16, duree: 1, titre: { fr: "Formation outils internes", en: "Internal tools training" }, organisateur: "Hugo Mercier", participants: 5, mienne: false },
  // Salle Colette
  { id: "rsv-5", ressourceId: "colette", jour: 0, heure: 11, duree: 1, titre: { fr: "Point hebdo marketing", en: "Weekly marketing check-in" }, organisateur: "Inès Rousseau", participants: 4, mienne: false },
  { id: "rsv-6", ressourceId: "colette", jour: 1, heure: 9, duree: 1, titre: { fr: "Entretien candidat dev", en: "Dev candidate interview" }, organisateur: "Karim Benali", participants: 3, mienne: false },
  { id: "rsv-7", ressourceId: "colette", jour: 2, heure: 15, duree: 2, titre: { fr: "Atelier roadmap produit", en: "Product roadmap workshop" }, organisateur: "Claire Morel", participants: 4, mienne: false },
  { id: "rsv-8", ressourceId: "colette", jour: 4, heure: 10, duree: 1, titre: { fr: "Brief campagne T3", en: "Q3 campaign brief" }, organisateur: "", participants: 3, mienne: true },
  // Box Rimbaud
  { id: "rsv-9", ressourceId: "rimbaud", jour: 0, heure: 14, duree: 1, titre: { fr: "Call fournisseur Adexo", en: "Adexo supplier call" }, organisateur: "Inès Rousseau", participants: 2, mienne: false },
  { id: "rsv-10", ressourceId: "rimbaud", jour: 2, heure: 9, duree: 1, titre: { fr: "Point RH confidentiel", en: "Confidential HR check-in" }, organisateur: "Sophie Lambert", participants: 2, mienne: false },
  { id: "rsv-11", ressourceId: "rimbaud", jour: 3, heure: 11, duree: 1, titre: { fr: "Visio partenaire Berlin", en: "Berlin partner video call" }, organisateur: "Hugo Mercier", participants: 2, mienne: false },
];

/** Erreur du modal de réservation, stockée structurée pour rester réactive à la langue. */
type ModalError =
  | { type: "titleRequired" }
  | { type: "outOfRange" }
  | { type: "conflict"; range: string };

export default function ReservationCreneauxSimulateur() {
  const { locale } = useI18n();
  const s = STR[locale];
  const { showToast } = useToast();
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);
  const [ressourceId, setRessourceId] = useState<string>("hugo");

  // Modal de réservation (case libre cliquée)
  const [slotCible, setSlotCible] = useState<{ jour: number; heure: number } | null>(null);
  const [titre, setTitre] = useState("");
  const [organisateur, setOrganisateur] = useState(s.you);
  const [duree, setDuree] = useState<string>("1");
  const [modalError, setModalError] = useState<ModalError | null>(null);

  // Modal lecture seule (case occupée cliquée)
  const [detail, setDetail] = useState<Reservation | null>(null);
  // Annulation (ConfirmModal)
  const [aAnnuler, setAAnnuler] = useState<Reservation | null>(null);

  const ressource = RESSOURCES.find((r) => r.id === ressourceId) ?? RESSOURCES[0];

  const JOURS = s.days;
  const DUREE_OPTIONS = [
    { value: "1", label: s.duration1h },
    { value: "2", label: s.duration2h },
  ];

  /** Nom de l'organisateur à afficher (chaîne vide = l'utilisateur courant). */
  const organisateurLabel = (r: Reservation) => r.organisateur || s.you;

  const modalErrorLabel = (e: ModalError): string => {
    switch (e.type) {
      case "titleRequired":
        return s.errTitleRequired;
      case "outOfRange":
        return s.errOutOfRange;
      case "conflict":
        return s.errConflict(e.range);
    }
  };

  /** Carte d'occupation de la salle affichée : "jour-heure" → réservation. */
  const occupation = useMemo(() => {
    const map = new Map<string, Reservation>();
    for (const r of reservations) {
      if (r.ressourceId !== ressourceId) continue;
      for (let h = r.heure; h < r.heure + r.duree; h++) {
        map.set(`${r.jour}-${h}`, r);
      }
    }
    return map;
  }, [reservations, ressourceId]);

  const stats = useMemo(() => {
    const totalSemaine = reservations.length;
    const heuresOccupees = reservations
      .filter((r) => r.ressourceId === ressourceId)
      .reduce((sum, r) => sum + r.duree, 0);
    const taux = Math.round((heuresOccupees / CRENEAUX_PAR_SALLE) * 100);
    const compte = new Map<string, number>();
    for (const r of reservations) compte.set(r.ressourceId, (compte.get(r.ressourceId) ?? 0) + 1);
    let topId = RESSOURCES[0].id;
    let topCount = -1;
    for (const res of RESSOURCES) {
      const c = compte.get(res.id) ?? 0;
      if (c > topCount) {
        topCount = c;
        topId = res.id;
      }
    }
    const topNom = RESSOURCES.find((r) => r.id === topId)?.nom[locale] ?? "—";
    return { totalSemaine, taux, topNom, topCount: Math.max(topCount, 0) };
  }, [reservations, ressourceId, locale]);

  const mesReservations = useMemo(
    () =>
      [...reservations]
        .filter((r) => r.mienne)
        .sort((a, b) => a.jour - b.jour || a.heure - b.heure),
    [reservations]
  );

  const ouvrirReservation = (jour: number, heure: number) => {
    setTitre("");
    setOrganisateur(s.you);
    setDuree("1");
    setModalError(null);
    setSlotCible({ jour, heure });
  };

  const fermerReservation = () => {
    setSlotCible(null);
    setModalError(null);
  };

  const confirmerReservation = () => {
    if (!slotCible) return;
    if (!titre.trim()) {
      setModalError({ type: "titleRequired" });
      return;
    }
    const dureeH = parseInt(duree, 10) || 1;
    if (dureeH === 2) {
      const heureSuivante = slotCible.heure + 1;
      if (heureSuivante > 17) {
        setModalError({ type: "outOfRange" });
        return;
      }
      if (occupation.has(`${slotCible.jour}-${heureSuivante}`)) {
        setModalError({ type: "conflict", range: plageLabel(heureSuivante, 1) });
        return;
      }
    }
    const titreSaisi = titre.trim();
    const orgSaisi = organisateur.trim();
    // « Vous » / "You" (ou champ vide) = l'utilisateur courant → chaîne vide, résolue à l'affichage.
    const estVous = orgSaisi === "" || orgSaisi === STR.fr.you || orgSaisi === STR.en.you;
    const nouvelle: Reservation = {
      id: `rsv-${Date.now()}`,
      ressourceId: ressource.id,
      jour: slotCible.jour,
      heure: slotCible.heure,
      duree: dureeH,
      titre: { fr: titreSaisi, en: titreSaisi },
      organisateur: estVous ? "" : orgSaisi,
      mienne: true,
    };
    setReservations((prev) => [...prev, nouvelle]);
    setSlotCible(null);
    setModalError(null);
    showToast(
      s.toastBookedMsg(ressource.nom[locale], nouvelle.jour, plageLabel(nouvelle.heure, nouvelle.duree), titreSaisi),
      "success",
      5000,
      s.toastBookedTitle,
      s.toastSource,
      null
    );
  };

  const confirmerAnnulation = () => {
    if (!aAnnuler) return;
    const salle = RESSOURCES.find((r) => r.id === aAnnuler.ressourceId)?.nom[locale] ?? s.roomFallback;
    setReservations((prev) => prev.filter((r) => r.id !== aAnnuler.id));
    showToast(
      s.toastCancelledMsg(aAnnuler.titre[locale], salle, aAnnuler.jour, plageLabel(aAnnuler.heure, aAnnuler.duree)),
      "info",
      5000,
      s.toastCancelledTitle,
      s.toastSource,
      null
    );
    setAAnnuler(null);
  };

  return (
    <div className="space-y-6">
      <MetricRow>
        <Metric label={s.metricWeekBookings} value={String(stats.totalSemaine)} />
        <Metric label={s.metricOccupancy(ressource.nom[locale])} value={s.percent(stats.taux)} />
        <Metric label={s.metricTopRoom} value={stats.topNom} />
      </MetricRow>

      <Panel variant="info" title={s.planningTitle}>
        <div className="mb-4 flex flex-wrap items-end gap-4">
          <div className="min-w-[220px]">
            <Selectbox
              label={s.resourceLabel}
              options={RESSOURCES.map((r) => ({ value: r.id, label: r.nom[locale] }))}
              value={ressourceId}
              onChange={(v) => setRessourceId(v)}
              placeholder={s.resourcePlaceholder}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 pb-1">
            <Badge variant="default">{s.seats(ressource.capacite)}</Badge>
            {ressource.equipements.map((eq) => (
              <Badge key={eq.fr} variant="primary">{eq[locale]}</Badge>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <div
            className="grid text-sm"
            style={{
              gridTemplateColumns: "92px repeat(5, minmax(96px, 1fr))",
              minWidth: 600,
              border: "1px solid var(--bpm-border)",
              borderRadius: "var(--bpm-radius)",
              overflow: "hidden",
            }}
          >
            {/* En-tête : coin + jours */}
            <div
              className="px-2 py-2 text-xs font-medium border-b border-r"
              style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)", color: "var(--bpm-text-secondary)" }}
            >
              {s.hourHeader}
            </div>
            {JOURS.map((j, i) => (
              <div
                key={j}
                className={`px-2 py-2 text-center text-xs font-semibold border-b ${i < JOURS.length - 1 ? "border-r" : ""}`}
                style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)", color: "var(--bpm-text-primary)" }}
              >
                {j}
              </div>
            ))}

            {/* Lignes : créneaux horaires */}
            {HEURES.map((h, rowIdx) => {
              const isLastRow = rowIdx === HEURES.length - 1;
              return [
                <div
                  key={`h-${h}`}
                  className={`px-2 py-1 text-xs flex items-center border-r ${!isLastRow ? "border-b" : ""}`}
                  style={{ borderColor: "var(--bpm-border)", color: "var(--bpm-text-secondary)", background: "var(--bpm-bg-secondary)", minHeight: 44 }}
                >
                  {plageLabel(h, 1)}
                </div>,
                ...JOURS.map((_, jour) => {
                  const rsv = occupation.get(`${jour}-${h}`);
                  const borders = `${!isLastRow ? "border-b " : ""}${jour < JOURS.length - 1 ? "border-r" : ""}`;
                  if (!rsv) {
                    return (
                      <button
                        key={`c-${jour}-${h}`}
                        type="button"
                        onClick={() => ouvrirReservation(jour, h)}
                        className={`group relative text-left px-1.5 py-1 transition-colors cursor-pointer ${borders} hover:bg-[rgba(0,163,226,0.12)]`}
                        style={{ borderColor: "var(--bpm-border)", background: "transparent", minHeight: 44 }}
                        title={s.bookSlotTitle(ressource.nom[locale], jour, plageLabel(h, 1))}
                        aria-label={s.bookSlotAria(jour, plageLabel(h, 1))}
                      >
                        <span
                          className="hidden group-hover:inline text-xs font-medium"
                          style={{ color: "var(--bpm-accent-cyan)" }}
                        >
                          {s.bookCta}
                        </span>
                      </button>
                    );
                  }
                  const estDebut = rsv.heure === h;
                  const couleur = rsv.mienne ? "var(--bpm-success, #27ae60)" : "var(--bpm-accent-cyan)";
                  return (
                    <button
                      key={`c-${jour}-${h}`}
                      type="button"
                      onClick={() => setDetail(rsv)}
                      className={`text-left px-1.5 py-1 transition-opacity cursor-pointer hover:opacity-80 ${borders}`}
                      style={{
                        borderColor: "var(--bpm-border)",
                        background: rsv.mienne ? "rgba(39,174,96,0.18)" : "rgba(0,163,226,0.18)",
                        borderLeft: `3px solid ${couleur}`,
                        minHeight: 44,
                      }}
                      title={s.occupiedTooltip(rsv.titre[locale], organisateurLabel(rsv), rsv.participants)}
                      aria-label={s.detailAria(rsv.titre[locale])}
                    >
                      {estDebut ? (
                        <>
                          <span className="block text-xs font-medium truncate" style={{ color: "var(--bpm-text-primary)" }}>
                            {rsv.titre[locale]}
                          </span>
                          <span className="block text-[11px] truncate" style={{ color: "var(--bpm-text-secondary)" }}>
                            {rsv.mienne ? s.yours : organisateurLabel(rsv)}
                            {rsv.duree > 1 ? ` · ${rsv.duree} h` : ""}
                          </span>
                        </>
                      ) : (
                        <span className="block text-[11px] italic truncate" style={{ color: "var(--bpm-text-secondary)" }}>
                          {s.continued}
                        </span>
                      )}
                    </button>
                  );
                }),
              ];
            })}
          </div>
        </div>

        {/* Légende */}
        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm border" style={{ borderColor: "var(--bpm-border)" }} />
            {s.legendFree}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "rgba(0,163,226,0.4)" }} />
            {s.legendBusy}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "rgba(39,174,96,0.5)" }} />
            {s.legendMine}
          </span>
        </div>
      </Panel>

      <Panel variant="info" title={s.myBookingsTitle}>
        {mesReservations.length === 0 ? (
          <p className="text-sm m-0" style={{ color: "var(--bpm-text-secondary)" }}>
            {s.myBookingsEmpty}
          </p>
        ) : (
          <ul className="m-0 p-0 list-none space-y-2">
            {mesReservations.map((r) => {
              const salle = RESSOURCES.find((x) => x.id === r.ressourceId)?.nom[locale] ?? s.roomFallback;
              return (
                <li
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2"
                  style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: "var(--bpm-text-primary)" }}>
                      {r.titre[locale]}
                    </div>
                    <div className="text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
                      {salle} · {s.dayMonth(r.jour)} · {plageLabel(r.heure, r.duree)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="success">{s.yours}</Badge>
                    <Button size="small" variant="destructive" onClick={() => setAAnnuler(r)}>
                      {s.cancel}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      {/* Modal de réservation d'un créneau libre */}
      <Modal
        isOpen={slotCible !== null}
        onClose={fermerReservation}
        title={s.bookModalTitle}
        size="small"
      >
        {slotCible && (
          <div className="space-y-3">
            <div
              className="rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)", color: "var(--bpm-text-primary)" }}
            >
              <div className="font-medium">{ressource.nom[locale]}</div>
              <div className="text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
                {s.dayMonth(slotCible.jour)} · {s.fromHour(heureLabel(slotCible.heure))} · {s.seats(ressource.capacite)} ·{" "}
                {ressource.equipements.map((eq) => eq[locale]).join(", ")}
              </div>
            </div>
            <Input
              label={s.meetingTitleLabel}
              value={titre}
              onChange={setTitre}
              placeholder={s.meetingTitlePlaceholder}
              required
            />
            <Input
              label={s.organizerLabel}
              value={organisateur}
              onChange={setOrganisateur}
              placeholder={s.you}
            />
            <Selectbox
              label={s.durationLabel}
              options={DUREE_OPTIONS}
              value={duree}
              onChange={(v) => {
                setDuree(v);
                setModalError(null);
              }}
              placeholder={s.durationPlaceholder}
            />
            {duree === "2" && (
              <p className="m-0 text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
                {s.twoHourHint(plageLabel(slotCible.heure, 2))}
              </p>
            )}
            {modalError && (
              <p
                className="m-0 rounded-lg border px-3 py-2 text-sm"
                style={{
                  color: "var(--bpm-error, #dc2626)",
                  borderColor: "var(--bpm-error, #dc2626)",
                  background: "rgba(220,38,38,0.08)",
                }}
              >
                {modalErrorLabel(modalError)}
              </p>
            )}
            <div className="flex gap-2 pt-1">
              <Button variant="primary" onClick={confirmerReservation}>
                {s.confirmBooking}
              </Button>
              <Button variant="secondary" onClick={fermerReservation}>
                {s.cancel}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal lecture seule — détail d'une réservation existante */}
      <Modal
        isOpen={detail !== null}
        onClose={() => setDetail(null)}
        title={detail ? detail.titre[locale] : undefined}
        size="small"
      >
        {detail && (
          <div className="space-y-2 text-sm" style={{ color: "var(--bpm-text-primary)" }}>
            <p className="m-0">
              <strong>{s.roomLabel}</strong> {RESSOURCES.find((r) => r.id === detail.ressourceId)?.nom[locale] ?? "—"}
            </p>
            <p className="m-0">
              <strong>{s.slotLabel}</strong> {s.dayMonth(detail.jour)} · {plageLabel(detail.heure, detail.duree)}
            </p>
            <p className="m-0">
              <strong>{s.organizerLabelColon}</strong> {organisateurLabel(detail)}{" "}
              {detail.mienne && <Badge variant="success">{s.yours}</Badge>}
            </p>
            {detail.participants !== undefined && (
              <p className="m-0">
                <strong>{s.participantsLabel}</strong> {detail.participants}
              </p>
            )}
            {!detail.mienne && (
              <p className="m-0 text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
                {s.readOnlyNote}
              </p>
            )}
            <div className="flex gap-2 pt-2">
              {detail.mienne && (
                <Button
                  size="small"
                  variant="destructive"
                  onClick={() => {
                    setAAnnuler(detail);
                    setDetail(null);
                  }}
                >
                  {s.cancelBooking}
                </Button>
              )}
              <Button size="small" variant="secondary" onClick={() => setDetail(null)}>
                {s.close}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation d'annulation */}
      <ConfirmModal
        isOpen={aAnnuler !== null}
        title={s.confirmCancelTitle}
        message={
          aAnnuler
            ? s.confirmCancelMsg(
                aAnnuler.titre[locale],
                RESSOURCES.find((r) => r.id === aAnnuler.ressourceId)?.nom[locale] ?? s.roomFallback,
                aAnnuler.jour,
                plageLabel(aAnnuler.heure, aAnnuler.duree)
              )
            : ""
        }
        confirmLabel={s.cancelBooking}
        cancelLabel={s.keep}
        variant="danger"
        onConfirm={confirmerAnnulation}
        onCancel={() => setAAnnuler(null)}
      />
    </div>
  );
}
