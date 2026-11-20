"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, ConfirmModal, Input } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { canStart, hours, isWorkingDay, rooms, type Booking } from "@/lib/reservations/planning";

const copy = {
  fr: {
    module: "Réservation / Créneaux", heading: "Réserver une salle", login: "Se connecter pour réserver",
    noOrg: "Ce compte doit rejoindre une organisation pour accéder à son planning.", org: "Organisation",
    day: "Date", room: "Salle", info: "Du lundi au vendredi, de 9 h à 18 h, heure de Paris.",
    weekday: "Sélectionnez un jour du lundi au vendredi.", loading: "Chargement du planning…",
    busy: "Occupé", free: "Libre", title: "Titre de la réunion", start: "Début", duration: "Durée (heures)",
    reserve: "Réserver", cancel: "Annuler la réservation", confirm: "Confirmer", keep: "Conserver",
    saved: "Réservation enregistrée.", removed: "Réservation annulée.", conflict: "Ce créneau vient d’être réservé.",
    failed: "Le planning est indisponible.", uncertain: "La demande n’a pas pu être confirmée. Vérifiez le planning.",
    retry: "Actualiser", full: "Aucun créneau disponible pour cette durée.", authorization: "Votre accès au planning a changé.",
  },
  en: {
    module: "Room bookings", heading: "Book a room", login: "Sign in to book",
    noOrg: "Join an organization to access its room schedule.", org: "Organization",
    day: "Date", room: "Room", info: "Monday to Friday, 9 am to 6 pm, Paris time.",
    weekday: "Choose a weekday.", loading: "Loading schedule…",
    busy: "Occupied", free: "Available", title: "Meeting title", start: "Start", duration: "Duration (hours)",
    reserve: "Book", cancel: "Cancel booking", confirm: "Confirm", keep: "Keep booking",
    saved: "Booking saved.", removed: "Booking cancelled.", conflict: "This slot was just booked.",
    failed: "The schedule is unavailable.", uncertain: "The request could not be confirmed. Check the schedule.",
    retry: "Refresh", full: "No slots available for this duration.", authorization: "Your access to this schedule has changed.",
  },
};

