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

interface Ressource {
  id: string;
  nom: string;
  capacite: number;
  equipements: string[];
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
  titre: string;
  organisateur: string;
  participants?: number;
  /** true si la réservation a été faite par « Vous ». */
  mienne: boolean;
}

const RESSOURCES: Ressource[] = [
  { id: "hugo", nom: "Salle Hugo", capacite: 8, equipements: ["Écran", "Visio"] },
  { id: "colette", nom: "Salle Colette", capacite: 4, equipements: ["Tableau blanc"] },
  { id: "rimbaud", nom: "Box Rimbaud", capacite: 2, equipements: ["Téléphone"] },
];

const JOURS = ["Lundi 15", "Mardi 16", "Mercredi 17", "Jeudi 18", "Vendredi 19"];
/** Créneaux d'1 h de 09:00 à 18:00 (9 créneaux par jour). */
const HEURES = [9, 10, 11, 12, 13, 14, 15, 16, 17];
const CRENEAUX_PAR_SALLE = JOURS.length * HEURES.length; // 45

const DUREE_OPTIONS = [
  { value: "1", label: "1 heure" },
  { value: "2", label: "2 heures" },
];

function heureLabel(h: number): string {
  return `${String(h).padStart(2, "0")}:00`;
}

function plageLabel(heure: number, duree: number): string {
  return `${heureLabel(heure)} – ${heureLabel(heure + duree)}`;
}

/** Jeu de démonstration déterministe : 11 réservations réparties sur les 3 salles. */
const INITIAL_RESERVATIONS: Reservation[] = [
  // Salle Hugo
  { id: "rsv-1", ressourceId: "hugo", jour: 0, heure: 9, duree: 2, titre: "Comité de direction", organisateur: "Claire Morel", participants: 7, mienne: false },
  { id: "rsv-2", ressourceId: "hugo", jour: 1, heure: 14, duree: 1, titre: "Revue de sprint", organisateur: "Karim Benali", participants: 6, mienne: false },
  { id: "rsv-3", ressourceId: "hugo", jour: 2, heure: 10, duree: 1, titre: "Présentation client Nexa", organisateur: "Sophie Lambert", participants: 8, mienne: false },
  { id: "rsv-4", ressourceId: "hugo", jour: 3, heure: 16, duree: 1, titre: "Formation outils internes", organisateur: "Hugo Mercier", participants: 5, mienne: false },
  // Salle Colette
  { id: "rsv-5", ressourceId: "colette", jour: 0, heure: 11, duree: 1, titre: "Point hebdo marketing", organisateur: "Inès Rousseau", participants: 4, mienne: false },
  { id: "rsv-6", ressourceId: "colette", jour: 1, heure: 9, duree: 1, titre: "Entretien candidat dev", organisateur: "Karim Benali", participants: 3, mienne: false },
  { id: "rsv-7", ressourceId: "colette", jour: 2, heure: 15, duree: 2, titre: "Atelier roadmap produit", organisateur: "Claire Morel", participants: 4, mienne: false },
  { id: "rsv-8", ressourceId: "colette", jour: 4, heure: 10, duree: 1, titre: "Brief campagne T3", organisateur: "Vous", participants: 3, mienne: true },
  // Box Rimbaud
  { id: "rsv-9", ressourceId: "rimbaud", jour: 0, heure: 14, duree: 1, titre: "Call fournisseur Adexo", organisateur: "Inès Rousseau", participants: 2, mienne: false },
  { id: "rsv-10", ressourceId: "rimbaud", jour: 2, heure: 9, duree: 1, titre: "Point RH confidentiel", organisateur: "Sophie Lambert", participants: 2, mienne: false },
  { id: "rsv-11", ressourceId: "rimbaud", jour: 3, heure: 11, duree: 1, titre: "Visio partenaire Berlin", organisateur: "Hugo Mercier", participants: 2, mienne: false },
];

