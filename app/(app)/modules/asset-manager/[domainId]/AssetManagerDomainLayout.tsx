"use client";

import { AssetManagerMobileTabs } from "./AssetManagerMobileTabs";

export function AssetManagerDomainLayout({
  domainId,
  children,
}: {
  domainId: string;
  children: React.ReactNode;
}) {
  return (
    <div className="asset-manager-layout">
      <div className="asset-manager-main-wrapper flex flex-1 min-w-0 min-h-0 flex-col overflow-hidden">
        <AssetManagerMobileTabs domainId={domainId} />
        <main className="asset-manager-main">{children}</main>
      </div>
    </div>
  );
}
