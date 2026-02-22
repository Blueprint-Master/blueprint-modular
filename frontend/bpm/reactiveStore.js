/**
 * Store réactif minimal — réactivité granulaire côté frontend.
 * get/set par clé ; subscribe(key, callback) pour ne mettre à jour que les
 * composants qui dépendent de cette clé (pas de re-run complet).
 */
const state = {};
const subscribers = {};

function get(key) {
  return state[key];
}

function set(key, value) {
  if (state[key] === value) return;
  state[key] = value;
  (subscribers[key] || []).forEach((cb) => cb(value));
}

function subscribe(key, callback) {
  if (!subscribers[key]) subscribers[key] = [];
  subscribers[key].push(callback);
  return function unsubscribe() {
    subscribers[key] = subscribers[key].filter((cb) => cb !== callback);
  };
}

export default { get, set, subscribe };
