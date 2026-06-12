"use client";

import { useMemo, useRef, useState } from "react";
import {
  Badge,
  Barcode,
  Button,
  ConfirmModal,
  Drawer,
  Input,
  LabelValue,
  Metric,
  MetricRow,
  Modal,
  NumberInput,
  Panel,
  QRCode,
  Selectbox,
  Table,
  type TableColumn,
  useToast,
} from "@/components/bpm";

type Categorie = "Mobilier" | "Éclairage" | "Accessoires" | "Tech";
type Statut = "en-stock" | "stock-faible" | "rupture";

interface Variante {
  ref: string;
  libelle: string;
  prix: number;
  stock: number;
}

interface Produit {
  id: string;
  ref: string;
  nom: string;
  categorie: Categorie;
  prix: number;
  stock: number;
  ean: string;
  description: string;
  variantes?: Variante[];
}

const CATEGORIES: Categorie[] = ["Mobilier", "Éclairage", "Accessoires", "Tech"];

const CATEGORIE_OPTIONS = CATEGORIES.map((c) => ({ value: c, label: c }));

const FILTRE_CATEGORIE_OPTIONS = [
  { value: "toutes", label: "Toutes les catégories" },
  ...CATEGORIE_OPTIONS,
];

const TRI_OPTIONS = [
  { value: "nom-asc", label: "Nom A→Z" },
  { value: "prix-asc", label: "Prix croissant" },
  { value: "prix-desc", label: "Prix décroissant" },
  { value: "stock-asc", label: "Stock croissant" },
];

/**
 * Catalogue seedé 100 % déterministe (littéraux figés, aucun aléa au render).
 * Les EAN-13 sont valides (préfixe GS1 France 376, clé de contrôle calculée).
 */
const INITIAL_PRODUITS: Produit[] = [
  {
    id: "prd-1001",
    ref: "P-1001",
    nom: "Chaise Oslo",
    categorie: "Mobilier",
    prix: 149.0,
    stock: 24,
    ean: "3761234010018",
    description:
      "Chaise de bureau ergonomique, assise en tissu recyclé et piètement acier. Existe en trois coloris.",
    variantes: [
      { ref: "P-1001-GR", libelle: "Coloris gris", prix: 149.0, stock: 10 },
      { ref: "P-1001-NO", libelle: "Coloris noir", prix: 149.0, stock: 9 },
      { ref: "P-1001-BE", libelle: "Coloris beige", prix: 159.0, stock: 5 },
    ],
  },
  {
    id: "prd-1002",
    ref: "P-1002",
    nom: "Bureau assis-debout Lindo",
    categorie: "Mobilier",
    prix: 549.0,
    stock: 8,
    ean: "3761234010025",
    description:
      "Bureau électrique réglable en hauteur (65–128 cm), plateau chêne 140 × 70 cm, mémoire 3 positions.",
  },
  {
    id: "prd-1003",
    ref: "P-1003",
    nom: "Lampe de bureau Lumo",
    categorie: "Éclairage",
    prix: 79.9,
    stock: 3,
    ean: "3761234010032",
    description:
      "Lampe LED articulée, température de couleur réglable (2700–6000 K), port USB-C intégré.",
  },
  {
    id: "prd-1004",
    ref: "P-1004",
    nom: "Caisson 3 tiroirs Arko",
    categorie: "Mobilier",
    prix: 189.0,
    stock: 12,
    ean: "3761234010049",
    description:
      "Caisson mobile à 3 tiroirs avec serrure centralisée, finition blanc mat, roulettes freinées.",
  },
  {
    id: "prd-1005",
    ref: "P-1005",
    nom: "Bras d'écran simple Flex",
    categorie: "Accessoires",
    prix: 64.5,
    stock: 0,
    ean: "3761234010056",
    description:
      "Bras articulé à gaz pour écran 17–32\", fixation pince ou œillet, passage de câbles intégré.",
  },
  {
    id: "prd-1006",
    ref: "P-1006",
    nom: "Hub USB-C 8 ports",
    categorie: "Tech",
    prix: 89.0,
    stock: 31,
    ean: "3761234010063",
    description:
      "Station USB-C : HDMI 4K, Ethernet gigabit, 3 × USB-A, lecteur SD, charge 100 W en passthrough.",
  },
  {
    id: "prd-1007",
    ref: "P-1007",
    nom: "Suspension LED Halo",
    categorie: "Éclairage",
    prix: 219.0,
    stock: 5,
    ean: "3761234010070",
    description:
      "Suspension circulaire LED pour open space, éclairage direct/indirect, compatible DALI.",
    variantes: [
      { ref: "P-1007-45", libelle: "Diamètre 45 cm", prix: 219.0, stock: 3 },
      { ref: "P-1007-60", libelle: "Diamètre 60 cm", prix: 289.0, stock: 2 },
    ],
  },
  {
    id: "prd-1008",
    ref: "P-1008",
    nom: "Tapis de souris XL Feutre",
    categorie: "Accessoires",
    prix: 24.9,
    stock: 57,
    ean: "3761234010087",
    description:
      "Sous-main 90 × 40 cm en feutre de laine et liège, antidérapant, bords surpiqués.",
  },
  {
    id: "prd-1009",
    ref: "P-1009",
    nom: "Webcam 4K Vista",
    categorie: "Tech",
    prix: 129.0,
    stock: 2,
    ean: "3761234010094",
    description:
      "Webcam 4K avec cadrage automatique, double micro antibruit et obturateur de confidentialité.",
  },
  {
    id: "prd-1010",
    ref: "P-1010",
    nom: "Étagère murale Nodo",
    categorie: "Mobilier",
    prix: 99.0,
    stock: 0,
    ean: "3761234010100",
    description:
      "Étagère murale modulaire 80 cm, chêne massif et équerres acier noir, charge 25 kg.",
  },
];

