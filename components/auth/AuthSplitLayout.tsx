"use client";

import React from "react";
import Image from "next/image";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import styles from "./AuthSplitLayout.module.css";

const fr = {
  cardTitle: "Réunion équipe",
  cardMeta: "Lun. 10:00 · Salle A",
};

const en: typeof fr = {
  cardTitle: "Team meeting",
  cardMeta: "Mon 10:00 · Room A",
};

/** Image Unsplash : équipe en collaboration (gratuit, pas d'attribution requise) */
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80";

/** Overlay par défaut : carte type réunion (optionnel sur le visuel droit) */
function DefaultRightOverlay() {
  const { locale } = useI18n();
  const S = locale === "en" ? en : fr;
  return (
    <div className={styles.overlayCard}>
      <div className={styles.overlayCardTitle}>{S.cardTitle}</div>
      <div className={styles.overlayCardMeta}>{S.cardMeta}</div>
    </div>
  );
}

export type AuthSplitLayoutProps = {
  children: React.ReactNode;
  /** Overlay optionnel sur l'image (ex. cartes, calendrier). Si true, utilise l'overlay par défaut. */
  rightOverlay?: React.ReactNode | true;
  /** Ratio gauche/droite : "50" (50/50) ou "40" (40/60) */
  ratio?: "50" | "40";
};

export function AuthSplitLayout({
  children,
  rightOverlay,
  ratio = "40",
}: AuthSplitLayoutProps) {
  const overlay = rightOverlay === true ? <DefaultRightOverlay /> : rightOverlay;

  return (
    <div className={styles.root} data-ratio={ratio}>
      <div className={styles.left}>
        <div className={styles.leftInner}>{children}</div>
      </div>
      <div className={styles.right}>
        <div className={styles.imageWrap}>
          <Image
            src={HERO_IMAGE}
            alt=""
            fill
            priority
            sizes="(max-width: 900px) 0px, 60vw"
            className={styles.image}
          />
          <div className={styles.overlay} />
        </div>
        {overlay && <div className={styles.rightOverlay}>{overlay}</div>}
      </div>
    </div>
  );
}
