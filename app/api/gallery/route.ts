import { NextResponse } from "next/server";
import { fetchCuratedApps } from "@/lib/gallery/curated";

export const dynamic = "force-dynamic";

/**
 * GET /api/gallery
 *
 * Endpoint public read-only de la galerie « Apps créées avec Modular ».
 * Proxy serveur→serveur vers l'endpoint Maker (MAKER_GALLERY_URL) : le filtrage
 * « pouce vert » est fait CÔTÉ Maker (cf. docs/contracts/maker-gallery-endpoint.md).
 * Modular ne renvoie que les 5 champs publics du contrat ; jamais de code,
 * de previewUrl ni d'URL de backend live.
 *
 * Fallback propre : endpoint absent ou injoignable → { apps: [] }, jamais de 500.
 */
export async function GET() {
  const apps = await fetchCuratedApps();
  return NextResponse.json(
    { apps },
    {
      headers: {
        "Cache-Control":
          "public, max-age=0, s-maxage=300, stale-while-revalidate=600",
      },
    },
  );
}