function statutProduit(stock: number): Statut {
  if (stock === 0) return "rupture";
  if (stock <= 5) return "stock-faible";
  return "en-stock";
}

const STATUT_LABEL: Record<Statut, string> = {
  "en-stock": "En stock",
  "stock-faible": "Stock faible",
  rupture: "Rupture",
};

const STATUT_VARIANT: Record<Statut, "success" | "warning" | "error"> = {
  "en-stock": "success",
  "stock-faible": "warning",
  rupture: "error",
};

const EUR = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

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
  const { showToast } = useToast();
  const [produits, setProduits] = useState<Produit[]>(INITIAL_PRODUITS);

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
  const [erreurForm, setErreurForm] = useState<string | null>(null);

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
      if (q && !p.nom.toLowerCase().includes(q) && !p.ref.toLowerCase().includes(q)) {
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
        ordonnes.sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
    }
    return ordonnes;
  }, [produits, recherche, filtreCategorie, tri]);

  const ajusterStock = (produit: Produit, delta: number) => {
    const nouveau = Math.max(0, produit.stock + delta);
    if (nouveau === produit.stock) return;
    setProduits((prev) => prev.map((p) => (p.id === produit.id ? { ...p, stock: nouveau } : p)));
    if (nouveau === 0) {
      showToast(
        `« ${produit.nom} » est désormais en rupture de stock.`,
        "warning",
        4000,
        "Stock épuisé",
        "Catalogue produits",
        null
      );
    } else {
      showToast(
        `Stock de « ${produit.nom} » : ${produit.stock} → ${nouveau}.`,
        "success",
        3000,
        "Stock mis à jour",
        "Catalogue produits",
        null
      );
    }
  };

  const confirmerSuppression = () => {
    if (!aSupprimer) return;
    setProduits((prev) => prev.filter((p) => p.id !== aSupprimer.id));
    if (ficheId === aSupprimer.id) setFicheId(null);
    showToast(
      `« ${aSupprimer.nom} » (${aSupprimer.ref}) a été retiré du catalogue.`,
      "info",
      4000,
      "Produit supprimé",
      "Catalogue produits",
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
      setErreurForm("Le nom du produit est requis.");
      return;
    }
    if (!nouvelleCategorie) {
      setErreurForm("Choisissez une catégorie.");
      return;
    }
    if (nouveauPrix === null || nouveauPrix <= 0) {
      setErreurForm("Indiquez un prix de vente strictement positif.");
      return;
    }
    if (nouveauStock === null || nouveauStock < 0) {
      setErreurForm("Indiquez un stock initial (0 ou plus).");
      return;
    }
    setErreurForm(null);
    const compteur = compteurRef.current;
    compteurRef.current += 1;
    const ref = `P-${compteur}`;
    const produit: Produit = {
      id: `prd-${compteur}`,
      ref,
      nom,
      categorie: nouvelleCategorie as Categorie,
      prix: Math.round(nouveauPrix * 100) / 100,
      stock: Math.round(nouveauStock),
      ean: genererEan(compteur),
      description: `Produit ajouté au catalogue le ${new Date().toLocaleDateString("fr-FR")}.`,
    };
    setProduits((prev) => [produit, ...prev]);
    setCreationOuverte(false);
    showToast(
      `« ${nom} » créé sous la référence ${ref} (EAN ${produit.ean}).`,
      "success",
      5000,
      "Produit créé",
      "Catalogue produits",
      null
    );
  };

  const colonnes: TableColumn[] = [
    { key: "ref", label: "Réf." },
    {
      key: "nom",
      label: "Produit",
      render: (value, row) => (
        <div>
          <div style={{ color: "var(--bpm-text-primary)", fontWeight: 500 }}>{String(value)}</div>
          {Array.isArray((row as unknown as Produit).variantes) && (
            <div className="text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
              {(row as unknown as Produit).variantes!.length} variantes
            </div>
          )}
        </div>
      ),
    },
    {
      key: "categorie",
      label: "Catégorie",
      render: (value) => <Badge variant="default">{String(value)}</Badge>,
    },
    {
      key: "prix",
      label: "Prix",
      align: "right",
      render: (value) => <span>{EUR.format(Number(value))}</span>,
    },
    {
      key: "stock",
      label: "Stock",
      render: (value) => {
        const stock = Number(value);
        const statut = statutProduit(stock);
        return (
          <span className="inline-flex items-center gap-2">
            <Badge variant={STATUT_VARIANT[statut]}>{STATUT_LABEL[statut]}</Badge>
            <span style={{ color: "var(--bpm-text-secondary)" }}>{stock}</span>
          </span>
        );
      },
    },
    {
      key: "id",
      label: "Actions",
      render: (_, row) => {
        const produit = row as unknown as Produit;
        return (
          <div className="flex flex-wrap gap-2">
            <Button
              size="small"
              variant="secondary"
              onClick={() => setFicheId(produit.id)}
            >
              Fiche
            </Button>
            <Button
              size="small"
              variant="destructive"
              onClick={() => setASupprimer(produit)}
            >
              Supprimer
            </Button>
          </div>
        );
      },
    },
  ];

  const colonnesVariantes: TableColumn[] = [
    { key: "ref", label: "Réf." },
    { key: "libelle", label: "Variante" },
    {
      key: "prix",
      label: "Prix",
      align: "right",
      render: (value) => <span>{EUR.format(Number(value))}</span>,
    },
    { key: "stock", label: "Stock", align: "right" },
  ];

  const statutFiche = ficheProduit ? statutProduit(ficheProduit.stock) : null;

  return (
    <div className="space-y-6">
      <MetricRow>
        <Metric label="Produits" value={String(stats.total)} />
        <Metric label="Valeur du stock" value={EUR.format(stats.valeur)} />
        <Metric label="Ruptures / stock faible" value={String(stats.alertes)} />
      </MetricRow>

      <Panel variant="info" title="Catalogue">
        <div className="grid gap-3 md:grid-cols-3">
          <Input
            label="Recherche (nom ou référence)"
            placeholder="Ex. : chaise, P-1003…"
            value={recherche}
            onChange={setRecherche}
          />
          <Selectbox
            label="Catégorie"
            options={FILTRE_CATEGORIE_OPTIONS}
            value={filtreCategorie}
            onChange={setFiltreCategorie}
            placeholder="Catégorie"
          />
          <Selectbox
            label="Tri"
            options={TRI_OPTIONS}
            value={tri}
            onChange={setTri}
            placeholder="Tri"
          />
        </div>
        <div className="mt-4">
          <Table
            columns={colonnes}
            data={produitsAffiches as unknown as Record<string, unknown>[]}
            striped
            hover
            onRowClick={(row) => setFicheId((row as unknown as Produit).id)}
          />
          {produitsAffiches.length === 0 && (
            <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
              Aucun produit ne correspond à la recherche ou aux filtres.
            </p>
          )}
        </div>
        <div className="mt-4">
          <Button onClick={ouvrirCreation}>Nouveau produit</Button>
        </div>
      </Panel>

      <Drawer
        open={ficheProduit !== null}
        onClose={() => setFicheId(null)}
        title={ficheProduit ? `Fiche produit — ${ficheProduit.ref}` : "Fiche produit"}
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
                {ficheProduit.nom}
              </h3>
              <p className="mt-1 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
                {ficheProduit.description}
              </p>
            </div>

            <div className="space-y-2">
              <LabelValue label="Référence" value={ficheProduit.ref} copyable />
              <LabelValue
                label="Catégorie"
                value={<Badge variant="default">{ficheProduit.categorie}</Badge>}
              />
              <LabelValue label="Prix" value={EUR.format(ficheProduit.prix)} valueStyle="bold" />
              <LabelValue
                label="Stock"
                value={
                  <span className="inline-flex items-center gap-2">
                    <Badge variant={STATUT_VARIANT[statutFiche]}>
                      {STATUT_LABEL[statutFiche]}
                    </Badge>
                    <span>{ficheProduit.stock} unités</span>
                  </span>
                }
              />
              <LabelValue label="EAN-13" value={ficheProduit.ean} copyable />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button size="small" variant="secondary" onClick={() => ajusterStock(ficheProduit, 1)}>
                +1 stock
              </Button>
              <Button
                size="small"
                variant="secondary"
                disabled={ficheProduit.stock === 0}
                onClick={() => ajusterStock(ficheProduit, -1)}
              >
                −1 stock
              </Button>
              <Button
                size="small"
                variant="destructive"
                onClick={() => setASupprimer(ficheProduit)}
              >
                Supprimer le produit
              </Button>
            </div>

            <div>
              <h4
                className="mb-2 text-sm font-semibold"
                style={{ color: "var(--bpm-text-primary)" }}
              >
                Code-barres (EAN-13)
              </h4>
              <Barcode value={ficheProduit.ean} format="EAN13" height={56} />
            </div>

            <div>
              <h4
                className="mb-2 text-sm font-semibold"
                style={{ color: "var(--bpm-text-primary)" }}
              >
                QR code (référence interne)
              </h4>
              <QRCode value={ficheProduit.ref} size={112} />
            </div>

            {ficheProduit.variantes && ficheProduit.variantes.length > 0 && (
              <div>
                <h4
                  className="mb-2 text-sm font-semibold"
                  style={{ color: "var(--bpm-text-primary)" }}
                >
                  Variantes ({ficheProduit.variantes.length})
                </h4>
                <Table
                  columns={colonnesVariantes}
                  data={ficheProduit.variantes as unknown as Record<string, unknown>[]}
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
          title="Nouveau produit"
          size="medium"
        >
          <div className="space-y-3">
            <Input
              label="Nom du produit (requis)"
              placeholder="Ex. : Fauteuil Bergen"
              value={nouveauNom}
              onChange={setNouveauNom}
            />
            <Selectbox
              label="Catégorie"
              options={CATEGORIE_OPTIONS}
              value={nouvelleCategorie}
              onChange={setNouvelleCategorie}
              placeholder="Catégorie"
            />
            <div className="grid gap-3 md:grid-cols-2">
              <NumberInput
                label="Prix de vente (€)"
                value={nouveauPrix}
                onChange={setNouveauPrix}
                min={0}
                step={0.5}
                placeholder="Ex. : 129.90"
              />
              <NumberInput
                label="Stock initial"
                value={nouveauStock}
                onChange={setNouveauStock}
                min={0}
                step={1}
                placeholder="Ex. : 10"
              />
            </div>
            <p className="text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
              La référence (P-{compteurRef.current}) et l&apos;EAN-13 seront générés automatiquement
              à la création.
            </p>
            {erreurForm && (
              <p className="text-sm" style={{ color: "var(--bpm-accent-red, #dc2626)" }}>
                {erreurForm}
              </p>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setCreationOuverte(false)}>
                Annuler
              </Button>
              <Button onClick={creerProduit}>Créer le produit</Button>
            </div>
          </div>
        </Modal>
      )}

      <ConfirmModal
        isOpen={aSupprimer !== null}
        title="Supprimer le produit"
        message={
          aSupprimer
            ? `« ${aSupprimer.nom} » (${aSupprimer.ref}) sera retiré du catalogue${
                aSupprimer.variantes && aSupprimer.variantes.length > 0
                  ? ` avec ses ${aSupprimer.variantes.length} variantes`
                  : ""
              }. Cette action est immédiate.`
            : ""
        }
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        onConfirm={confirmerSuppression}
        onCancel={() => setASupprimer(null)}
      />
    </div>
  );
}
