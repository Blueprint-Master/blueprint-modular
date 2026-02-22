/**
 * i18n pour Blueprint Modular — charge la langue (?lang= ou localStorage), applique les traductions aux [data-i18n].
 */
(function() {
  var LANG_KEY = 'bpm-lang';
  var SUPPORTED = ['fr', 'en', 'de', 'es', 'it', 'nl', 'zh', 'ja'];

  function getLang() {
    var params = new URLSearchParams(window.location.search);
    var lang = params.get('lang');
    if (lang && SUPPORTED.indexOf(lang) !== -1) return lang;
    try { lang = localStorage.getItem(LANG_KEY); } catch (e) {}
    return (lang && SUPPORTED.indexOf(lang) !== -1) ? lang : 'fr';
  }

  function setLang(lang) {
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
    var url = new URL(window.location.href);
    url.searchParams.set('lang', lang);
    window.location.href = url.toString();
  }

  function getNested(obj, key) {
    var parts = key.split('.');
    for (var i = 0; i < parts.length && obj != null; i++) obj = obj[parts[i]];
    return obj;
  }

  function applyTranslations(t, scope) {
    scope = scope || document;
    var nodes = scope.querySelectorAll('[data-i18n]');
    nodes.forEach(function(node) {
      var key = node.getAttribute('data-i18n');
      var val = getNested(t, key);
      if (val != null && typeof val === 'string') {
        if (val.indexOf('<') !== -1) node.innerHTML = val;
        else node.textContent = val;
      }
    });
    var placeholders = scope.querySelectorAll('[data-i18n-placeholder]');
    placeholders.forEach(function(node) {
      var key = node.getAttribute('data-i18n-placeholder');
      var val = getNested(t, key);
      if (val != null && typeof val === 'string') node.setAttribute('placeholder', val);
    });
  }

  function run() {
    var lang = getLang();
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang === 'ja' ? 'ja' : lang;
    var switcherEl = document.getElementById('i18n-switcher');
    if (switcherEl && switcherEl.tagName === 'SELECT') switcherEl.value = lang;
    var base = (function() {
      var s = document.querySelector('script[data-i18n-base]');
      return (s && s.getAttribute('data-i18n-base')) || '';
    })();
    var url = base + 'i18n/' + lang + '.json';
    fetch(url).then(function(r) { return r.json(); }).then(function(t) {
      applyTranslations(t);
      if (t.page && t.page.title) document.title = t.page.title;
      if (t.page && t.page.description) {
        var meta = document.querySelector('meta[name="description"]');
        if (meta) meta.setAttribute('content', t.page.description);
      }
      var switcher = document.getElementById('i18n-switcher');
      if (switcher) {
        if (switcher.tagName === 'SELECT') {
          switcher.value = lang;
          switcher.addEventListener('change', function() {
            setLang(switcher.value);
          });
          if (t.languages) {
            [].slice.call(switcher.options).forEach(function(opt) {
              if (t.languages[opt.value]) opt.textContent = t.languages[opt.value];
            });
          }
        } else if (t.languages) {
          switcher.innerHTML = '';
          Object.keys(t.languages).forEach(function(code) {
            var a = document.createElement('a');
            a.href = '?lang=' + code;
            a.textContent = t.languages[code];
            a.addEventListener('click', function(e) { e.preventDefault(); setLang(code); });
            if (code === lang) a.setAttribute('aria-current', 'true');
            switcher.appendChild(a);
          });
        }
      }
    }).catch(function() {
      var switcher = document.getElementById('i18n-switcher');
      if (switcher && switcher.tagName === 'SELECT') {
        switcher.value = getLang();
        switcher.addEventListener('change', function() { setLang(switcher.value); });
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
  window.bpmSetLang = setLang;
  window.bpmGetLang = getLang;
})();
