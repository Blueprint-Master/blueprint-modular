import type { Archetype } from "@/lib/plano/archetypes";

/**
 * Dessins techniques par ARCHÉTYPE de forme (viewBox 150 × 70). Trait papier
 * sur bleu de Prusse, une seule touche vermillon : ce qui parle dans la pièce
 * (delta, seuil franchi, étape courante, action, alerte). `v(slot, span)`
 * donne une variation déterministe propre au composant.
 */
const L = "var(--plano-line)";
const S = "var(--plano-line-soft)";
const A = "var(--plano-line-accent)";
const W = 1.2;

type V = (slot: number, span: number) => number;

export function ArchetypeDrawing({ archetype, v }: { archetype: Archetype; v: V }) {
  switch (archetype) {
    case "metrique":
      return (
        <>
          <rect x="1" y="1" width="148" height="68" rx="2" fill="none" stroke={L} strokeWidth={W} />
          <path d={`M14 18H${54 + v(0, 3) * 10}`} stroke={L} strokeWidth={W} />
          <path d={`M14 40H${92 + v(1, 3) * 8}`} stroke={L} strokeWidth="4" />
          <path d={`M14 56H${44 + v(2, 3) * 6}`} stroke={A} strokeWidth="1.6" />
          <path d="M118 52l6-6 6 6" fill="none" stroke={A} strokeWidth="1.4" />
        </>
      );
    case "tableau":
      return (
        <>
          <rect x="1" y="1" width="148" height="68" fill="none" stroke={L} strokeWidth={W} />
          <path d="M1 17H149" stroke={L} strokeWidth={W} />
          <path d={`M12 31H138M12 45H138M12 59H${100 + v(0, 4) * 8}`} stroke={S} />
          <path d={`M${54 + v(1, 3) * 4} 1V69M${102 + v(2, 3) * 4} 1V69`} stroke={S} strokeDasharray="3 3" />
          <path d="M12 9H40" stroke={L} strokeWidth="2" />
          <path d="M140 7l3 4 3-4" fill="none" stroke={A} strokeWidth="1.2" />
        </>
      );
    case "courbe":
      return (
        <>
          <path d="M8 4V62H148" fill="none" stroke={L} strokeWidth={W} />
          <path d="M8 46H148M8 30H148M8 14H148" stroke={S} strokeDasharray="2 4" opacity="0.7" />
          <path
            d={`M12 54C30 ${44 - v(0, 3) * 4} 44 ${48 - v(1, 3) * 3} 62 ${36 - v(2, 3) * 4}S100 ${22 + v(3, 3) * 4} 118 26S136 ${14 + v(0, 3) * 2} 144 12`}
            fill="none"
            stroke={L}
            strokeWidth="1.6"
          />
          <circle cx="144" cy="12" r="3.4" fill={A} />
        </>
      );
    case "barres":
      return (
        <>
          <path d="M8 4V62H148" fill="none" stroke={L} strokeWidth={W} />
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const h = 14 + ((v(i % 4, 5) + i * 3) % 6) * 7;
            return (
              <rect key={i} x={18 + i * 21} y={62 - h} width="12" height={h} fill="none" stroke={i === 4 ? A : L} strokeWidth={i === 4 ? 1.6 : W} />
            );
          })}
        </>
      );
    case "donut":
      return (
        <>
          <circle cx="44" cy="35" r="24" fill="none" stroke={S} strokeWidth="7" opacity="0.6" />
          <circle cx="44" cy="35" r="24" fill="none" stroke={L} strokeWidth="7" strokeDasharray={`${70 + v(0, 4) * 12} 200`} transform="rotate(-90 44 35)" />
          <circle cx="44" cy="35" r="24" fill="none" stroke={A} strokeWidth="7" strokeDasharray={`16 200`} strokeDashoffset={`${-(70 + v(0, 4) * 12)}`} transform="rotate(-90 44 35)" />
          <path d="M86 20H138M86 35H124M86 50H130" stroke={S} />
          <rect x="80" y="17" width="4" height="4" fill={L} />
          <rect x="80" y="47" width="4" height="4" fill={A} />
        </>
      );
    case "radar":
      return (
        <>
          <path d="M75 4L104 25L93 62H57L46 25Z" fill="none" stroke={S} />
          <path d="M75 18L92 30L86 52H64L58 30Z" fill="none" stroke={S} strokeDasharray="2 3" />
          <path d="M75 4V40M104 25L75 40M93 62L75 40M57 62L75 40M46 25L75 40" stroke={S} opacity="0.6" />
          <path d={`M75 ${10 + v(0, 3) * 4}L98 28L${84 + v(1, 3) * 3} 55L62 50L54 27Z`} fill="none" stroke={A} strokeWidth="1.6" />
        </>
      );
    case "nuage":
      return (
        <>
          <path d="M8 4V62H148" fill="none" stroke={L} strokeWidth={W} />
          {[
            [22, 50], [34, 44], [46, 46], [58, 36], [70, 40], [82, 30], [94, 32], [106, 22], [118, 26], [130, 16],
          ].map(([x, y], i) => (
            <circle key={i} cx={x + v(i % 4, 3) * 2} cy={y} r={i === 9 ? 3.4 : 2.4} fill={i === 9 ? A : "none"} stroke={i === 9 ? A : L} strokeWidth={W} />
          ))}
          <path d="M18 54L136 14" stroke={S} strokeDasharray="3 3" />
        </>
      );
    case "jauge":
      return (
        <>
          <path d="M25 62A50 50 0 0 1 125 62" fill="none" stroke={L} strokeWidth={W} />
          <path d="M104 22A50 50 0 0 1 118 40" fill="none" stroke={A} strokeWidth="2.6" />
          <path d={`M75 62L${96 + v(0, 3) * 2} ${30 + v(1, 3) * 2}`} stroke={L} strokeWidth={W} />
          <circle cx="75" cy="62" r="3" fill="none" stroke={L} strokeWidth={W} />
          <path d="M19 66H131" stroke={S} strokeDasharray="3 3" />
        </>
      );
    case "etapes": {
      const cur = 1 + v(0, 2);
      const xs = [10, 53, 96, 139];
      return (
        <>
          <path d="M10 28H139" stroke={S} strokeDasharray="4 4" />
          <path d={`M10 28H${xs[cur]}`} stroke={L} strokeWidth="1.6" />
          {xs.map((x, i) =>
            i < cur ? (
              <circle key={x} cx={x} cy="28" r="5" fill={L} />
            ) : i === cur ? (
              <circle key={x} cx={x} cy="28" r="6.5" fill="none" stroke={A} strokeWidth="1.8" />
            ) : (
              <circle key={x} cx={x} cy="28" r="5" fill="none" stroke={S} strokeWidth={W} />
            ),
          )}
          <path d="M0 48H22M42 48H64M85 48H107M128 48H150" stroke={S} />
        </>
      );
    }
    case "timeline":
      return (
        <>
          <path d="M18 4V66" stroke={S} />
          {[12, 34, 56].map((y, i) => (
            <g key={y}>
              <circle cx="18" cy={y} r="4" fill={i === 0 ? A : "none"} stroke={i === 0 ? A : L} strokeWidth={W} />
              <path d={`M32 ${y - 3}H${92 + v(i, 4) * 10}`} stroke={L} strokeWidth={W} />
              <path d={`M32 ${y + 5}H${70 + v(i + 1, 4) * 8}`} stroke={S} />
            </g>
          ))}
        </>
      );
    case "badge":
      return (
        <>
          <rect x="14" y="14" width={58 + v(0, 3) * 6} height="18" rx="9" fill="none" stroke={L} strokeWidth={W} />
          <circle cx="25" cy="23" r="3" fill={A} />
          <path d="M33 23H60" stroke={L} strokeWidth={W} />
          <rect x="14" y="40" width="44" height="18" rx="9" fill="none" stroke={S} />
          <rect x="66" y="40" width={56 + v(1, 3) * 6} height="18" rx="9" fill="none" stroke={S} />
          <path d="M26 49H46M78 49H108" stroke={S} />
        </>
      );
    case "bouton":
      return (
        <>
          <rect x="24" y="20" width="102" height="30" rx="6" fill="none" stroke={A} strokeWidth="1.8" />
          <path d={`M${50 - v(0, 3) * 3} 35H${100 + v(0, 3) * 3}`} stroke={A} strokeWidth="2" />
          <path d="M14 60H136" stroke={S} strokeDasharray="3 3" />
          <path d="M24 10V16M126 10V16M24 13H126" stroke={S} />
        </>
      );
    case "champ":
      return (
        <>
          <path d={`M10 12H${48 + v(0, 3) * 8}`} stroke={S} />
          <rect x="10" y="20" width="130" height="26" rx="4" fill="none" stroke={L} strokeWidth={W} />
          <path d={`M20 33H${70 + v(1, 4) * 8}`} stroke={L} strokeWidth={W} />
          <path d={`M${74 + v(1, 4) * 8} 26V40`} stroke={A} strokeWidth="1.6" />
          <path d="M10 56H90" stroke={S} strokeDasharray="2 3" />
        </>
      );
    case "selecteur":
      return (
        <>
          <rect x="10" y="6" width="130" height="20" rx="4" fill="none" stroke={L} strokeWidth={W} />
          <path d="M20 16H78" stroke={L} strokeWidth={W} />
          <path d="M124 13l5 5 5-5" fill="none" stroke={L} strokeWidth={W} />
          <rect x="10" y="30" width="130" height="36" rx="4" fill="none" stroke={S} />
          <rect x="14" y={34 + v(0, 2) * 10} width="122" height="10" rx="2" fill="none" stroke={A} strokeWidth="1.4" />
          <path d="M22 39H90M22 49H80M22 59H96" stroke={S} />
        </>
      );
    case "case":
      return (
        <>
          <rect x="14" y="10" width="14" height="14" rx="3" fill="none" stroke={A} strokeWidth="1.6" />
          <path d="M17 17l3 3 6-7" fill="none" stroke={A} strokeWidth="1.6" />
          <path d={`M38 17H${90 + v(0, 3) * 10}`} stroke={L} strokeWidth={W} />
          <rect x="14" y="34" width="14" height="14" rx="3" fill="none" stroke={L} strokeWidth={W} />
          <path d="M38 41H96" stroke={S} />
          <rect x="102" y="46" width="34" height="16" rx="8" fill="none" stroke={L} strokeWidth={W} />
          <circle cx="128" cy="54" r="5" fill={L} />
        </>
      );
    case "curseur":
      return (
        <>
          <path d="M12 36H138" stroke={S} strokeWidth="3" strokeLinecap="round" />
          <path d={`M12 36H${60 + v(0, 4) * 12}`} stroke={L} strokeWidth="3" strokeLinecap="round" />
          <circle cx={60 + v(0, 4) * 12} cy="36" r="7" fill="none" stroke={A} strokeWidth="1.8" />
          <path d="M12 50V56M43 50V56M75 50V56M106 50V56M138 50V56" stroke={S} />
          <path d="M12 14H54" stroke={S} />
        </>
      );
    case "calendrier":
      return (
        <>
          <rect x="18" y="4" width="114" height="62" rx="3" fill="none" stroke={L} strokeWidth={W} />
          <path d="M18 18H132" stroke={L} strokeWidth={W} />
          <path d="M34.3 18V66M50.6 18V66M66.9 18V66M83.1 18V66M99.4 18V66M115.7 18V66M18 34H132M18 50H132" stroke={S} opacity="0.7" />
          <rect x={51 + v(0, 4) * 16.3} y={35 + v(1, 2) * 16} width="15" height="14" fill="none" stroke={A} strokeWidth="1.6" />
          <path d="M40 2V8M110 2V8" stroke={L} strokeWidth={W} />
        </>
      );
    case "onglets":
      return (
        <>
          <path d="M1 26H149" stroke={S} />
          <path d="M10 16H40M60 16H92M112 16H140" stroke={L} strokeWidth={W} />
          <path d={`M${[10, 60, 112][v(0, 3)]} 26H${[40, 92, 140][v(0, 3)]}`} stroke={A} strokeWidth="2.2" />
          <rect x="10" y="36" width="130" height="28" rx="3" fill="none" stroke={S} strokeDasharray="3 3" />
        </>
      );
    case "carte":
      return (
        <>
          <rect x="18" y="4" width="114" height="62" rx="6" fill="none" stroke={L} strokeWidth={W} />
          <path d="M18 22H132" stroke={S} />
          <path d={`M28 14H${70 + v(0, 3) * 8}`} stroke={L} strokeWidth="2" />
          <path d={`M28 34H120M28 44H${96 + v(1, 3) * 8}`} stroke={S} />
          <rect x="94" y="52" width="28" height="9" rx="3" fill="none" stroke={A} strokeWidth="1.4" />
        </>
      );
    case "liste":
      return (
        <>
          {[8, 30, 52].map((y, i) => (
            <g key={y}>
              <rect x="10" y={y} width="130" height="16" rx="3" fill="none" stroke={i === v(0, 3) ? A : S} strokeWidth={i === v(0, 3) ? 1.4 : 1} />
              <circle cx="20" cy={y + 8} r="3" fill="none" stroke={L} strokeWidth={W} />
              <path d={`M30 ${y + 8}H${88 + v(i, 4) * 8}`} stroke={L} strokeWidth={W} />
              <path d={`M128 ${y + 5}l4 3-4 3`} fill="none" stroke={S} />
            </g>
          ))}
        </>
      );
    case "arbre":
      return (
        <>
          <rect x="60" y="4" width="30" height="14" rx="3" fill="none" stroke={A} strokeWidth="1.6" />
          <path d="M75 18V28M30 28H120M30 28V38M75 28V38M120 28V38" fill="none" stroke={S} />
          {[18, 63, 108].map((x) => (
            <rect key={x} x={x} y="38" width="24" height="12" rx="3" fill="none" stroke={L} strokeWidth={W} />
          ))}
          <path d={`M30 50V58M30 58H${46 + v(0, 3) * 4}`} fill="none" stroke={S} />
          <rect x={46 + v(0, 3) * 4} y="54" width="18" height="10" rx="2" fill="none" stroke={L} strokeWidth={W} />
        </>
      );
    case "modale":
      return (
        <>
          <rect x="1" y="1" width="148" height="68" fill="none" stroke={S} strokeDasharray="3 3" />
          <rect x="30" y="10" width="90" height="50" rx="5" fill="none" stroke={L} strokeWidth={W} />
          <path d={`M40 22H${80 + v(0, 3) * 6}`} stroke={L} strokeWidth="2" />
          <path d="M108 18l6 6M114 18l-6 6" stroke={S} />
          <path d="M40 34H108M40 42H96" stroke={S} />
          <rect x="84" y="49" width="28" height="7" rx="2" fill="none" stroke={A} strokeWidth="1.4" />
        </>
      );
    case "alerte":
      return (
        <>
          <rect x="1" y="8" width="148" height="54" rx="6" fill="none" stroke={L} strokeWidth={W} />
          <rect x="12" y="18" width="4" height="34" fill={A} />
          <path d={`M28 24H${96 + v(0, 3) * 8}`} stroke={L} strokeWidth="3" />
          <path d={`M28 38H136M28 48H${104 + v(1, 3) * 8}`} stroke={L} strokeWidth={W} />
        </>
      );
    case "progression":
      return (
        <>
          <rect x="10" y="22" width="130" height="10" rx="5" fill="none" stroke={S} />
          <rect x="10" y="22" width={54 + v(0, 4) * 14} height="10" rx="5" fill="none" stroke={L} strokeWidth="1.6" />
          <path d={`M${64 + v(0, 4) * 14} 22V32`} stroke={A} strokeWidth="1.8" />
          <path d="M10 46H60" stroke={S} />
          <path d="M120 46H140" stroke={L} strokeWidth={W} />
        </>
      );
    case "avatar":
      return (
        <>
          <circle cx="40" cy="35" r="24" fill="none" stroke={L} strokeWidth={W} />
          <circle cx="40" cy="28" r="8" fill="none" stroke={L} strokeWidth={W} />
          <path d="M24 52C28 42 52 42 56 52" fill="none" stroke={L} strokeWidth={W} />
          <circle cx="59" cy="53" r="4" fill={A} />
          <path d={`M78 28H${126 + v(0, 3) * 6}`} stroke={L} strokeWidth="2" />
          <path d="M78 42H118" stroke={S} />
        </>
      );
    case "geo":
      return (
        <>
          <rect x="1" y="1" width="148" height="68" fill="none" stroke={S} />
          <path d="M1 44C30 38 40 52 70 40S118 18 149 26" fill="none" stroke={S} strokeDasharray="3 3" />
          <path d="M20 66L48 8M96 69L120 1" stroke={S} opacity="0.6" />
          <path d={`M30 52L${70 + v(0, 3) * 6} 30L104 40`} fill="none" stroke={L} strokeWidth="1.4" />
          <path d="M104 40c0-8 12-8 12 0c0 6-6 12-6 12s-6-6-6-12z" fill="none" stroke={A} strokeWidth="1.6" transform="translate(-6 -16)" />
        </>
      );
    case "orbite":
      return (
        <>
          <ellipse cx="75" cy="35" rx="62" ry="22" fill="none" stroke={S} strokeDasharray="3 3" />
          <ellipse cx="75" cy="35" rx="36" ry="13" fill="none" stroke={S} />
          <circle cx="75" cy="35" r="7" fill="none" stroke={L} strokeWidth="1.6" />
          <circle cx={111 - v(0, 3) * 4} cy={36 + v(0, 3)} r="3.2" fill={L} />
          <circle cx="22" cy="24" r="3.6" fill={A} />
        </>
      );
    case "titre":
      return (
        <>
          <path d={`M10 18H${100 + v(0, 3) * 10}`} stroke={L} strokeWidth="5" />
          <path d="M10 36H140M10 46H132M10 56H90" stroke={S} />
          <path d="M10 26H34" stroke={A} strokeWidth="1.6" />
        </>
      );
    case "media":
      return (
        <>
          <rect x="1" y="1" width="148" height="68" fill="none" stroke={L} strokeWidth={W} />
          <path d={`M1 58L44 ${26 + v(0, 3) * 4}L76 50L100 34L149 64`} fill="none" stroke={L} strokeWidth={W} />
          <circle cx="116" cy="18" r="7" fill="none" stroke={L} strokeWidth={W} />
          <path d="M64 26L84 36L64 46Z" fill="none" stroke={A} strokeWidth="1.6" />
        </>
      );
    case "formulaire":
      return (
        <>
          <rect x="10" y="2" width="130" height="66" rx="4" fill="none" stroke={S} />
          <path d="M20 12H60M20 32H54" stroke={S} />
          <rect x="20" y="16" width="110" height="10" rx="2" fill="none" stroke={L} strokeWidth={W} />
          <rect x="20" y="36" width={70 + v(0, 3) * 10} height="10" rx="2" fill="none" stroke={L} strokeWidth={W} />
          <rect x="94" y="54" width="36" height="9" rx="2" fill="none" stroke={A} strokeWidth="1.4" />
        </>
      );
    case "code":
      return (
        <>
          <rect x="1" y="1" width="148" height="68" rx="4" fill="none" stroke={L} strokeWidth={W} />
          <path d="M12 14l-5 5 5 5" fill="none" stroke={S} />
          <path d={`M22 14H${70 + v(0, 3) * 8}M30 28H${110 + v(1, 3) * 6}M30 42H${86 + v(2, 3) * 8}M22 56H60`} stroke={L} strokeWidth={W} />
          <path d={`M${74 + v(0, 3) * 8} 14H96`} stroke={A} strokeWidth="1.6" />
          <path d="M12 28V56" stroke={S} strokeDasharray="2 3" />
        </>
      );
    case "conversation":
      return (
        <>
          <rect x="62" y="4" width="84" height="18" rx="9" fill="none" stroke={L} strokeWidth={W} />
          <path d={`M74 13H${120 + v(0, 3) * 6}`} stroke={L} />
          <rect x="4" y="28" width="100" height="18" rx="9" fill="none" stroke={S} />
          <path d={`M16 37H${76 + v(1, 3) * 6}`} stroke={S} />
          <rect x="4" y="52" width="142" height="16" rx="8" fill="none" stroke={L} strokeWidth={W} />
          <circle cx="137" cy="60" r="4" fill={A} />
        </>
      );
    case "codebarre":
      return (
        <>
          {[6, 12, 15, 22, 26, 31, 38, 41, 47, 52, 56, 62, 66, 71].map((x, i) => (
            <path key={x} d={`M${x} 10V60`} stroke={L} strokeWidth={(i + v(0, 3)) % 3 === 0 ? 3 : W} />
          ))}
          <rect x="92" y="10" width="50" height="50" fill="none" stroke={L} strokeWidth={W} />
          <rect x="98" y="16" width="12" height="12" fill="none" stroke={L} strokeWidth={W} />
          <rect x="124" y="16" width="12" height="12" fill="none" stroke={L} strokeWidth={W} />
          <rect x="98" y="42" width="12" height="12" fill="none" stroke={L} strokeWidth={W} />
          <rect x="122" y="40" width="8" height="8" fill={A} />
        </>
      );
    case "tableau-bord":
      return (
        <>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const x = 6 + (i % 3) * 48;
            const y = 4 + Math.floor(i / 3) * 33;
            const hot = i === v(0, 6);
            return (
              <g key={i}>
                <rect x={x} y={y} width="42" height="28" rx="3" fill="none" stroke={hot ? A : L} strokeWidth={hot ? 1.6 : W} />
                <circle cx={x + 8} cy={y + 8} r="2.5" fill={hot ? A : "none"} stroke={hot ? A : S} />
                <path d={`M${x + 6} ${y + 20}H${x + 30}`} stroke={S} />
              </g>
            );
          })}
        </>
      );
  }
}
