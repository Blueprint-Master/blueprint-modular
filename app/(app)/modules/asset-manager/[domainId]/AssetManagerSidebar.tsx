"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function IconSvg({ size = 20, className, d }: { size?: number; className?: string; d: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height={size} viewBox="0 -960 960 960" width={size} className={className} fill="currentColor">
      <path d={d} />
    </svg>
  );
}

function IconDashboard({ className, size = 20 }: { className?: string; size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height={size} viewBox="0 -960 960 960" width={size} className={className} fill="currentColor">
      <path d="M120-200v-560h720v560H120Zm680-300v-220H160v220h640ZM375.38-240H800v-220H375.38v220ZM160-240h175.38v-220H160v220Z" />
    </svg>
  );
}

const ICON_SIZE = 20;

const ITEMS = [
  { key: "dashboard", label: "Tableau de bord", path: "", icon: <IconDashboard size={ICON_SIZE} /> },
  {
    key: "assets",
    label: "Équipements",
    path: "/assets",
    icon: (
      <IconSvg
        size={ICON_SIZE}
        d="M360-160v-40h80v-80H184.62q-27.62 0-46.12-18.5Q120-317 120-344.62v-390.76q0-27.62 18.5-46.12Q157-800 184.62-800h590.76q27.62 0 46.12 18.5Q840-763 840-735.38v390.76q0 27.62-18.5 46.12Q803-280 775.38-280H520v80h80v40H360ZM184.62-320h590.76q9.24 0 16.93-7.69 7.69-7.69 7.69-16.93v-390.76q0-9.24-7.69-16.93-7.69-7.69-16.93-7.69H184.62q-9.24 0-16.93 7.69-7.69 7.69-7.69 16.93v390.76q0 9.24 7.69 16.93 7.69 7.69 16.93 7.69ZM160-320v-440 440Z"
      />
    ),
  },
  {
    key: "tickets",
    label: "Tickets",
    path: "/tickets",
    icon: (
      <IconSvg
        size={ICON_SIZE}
        d="M480.03-307.69q8.51 0 14.24-5.76t5.73-14.27q0-8.51-5.76-14.24t-14.27-5.73q-8.51 0-14.24 5.76-5.73 5.75-5.73 14.26 0 8.52 5.76 14.25t14.27 5.73Zm0-152.31q8.51 0 14.24-5.76t5.73-14.27q0-8.51-5.76-14.24T479.97-500q-8.51 0-14.24 5.76T460-479.97q0 8.51 5.76 14.24t14.27 5.73Zm0-152.31q8.51 0 14.24-5.76 5.73-5.75 5.73-14.26 0-8.52-5.76-14.25t-14.27-5.73q-8.51 0-14.24 5.76T460-632.28q0 8.51 5.76 14.24t14.27 5.73ZM775.38-200H184.62q-26.66 0-45.64-18.98T120-264.62v-103.07q35.31-13.08 57.65-43.5Q200-441.62 200-480t-22.35-68.81q-22.34-30.42-57.65-43.5v-103.07q0-26.66 18.98-45.64T184.62-760h590.76q26.66 0 45.64 18.98T840-695.38v103.07q-35.31 13.08-57.65 43.5Q760-518.38 760-480t22.35 68.81q22.34 30.42 57.65 43.5v103.07q0 26.66-18.98 45.64T775.38-200Zm0-40q10.77 0 17.7-6.92 6.92-6.93 6.92-17.7V-342q-37-22-58.5-58.5T720-480q0-43 21.5-79.5T800-618v-77.38q0-10.77-6.92-17.7-6.93-6.92-17.7-6.92H184.62q-10.77 0-17.7 6.92-6.92 6.93-6.92 17.7V-618q37 22 58.5 58.5T240-480q0 43-21.5 79.5T160-342v77.38q0 10.77 6.92 17.7 6.93 6.92 17.7 6.92h590.76ZM480-480Z"
      />
    ),
  },
  {
    key: "assignments",
    label: "Mise à disposition",
    path: "/assignments",
    icon: (
      <IconSvg
        size={ICON_SIZE}
        d="M702-508.46 588.46-622 617-649.54l85 85 170-170L900.31-706 702-508.46Zm-426.92-31.23Q240-574.77 240-624.62q0-49.84 35.08-84.92 35.07-35.08 84.92-35.08t84.92 35.08Q480-674.46 480-624.62q0 49.85-35.08 84.93-35.07 35.07-84.92 35.07t-84.92-35.07ZM80-215.38v-65.85q0-24.77 14.42-46.35 14.43-21.57 38.81-33.5 56.62-27.15 113.31-40.73 56.69-13.57 113.46-13.57 56.77 0 113.46 13.57 56.69 13.58 113.31 40.73 24.38 11.93 38.81 33.5Q640-306 640-281.23v65.85H80Zm40-40h480v-25.85q0-13.31-8.58-25-8.57-11.69-23.73-19.77-49.38-23.92-101.69-36.65-52.31-12.73-106-12.73t-106 12.73Q201.69-349.92 152.31-326q-15.16 8.08-23.73 19.77-8.58 11.69-8.58 25v25.85Zm296.5-312.74q23.5-23.5 23.5-56.5t-23.5-56.5q-23.5-23.5-56.5-23.5t-56.5 23.5q-23.5 23.5-23.5 56.5t23.5 56.5q23.5 23.5 56.5 23.5t56.5-23.5ZM360-315.38Zm0-309.24Z"
      />
    ),
  },
  {
    key: "contracts",
    label: "Contrats",
    path: "/contracts",
    icon: (
      <IconSvg
        size={ICON_SIZE}
        d="M335.38-467.69h289.24v-40H335.38v40Zm0 110.77h289.24v-40H335.38v40Zm0 110.77h169.24v-40H335.38v40ZM264.62-120q-27.62 0-46.12-18.5Q200-157 200-184.62v-590.76q0-27.62 18.5-46.12Q237-840 264.62-840H580l180 180v475.38q0 27.62-18.5 46.12Q723-120 695.38-120H264.62ZM560-640v-160H264.62q-9.24 0-16.93 7.69-7.69 7.69-7.69 16.93v590.76q0 9.24 7.69 16.93 7.69 7.69 16.93 7.69h430.76q9.24 0 16.93-7.69 7.69-7.69 7.69-16.93V-640H560ZM240-800v160-160 640-640Z"
      />
    ),
  },
  {
    key: "knowledge",
    label: "Connaissances",
    path: "/knowledge",
    icon: (
      <IconSvg
        size={ICON_SIZE}
        d="M260-318.46q52.38 0 101.88 12.04 49.5 12.04 98.12 39.19v-392.46q-43.31-30.93-95.46-46.39-52.16-15.46-104.54-15.46-36 0-63.04 4.31t-60.04 16q-9.23 3.08-13.07 8.85-3.85 5.76-3.85 12.69v360.61q0 10.77 7.69 15.77t16.93 1.16q21.92-7.39 50.65-11.85 28.73-4.46 64.73-4.46Zm240 51.23q48.62-27.15 98.12-39.19 49.5-12.04 101.88-12.04 36 0 64.73 4.46 28.73 4.46 50.65 11.85 9.24 3.84 16.93-1.16 7.69-5 7.69-15.77v-360.61q0-6.93-3.85-12.31-3.84-5.38-13.07-9.23-33-11.69-60.04-16-27.04-4.31-63.04-4.31-52.38 0-104.54 15.46-52.15 15.46-95.46 46.39v392.46Zm-20 58q-48.77-33.39-104.77-51.31-56-17.92-115.23-17.92-31.23 0-61.35 5.23Q168.54-268 140-256.46q-21.77 8.69-40.88-5.23Q80-275.61 80-300.15v-386.62q0-14.85 7.81-27.54T109.69-732q35.23-15.54 73.31-22.54 38.08-7 77-7 58.77 0 114.65 16.92 55.89 16.93 105.35 49.24 49.46-32.31 105.35-49.24 55.88-16.92 114.65-16.92 38.92 0 77 7T850.31-732q14.07 5 21.88 17.69 7.81 12.69 7.81 27.54v386.62q0 24.54-20.65 37.69-20.66 13.15-43.97 4.46-27.76-10.77-56.73-15.62-28.96-4.84-58.65-4.84-59.23 0-115.23 17.92-56 17.92-104.77 51.31ZM290-499.38Z"
      />
    ),
  },
  {
    key: "changes",
    label: "Changements",
    path: "/changes",
    icon: (
      <IconSvg
        size={ICON_SIZE}
        d="M209.38-351.85q-14.3-29.53-21.84-61.46Q180-445.23 180-478q0-125.54 87.62-213.77Q355.23-780 480-780h55.46l-84-84 28.31-28.31L612.08-760 479.77-627.69 451.46-656l84-84H480q-108.46 0-184.23 76.27T220-478q0 23.69 4.85 48.31 4.84 24.61 14.53 47.84l-30 30ZM480.23-67.69 347.92-200l132.31-132.31L508.54-304l-84 84H480q108.46 0 184.23-76.27T740-482q0-23.69-4.85-48.31-4.84-24.61-14.53-47.84l30-30q14.3 29.53 21.84 61.46Q780-514.77 780-482q0 125.54-87.62 213.77Q604.77-180 480-180h-55.46l84 84-28.31 28.31Z"
      />
    ),
  },
  {
    key: "cmdb",
    label: "Cartographie CMDB",
    path: "/cmdb-graph",
    icon: (
      <IconSvg
        size={ICON_SIZE}
        d="M610.77-200v-74.62H460V-460H348.46v73.85H120v-188.47h228.46V-500H460v-186.15h150.77v-74.62H840v189.23H610.77v-74.61H500v331.53h110.77v-73.84H840V-200H610.77Zm40-40H800v-108.46H650.77V-240ZM160-426.15h148.46v-108.47H160v108.47Zm490.77-185.39H800v-109.23H650.77v109.23Zm0 371.54v-108.46V-240ZM308.46-426.15v-108.47 108.47Zm342.31-185.39v-109.23 109.23Z"
      />
    ),
  },
  {
    key: "audit",
    label: "Journal d'audit",
    path: "/audit",
    icon: (
      <IconSvg
        size={ICON_SIZE}
        d="M240-120q-33.85 0-56.92-23.08Q160-166.15 160-200v-110.77h120V-840h520v640q0 33.85-23.08 56.92Q753.85-120 720-120H240Zm480-40q17 0 28.5-11.5T760-200v-600H320v489.23h360V-200q0 17 11.5 28.5T720-160ZM375.38-624.62v-40h329.24v40H375.38Zm0 110.77v-40h329.24v40H375.38ZM240-160h400v-110.77H200V-200q0 17 11.5 28.5T240-160Zm0 0h-40 440-400Z"
      />
    ),
  },
] as const;