function DaySchedule({ day, organizationId, room }: { day: string; organizationId: string; room: string }) {
  const { locale } = useI18n();
  const s = copy[locale];
  const [records, setRecords] = useState<Booking[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [notice, setNotice] = useState<keyof typeof s | null>(null);
  const [version, setVersion] = useState(0);
  const [pending, setPending] = useState(false);
  const [cancelling, setCancelling] = useState<Booking | null>(null);
  const [duration, setDuration] = useState(1);
  const [preferredStart, setPreferredStart] = useState(9);
  const [title, setTitle] = useState("");
  const query = new URLSearchParams({ organizationId, day }).toString();

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/reservations?" + query, { cache: "no-store", signal: controller.signal })
      .then(async r => {
        if (!r.ok) throw new Error(String(r.status));
        const data: Booking[] = await r.json();
        if (!controller.signal.aborted) setRecords(data.filter(b => b.room === room));
      }).catch(() => { if (!controller.signal.aborted) setLoadError(true); });
    return () => controller.abort();
  }, [query, room, version]);

  function refresh() {
    setRecords(null);
    setLoadError(false);
    setVersion(v => v + 1);
  }

  async function submit(id?: string) {
    if (pending) return;
    setPending(true);
    setNotice(null);
    try {
      const response = id
        ? await fetch("/api/reservations?id=" + encodeURIComponent(id), { method: "DELETE" })
        : await fetch("/api/reservations", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ day, room, organizationId, startHour: start, duration, title }),
        });
      if (response.ok) {
        setNotice(id ? "removed" : "saved");
        if (!id) setTitle("");
      } else if (response.status === 409) setNotice("conflict");
      else if (response.status === 401 || response.status === 403) setNotice("authorization");
      else setNotice("uncertain");
    } catch { setNotice("uncertain"); }
    finally {
      setPending(false);
      setCancelling(null);
      refresh();
    }
  }

  const occupies = (hour: number) => records?.find(b => b.startHour <= hour && hour < b.startHour + b.duration);
  const available = hours.filter(h => canStart(day, h) && h + duration <= 18
    && !occupies(h) && (duration === 1 || !occupies(h + 1)));
  const start = available.includes(preferredStart) ? preferredStart : available[0];

  return <section className="space-y-4">
    {notice && <p role="status">{s[notice]}</p>}
    {loadError ? <p role="alert">{s.failed}</p> : records === null ? <p role="status">{s.loading}</p> : <>
      <ul className="divide-y">
        {hours.map(h => {
          const b = occupies(h);
          return <li key={h} className="flex flex-wrap items-center gap-3 py-2">
            <time>{h}:00</time><span>{b ? b.title ?? s.busy : s.free}</span>
            {b?.id && b.startHour === h && <Button variant="ghost" size="sm" disabled={pending}
              onClick={() => setCancelling(b)}>{s.cancel}</Button>}
          </li>;
        })}
      </ul>
      <form className="space-y-3" onSubmit={e => { e.preventDefault(); if (start !== undefined && title.trim()) void submit(); }}>
        <div className="flex flex-wrap gap-4">
          <label>{s.duration} <select disabled={pending} value={duration} onChange={e => setDuration(Number(e.target.value))}>
            <option value={1}>1</option><option value={2}>2</option>
          </select></label>
          {available.length > 0 && <label>{s.start} <select disabled={pending} value={start} onChange={e => setPreferredStart(Number(e.target.value))}>
            {available.map(h => <option key={h} value={h}>{h}:00</option>)}
          </select></label>}
        </div>
        {available.length === 0 ? <p>{s.full}</p> : <>
          <Input label={s.title} value={title} onChange={setTitle} maxLength={160} required disabled={pending} />
          <Button type="submit" loading={pending} disabled={!title.trim() || pending}>{s.reserve}</Button>
        </>}
      </form>
    </>}
    <Button variant="outline" onClick={refresh} disabled={pending}>{s.retry}</Button>
    {cancelling && <ConfirmModal isOpen title={s.cancel}
      message={day + " · " + cancelling.startHour + ":00 · " + cancelling.title}
      confirmLabel={s.confirm} cancelLabel={s.keep} variant="warning" isLoading={pending}
      onConfirm={() => { if (cancelling.id) void submit(cancelling.id); }} onCancel={() => { if (!pending) setCancelling(null); }} />}
  </section>;
}

export default function Planning({ organizations, signedIn, initialDay }: {
  organizations: { id: string; name: string }[]; signedIn: boolean; initialDay: string;
}) {
  const { locale } = useI18n();
  const s = copy[locale];
  const [organizationId, setOrganization] = useState(organizations[0]?.id ?? "");
  const [day, setDay] = useState(initialDay);
  const [room, setRoom] = useState<string>(rooms[0]);
  return <div className="doc-page space-y-5">
    <div className="doc-page-header">
      <Link className="doc-breadcrumb" href="/modules/reservation-creneaux">{s.module}</Link>
      <h1>{s.heading}</h1><p className="doc-description">{s.info}</p>
    </div>
    {!signedIn ? <Link href="/login?callbackUrl=%2Fmodules%2Freservation-creneaux%2Fplanning">{s.login}</Link> :
      !organizations.length ? <p>{s.noOrg}</p> : <>
        <div className="flex flex-wrap items-end gap-4">
          <label>{s.org} <select value={organizationId} onChange={e => setOrganization(e.target.value)}>
            {organizations.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select></label>
          <Input label={s.day} type="date" value={day} onChange={setDay} />
          <label>{s.room} <select value={room} onChange={e => setRoom(e.target.value)}>
            {rooms.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
          </select></label>
        </div>
        {isWorkingDay(day) ? <DaySchedule key={[organizationId, day, room].join("/")} {...{ day, room, organizationId }} />
          : <p role="status">{s.weekday}</p>}
      </>}
  </div>;
}
