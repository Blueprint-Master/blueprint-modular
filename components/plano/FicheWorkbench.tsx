"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import examples from "@/lib/generated/component-examples.json";
import registry from "@/lib/generated/bpm-components.json";
import { PlanBlueprint, seedOf } from "@/components/plano/PlanBlueprint";
import { archetypeOf } from "@/lib/plano/archetypes";
import { familyOf } from "@/lib/plano/families";
import { useI18n } from "@/lib/i18n/LocaleProvider";

/**
 * Plan de travail commun aux fiches composant (les 109 fiches partagent la
 * structure `.sandbox-container` / `.sandbox-controls` / `.sandbox-code`).
 * Sans réécrire une seule fiche, il ajoute :
 *
 * - la BANDE DES ÉTATS : les valeurs RÉELLES du premier réglage à choix de la
 *   fiche (les `<option>` de son `<select>`, ou vrai/faux de sa première case).
 *   Un clic règle la pièce par le contrôle lui-même : la fiche reste seule
 *   maîtresse de son état. Sans réglage à choix, la bande ne montre que le plan
 *   — jamais un état inventé ;
 * - la bascule PYTHON / REACT du code : Python reste le code vivant de la fiche,
 *   React montre l'exemple du registre (`component-examples.json`), dit comme tel.
 */

type Choice =
  | { kind: "select"; el: HTMLSelectElement; prop: string; values: string[] }
  | { kind: "checkbox"; el: HTMLInputElement; prop: string; values: string[] };

const STRINGS = {
  fr: { states: "États", plan: "Le plan", python: "Python", react: "React", reactNote: "Exemple du registre", lang: "Langage du code" },
  en: { states: "States", plan: "The plan", python: "Python", react: "React", reactNote: "Registry example", lang: "Code language" },
} as const;

function propLabel(control: Element): string {
  const group = control.closest(".sandbox-control-group") ?? control.parentElement;
  const label = group?.querySelector("label");
  const text = (label?.textContent ?? "").trim();
  return text.split(/\s|\(/)[0] || "état";
}

function findChoice(container: Element): Choice | null {
  const controls = container.querySelector(".sandbox-controls");
  if (!controls) return null;
  for (const el of Array.from(controls.querySelectorAll("select"))) {
    const values = Array.from(el.options).map((o) => o.value).filter((v) => v !== "");
    if (values.length >= 2 && values.length <= 8) return { kind: "select", el, prop: propLabel(el), values };
  }
  const cb = controls.querySelector<HTMLInputElement>('input[type="checkbox"]');
  if (cb) return { kind: "checkbox", el: cb, prop: propLabel(cb), values: ["false", "true"] };
  return null;
}

/** Règle un contrôle React comme le ferait l'utilisateur (setter natif + événement). */
function setControl(choice: Choice, value: string) {
  if (choice.kind === "select") {
    const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value")?.set;
    setter?.call(choice.el, value);
    choice.el.dispatchEvent(new Event("change", { bubbles: true }));
  } else if (String(choice.el.checked) !== value) {
    choice.el.click();
  }
}

function currentValue(choice: Choice): string {
  return choice.kind === "select" ? choice.el.value : String(choice.el.checked);
}

export function FicheWorkbench() {
  const pathname = usePathname() ?? "";
  const { locale } = useI18n();
  const t = STRINGS[locale === "en" ? "en" : "fr"];
  const slug = /^\/composants\/([^/]+)/.exec(pathname)?.[1] ?? null;
  const [targets, setTargets] = useState<{ strip: HTMLElement; code: HTMLElement | null } | null>(null);
  const [choice, setChoice] = useState<Choice | null>(null);
  const [active, setActive] = useState<string>("");
  const [lang, setLang] = useState<"python" | "react">("python");

  useEffect(() => {
    setTargets(null);
    setChoice(null);
    setLang("python");
    if (!slug) return;
    let strip: HTMLElement | null = null;
    let codeSlot: HTMLElement | null = null;
    let cleanupListener: (() => void) | null = null;

    const attach = (): boolean => {
      const container = document.querySelector(".sandbox-container");
      if (!container) return false;
      strip = document.createElement("div");
      strip.className = "plano-states";
      container.appendChild(strip);
      const code = container.querySelector(".sandbox-code");
      if (code) {
        codeSlot = document.createElement("div");
        codeSlot.className = "plano-code-slot";
        code.insertBefore(codeSlot, code.firstChild);
      }
      const c = findChoice(container);
      if (c) {
        const onChange = () => setActive(currentValue(c));
        c.el.addEventListener("change", onChange);
        cleanupListener = () => c.el.removeEventListener("change", onChange);
        setActive(currentValue(c));
      }
      setChoice(c);
      setTargets({ strip, code: codeSlot });
      return true;
    };

    if (!attach()) {
      const obs = new MutationObserver(() => {
        if (attach()) obs.disconnect();
      });
      obs.observe(document.body, { childList: true, subtree: true });
      return () => {
        obs.disconnect();
        cleanupListener?.();
        strip?.remove();
        codeSlot?.remove();
      };
    }
    return () => {
      cleanupListener?.();
      strip?.remove();
      codeSlot?.remove();
    };
  }, [slug]);

  useEffect(() => {
    const code = targets?.code?.parentElement;
    if (!code) return;
    code.classList.toggle("plano-code--react", lang === "react");
  }, [lang, targets]);

  if (!slug || !targets) return null;
  const entry = registry.components.find((c) => c.slug === slug);
  const reactExample = (examples as Record<string, string>)[slug];

  return (
    <>
      {createPortal(
        <div className="plano-states-inner" role="group" aria-label={t.states}>
          {choice
            ? choice.values.map((value) => (
                <button
                  key={value}
                  type="button"
                  className="plano-state"
                  aria-pressed={active === value}
                  onClick={() => {
                    setControl(choice, value);
                    setActive(value);
                  }}
                >
                  <span className="plano-state-frame">
                    <span className="plano-state-value">{value}</span>
                  </span>
                  <span className="plano-state-label">
                    {choice.prop} = {value}
                  </span>
                </button>
              ))
            : null}
          {entry ? (
            <span className="plano-state plano-state--plan">
              <span className="plano-state-frame plano-state-frame--plan">
                <PlanBlueprint family={familyOf(entry.category)} archetype={archetypeOf(slug)} seed={seedOf(slug)} width={84} height={40} />
              </span>
              <span className="plano-state-label">{t.plan}</span>
            </span>
          ) : null}
        </div>,
        targets.strip,
      )}
      {targets.code && reactExample
        ? createPortal(
            <>
              <div className="plano-lang" role="group" aria-label={t.lang}>
                <button type="button" aria-pressed={lang === "python"} onClick={() => setLang("python")}>
                  {t.python}
                </button>
                <button type="button" aria-pressed={lang === "react"} onClick={() => setLang("react")}>
                  {t.react}
                </button>
              </div>
              {lang === "react" ? (
                <div className="plano-react-code">
                  <span className="plano-react-note">{t.reactNote}</span>
                  <pre>
                    <code>{reactExample}</code>
                  </pre>
                </div>
              ) : null}
            </>,
            targets.code,
          )
        : null}
    </>
  );
}