function getSectionFromPath(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  const idx = parts.indexOf("asset-manager");
  const segment = idx >= 0 && parts[idx + 2] ? parts[idx + 2] : "";
  if (!segment) return "dashboard";
  if (segment === "cmdb-graph") return "cmdb";
  if (segment === "audit") return "audit";
  const found = ITEMS.find((s) => s.path === `/${segment}`);
  return found ? found.key : "dashboard";
}

export function AssetManagerSidebar({ domainId }: { domainId: string }) {
  const pathname = usePathname();
  const current = getSectionFromPath(pathname ?? "");
  const basePath = `/modules/asset-manager/${domainId}`;

  return (
    <aside className="asset-manager-sidebar" aria-label="Navigation Gestion de parc">
      <nav className="asset-manager-sidebar-nav">
        {ITEMS.map((item) => {
          const href = item.path ? `${basePath}${item.path}` : basePath;
          const isActive = current === item.key;
          return (
            <Link
              key={item.key}
              href={href}
              className={`asset-manager-sidebar-link ${isActive ? "asset-manager-sidebar-link--active" : ""}`}
            >
              <span className="asset-manager-sidebar-link-icon flex-shrink-0" aria-hidden>
                {item.icon}
              </span>
              <span className="asset-manager-sidebar-link-text">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="asset-manager-sidebar-footer">
        <Link href="/modules" className="asset-manager-sidebar-link">
          Retour aux modules
        </Link>
        <Link href="/modules/asset-manager/documentation" className="asset-manager-sidebar-link">
          Documentation
        </Link>
      </div>
    </aside>
  );
}
