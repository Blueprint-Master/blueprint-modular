"use client";

import React, { useMemo, useState } from "react";

/**
 * @component bpm.scheduler
 * @description Calendrier/agenda avec vues jour, semaine et mois, gestion d'événements et de ressources.
 * @example
 * bpm.scheduler({ view: "week", events: [{ id: "1", title: "Réunion", start: "2024-01-15T10:00", end: "2024-01-15T11:00" }], onEventClick: handleEvent, onSlotClick: handleSlot })
 *
 * @param {object} props
 * @param {"day"|"week"|"month"} props.view - Vue active. Obligatoire.
 * @param {SchedulerEvent[]} props.events - Liste des événements (id, title, start, end, resourceId?, color?). Obligatoire.
 * @param {SchedulerResource[]} [props.resources] - Ressources associables (id, label). Optionnel.
 * @param {function} props.onEventClick - Callback au clic sur un événement. Obligatoire.
 * @param {function} props.onSlotClick - Callback au clic sur un créneau vide (dayStart, hour). Obligatoire.
 * @param {number} [props.startHour=8] - Première heure affichée. Optionnel.
 * @param {number} [props.endHour=20] - Dernière heure affichée. Optionnel.
 * @param {string} [props.locale] - Locale BCP-47 des dates et des libellés de navigation. Optionnel — défaut : locale du moteur.
 * @param {object} [props.labels] - Surcharge de { prev, today, next }. Optionnel — défaut : dérivé de la locale.
 *
 * @associated bpm.calendar, bpm.timeline
 */
const DAY_MS = 24 * 60 * 60 * 1000;

function parseMs(iso: string): number {
  const t = Date.parse(iso);
  return Number.isNaN(t) ? 0 : t;
}

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function startOfWeekMonday(d: Date): Date {
  const s = startOfLocalDay(d);
  const day = s.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(s, diff);
}

function daysInMonth(y: number, m: number): number {
  return new Date(y, m + 1, 0).getDate();
}

/**
 * LE SEUL COMPOSANT DU CORE QUI PARLAIT ANGLAIS QUOI QU'IL ARRIVE.
 *
 * Deux fautes distinctes vivaient ici, et la seconde rendait la première
 * visible :
 *
 * 1. `Prev` / `Today` / `Next` étaient des littéraux anglais sans échappatoire —
 *    aucune application française n'y coupait ;
 * 2. l'en-tête des jours était un tableau `["Mon", "Tue", …]` FIGÉ, alors que le
 *    titre juste au-dessus passait par `toLocaleDateString`. Le même composant
 *    affichait donc « août 2026 » surmontant « Mon Tue Wed ». Ce n'est pas une
 *    traduction manquante, c'est une INCOHÉRENCE interne — celle que l'œil
 *    attrape en premier.
 *
 * ## Ce qui remplace, et pourquoi pas une table pour tout
 *
 * Les noms de jours ne se traduisent pas à la main : `Intl` les connaît dans
 * toutes les locales. On les DÉRIVE d'une semaine réelle ancrée sur un lundi,
 * avec la même locale que le titre. Les deux ne peuvent plus diverger, puisqu'ils
 * lisent la même source.
 *
 * Restent trois mots qu'aucun `Intl` ne rend — précédent, aujourd'hui, suivant.
 * Eux passent par une table FERMÉE, et c'est ici le bon outil : trois mots, un
 * vocabulaire qui ne bougera pas, et la seule alternative — laisser l'anglais
 * par défaut — est exactement le défaut qu'on corrige.
 *
 * Locale inconnue → anglais, comme avant : aucune application existante ne
 * change de langue sans l'avoir demandé.
 */
const NAV_LABELS: Record<string, { prev: string; today: string; next: string }> = {
  fr: { prev: "Précédent", today: "Aujourd'hui", next: "Suivant" },
  en: { prev: "Prev", today: "Today", next: "Next" },
  es: { prev: "Anterior", today: "Hoy", next: "Siguiente" },
  de: { prev: "Zurück", today: "Heute", next: "Weiter" },
  it: { prev: "Precedente", today: "Oggi", next: "Successivo" },
  pt: { prev: "Anterior", today: "Hoje", next: "Seguinte" },
  nl: { prev: "Vorige", today: "Vandaag", next: "Volgende" },
  ru: { prev: "Назад", today: "Сегодня", next: "Вперёд" },
  zh: { prev: "上一个", today: "今天", next: "下一个" },
};

