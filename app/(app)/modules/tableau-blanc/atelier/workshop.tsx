"use client";
import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import Board from "../Board";

export default function Workshop({ signedIn, organizations }: {
  signedIn: boolean; organizations: { id: string; name: string }[];
}) {
  const { locale } = useI18n();
  const en = locale === "en";
  const [organization, setOrganization] = useState(organizations[0]?.id || "");
  const [board, setBoard] = useState("retro");
  const [draft, setDraft] = useState(board);
  return <div className="doc-page">
    <h1>{en ? "Team whiteboard" : "Tableau blanc d’équipe"}</h1>
    {!signedIn ? <Link href="/login?callbackUrl=%2Fmodules%2Ftableau-blanc%2Fatelier">{en ? "Sign in" : "Se connecter"}</Link>
      : !organization ? <p>{en ? "Join an organization to open a shared board." : "Rejoins une organisation pour ouvrir un tableau partagé."}</p>
      : <>
        <form className="flex flex-wrap items-center gap-3 mb-4" onSubmit={event => { event.preventDefault(); setBoard(draft); }}>
          <label>{en ? "Organization" : "Organisation"} <select value={organization} onChange={e => setOrganization(e.target.value)}>
            {organizations.map(org => <option key={org.id} value={org.id}>{org.name}</option>)}
          </select></label>
          <label>{en ? "Board identifier" : "Identifiant du tableau"} <input value={draft} onChange={e => setDraft(e.target.value)}
            required maxLength={64} pattern="[a-z0-9][a-z0-9\-]{0,63}" title={en ? "Lowercase letters, digits and hyphens" : "Lettres minuscules, chiffres et tirets"} /></label>
          <button className="underline" type="submit">{en ? "Open" : "Ouvrir"}</button>
        </form>
        <Board key={organization + "/" + board} board={board} endpoint={"/api/whiteboards/" + encodeURIComponent(organization) + "/" + encodeURIComponent(board)} />
      </>}
  </div>;
}
