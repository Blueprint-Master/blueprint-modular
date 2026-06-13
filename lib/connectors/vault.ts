/**
 * Résolution des secrets au RUNTIME — interface uniquement (track Maker ultérieur).
 *
 * Le descripteur ne porte que des CLÉS (`CredentialField.key`). La VALEUR d'un secret
 * n'existe jamais dans le dépôt : elle est résolue à l'exécution de l'app générée par
 * `vault.get(appId, connectorId, key)`.
 *
 * Au MVP du pilier (catalogue + vitrine), AUCUN secret n'est lu. Ce module fournit :
 *  - l'interface `VaultResolver` (contrat pour l'implémentation runtime à venir) ;
 *  - un garde-fou `showcaseVault` qui LÈVE si on tente de lire une valeur en contexte
 *    vitrine — la vitrine doit tourner sur des fixtures, jamais sur un secret.
 */

/** Contrat de résolution d'un secret au runtime de l'app générée. */
export interface VaultResolver {
  /**
   * Rend la valeur du secret `key` pour le connecteur `connectorId` de l'app `appId`.
   * Implémentation runtime hors-MVP (coffre dédié, jamais le dépôt).
   */
  get(appId: string, connectorId: string, key: string): Promise<string>;
}

/**
 * Vault de la vitrine : interdit toute lecture de secret. Toute tentative est une
 * erreur de conception (la vitrine tourne sur Operation.sampleResponse).
 */
export const showcaseVault: VaultResolver = {
  get(_appId, connectorId, key) {
    return Promise.reject(
      new Error(
        `vault.get interdit en contexte vitrine (connector "${connectorId}", key "${key}"). ` +
          `La démo doit utiliser Operation.sampleResponse (fixture), jamais un secret.`
      )
    );
  },
};