function navLabelsFor(locale: string | undefined): { prev: string; today: string; next: string } {
  /* `undefined` = locale du moteur, celle-là même que suivent les dates. On la
     RÉSOUT explicitement pour que les boutons suivent le titre au lieu de
     retomber en anglais pendant que le titre, lui, est traduit. */
  let resolved = "en";
  try {
    resolved = new Intl.DateTimeFormat(locale).resolvedOptions().locale;
  } catch {
    /* Environnement sans ICU complet : on garde l'anglais. */
  }
  return NAV_LABELS[resolved.slice(0, 2).toLowerCase()] ?? NAV_LABELS.en!;
}

/** Noms courts des jours, lundi → dimanche, dans la locale demandée. */
function weekdayLabelsFor(locale: string | undefined): string[] {
  try {
    const fmt = new Intl.DateTimeFormat(locale, { weekday: "short" });
    // 2024-01-01 est un LUNDI : l'ancre rend la semaine déterministe.
    return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2024, 0, 1 + i)));
  } catch {
    return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  }
}

export type SchedulerEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  resourceId?: string;
  color?: string;
};

export type SchedulerResource = {
  id: string;
  label: string;
};

/**
 * Les trois mots de la barre de navigation qu'`Intl` ne sait pas rendre.
 *
 * Type NOMMÉ à dessein : le générateur de doc machine (`generate-llms-txt.py`)
 * coupe un type inline au premier `;` et publierait « labels?: { prev?: string »
 * — une forme fausse, enseignée telle quelle au modèle qui lit `llms.txt`.
 */
export type SchedulerNavLabels = {
  prev?: string;
  today?: string;
  next?: string;
};

/**
 * @component bpm.scheduler
 * @description Planificateur / agenda (semaine, jour, mois).
 */
export type SchedulerProps = {
  view: "day" | "week" | "month";
  events: SchedulerEvent[];
  resources?: SchedulerResource[];
  onEventClick: (ev: SchedulerEvent) => void;
  onSlotClick: (dayStart: Date, hour: number) => void;
  startHour?: number;
  endHour?: number;
  /** Locale BCP-47 des dates ET des libellés de navigation. Absente = locale du moteur (comportement historique). */
  locale?: string;
  /** Surcharge des trois mots que `Intl` ne rend pas. Absente = dérivée de `locale`. */
  labels?: SchedulerNavLabels;
};

function resourceLabel(resources: SchedulerResource[] | undefined, id: string | undefined): string | undefined {
  if (!resources || !id) return undefined;
  return resources.find((r) => r.id === id)?.label;
}

/**
 * L'heure d'un événement, ou rien.
 *
 * ABSTENTION plutôt qu'une valeur fausse : une date illisible rend `undefined`
 * et l'infobulle se réduit au titre. Écrire « Invalid Date » au survol serait un
 * affichage qui ment, et une infobulle qui ment est pire que pas d'infobulle.
 *
 * ⚠️ La branche `NaN` est aujourd'hui INATTEIGNABLE par le rendu — le placement
 * filtre déjà sur `en > dayStart && s < dayEnd`, comparaisons toutes fausses
 * avec `NaN`, donc un événement à date cassée n'est posé sur aucun jour. Elle
 * reste ici parce qu'elle couvre aussi le `throw` d'`Intl` sur un moteur sans
 * ICU complet, et parce qu'elle survivrait à un assouplissement du filtre. Le
 * test ne la déclare pas prouvée : il prouve la propriété qui compte pour
 * l'utilisateur, à savoir que ces mots restent absents du balisage rendu.
 */
function eventTimeRange(ev: SchedulerEvent, locale: string | undefined): string | undefined {
  const debut = new Date(ev.start);
  const fin = new Date(ev.end);
  if (Number.isNaN(debut.getTime()) || Number.isNaN(fin.getTime())) return undefined;
  try {
    const fmt = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" });
    return `${fmt.format(debut)} – ${fmt.format(fin)}`;
  } catch {
    /* Environnement sans ICU complet : pas d'heure plutôt qu'une heure fausse. */
    return undefined;
  }
}

