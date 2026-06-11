"use client";

import { useI18n } from "@/lib/i18n/LocaleProvider";
import { Hero } from "./_home/Hero";
import { ValueProps } from "./_home/ValueProps";
import { ComponentShowcase } from "./_home/ComponentShowcase";
import { Modules } from "./_home/Modules";
import { GetStarted } from "./_home/GetStarted";
import { WhyBpm } from "./_home/WhyBpm";
import { Faq } from "./_home/Faq";
import { FinalCta } from "./_home/FinalCta";

export function HomeContent() {
  const { dict } = useI18n();

  return (
    <>
      <Hero dict={dict} />
      <ValueProps dict={dict} />
      <ComponentShowcase dict={dict} />
      <Modules dict={dict} />
      <GetStarted dict={dict} />
      <WhyBpm dict={dict} />
      <Faq dict={dict} />
      <FinalCta dict={dict} />
    </>
  );
}
