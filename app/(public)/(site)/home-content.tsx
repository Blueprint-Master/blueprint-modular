"use client";

import { useI18n } from "@/lib/i18n/LocaleProvider";
import { Faq } from "./_home/Faq";

/**
 * Sous l'accueil de la planothèque, la seule section conservée de l'ancienne
 * page d'accueil : la FAQ. Elle reste VISIBLE parce que la page publie son
 * balisage `FAQPage` (un balisage sans contenu visible serait trompeur). Les
 * autres sections (héros, arguments, modules…) vivent sur /presentation.
 */
export function HomeFaq() {
  const { dict } = useI18n();
  return <Faq dict={dict} />;
}