/**
 * LE TEXTE ENTIER D'UN ÉVÉNEMENT, pour l'attribut `title`.
 *
 * ## Le fait, mesuré sur la critique vision de la production
 *
 * Cinq constats : « les libellés d'événement sont tronqués sans infobulle ».
 * La cause est dans le rendu, relue telle quelle : la pastille du mois porte
 * `whiteSpace: "nowrap"` + `textOverflow: "ellipsis"` dans une cellule large
 * d'un septième de grille, et celle de la semaine porte une hauteur DÉRIVÉE DE
 * LA DURÉE (`Math.max(18, …)`) avec `overflow: "hidden"` — un rendez-vous d'un
 * quart d'heure fait 18 px et coupe son titre à la première ligne. Dans les deux
 * cas l'information n'était récupérable par aucun chemin.
 *
 * ## Ce qu'on rend, et dans quel ordre
 *
 * `09:00 – 10:00 · Titre · Ressource` — l'heure d'abord, comme le font Outlook
 * et Google Agenda, parce qu'en vue MOIS elle n'est écrite nulle part ailleurs.
 * On transcrit le GESTE de la référence, pas son apparence.
 *
 * ## Ce que l'infobulle ne remplace pas
 *
 * Rien sur un écran tactile, où aucun geste ne la déclenche. C'est assumé : la
 * pastille est un `<button>` qui appelle `onEventClick`, donc le contenu complet
 * y est déjà atteignable en un doigt. L'infobulle rend le survol, le clic rend
 * le reste — les deux publics sont couverts, par deux mécanismes distincts.
 */
function eventTooltip(
  ev: SchedulerEvent,
  resourceName: string | undefined,
  locale: string | undefined,
): string {
  return [eventTimeRange(ev, locale), ev.title, resourceName].filter(Boolean).join(" · ");
}

