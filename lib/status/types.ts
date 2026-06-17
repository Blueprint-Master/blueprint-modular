/**
 * Types de la page de statut publique (/status).
 * Données 100 % dérivées de la sonde de disponibilité (table `status_check`).
 * Aucune donnée personnelle.
 */

/** Statut courant d'un service ou du système. */
export type StatusLevel = "operational" | "degraded" | "outage";

/** Identifiant interne d'un service surveillé. */
export type ServiceKey = "vitrine" | "mcp";

/** Un jour dans la barre d'uptime 90 jours. */
export interface UptimeDay {
  date: string; // YYYY-MM-DD
  status: StatusLevel | "no_data";
  uptime: number | null; // 0-100, ou null si aucune mesure ce jour-là
}

/** Une ligne de service (barre 90 jours + état courant). */
export interface ServiceRow {
  key: ServiceKey;
  status: StatusLevel | "no_data";
  uptime90: UptimeDay[];
  /** Moyenne d'uptime sur les jours mesurés (null si aucune mesure). */
  uptimePct90: number | null;
  /** Date ISO de la dernière mesure (null si jamais sondé). */
  lastChecked: string | null;
  /** Latence de la dernière mesure réussie (ms), si disponible. */
  latencyMs: number | null;
  /** Nombre de mesures enregistrées aujourd'hui (preuve de collecte active). */
  checksToday: number;
}

/** Incident dérivé de séquences de mesures en échec. */
export interface StatusIncident {
  id: string;
  service: ServiceKey;
  date: string; // ISO (début de l'incident)
  title: string;
  description: string;
  status: "resolved" | "ongoing";
  duration?: string;
}

/** Payload public de la page /status. */
export interface StatusPayload {
  /** Bandeau global : pire état parmi les services ayant des mesures. */
  status: StatusLevel | "no_data";
  services: ServiceRow[];
  incidents: StatusIncident[];
  generatedAt: string;
}
