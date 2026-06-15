"use client";

import { useMemo, useRef, useState } from "react";
import { Badge, Barcode, Button, Card, ConfirmModal, Drawer, Input, LabelValue, Metric, MetricRow, Modal, NumberInput, QRCode, Selectbox, Table, type TableColumn, useToast } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR, type Localized } from "./strings";

type Categorie = "Mobilier" | "Éclairage" | "Accessoires" | "Tech";
type Statut = "en-stock" | "stock-faible" | "rupture";

interface Variante {
  ref: string;
  libelle: Localized;
  prix: number;
  stock: number;
}

interface Produit {
  id: string;
  ref: string;
  nom: Localized;
  categorie: Categorie;
  prix: number;
  stock: number;
  ean: string;
  description: Localized;
  variantes?: Variante[];
}

const CATEGORIES: Categorie[] = ["Mobilier", "Éclairage", "Accessoires", "Tech"];

/**
 * Catalogue seedé 100 % déterministe (littéraux figés, aucun aléa au render).
 * Les EAN-13 sont valides (préfixe GS1 France 376, clé de contrôle calculée).
 * Noms et descriptions bilingues : résolus au render selon la locale active
 * (refs, EAN et prix identiques dans les deux langues).
 */
const INITIAL_PRODUITS: Produit[] = [
  {
    id: "prd-1001",
    ref: "P-1001",
    nom: { fr: "Chaise Oslo", en: "Oslo chair" },
    categorie: "Mobilier",
    prix: 149.0,
    stock: 24,
    ean: "3761234010018",
    description: {
      fr: "Chaise de bureau ergonomique, assise en tissu recyclé et piètement acier. Existe en trois coloris.",
      en: "Ergonomic office chair, recycled-fabric seat and steel base. Available in three colours.",
    },
    variantes: [
      {
        ref: "P-1001-GR",
        libelle: { fr: "Coloris gris", en: "Grey finish" },
        prix: 149.0,
        stock: 10,
      },
      {
        ref: "P-1001-NO",
        libelle: { fr: "Coloris noir", en: "Black finish" },
        prix: 149.0,
        stock: 9,
      },
      {
        ref: "P-1001-BE",
        libelle: { fr: "Coloris beige", en: "Beige finish" },
        prix: 159.0,
        stock: 5,
      },
    ],
  },
  {
    id: "prd-1002",
    ref: "P-1002",
    nom: { fr: "Bureau assis-debout Lindo", en: "Lindo sit-stand desk" },
    categorie: "Mobilier",
    prix: 549.0,
    stock: 8,
    ean: "3761234010025",
    description: {
      fr: "Bureau électrique réglable en hauteur (65–128 cm), plateau chêne 140 × 70 cm, mémoire 3 positions.",
      en: "Electric height-adjustable desk (65–128 cm), 140 × 70 cm oak top, 3-position memory.",
    },
  },
  {
    id: "prd-1003",
    ref: "P-1003",
    nom: { fr: "Lampe de bureau Lumo", en: "Lumo desk lamp" },
    categorie: "Éclairage",
    prix: 79.9,
    stock: 3,
    ean: "3761234010032",
    description: {
      fr: "Lampe LED articulée, température de couleur réglable (2700–6000 K), port USB-C intégré.",
      en: "Articulated LED lamp, adjustable colour temperature (2700–6000 K), built-in USB-C port.",
    },
  },
  {
    id: "prd-1004",
    ref: "P-1004",
    nom: { fr: "Caisson 3 tiroirs Arko", en: "Arko 3-drawer pedestal" },
    categorie: "Mobilier",
    prix: 189.0,
    stock: 12,
    ean: "3761234010049",
    description: {
      fr: "Caisson mobile à 3 tiroirs avec serrure centralisée, finition blanc mat, roulettes freinées.",
      en: "Mobile 3-drawer pedestal with central locking, matte white finish, braked castors.",
    },
  },
  {
    id: "prd-1005",
    ref: "P-1005",
    nom: { fr: "Bras d'écran simple Flex", en: "Flex single monitor arm" },
    categorie: "Accessoires",
    prix: 64.5,
    stock: 0,
    ean: "3761234010056",
    description: {
      fr: "Bras articulé à gaz pour écran 17–32\", fixation pince ou œillet, passage de câbles intégré.",
      en: "Gas-spring monitor arm for 17–32\" screens, clamp or grommet mount, integrated cable routing.",
    },
  },
  {
    id: "prd-1006",
    ref: "P-1006",
    nom: { fr: "Hub USB-C 8 ports", en: "8-port USB-C hub" },
    categorie: "Tech",
    prix: 89.0,
    stock: 31,
    ean: "3761234010063",
    description: {
      fr: "Station USB-C : HDMI 4K, Ethernet gigabit, 3 × USB-A, lecteur SD, charge 100 W en passthrough.",
      en: "USB-C dock: 4K HDMI, gigabit Ethernet, 3 × USB-A, SD card reader, 100 W passthrough charging.",
    },
  },
  {
    id: "prd-1007",
    ref: "P-1007",
    nom: { fr: "Suspension LED Halo", en: "Halo LED pendant light" },
    categorie: "Éclairage",
    prix: 219.0,
    stock: 5,
    ean: "3761234010070",
    description: {
      fr: "Suspension circulaire LED pour open space, éclairage direct/indirect, compatible DALI.",
      en: "Circular LED pendant for open-plan spaces, direct/indirect lighting, DALI compatible.",
    },
    variantes: [
      {
        ref: "P-1007-45",
        libelle: { fr: "Diamètre 45 cm", en: "45 cm diameter" },
        prix: 219.0,
        stock: 3,
      },
      {
        ref: "P-1007-60",
        libelle: { fr: "Diamètre 60 cm", en: "60 cm diameter" },
        prix: 289.0,
        stock: 2,
      },
    ],
  },
  {
    id: "prd-1008",
    ref: "P-1008",
    nom: { fr: "Tapis de souris XL Feutre", en: "XL felt desk pad" },
    categorie: "Accessoires",
    prix: 24.9,
    stock: 57,
    ean: "3761234010087",
    description: {
      fr: "Sous-main 90 × 40 cm en feutre de laine et liège, antidérapant, bords surpiqués.",
      en: "90 × 40 cm desk pad in wool felt and cork, non-slip, with stitched edges.",
    },
  },
  {
    id: "prd-1009",
    ref: "P-1009",
    nom: { fr: "Webcam 4K Vista", en: "Vista 4K webcam" },
    categorie: "Tech",
    prix: 129.0,
    stock: 2,
    ean: "3761234010094",
    description: {
      fr: "Webcam 4K avec cadrage automatique, double micro antibruit et obturateur de confidentialité.",
      en: "4K webcam with auto-framing, dual noise-cancelling microphones and a privacy shutter.",
    },
  },
  {
    id: "prd-1010",
    ref: "P-1010",
    nom: { fr: "Étagère murale Nodo", en: "Nodo wall shelf" },
    categorie: "Mobilier",
    prix: 99.0,
    stock: 0,
    ean: "3761234010100",
    description: {
      fr: "Étagère murale modulaire 80 cm, chêne massif et équerres acier noir, charge 25 kg.",
      en: "Modular 80 cm wall shelf, solid oak with black steel brackets, 25 kg load capacity.",
    },
  },
];