export default function ReservationCreneauxSimulateur() {
  const { showToast } = useToast();
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);
  const [ressourceId, setRessourceId] = useState<string>("hugo");

  // Modal de réservation (case libre cliquée)
  const [slotCible, setSlotCible] = useState<{ jour: number; heure: number } | null>(null);
  const [titre, setTitre] = useState("");
  const [organisateur, setOrganisateur] = useState("Vous");
  const [duree, setDuree] = useState<string>("1");
  const [modalError, setModalError] = useState<string | null>(null);

  // Modal lecture seule (case occupée cliquée)
  const [detail, setDetail] = useState<Reservation | null>(null);
  // Annulation (ConfirmModal)
  const [aAnnuler, setAAnnuler] = useState<Reservation | null>(null);

  const ressource = RESSOURCES.find((r) => r.id === ressourceId) ?? RESSOURCES[0];

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
    const topNom = RESSOURCES.find((r) => r.id === topId)?.nom ?? "—";
    return { totalSemaine, taux, topNom, topCount: Math.max(topCount, 0) };
  }, [reservations, ressourceId]);

  const mesReservations = useMemo(
    () =>
      [...reservations]
        .filter((r) => r.mienne)
        .sort((a, b) => a.jour - b.jour || a.heure - b.heure),
    [reservations]
  );

  const ouvrirReservation = (jour: number, heure: number) => {
    setTitre("");
    setOrganisateur("Vous");
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
      setModalError("Le titre de la réunion est requis.");
      return;
    }
    const dureeH = parseInt(duree, 10) || 1;
    if (dureeH === 2) {
      const heureSuivante = slotCible.heure + 1;
      if (heureSuivante > 17) {
        setModalError("Impossible de réserver 2 h : le créneau suivant est en dehors du planning (09:00–18:00).");
        return;
      }
      if (occupation.has(`${slotCible.jour}-${heureSuivante}`)) {
        setModalError(`Impossible de réserver 2 h : le créneau ${plageLabel(heureSuivante, 1)} est déjà occupé. Choisissez 1 heure ou un autre créneau.`);
        return;
      }
    }
    const nouvelle: Reservation = {
      id: `rsv-${Date.now()}`,
      ressourceId: ressource.id,
      jour: slotCible.jour,
      heure: slotCible.heure,
      duree: dureeH,
      titre: titre.trim(),
      organisateur: organisateur.trim() || "Vous",
      mienne: true,
    };
    setReservations((prev) => [...prev, nouvelle]);
    setSlotCible(null);
    setModalError(null);
    showToast(
      `${ressource.nom} réservée le ${JOURS[nouvelle.jour].toLowerCase()} juin, ${plageLabel(nouvelle.heure, nouvelle.duree)} — « ${nouvelle.titre} ».`,
      "success",
      5000,
      "Réservation confirmée",
      "Réservation de créneaux",
      null
    );
  };

  const confirmerAnnulation = () => {
    if (!aAnnuler) return;
    const salle = RESSOURCES.find((r) => r.id === aAnnuler.ressourceId)?.nom ?? "Salle";
    setReservations((prev) => prev.filter((r) => r.id !== aAnnuler.id));
    showToast(
      `« ${aAnnuler.titre} » (${salle}, ${JOURS[aAnnuler.jour].toLowerCase()} juin, ${plageLabel(aAnnuler.heure, aAnnuler.duree)}) a été annulée. Le créneau est de nouveau libre.`,
      "info",
      5000,
      "Réservation annulée",
      "Réservation de créneaux",
      null
    );
    setAAnnuler(null);
  };

  return (
    <div className="space-y-6">
      <MetricRow>
        <Metric label="Réservations cette semaine" value={String(stats.totalSemaine)} />
        <Metric label={`Taux d'occupation — ${ressource.nom}`} value={`${stats.taux} %`} />
        <Metric label="Salle la plus demandée" value={stats.topNom} />
      </MetricRow>

      <Panel variant="info" title="Planning hebdomadaire — Semaine du 15 juin">
        <div className="mb-4 flex flex-wrap items-end gap-4">
          <div className="min-w-[220px]">
            <Selectbox
              label="Ressource"
              options={RESSOURCES.map((r) => ({ value: r.id, label: r.nom }))}
              value={ressourceId}
              onChange={(v) => setRessourceId(v)}
              placeholder="Choisir une salle"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 pb-1">
            <Badge variant="default">{ressource.capacite} places</Badge>
            {ressource.equipements.map((eq) => (
              <Badge key={eq} variant="primary">{eq}</Badge>
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
              Heure
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
                        title={`Réserver ${ressource.nom} — ${JOURS[jour]} juin, ${plageLabel(h, 1)}`}
                        aria-label={`Réserver le créneau ${JOURS[jour]} ${plageLabel(h, 1)}`}
                      >
                        <span
                          className="hidden group-hover:inline text-xs font-medium"
                          style={{ color: "var(--bpm-accent-cyan)" }}
                        >
                          + Réserver
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
                      title={`${rsv.titre} — ${rsv.organisateur}${rsv.participants ? ` (${rsv.participants} participants)` : ""}`}
                      aria-label={`Détail de la réservation ${rsv.titre}`}
                    >
                      {estDebut ? (
                        <>
                          <span className="block text-xs font-medium truncate" style={{ color: "var(--bpm-text-primary)" }}>
                            {rsv.titre}
                          </span>
                          <span className="block text-[11px] truncate" style={{ color: "var(--bpm-text-secondary)" }}>
                            {rsv.mienne ? "À vous" : rsv.organisateur}
                            {rsv.duree > 1 ? ` · ${rsv.duree} h` : ""}
                          </span>
                        </>
                      ) : (
                        <span className="block text-[11px] italic truncate" style={{ color: "var(--bpm-text-secondary)" }}>
                          (suite)
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
            Libre (cliquer pour réserver)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "rgba(0,163,226,0.4)" }} />
            Occupé
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "rgba(39,174,96,0.5)" }} />
            Vos réservations
          </span>
        </div>
      </Panel>

      <Panel variant="info" title="Mes réservations">
        {mesReservations.length === 0 ? (
          <p className="text-sm m-0" style={{ color: "var(--bpm-text-secondary)" }}>
            Aucune réservation à votre nom cette semaine. Cliquez sur une case libre du planning pour en créer une.
          </p>
        ) : (
          <ul className="m-0 p-0 list-none space-y-2">
            {mesReservations.map((r) => {
              const salle = RESSOURCES.find((x) => x.id === r.ressourceId)?.nom ?? "Salle";
              return (
                <li
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2"
                  style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: "var(--bpm-text-primary)" }}>
                      {r.titre}
                    </div>
                    <div className="text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
                      {salle} · {JOURS[r.jour]} juin · {plageLabel(r.heure, r.duree)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="success">À vous</Badge>
                    <Button size="small" variant="destructive" onClick={() => setAAnnuler(r)}>
                      Annuler
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
        title="Réserver un créneau"
        size="small"
      >
        {slotCible && (
          <div className="space-y-3">
            <div
              className="rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)", color: "var(--bpm-text-primary)" }}
            >
              <div className="font-medium">{ressource.nom}</div>
              <div className="text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
                {JOURS[slotCible.jour]} juin · à partir de {heureLabel(slotCible.heure)} · {ressource.capacite} places ·{" "}
                {ressource.equipements.join(", ")}
              </div>
            </div>
            <Input
              label="Titre de la réunion"
              value={titre}
              onChange={setTitre}
              placeholder="Ex. : Point projet hebdomadaire"
              required
            />
            <Input
              label="Organisateur"
              value={organisateur}
              onChange={setOrganisateur}
              placeholder="Vous"
            />
            <Selectbox
              label="Durée"
              options={DUREE_OPTIONS}
              value={duree}
              onChange={(v) => {
                setDuree(v);
                setModalError(null);
              }}
              placeholder="Durée"
            />
            {duree === "2" && (
              <p className="m-0 text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
                Créneau demandé : {plageLabel(slotCible.heure, 2)} (le créneau suivant doit être libre).
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
                {modalError}
              </p>
            )}
            <div className="flex gap-2 pt-1">
              <Button variant="primary" onClick={confirmerReservation}>
                Confirmer la réservation
              </Button>
              <Button variant="secondary" onClick={fermerReservation}>
                Annuler
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal lecture seule — détail d'une réservation existante */}
      <Modal
        isOpen={detail !== null}
        onClose={() => setDetail(null)}
        title={detail?.titre}
        size="small"
      >
        {detail && (
          <div className="space-y-2 text-sm" style={{ color: "var(--bpm-text-primary)" }}>
            <p className="m-0">
              <strong>Salle :</strong> {RESSOURCES.find((r) => r.id === detail.ressourceId)?.nom ?? "—"}
            </p>
            <p className="m-0">
              <strong>Créneau :</strong> {JOURS[detail.jour]} juin · {plageLabel(detail.heure, detail.duree)}
            </p>
            <p className="m-0">
              <strong>Organisateur :</strong> {detail.organisateur}{" "}
              {detail.mienne && <Badge variant="success">À vous</Badge>}
            </p>
            {detail.participants !== undefined && (
              <p className="m-0">
                <strong>Participants :</strong> {detail.participants}
              </p>
            )}
            {!detail.mienne && (
              <p className="m-0 text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
                Réservation faite par un autre collaborateur — consultation seule.
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
                  Annuler la réservation
                </Button>
              )}
              <Button size="small" variant="secondary" onClick={() => setDetail(null)}>
                Fermer
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation d'annulation */}
      <ConfirmModal
        isOpen={aAnnuler !== null}
        title="Annuler la réservation"
        message={
          aAnnuler
            ? `« ${aAnnuler.titre} » (${RESSOURCES.find((r) => r.id === aAnnuler.ressourceId)?.nom ?? "Salle"}, ${JOURS[aAnnuler.jour]} juin, ${plageLabel(aAnnuler.heure, aAnnuler.duree)}) sera annulée et le créneau redeviendra libre.`
            : ""
        }
        confirmLabel="Annuler la réservation"
        cancelLabel="Conserver"
        variant="danger"
        onConfirm={confirmerAnnulation}
        onCancel={() => setAAnnuler(null)}
      />
    </div>
  );
}
