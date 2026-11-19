import type { DomainConfig } from "./get-domain-config";

export function relationTypes(config: DomainConfig | null) {
  const legacy = ["depends_on", "connected_to", "hosted_on", "fed_by", "controls"];
  return [...new Set([...(config?.ci_relation_types ?? []).map(type => type.id), ...legacy])];
}

export function symmetricRelation(type: string) {
  return type === "connected_to" || type === "shares_utility";
}