function statutProduit(stock: number): Statut {
  if (stock === 0) return "rupture";
  if (stock <= 5) return "stock-faible";
  return "en-stock";
}

const STATUT_VARIANT: Record<Statut, "success" | "warning" | "error"> = {
  "en-stock": "success",
  "stock-faible": "warning",
  rupture: "error",
};

/** EAN-13 déterministe : préfixe figé + compteur, clé de contrôle GS1 calculée. */
function genererEan(compteur: number): string {
  const base = "3761234" + String(compteur).padStart(5, "0");
  let somme = 0;
  for (let i = 0; i < 12; i++) {
    somme += Number(base[i]) * (i % 2 === 0 ? 1 : 3);
  }
  return base + String((10 - (somme % 10)) % 10);
}

export default function CatalogueProduitsSimulateur() {
  const { locale } = useI18n();
  const T = STR[locale];
  const { showToast } = useToast();
  const [produits, setProduits] = useState<Produit[]>(INITIAL_PRODUITS);

  const EUR = useMemo(
    () =>
      new Intl.NumberFormat(locale === "en" ? "en-GB" : "fr-FR", {
        style: "currency",
        currency: "EUR",
      }),
    [locale]
  );

  // Recherche / filtres
  const [recherche, setRecherche] = useState("");
  const [filtreCategorie, setFiltreCategorie] = useState<string | null>("toutes");
  const [tri, setTri] = useState<string | null>("nom-asc");

  // Fiche produit (drawer) + suppression
  const [ficheId, setFicheId] = useState<string | null>(null);
  const [aSupprimer, setASupprimer] = useState<Produit | null>(null);

  // Création
  const compteurRef = useRef(1011);
  const [creationOuverte, setCreationOuverte] = useState(false);
  const [nouveauNom, setNouveauNom] = useState("");
  const [nouvelleCategorie, setNouvelleCategorie] = useState<string | null>("Mobilier");
  const [nouveauPrix, setNouveauPrix] = useState<number | null>(null);
  const [nouveauStock, setNouveauStock] = useState<number | null>(0);
  const [erreurForm, setErreurForm] = useState<
    "errNameRequired" | "errCategoryRequired" | "errPriceInvalid" | "errStockInvalid" | null
  >(null);

  const categorieOptions = CATEGORIES.map((c) => ({ value: c, label: T.categories[c] }));

  const filtreCategorieOptions = [
    { value: "toutes", label: T.allCategories },
    ...categorieOptions,
  ];

  const triOptions = [
    { value: "nom-asc", label: T.sortNameAsc },
    { value: "prix-asc", label: T.sortPriceAsc },
    { value: "prix-desc", label: T.sortPriceDesc },
    { value: "stock-asc", label: T.sortStockAsc },
  ];

  const ficheProduit = useMemo(
    () => produits.find((p) => p.id === ficheId) ?? null,
    [produits, ficheId]
  );

  const stats = useMemo(() => {
    const valeur = produits.reduce((somme, p) => somme + p.prix * p.stock, 0);
    const alertes = produits.filter((p) => statutProduit(p.stock) !== "en-stock").length;
    return { total: produits.length, valeur, alertes };
  }, [produits]);

  const produitsAffiches = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    const filtres = produits.filter((p) => {
      if (filtreCategorie && filtreCategorie !== "toutes" && p.categorie !== filtreCategorie) {
        return false;
      }
      // La recherche porte sur le libellé de la locale active.
      if (q && !p.nom[locale].toLowerCase().includes(q) && !p.ref.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
    const ordonnes = [...filtres];
    switch (tri) {
      case "prix-asc":
        ordonnes.sort((a, b) => a.prix - b.prix);
        break;
      case "prix-desc":
        ordonnes.sort((a, b) => b.prix - a.prix);
        break;
      case "stock-asc":
        ordonnes.sort((a, b) => a.stock - b.stock);
        break;
      default:
        ordonnes.sort((a, b) => a.nom[locale].localeCompare(b.nom[locale], locale));
    }
    return ordonnes;
  }, [produits, recherche, filtreCategorie, tri, locale]);

  const lignesTableau = useMemo(
    () =>
      produitsAffiches.map((p) => ({
        ...p,
        nom: p.nom[locale],
      })),
    [produitsAffiches, locale]
  );

  const ajusterStock = (produit: Produit, delta: number) => {
    const nouveau = Math.max(0, produit.stock + delta);
    if (nouveau === produit.stock) return;
    setProduits((prev) => prev.map((p) => (p.id === produit.id ? { ...p, stock: nouveau } : p)));
    if (nouveau === 0) {
      showToast(
        T.toastOutOfStock(produit.nom[locale]),
        "warning",
        4000,
        T.toastOutOfStockTitle,
        T.toastSource,
        null
      );
    } else {
      showToast(
        T.toastStockUpdated(produit.nom[locale], produit.stock, nouveau),
        "success",
        3000,
        T.toastStockUpdatedTitle,
        T.toastSource,
        null
      );
    }
  };

  const confirmerSuppression = () => {
    if (!aSupprimer) return;
    setProduits((prev) => prev.filter((p) => p.id !== aSupprimer.id));
    if (ficheId === aSupprimer.id) setFicheId(null);
    showToast(
      T.toastDeleted(aSupprimer.nom[locale], aSupprimer.ref),
      "info",
      4000,
      T.toastDeletedTitle,
      T.toastSource,
      null
    );
    setASupprimer(null);
  };

  const ouvrirCreation = () => {
    setNouveauNom("");
    setNouvelleCategorie("Mobilier");
    setNouveauPrix(null);
    setNouveauStock(0);
    setErreurForm(null);
    setCreationOuverte(true);
  };

  const creerProduit = () => {
    const nom = nouveauNom.trim();
    if (!nom) {
      setErreurForm("errNameRequired");
      return;
    }
    if (!nouvelleCategorie) {
      setErreurForm("errCategoryRequired");
      return;
    }
    if (nouveauPrix === null || nouveauPrix <= 0) {
      setErreurForm("errPriceInvalid");
      return;
    }
    if (nouveauStock === null || nouveauStock < 0) {
      setErreurForm("errStockInvalid");
      return;
    }
    setErreurForm(null);
    const compteur = compteurRef.current;
    compteurRef.current += 1;
    const ref = `P-${compteur}`;
    const maintenant = new Date();
    const produit: Produit = {
      id: `prd-${compteur}`,
      ref,
      nom: { fr: nom, en: nom },
      categorie: nouvelleCategorie as Categorie,
      prix: Math.round(nouveauPrix * 100) / 100,
      stock: Math.round(nouveauStock),
      ean: genererEan(compteur),
      description: {
        fr: STR.fr.createdDescription(maintenant.toLocaleDateString("fr-FR")),
        en: STR.en.createdDescription(maintenant.toLocaleDateString("en-GB")),
      },
    };
    setProduits((prev) => [produit, ...prev]);
    setCreationOuverte(false);
    showToast(
      T.toastCreated(nom, ref, produit.ean),
      "success",
      5000,
      T.toastCreatedTitle,
      T.toastSource,
      null
    );
  };

  const colonnes: TableColumn[] = [
    { key: "ref", label: T.colRef },
    {
      key: "nom",
      label: T.colProduct,
      render: (value, row) => (
        <div>
          <div style={{ color: "var(--bpm-text-primary)", fontWeight: 500 }}>{String(value)}</div>
          {Array.isArray((row as unknown as Produit).variantes) && (
            <div className="text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
              {T.variantCount((row as unknown as Produit).variantes!.length)}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "categorie",
      label: T.colCategory,
      render: (value) => <Badge variant="default">{T.categories[value as Categorie]}</Badge>,
    },
    {
      key: "prix",
      label: T.colPrice,
      align: "right",
      render: (value) => <span>{EUR.format(Number(value))}</span>,
    },
    {
      key: "stock",
      label: T.colStock,
      render: (value) => {
        const stock = Number(value);
        const statut = statutProduit(stock);
        return (
          <span className="inline-flex items-center gap-2">
            <Badge variant={STATUT_VARIANT[statut]}>{T.statuses[statut]}</Badge>
            <span style={{ color: "var(--bpm-text-secondary)" }}>{stock}</span>
          </span>
        );
      },
    },
    {
      key: "id",
      label: T.colActions,
      render: (_, row) => {
        const id = String((row as { id: unknown }).id);
        return (
          <div className="flex flex-wrap gap-2">
            <Button
              size="small"
              variant="secondary"
              onClick={() => setFicheId(id)}
            >
              {T.btnDetails}
            </Button>
            <Button
              size="small"
              variant="destructive"
              onClick={() => setASupprimer(produits.find((p) => p.id === id) ?? null)}
            >
              {T.btnDelete}
            </Button>
          </div>
        );
      },
    },
  ];

  const colonnesVariantes: TableColumn[] = [
    { key: "ref", label: T.colRef },
    { key: "libelle", label: T.colVariant },
    {
      key: "prix",
      label: T.colPrice,
      align: "right",
      render: (value) => <span>{EUR.format(Number(value))}</span>,
    },
    { key: "stock", label: T.colStock, align: "right" },
  ];

  const statutFiche = ficheProduit ? statutProduit(ficheProduit.stock) : null;

  return (
    <div className="space-y-6">
      <MetricRow>
        <Metric label={T.metricProducts} value={String(stats.total)} />
        <Metric label={T.metricStockValue} value={EUR.format(stats.valeur)} />
        <Metric label={T.metricAlerts} value={String(stats.alertes)} />
      </MetricRow>

      <Card variant="outlined" title={T.panelTitle}>
        <div className="grid gap-3 md:grid-cols-3">
          <Input
            label={T.searchLabel}
            placeholder={T.searchPlaceholder}
            value={recherche}
            onChange={setRecherche}
          />
          <Selectbox
            label={T.categoryLabel}
            options={filtreCategorieOptions}
            value={filtreCategorie}
            onChange={setFiltreCategorie}
            placeholder={T.categoryLabel}
          />
          <Selectbox
            label={T.sortLabel}
            options={triOptions}
            value={tri}
            onChange={setTri}
            placeholder={T.sortLabel}
          />
        </div>
        <div className="mt-4">
          <Table
            columns={colonnes}
            data={lignesTableau as unknown as Record<string, unknown>[]}
            striped
            hover
            onRowClick={(row) => setFicheId(String((row as { id: unknown }).id))}
          />
          {produitsAffiches.length === 0 && (
            <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
              {T.emptyState}
            </p>
          )}
        </div>
        <div className="mt-4">
          <Button onClick={ouvrirCreation}>{T.btnNewProduct}</Button>
        </div>
      </Card>

      <Drawer
        open={ficheProduit !== null}
        onClose={() => setFicheId(null)}
        title={ficheProduit ? T.drawerTitle(ficheProduit.ref) : T.drawerTitleFallback}
        side="right"
        width={460}
      >
        {ficheProduit && statutFiche && (
          <div className="space-y-4 p-4">
            <div>
              <h3
                className="text-base font-semibold"
                style={{ color: "var(--bpm-text-primary)" }}
              >
                {ficheProduit.nom[locale]}
              </h3>
              <p className="mt-1 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
                {ficheProduit.description[locale]}
              </p>
            </div>

            <div className="space-y-2">
              <LabelValue label={T.lblReference} value={ficheProduit.ref} copyable />
              <LabelValue
                label={T.lblCategory}
                value={<Badge variant="default">{T.categories[ficheProduit.categorie]}</Badge>}
              />
              <LabelValue label={T.lblPrice} value={EUR.format(ficheProduit.prix)} valueStyle="bold" />
              <LabelValue
                label={T.lblStock}
                value={
                  <span className="inline-flex items-center gap-2">
                    <Badge variant={STATUT_VARIANT[statutFiche]}>
                      {T.statuses[statutFiche]}
                    </Badge>
                    <span>{T.unitsCount(ficheProduit.stock)}</span>
                  </span>
                }
              />
              <LabelValue label={T.lblEan} value={ficheProduit.ean} copyable />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button size="small" variant="secondary" onClick={() => ajusterStock(ficheProduit, 1)}>
                {T.btnPlusOne}
              </Button>
              <Button
                size="small"
                variant="secondary"
                disabled={ficheProduit.stock === 0}
                onClick={() => ajusterStock(ficheProduit, -1)}
              >
                {T.btnMinusOne}
              </Button>
              <Button
                size="small"
                variant="destructive"
                onClick={() => setASupprimer(ficheProduit)}
              >
                {T.btnDeleteProduct}
              </Button>
            </div>

            <div>
              <h4
                className="mb-2 text-sm font-semibold"
                style={{ color: "var(--bpm-text-primary)" }}
              >
                {T.barcodeHeading}
              </h4>
              <Barcode value={ficheProduit.ean} format="EAN13" height={56} />
            </div>

            <div>
              <h4
                className="mb-2 text-sm font-semibold"
                style={{ color: "var(--bpm-text-primary)" }}
              >
                {T.qrHeading}
              </h4>
              <QRCode value={ficheProduit.ref} size={112} />
            </div>

            {ficheProduit.variantes && ficheProduit.variantes.length > 0 && (
              <div>
                <h4
                  className="mb-2 text-sm font-semibold"
                  style={{ color: "var(--bpm-text-primary)" }}
                >
                  {T.variantsHeading(ficheProduit.variantes.length)}
                </h4>
                <Table
                  columns={colonnesVariantes}
                  data={
                    ficheProduit.variantes.map((v) => ({
                      ...v,
                      libelle: v.libelle[locale],
                    })) as unknown as Record<string, unknown>[]
                  }
                  striped
                />
              </div>
            )}
          </div>
        )}
      </Drawer>

      {creationOuverte && (
        <Modal
          isOpen={creationOuverte}
          onClose={() => setCreationOuverte(false)}
          title={T.modalTitle}
          size="medium"
        >
          <div className="space-y-3">
            <Input
              label={T.nameLabel}
              placeholder={T.namePlaceholder}
              value={nouveauNom}
              onChange={setNouveauNom}
            />
            <Selectbox
              label={T.categoryLabel}
              options={categorieOptions}
              value={nouvelleCategorie}
              onChange={setNouvelleCategorie}
              placeholder={T.categoryLabel}
            />
            <div className="grid gap-3 md:grid-cols-2">
              <NumberInput
                label={T.priceLabel}
                value={nouveauPrix}
                onChange={setNouveauPrix}
                min={0}
                step={0.5}
                placeholder={T.pricePlaceholder}
              />
              <NumberInput
                label={T.stockLabel}
                value={nouveauStock}
                onChange={setNouveauStock}
                min={0}
                step={1}
                placeholder={T.stockPlaceholder}
              />
            </div>
            <p className="text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
              {T.refHint(`P-${compteurRef.current}`)}
            </p>
            {erreurForm && (
              <p className="text-sm" style={{ color: "var(--bpm-accent-red, #dc2626)" }}>
                {T[erreurForm]}
              </p>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setCreationOuverte(false)}>
                {T.btnCancel}
              </Button>
              <Button onClick={creerProduit}>{T.btnCreate}</Button>
            </div>
          </div>
        </Modal>
      )}

      <ConfirmModal
        isOpen={aSupprimer !== null}
        title={T.confirmTitle}
        message={
          aSupprimer
            ? T.confirmMessage(
                aSupprimer.nom[locale],
                aSupprimer.ref,
                aSupprimer.variantes?.length ?? 0
              )
            : ""
        }
        confirmLabel={T.confirmLabel}
        cancelLabel={T.cancelLabel}
        variant="danger"
        onConfirm={confirmerSuppression}
        onCancel={() => setASupprimer(null)}
      />
    </div>
  );
}
