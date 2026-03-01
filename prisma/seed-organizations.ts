import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Organisation par défaut — personnalisable via .env
  const defaultOrgName = process.env.DEFAULT_ORG_NAME ?? "My Organization";
  const defaultOrgSlug = process.env.DEFAULT_ORG_SLUG ?? "default";

  const defaultOrg = await prisma.organization.upsert({
    where: { slug: defaultOrgSlug },
    update: {},
    create: {
      name: defaultOrgName,
      slug: defaultOrgSlug,
      plan: "pro",
      workspaces: {
        create: [
          { name: "General", slug: "general" },
          { name: "Operations", slug: "operations" },
        ],
      },
    },
    include: { workspaces: true },
  });

  // Migrer les données legacy sans référence aux orgs réelles
  // WikiArticles, Documents, AiConversations, Contracts → org par défaut
  await prisma.wikiArticle.updateMany({
    where: { organizationId: null },
    data: { organizationId: defaultOrg.id },
  });
  await prisma.document.updateMany({
    where: { organizationId: null },
    data: { organizationId: defaultOrg.id },
  });
  await prisma.aiConversation.updateMany({
    where: { organizationId: null },
    data: { organizationId: defaultOrg.id },
  });
  await prisma.contract.updateMany({
    where: { organizationId: null },
    data: { organizationId: defaultOrg.id },
  });

  // Assets/Tickets/etc. → workspace 'general' par défaut
  const generalWs = defaultOrg.workspaces.find((w) => w.slug === "general")!;
  const models = ["asset", "ticket", "assignment", "knowledgeArticle", "changeRequest"] as const;
  for (const model of models) {
    await (prisma[model] as { updateMany: (args: unknown) => Promise<unknown> }).updateMany({
      where: { workspaceId: null },
      data: { workspaceId: generalWs.id },
    });
  }
  // AssetContract n'est pas dans le même pattern (pas de relation workspace dans le client de la même façon)
  await prisma.assetContract.updateMany({
    where: { workspaceId: null },
    data: { workspaceId: generalWs.id },
  });

  console.log("✅ Organisation par défaut créée et données migrées");
  console.log(`   Org  : ${defaultOrg.name} (${defaultOrg.id})`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
