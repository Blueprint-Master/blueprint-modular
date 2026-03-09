import { AssetManagerDomainLayout } from "./AssetManagerDomainLayout";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ domainId: string }>;
}) {
  const { domainId } = await params;
  if (!domainId) return <>{children}</>;
  return (
    <AssetManagerDomainLayout domainId={domainId}>
      {children}
    </AssetManagerDomainLayout>
  );
}
