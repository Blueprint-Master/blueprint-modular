import type { Metadata } from "next";
import { ObjectsCatalogue } from "@/components/site/ObjectsCatalogue";

export const metadata: Metadata = { title: "Objets — Blueprint Modular" };
export default function ObjectsPage() { return <ObjectsCatalogue />; }
