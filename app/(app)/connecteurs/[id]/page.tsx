import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale } from "@/lib/i18n/server";
import { CONNECTORS, getConnectorById } from "@/lib/connectors/catalog";
import { STR } from "../strings";
import { ConnecteurFicheContent } from "./FicheContent";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return CONNECTORS.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const connector = getConnectorById(id);
  const locale = await getLocale();
  if (!connector) return { title: { absolute: STR[locale].metaTitle } };
  const title = `${connector.name[locale]} — ${STR[locale].breadcrumb}`;
  return {
    title: { absolute: title },
    description: connector.description[locale],
    alternates: { canonical: `https://blueprint-modular.com/connecteurs/${connector.id}` },
  };
}

export default async function ConnecteurFichePage({ params }: Props) {
  const { id } = await params;
  if (!getConnectorById(id)) notFound();
  return <ConnecteurFicheContent id={id} />;
}
