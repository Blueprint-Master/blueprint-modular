import type { PlanFamily } from "@/lib/plano/families";

/**
 * Plan cyanotype d'une FAMILLE de composants : un dessin technique au trait,
 * blanc sur bleu de Prusse, avec une seule touche vermillon (ce qui « parle »
 * dans la pièce : delta, seuil, alerte, action). Décoratif : la tuile porte le
 * nom, donc le dessin est `aria-hidden`.
 */
const L = "var(--plano-line)";
const S = "var(--plano-line-soft)";
const A = "var(--plano-line-accent)";

function Drawing({ family }: { family: PlanFamily }) {
  switch (family) {
    case "donnees":
      return (
        <>
          <rect x="1" y="1" width="148" height="68" fill="none" stroke={L} strokeWidth="1.2" />
          <path d="M14 18H70" stroke={L} strokeWidth="1.2" />
          <path d="M14 40H104" stroke={L} strokeWidth="4" />
          <path d="M14 56H50" stroke={A} strokeWidth="1.6" />
        </>
      );
    case "mise-en-page":
      return (
        <>
          <rect x="1" y="1" width="148" height="68" fill="none" stroke={L} strokeWidth="1.2" />
          <path d="M1 16H149M50 16V69" stroke={L} strokeWidth="1.2" />
          <rect x="60" y="24" width="38" height="18" fill="none" stroke={S} />
          <rect x="104" y="24" width="38" height="18" fill="none" stroke={S} />
          <rect x="60" y="48" width="82" height="14" fill="none" stroke={S} />
          <path d="M8 26H40M8 36H34M8 46H38" stroke={S} />
          <path d="M8 8H22" stroke={A} strokeWidth="1.6" />
        </>
      );
    case "interaction":
      return (
        <>
          <rect x="1" y="10" width="104" height="22" rx="3" fill="none" stroke={L} strokeWidth="1.2" />
          <path d="M10 21H52" stroke={S} />
          <path d="M60 15V27" stroke={L} strokeWidth="1.2" />
          <rect x="1" y="44" width="66" height="22" rx="3" fill="none" stroke={L} strokeWidth="1.2" />
          <rect x="78" y="44" width="70" height="22" rx="3" fill="none" stroke={A} strokeWidth="1.6" />
          <path d="M98 55H128" stroke={A} strokeWidth="1.6" />
          <path d="M12 55H40" stroke={S} />
        </>
      );
    case "feedback":
      return (
        <>
          <rect x="1" y="6" width="148" height="58" rx="6" fill="none" stroke={L} strokeWidth="1.2" />
          <rect x="14" y="18" width="4" height="34" fill={A} />
          <path d="M30 24H100" stroke={L} strokeWidth="3" />
          <path d="M30 38H136M30 48H112" stroke={L} strokeWidth="1.2" />
        </>
      );
    case "navigation":
      return (
        <>
          <path d="M1 22H149" stroke={S} />
          <path d="M8 14H36M52 14H84M100 14H128" stroke={L} strokeWidth="1.2" />
          <path d="M52 22H84" stroke={A} strokeWidth="2" />
          <path d="M8 44H26M42 44H70M86 44H110" stroke={L} strokeWidth="1.2" />
          <path d="M31 40L35 44L31 48M75 40L79 44L75 48" fill="none" stroke={S} />
          <path d="M8 60H149" stroke={S} strokeDasharray="3 3" />
        </>
      );
    case "media":
      return (
        <>
          <rect x="1" y="1" width="148" height="68" fill="none" stroke={L} strokeWidth="1.2" />
          <path d="M1 58L44 26L76 50L100 34L149 64" fill="none" stroke={L} strokeWidth="1.2" />
          <circle cx="116" cy="18" r="7" fill="none" stroke={L} strokeWidth="1.2" />
          <path d="M64 28L84 38L64 48Z" fill="none" stroke={A} strokeWidth="1.6" />
        </>
      );
    case "graphiques":
      return (
        <>
          <path d="M8 4V62H148" fill="none" stroke={L} strokeWidth="1.2" />
          <path d="M8 46H148M8 30H148M8 14H148" stroke={S} strokeDasharray="3 3" />
          <path d="M12 54L40 40L66 46L94 24L120 30L144 12" fill="none" stroke={L} strokeWidth="1.6" />
          <circle cx="144" cy="12" r="3.5" fill={A} />
        </>
      );
    case "utilitaires":
      return (
        <>
          <path d="M44 14L18 35L44 56M106 14L132 35L106 56" fill="none" stroke={L} strokeWidth="1.6" />
          <path d="M84 10L66 60" stroke={A} strokeWidth="1.6" />
          <path d="M1 68H149" stroke={S} strokeDasharray="3 3" />
        </>
      );
    case "identification":
      return (
        <>
          {[6, 12, 15, 22, 26, 31, 38, 41, 47, 52, 56, 62, 66, 71].map((x, i) => (
            <path key={x} d={`M${x} 10V60`} stroke={L} strokeWidth={i % 3 === 0 ? 3 : 1.2} />
          ))}
          <rect x="92" y="10" width="50" height="50" fill="none" stroke={L} strokeWidth="1.2" />
          <rect x="98" y="16" width="12" height="12" fill="none" stroke={L} strokeWidth="1.2" />
          <rect x="124" y="16" width="12" height="12" fill="none" stroke={L} strokeWidth="1.2" />
          <rect x="98" y="42" width="12" height="12" fill="none" stroke={L} strokeWidth="1.2" />
          <rect x="122" y="40" width="8" height="8" fill={A} />
        </>
      );
    case "ia":
      return (
        <>
          <rect x="1" y="4" width="100" height="22" rx="10" fill="none" stroke={L} strokeWidth="1.2" />
          <path d="M14 15H80" stroke={S} />
          <rect x="48" y="34" width="100" height="22" rx="10" fill="none" stroke={L} strokeWidth="1.2" />
          <path d="M62 45H124" stroke={S} />
          <path d="M22 50L25 58L33 61L25 64L22 70L19 64L11 61L19 58Z" fill="none" stroke={A} strokeWidth="1.4" />
        </>
      );
    default:
      return (
        <>
          <rect x="1" y="1" width="148" height="68" fill="none" stroke={L} strokeWidth="1.2" />
          <path d="M14 18H80M14 34H120M14 50H96" stroke={S} />
        </>
      );
  }
}

export function PlanBlueprint({ family, width = 150, height = 70 }: { family: PlanFamily; width?: number; height?: number }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className="plano-blueprint"
      width={width}
      height={height}
      viewBox="0 0 150 70"
      overflow="visible"
    >
      <Drawing family={family} />
    </svg>
  );
}
