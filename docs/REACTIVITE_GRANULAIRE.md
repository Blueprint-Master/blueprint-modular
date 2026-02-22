# Réactivité granulaire + syntaxe simple

**Objectif** : le meilleur des deux mondes — **réactivité granulaire** (seuls les composants concernés se mettent à jour) avec une **syntaxe aussi simple** que celle des frameworks type Streamlit (pas de re-run complet du script à chaque interaction).

---

## 1. Problème des frameworks « script re-run »

- **Streamlit** : à chaque action utilisateur, tout le script Python est réexécuté. Simple à écrire, mais coûteux et peu scalable (recalcul de tout le graphe, re-render de toute la page).
- **Dash** : réactivité par callbacks explicites ; plus granulaire mais verbose (déclarer chaque input → output).

BPM vise : **syntaxe simple** (comme Streamlit) + **mise à jour ciblée** (seules les parties du UI qui dépendent de l’état modifié sont rafraîchies).

---

## 2. Modèle cible : grappe de dépendances

- **État** = ensemble de **refs** nommées (`bpm.ref("x")` ou `$x`). Chaque ref a une valeur et une liste de **souscripteurs** (composants ou calculs qui en dépendent).
- **Composant** : à l’affichage, il **s’abonne** aux refs qu’il lit (ex. un `Metric` lit `bpm.ref("valeur")`). Quand une ref change, seuls ses souscripteurs sont notifiés (re-render ou recalcul).
- **Interaction** : un clic sur un bouton appelle `bpm.ref("valeur").set(nouvelle_valeur)` ; le runtime notifie uniquement les composants abonnés à `"valeur"`, pas toute la page.

Côté **frontend** (React) : un **store réactif** (voir `frontend/bpm/reactiveStore.js`) permet de :
- `store.get(key)`, `store.set(key, value)` ;
- `store.subscribe(key, callback)` pour réagir aux changements ;
- un hook `useReactive(key)` qui re-render le composant quand cette clé change.

Côté **Python** : le package `bpm` expose déjà `ref(name).get()`, `.set()`, `.subscribe()`. Le futur runtime `bpm run` devra :
- tracer quels composants lisent quelles refs pendant le rendu ;
- lors d’un `set`, envoyer au frontend uniquement les mises à jour des refs concernées ;
- le frontend met à jour seulement les widgets abonnés à ces refs (pas de full refresh).

---

## 3. Syntaxe « simple »

- **Écrire** : `bpm.ref("filtre_date").set(date)` ou, en API plus haut niveau, un widget qui fait ça automatiquement quand l’utilisateur change la date.
- **Lire** : dans un composant, `bpm.ref("filtre_date").get()` ; le composant est alors enregistré comme dépendant de `filtre_date`.
- Pas besoin de définir des callbacks pour chaque paire (input, output) comme en Dash ; la dépendance est déduite de l’usage des refs.

---

## 4. Store minimal (frontend)

Un **store réactif** minimal est fourni dans **`frontend/bpm/reactiveStore.js`** :
- `get(key)`, `set(key, value)` ;
- `subscribe(key, callback)` → retourne `unsubscribe` ;
- optionnel : hook React `useReactive(key)` pour lier un composant à une clé.

Les composants BPM peuvent l’utiliser pour un mode « réactif » côté client (sans backend) ; le futur runtime Python pourra s’y connecter en poussant les valeurs des refs via WebSocket ou SSE.

---

## 5. Fichiers

- **Doc** : ce fichier `docs/REACTIVITE_GRANULAIRE.md`.
- **Store frontend** : `frontend/bpm/reactiveStore.js` (et éventuellement `useReactive.js` pour React).
- **Refs Python** : `bpm/__init__.py` (`ref`, `Ref` avec get/set/subscribe).

---

*Voir aussi : `docs/REGISTRY.md`, `docs/ROADMAP.md`.*
