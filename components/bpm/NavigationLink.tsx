"use client";
import React from "react";

type LinkProps = { href: string; children: React.ReactNode; className?: string; style?: React.CSSProperties };
const RouterLink = React.createContext<React.ComponentType<LinkProps> | "a">("a");

/** Optional app router integration, scoped to this tree for SSR and multiple roots. */
export const NavigationLinkProvider = RouterLink.Provider;

export function NavigationLink(props: LinkProps) {
  const Link = React.useContext(RouterLink);
  return <Link {...props} />;
}
