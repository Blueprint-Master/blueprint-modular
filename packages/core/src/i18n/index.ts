/** Use JSON dictionaries from the host application. Keys may contain dots. */
export type Dictionary = Readonly<Record<string, string>>;
export type Dictionaries = Readonly<Record<string, Dictionary>>;
const own = (object: object, key: string) => Object.prototype.hasOwnProperty.call(object, key);

export function createTranslator(dictionaries: Dictionaries, reference: string, requested: string) {
  if (!own(dictionaries, reference)) throw new Error("Missing reference dictionary");
  const [tag] = Intl.getCanonicalLocales(requested);
  const language = new Intl.Locale(tag).language;
  const locale = [tag, language, reference].find(code => own(dictionaries, code))!;
  const lookup = (catalog: Dictionary, key: string) => own(catalog, key) && typeof catalog[key] === "string" && catalog[key].trim() ? catalog[key] : undefined;
  const formatNumber = new Intl.NumberFormat(tag);
  const fallback = dictionaries[reference];
  const current = dictionaries[locale];
  const missing = Object.keys(fallback).filter(key => !lookup(current, key));
  return {
    locale, missing,
    translate(key: string, variables: Readonly<Record<string, string | number>> = {}) {
      const local = lookup(current, key);
      let text = local ?? lookup(fallback, key) ?? key;
      const count = variables.count;
      if (typeof count === "number" && text.includes("|")) {
        const forms = text.split("|");
        const rule = new Intl.PluralRules(local ? locale : reference).select(count);
        text = rule === "one" ? forms[0] : forms[forms.length - 1];
      }
      return text.replace(/\{([a-zA-Z_][\w]*)\}/g, (match, name: string) => {
        if (!own(variables, name)) return match;
        return typeof variables[name] === "number" ? formatNumber.format(variables[name] as number) : String(variables[name]);
      });
    },
    currency(amount: number, currency: string) {
      return new Intl.NumberFormat(tag, {style: "currency", currency}).format(amount);
    },
    date(date: Date, options: Intl.DateTimeFormatOptions = {timeZone: "UTC"}) {
      return new Intl.DateTimeFormat(tag, options).format(date);
    },
  };
}