export function Scheduler({
  view,
  events,
  resources,
  onEventClick,
  onSlotClick,
  startHour = 8,
  endHour = 20,
  locale,
  labels,
}: SchedulerProps) {
  const [anchor, setAnchor] = useState(() => startOfLocalDay(new Date()));
  const nav = useMemo(() => {
    const base = navLabelsFor(locale);
    return {
      prev: labels?.prev ?? base.prev,
      today: labels?.today ?? base.today,
      next: labels?.next ?? base.next,
    };
  }, [locale, labels?.prev, labels?.today, labels?.next]);
  const weekdayLabels = useMemo(() => weekdayLabelsFor(locale), [locale]);
  const hourCount = Math.max(1, endHour - startHour);
  const hourRowPx = 44;
  const headerCellH = 36;

  const hourSlots = useMemo(() => {
    const slots: number[] = [];
    for (let h = startHour; h < endHour; h += 1) slots.push(h);
    return slots;
  }, [startHour, endHour]);

  const visibleDays = useMemo(() => {
    if (view === "day") return [startOfLocalDay(anchor)];
    if (view === "week") {
      const start = startOfWeekMonday(anchor);
      return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    }
    const y = anchor.getFullYear();
    const m = anchor.getMonth();
    const first = new Date(y, m, 1);
    const last = daysInMonth(y, m);
    const startWeekday = (first.getDay() + 6) % 7;
    const cells: Date[] = [];
    const pad = startWeekday;
    for (let i = 0; i < pad; i += 1) {
      cells.push(addDays(first, i - pad));
    }
    for (let d = 1; d <= last; d += 1) {
      cells.push(new Date(y, m, d));
    }
    while (cells.length % 7 !== 0 || cells.length < 42) {
      const lastCell = cells[cells.length - 1];
      cells.push(addDays(lastCell, 1));
    }
    return cells;
  }, [anchor, view]);

  const rangeBounds = useMemo(() => {
    if (view === "month") {
      const y = anchor.getFullYear();
      const m = anchor.getMonth();
      const startMs = new Date(y, m, 1).getTime();
      const lastDay = new Date(y, m + 1, 0);
      const endMs = startOfLocalDay(lastDay).getTime() + DAY_MS;
      return { start: startMs, end: endMs };
    }
    const d0 = visibleDays[0];
    const d1 = visibleDays[visibleDays.length - 1];
    return { start: startOfLocalDay(d0).getTime(), end: startOfLocalDay(d1).getTime() + DAY_MS };
  }, [visibleDays, view, anchor]);

  const eventsForView = useMemo(() => {
    return events.filter((e) => {
      const s = parseMs(e.start);
      const en = parseMs(e.end);
      return en > rangeBounds.start && s < rangeBounds.end;
    });
  }, [events, rangeBounds.start, rangeBounds.end]);

  const goPrev = () => {
    if (view === "day") setAnchor((a) => addDays(a, -1));
    else if (view === "week") setAnchor((a) => addDays(a, -7));
    else setAnchor((a) => new Date(a.getFullYear(), a.getMonth() - 1, 1));
  };

  const goNext = () => {
    if (view === "day") setAnchor((a) => addDays(a, 1));
    else if (view === "week") setAnchor((a) => addDays(a, 7));
    else setAnchor((a) => new Date(a.getFullYear(), a.getMonth() + 1, 1));
  };

  const goToday = () => {
    setAnchor(startOfLocalDay(new Date()));
  };

  const titleText = useMemo(() => {
    if (view === "day") {
      return anchor.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    }
    if (view === "week") {
      const s = startOfWeekMonday(anchor);
      const e = addDays(s, 6);
      return `${s.toLocaleDateString(locale, { day: "numeric", month: "short" })} – ${e.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })}`;
    }
    return anchor.toLocaleDateString(locale, { month: "long", year: "numeric" });
  }, [anchor, view]);

  const btnStyle: React.CSSProperties = {
    padding: "6px 12px",
    fontSize: 12,
    borderRadius: "var(--bpm-radius-sm)",
    border: "1px solid var(--bpm-border)",
    background: "var(--bpm-surface)",
    color: "var(--bpm-text-primary)",
    cursor: "pointer",
  };

  if (view === "month") {
    return (
      <div
        style={{
          border: "1px solid var(--bpm-border)",
          borderRadius: "var(--bpm-radius)",
          background: "var(--bpm-surface)",
          color: "var(--bpm-text-primary)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            padding: 10,
            borderBottom: "1px solid var(--bpm-border)",
            background: "var(--bpm-bg-secondary, var(--bpm-surface))",
          }}
        >
          <div style={{ display: "flex", gap: 6 }}>
            <button type="button" style={btnStyle} onClick={goPrev}>
              {nav.prev}
            </button>
            <button type="button" style={btnStyle} onClick={goToday}>
              {nav.today}
            </button>
            <button type="button" style={btnStyle} onClick={goNext}>
              {nav.next}
            </button>
          </div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{titleText}</div>
          <div style={{ width: 120 }} />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
            gap: 0,
            borderBottom: "1px solid var(--bpm-border)",
          }}
        >
          {weekdayLabels.map((w) => (
            <div
              key={w}
              style={{
                textAlign: "center",
                fontSize: 11,
                fontWeight: 600,
                color: "var(--bpm-text-secondary)",
                padding: 8,
                borderRight: "1px solid var(--bpm-border)",
              }}
            >
              {w}
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}>
          {visibleDays.map((day, idx) => {
            const inMonth = day.getMonth() === anchor.getMonth();
            const dayStart = startOfLocalDay(day).getTime();
            const dayEnd = dayStart + DAY_MS;
            const dayEvents = eventsForView.filter((e) => {
              const s = parseMs(e.start);
              const en = parseMs(e.end);
              return en > dayStart && s < dayEnd;
            });
            return (
              <div
                key={`${dayStart}-${idx}`}
                style={{
                  minHeight: 96,
                  borderRight: "1px solid var(--bpm-border)",
                  borderBottom: "1px solid var(--bpm-border)",
                  padding: 6,
                  background: inMonth ? "var(--bpm-surface)" : "color-mix(in srgb, var(--bpm-border) 12%, var(--bpm-surface))",
                  cursor: "pointer",
                }}
                role="button"
                tabIndex={0}
                onClick={() => onSlotClick(startOfLocalDay(day), startHour)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSlotClick(startOfLocalDay(day), startHour);
                  }
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: inMonth ? 600 : 400,
                    color: inMonth ? "var(--bpm-text-primary)" : "var(--bpm-text-secondary)",
                    marginBottom: 6,
                  }}
                >
                  {day.getDate()}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {dayEvents.map((ev) => {
                    const rl = resourceLabel(resources, ev.resourceId);
                    const chipBg = ev.color ?? "color-mix(in srgb, var(--bpm-accent) 22%, var(--bpm-surface))";
                    return (
                      <button
                        key={ev.id}
                        type="button"
                        /* Le texte entier au survol : la pastille tient dans un
                           septième de grille et coupe à l'ellipse. */
                        title={eventTooltip(ev, rl, locale)}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(ev);
                        }}
                        style={{
                          textAlign: "left",
                          fontSize: 10,
                          padding: "4px 6px",
                          borderRadius: "var(--bpm-radius-sm)",
                          border: "1px solid var(--bpm-border)",
                          background: chipBg,
                          color: "var(--bpm-text-primary)",
                          cursor: "pointer",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {ev.title}
                        {rl ? ` · ${rl}` : ""}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const colCount = view === "week" ? 7 : 1;
  const gridMinHeight = headerCellH + hourCount * hourRowPx;

  return (
    <div
      style={{
        border: "1px solid var(--bpm-border)",
        borderRadius: "var(--bpm-radius)",
        background: "var(--bpm-surface)",
        color: "var(--bpm-text-primary)",
        overflow: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          padding: 10,
          borderBottom: "1px solid var(--bpm-border)",
          background: "var(--bpm-bg-secondary, var(--bpm-surface))",
        }}
      >
        <div style={{ display: "flex", gap: 6 }}>
          <button type="button" style={btnStyle} onClick={goPrev}>
            {nav.prev}
          </button>
          <button type="button" style={btnStyle} onClick={goToday}>
            {nav.today}
          </button>
          <button type="button" style={btnStyle} onClick={goNext}>
            {nav.next}
          </button>
        </div>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{titleText}</div>
        <div style={{ width: 120 }} />
      </div>

      <div style={{ display: "flex", minWidth: colCount * 120, minHeight: gridMinHeight }}>
        <div style={{ width: 48, flexShrink: 0, borderRight: "1px solid var(--bpm-border)" }}>
          <div style={{ height: headerCellH, borderBottom: "1px solid var(--bpm-border)" }} />
          {hourSlots.map((h) => (
            <div
              key={h}
              style={{
                height: hourRowPx,
                fontSize: 10,
                color: "var(--bpm-text-secondary)",
                paddingRight: 6,
                textAlign: "right",
                borderBottom: "1px solid var(--bpm-border)",
                boxSizing: "border-box",
              }}
            >
              {`${h}:00`}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flex: 1, position: "relative" }}>
          {visibleDays.map((day, colIdx) => {
            const dayStart = startOfLocalDay(day).getTime();
            const dayEnd = dayStart + DAY_MS;
            return (
              <div
                key={`${dayStart}-${colIdx}`}
                style={{
                  flex: 1,
                  minWidth: 0,
                  borderRight: colIdx < visibleDays.length - 1 ? "1px solid var(--bpm-border)" : undefined,
                  position: "relative",
                }}
              >
                <div
                  style={{
                    height: headerCellH,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--bpm-text-secondary)",
                    borderBottom: "1px solid var(--bpm-border)",
                  }}
                >
                  {view === "week"
                    ? `${weekdayLabels[(day.getDay() + 6) % 7]} ${day.getDate()}`
                    : day.toLocaleDateString(locale, { weekday: "short", day: "numeric" })}
                </div>
                <div style={{ position: "relative", height: hourCount * hourRowPx }}>
                  {hourSlots.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => onSlotClick(startOfLocalDay(day), h)}
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: (h - startHour) * hourRowPx,
                        height: hourRowPx,
                        border: "none",
                        borderBottom: "1px solid var(--bpm-border)",
                        background: "transparent",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    />
                  ))}
                  {eventsForView
                    .filter((ev) => {
                      const s = parseMs(ev.start);
                      return s >= dayStart && s < dayEnd;
                    })
                    .map((ev) => {
                      const s = parseMs(ev.start);
                      const en = parseMs(ev.end);
                      const startD = new Date(s);
                      const minsFromStart = (startD.getHours() * 60 + startD.getMinutes() - startHour * 60) / 60;
                      const durH = Math.max(0.25, (en - s) / (60 * 60 * 1000));
                      const top = Math.max(0, minsFromStart * hourRowPx);
                      const height = Math.max(18, durH * hourRowPx - 2);
                      const rl = resourceLabel(resources, ev.resourceId);
                      const bg = ev.color ?? "color-mix(in srgb, var(--bpm-accent) 28%, var(--bpm-surface))";
                      return (
                        <button
                          key={ev.id}
                          type="button"
                          /* La hauteur suit la DURÉE (`Math.max(18, …)`) : un
                             rendez-vous d'un quart d'heure coupe son titre à la
                             première ligne, sous `overflow: hidden`. */
                          title={eventTooltip(ev, rl, locale)}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick(ev);
                          }}
                          style={{
                            position: "absolute",
                            left: 4,
                            right: 4,
                            top,
                            height,
                            borderRadius: "var(--bpm-radius-sm)",
                            border: "1px solid var(--bpm-border)",
                            background: bg,
                            color: "var(--bpm-text-primary)",
                            fontSize: 10,
                            textAlign: "left",
                            padding: "4px 6px",
                            overflow: "hidden",
                            cursor: "pointer",
                            zIndex: 1,
                            boxSizing: "border-box",
                          }}
                        >
                          <div style={{ fontWeight: 600 }}>{ev.title}</div>
                          {rl && <div style={{ color: "var(--bpm-text-secondary)", marginTop: 2 }}>{rl}</div>}
                        </button>
                      );
                    })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
