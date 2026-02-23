"""
CLI BPM — bpm run app.py, bpm init.
Point d'entrée : bpm = bpm.cli:main
"""
from __future__ import annotations

import argparse
import json
import os
import runpy
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Optional
from urllib.parse import parse_qs, urlparse

# Import après que le répertoire de travail soit celui de l'app
def _run_script(script_path: str) -> list:
    """Exécute script_path et retourne la liste des nœuds de rendu."""
    import bpm
    bpm.reset_current_nodes()
    script_dir = os.path.abspath(os.path.dirname(script_path))
    if script_dir not in sys.path:
        sys.path.insert(0, script_dir)
    old_cwd = os.getcwd()
    try:
        os.chdir(script_dir)
        runpy.run_path(script_path, run_name="__main__")
        return bpm.get_current_nodes()
    finally:
        os.chdir(old_cwd)
        if script_dir in sys.path:
            sys.path.remove(script_dir)


def _nodes_to_html(nodes: list) -> str:
    """Génère une page HTML qui affiche les nœuds (rendu minimal côté client)."""
    nodes_js = json.dumps(nodes, default=str, ensure_ascii=False)
    return f"""<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>BPM App</title>
  <style>
    body {{ font-family: system-ui, sans-serif; margin: 1rem 2rem; max-width: 800px; }}
    .bpm-title {{ font-size: 1.5rem; font-weight: 700; margin: 1rem 0; }}
    .bpm-write {{ margin: 0.5rem 0; }}
    .bpm-metric {{ display: inline-block; padding: 1rem; margin: 0.5rem; background: #f0f0f0; border-radius: 8px; }}
    .bpm-metric .value {{ font-size: 1.5rem; font-weight: 700; }}
    .bpm-metric .delta {{ font-size: 0.85rem; color: #666; }}
    .bpm-button {{ padding: 0.5rem 1rem; margin: 0.25rem; cursor: pointer; background: #1A4B8F; color: #fff; border: none; border-radius: 6px; }}
    .bpm-button:hover {{ opacity: 0.9; }}
    table {{ border-collapse: collapse; width: 100%; margin: 1rem 0; }}
    th, td {{ border: 1px solid #ddd; padding: 0.5rem; text-align: left; }}
    th {{ background: #f5f5f5; }}
    .bpm-panel {{ padding: 1rem; margin: 1rem 0; border-radius: 8px; border-left: 4px solid #00A3E0; background: #f8f9fa; }}
    .bpm-code {{ background: #1e1e1e; color: #d4d4d4; padding: 1rem; border-radius: 6px; overflow-x: auto; font-family: monospace; font-size: 0.9rem; }}
    hr {{ margin: 1rem 0; border: none; border-top: 1px solid #eee; }}
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
    const nodes = {nodes_js};
    const root = document.getElementById('root');
    function render(nodes) {{
      root.innerHTML = '';
      nodes.forEach(n => {{
        const div = document.createElement('div');
        div.className = 'bpm-' + n.type;
        if (n.type === 'title') {{
          const el = document.createElement('h' + (n.props.level || 1));
          el.textContent = n.props.text;
          root.appendChild(el);
        }} else if (n.type === 'write' || n.type === 'markdown') {{
          const p = document.createElement('div');
          p.innerHTML = n.props.text;
          root.appendChild(p);
        }} else if (n.type === 'button') {{
          const btn = document.createElement('button');
          btn.className = 'bpm-button';
          btn.textContent = n.props.label;
          btn.onclick = () => {{ window.location.href = '/?clicked=' + encodeURIComponent(n.props.key || n.props.label); }};
          root.appendChild(btn);
        }} else if (n.type === 'metric') {{
          const m = document.createElement('div');
          m.className = 'bpm-metric';
          if (n.props.name) m.setAttribute('data-metric-name', n.props.name);
          m.innerHTML = '<div class="value">' + n.props.value + '</div><div>' + n.props.label + '</div>' +
            (n.props.delta != null ? '<div class="delta">' + n.props.delta + '</div>' : '');
          root.appendChild(m);
        }} else if (n.type === 'table') {{
          const t = document.createElement('table');
          const rows = n.props.rows || [];
          if (rows.length) {{
            const thead = document.createElement('thead');
            const tr = document.createElement('tr');
            Object.keys(rows[0]).forEach(k => {{ const th = document.createElement('th'); th.textContent = k; tr.appendChild(th); }});
            thead.appendChild(tr); t.appendChild(thead);
            const tbody = document.createElement('tbody');
            rows.forEach(row => {{ const tr = document.createElement('tr'); Object.values(row).forEach(v => {{ const td = document.createElement('td'); td.textContent = v; tr.appendChild(td); }}); tbody.appendChild(tr); }});
            t.appendChild(tbody);
          }}
          root.appendChild(t);
        }} else if (n.type === 'header') {{
          const h = document.createElement('h2');
          h.textContent = n.props.text;
          root.appendChild(h);
        }} else if (n.type === 'subheader') {{
          const h = document.createElement('h3');
          h.textContent = n.props.text;
          root.appendChild(h);
        }} else if (n.type === 'caption') {{
          const p = document.createElement('p');
          p.style.color = '#666'; p.style.fontSize = '0.9rem';
          p.textContent = n.props.text;
          root.appendChild(p);
        }} else if (n.type === 'code') {{
          const pre = document.createElement('pre');
          pre.className = 'bpm-code';
          pre.textContent = n.props.code;
          root.appendChild(pre);
        }} else if (n.type === 'divider') {{
          const orient = n.props.orientation || 'horizontal';
          if (orient === 'vertical') {{
            const div = document.createElement('div');
            div.className = 'bpm-divider';
            div.style.width = '1px';
            div.style.alignSelf = 'stretch';
            div.style.background = 'var(--bpm-border, #ccc)';
            root.appendChild(div);
          }} else {{
            const wrap = document.createElement('div');
            wrap.className = 'bpm-divider';
            wrap.style.display = 'flex';
            wrap.style.alignItems = 'center';
            wrap.style.gap = '8px';
            const line = () => {{
              const s = document.createElement('span');
              s.style.flex = '1';
              s.style.height = '1px';
              s.style.background = 'var(--bpm-border, #ccc)';
              return s;
            }};
            wrap.appendChild(line());
            if (n.props.label) {{
              const lbl = document.createElement('span');
              lbl.className = 'text-sm';
              lbl.style.color = 'var(--bpm-text-secondary, #666)';
              lbl.textContent = n.props.label;
              wrap.appendChild(lbl);
            }}
            wrap.appendChild(line());
            root.appendChild(wrap);
          }}
        }} else if (n.type === 'panel') {{
          const p = document.createElement('div');
          p.className = 'bpm-panel';
          p.innerHTML = '<strong>' + n.props.title + '</strong><br/>' + (n.props.body || '');
          root.appendChild(p);
        }} else if (n.type === 'emptystate') {{
          const wrap = document.createElement('div');
          wrap.className = 'bpm-emptystate';
          wrap.style.textAlign = 'center';
          wrap.style.padding = '2rem 1rem';
          wrap.style.color = 'var(--bpm-text-secondary, #666)';
          const h3 = document.createElement('h3');
          h3.className = 'bpm-emptystate-title';
          h3.style.margin = '0 0 0.25rem';
          h3.style.fontSize = '1.125rem';
          h3.style.color = 'var(--bpm-text-primary, #111)';
          h3.textContent = n.props.title || 'Aucune donnée';
          wrap.appendChild(h3);
          if (n.props.description) {{
            const p = document.createElement('p');
            p.className = 'bpm-emptystate-desc';
            p.style.margin = '0 0 0.75rem';
            p.style.fontSize = '0.875rem';
            p.textContent = n.props.description;
            wrap.appendChild(p);
          }}
          if (n.props.action_label) {{
            const btn = document.createElement('button');
            btn.className = 'bpm-button';
            btn.textContent = n.props.action_label;
            wrap.appendChild(btn);
          }}
          root.appendChild(wrap);
        }} else if (n.type === 'input') {{
          const wrap = document.createElement('div');
          wrap.className = 'bpm-input-wrap';
          if (n.props.label) {{
            const lbl = document.createElement('label');
            lbl.className = 'bpm-input-label';
            lbl.style.display = 'block';
            lbl.style.fontSize = '0.875rem';
            lbl.style.marginBottom = '0.25rem';
            lbl.textContent = n.props.label;
            wrap.appendChild(lbl);
          }}
          const inp = document.createElement('input');
          inp.type = n.props.type || 'text';
          inp.placeholder = n.props.placeholder || '';
          inp.value = n.props.value || '';
          inp.disabled = !!n.props.disabled;
          inp.className = 'bpm-input';
          inp.style.width = '100%';
          inp.style.padding = '0.5rem 0.75rem';
          wrap.appendChild(inp);
          root.appendChild(wrap);
        }} else if (n.type === 'textarea') {{
          const wrap = document.createElement('div');
          wrap.className = 'bpm-textarea-wrap';
          if (n.props.label) {{
            const lbl = document.createElement('label');
            lbl.className = 'bpm-textarea-label';
            lbl.style.display = 'block';
            lbl.style.fontSize = '0.875rem';
            lbl.style.marginBottom = '0.25rem';
            lbl.textContent = n.props.label;
            wrap.appendChild(lbl);
          }}
          const ta = document.createElement('textarea');
          ta.placeholder = n.props.placeholder || '';
          ta.value = n.props.value || '';
          ta.rows = n.props.rows || 4;
          ta.disabled = !!n.props.disabled;
          ta.className = 'bpm-textarea';
          ta.style.width = '100%';
          ta.style.padding = '0.5rem 0.75rem';
          ta.style.resize = 'vertical';
          wrap.appendChild(ta);
          root.appendChild(wrap);
        }} else if (n.type === 'checkbox') {{
          const lbl = document.createElement('label');
          lbl.className = 'bpm-checkbox-wrap';
          lbl.style.display = 'inline-flex';
          lbl.style.alignItems = 'center';
          lbl.style.gap = '0.5rem';
          const inp = document.createElement('input');
          inp.type = 'checkbox';
          inp.checked = !!n.props.value;
          inp.disabled = !!n.props.disabled;
          inp.className = 'bpm-checkbox';
          lbl.appendChild(inp);
          if (n.props.label) {{
            const s = document.createElement('span');
            s.textContent = n.props.label;
            lbl.appendChild(s);
          }}
          root.appendChild(lbl);
        }} else if (n.type === 'radiogroup') {{
          const wrap = document.createElement('div');
          wrap.className = 'bpm-radiogroup-wrap';
          wrap.style.display = 'flex';
          wrap.style.flexDirection = n.props.layout === 'horizontal' ? 'row' : 'column';
          wrap.style.gap = '0.5rem';
          if (n.props.label) {{
            const cap = document.createElement('span');
            cap.style.display = 'block';
            cap.style.marginBottom = '0.25rem';
            cap.textContent = n.props.label;
            wrap.appendChild(cap);
          }}
          const opts = n.props.options || [];
          opts.forEach(function(opt) {{
            const val = typeof opt === 'string' ? opt : (opt.value || opt.label || '');
            const lab = typeof opt === 'string' ? opt : (opt.label || opt.value || '');
            const l = document.createElement('label');
            l.style.display = 'inline-flex';
            l.style.alignItems = 'center';
            l.style.gap = '0.5rem';
            const r = document.createElement('input');
            r.type = 'radio';
            r.name = n.props.key || 'rg';
            r.value = val;
            r.checked = (n.props.value === val);
            r.disabled = !!n.props.disabled;
            l.appendChild(r);
            const s = document.createElement('span');
            s.textContent = lab;
            l.appendChild(s);
            wrap.appendChild(l);
          }});
          root.appendChild(wrap);
        }} else if (n.type === 'slider') {{
          const wrap = document.createElement('div');
          wrap.className = 'bpm-slider-wrap';
          if (n.props.label) {{
            const lbl = document.createElement('label');
            lbl.style.display = 'block';
            lbl.style.marginBottom = '0.25rem';
            lbl.textContent = n.props.label;
            wrap.appendChild(lbl);
          }}
          const inp = document.createElement('input');
          inp.type = 'range';
          inp.min = n.props.min ?? 0;
          inp.max = n.props.max ?? 100;
          inp.step = n.props.step ?? 1;
          inp.value = n.props.value ?? inp.min;
          inp.disabled = !!n.props.disabled;
          wrap.appendChild(inp);
          const sp = document.createElement('span');
          sp.textContent = inp.value;
          wrap.appendChild(sp);
          root.appendChild(wrap);
        }} else if (n.type === 'dateinput') {{
          const wrap = document.createElement('div');
          wrap.className = 'bpm-dateinput-wrap';
          if (n.props.label) {{
            const lbl = document.createElement('label');
            lbl.style.display = 'block';
            lbl.style.marginBottom = '0.25rem';
            lbl.textContent = n.props.label;
            wrap.appendChild(lbl);
          }}
          const inp = document.createElement('input');
          inp.type = 'date';
          inp.value = n.props.value || '';
          inp.min = n.props.min || '';
          inp.max = n.props.max || '';
          inp.disabled = !!n.props.disabled;
          wrap.appendChild(inp);
          root.appendChild(wrap);
        }} else if (n.type === 'colorpicker') {{
          const wrap = document.createElement('div');
          wrap.className = 'bpm-colorpicker-wrap';
          if (n.props.label) {{
            const lbl = document.createElement('label');
            lbl.style.display = 'block';
            lbl.style.marginBottom = '0.25rem';
            lbl.textContent = n.props.label;
            wrap.appendChild(lbl);
          }}
          const inp = document.createElement('input');
          inp.type = 'color';
          inp.value = n.props.value || '#000000';
          inp.disabled = !!n.props.disabled;
          wrap.appendChild(inp);
          const sp = document.createElement('span');
          sp.textContent = n.props.value || '#000000';
          wrap.appendChild(sp);
          root.appendChild(wrap);
        }} else if (n.type === 'chip') {{
          const sp = document.createElement('span');
          sp.className = 'bpm-chip';
          sp.textContent = n.props.label || '';
          sp.style.display = 'inline-flex';
          sp.style.padding = '0.25rem 0.5rem';
          sp.style.borderRadius = '9999px';
          sp.style.fontSize = '0.75rem';
          if (n.props.variant === 'primary') {{ sp.style.background = 'var(--bpm-accent)'; sp.style.color = '#fff'; }}
          else if (n.props.variant === 'outline') {{ sp.style.border = '1px solid var(--bpm-border)'; }}
          root.appendChild(sp);
        }} else if (n.type === 'breadcrumb') {{
          const nav = document.createElement('nav');
          nav.className = 'bpm-breadcrumb';
          nav.setAttribute('aria-label', 'Fil d\'Ariane');
          const ol = document.createElement('ol');
          ol.style.display = 'flex';
          ol.style.flexWrap = 'wrap';
          ol.style.alignItems = 'center';
          ol.style.gap = '0.25rem';
          ol.style.listStyle = 'none';
          ol.style.margin = '0';
          ol.style.padding = '0';
          const items = n.props.items || [];
          const sep = n.props.separator || '›';
          items.forEach(function(it, i) {{
            const li = document.createElement('li');
            li.style.display = 'flex';
            li.style.alignItems = 'center';
            li.style.gap = '0.25rem';
            if (i > 0) {{
              const s = document.createElement('span');
              s.textContent = sep;
              s.setAttribute('aria-hidden', 'true');
              s.style.opacity = '0.6';
              li.appendChild(s);
            }}
            if (it.href != null && i < items.length - 1) {{
              const a = document.createElement('a');
              a.href = it.href;
              a.textContent = it.label || '';
              a.style.color = 'var(--bpm-accent-cyan)';
              li.appendChild(a);
            }} else {{
              const s = document.createElement('span');
              s.textContent = it.label || '';
              li.appendChild(s);
            }}
            ol.appendChild(li);
          }});
          nav.appendChild(ol);
          root.appendChild(nav);
        }} else if (n.type === 'stepper') {{
          const wrap = document.createElement('div');
          wrap.className = 'bpm-stepper';
          const steps = n.props.steps || [];
          const cur = n.props.current_step ?? 0;
          steps.forEach(function(st, i) {{
            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.alignItems = 'flex-start';
            row.style.gap = '0.75rem';
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = i < cur ? '✓' : (i + 1);
            btn.style.width = '2rem';
            btn.style.height = '2rem';
            btn.style.borderRadius = '9999px';
            btn.style.border = '2px solid';
            btn.style.borderColor = (i <= cur) ? 'var(--bpm-accent)' : 'var(--bpm-border)';
            btn.style.background = (i < cur) ? 'var(--bpm-accent)' : 'var(--bpm-bg-primary)';
            btn.style.color = (i <= cur) ? '#fff' : 'var(--bpm-text-secondary)';
            row.appendChild(btn);
            const lbl = document.createElement('span');
            lbl.textContent = st.label || ('Étape ' + (i + 1));
            lbl.style.fontSize = '0.875rem';
            row.appendChild(lbl);
            wrap.appendChild(row);
          }});
          root.appendChild(wrap);
        }} else {{
          const p = document.createElement('p');
          p.textContent = JSON.stringify(n);
          root.appendChild(p);
        }}
      }});
    }}
    render(nodes);
  </script>
</body>
</html>"""


def run(script_path: str, port: int = 8501, host: str = "127.0.0.1") -> None:
    """Lance le serveur BPM qui exécute script_path à chaque requête."""
    script_path = os.path.abspath(script_path)
    if not os.path.isfile(script_path):
        print(f"Erreur : fichier introuvable {script_path}", file=sys.stderr)
        sys.exit(1)

    class BPMHandler(BaseHTTPRequestHandler):
        def do_GET(self):
            parsed = urlparse(self.path)
            query = parse_qs(parsed.query)
            # Marquer un bouton cliqué pour le prochain run
            clicked = query.get("clicked", [None])[0]
            if clicked:
                import bpm
                bpm.session_state["_clicked_" + clicked] = True
            try:
                nodes = _run_script(script_path)
                # Consommer le clic après le run pour que le bouton ne reste pas True
                import bpm
                for k in list(bpm.session_state.keys()):
                    if k.startswith("_clicked_"):
                        del bpm.session_state[k]
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-type", "text/html; charset=utf-8")
                self.end_headers()
                self.wfile.write(
                    f"<html><body><h1>Erreur</h1><pre>{e!r}</pre></body></html>".encode("utf-8")
                )
                return
            html = _nodes_to_html(nodes)
            self.send_response(200)
            self.send_header("Content-type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(html.encode("utf-8"))

        def log_message(self, format, *args):
            print(f"[BPM] {args[0]}")

    server = ThreadingHTTPServer((host, port), BPMHandler)
    print(f"BPM : app servie sur http://{host}:{port}")
    print(f"     Script : {script_path}")
    print("     Arrêt : Ctrl+C")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.shutdown()


def init(name: str = "mon-app") -> None:
    """Scaffold une app BPM vide (dossier avec app.py, README.md, requirements.txt)."""
    os.makedirs(name, exist_ok=True)
    app_py = os.path.join(name, "app.py")
    if os.path.exists(app_py):
        print(f"Le dossier '{name}' contient déjà app.py.", file=sys.stderr)
        sys.exit(1)
    with open(app_py, "w", encoding="utf-8") as f:
        f.write('''import bpm

bpm.set_page_config(page_title="Mon App", layout="wide")
bpm.title("Mon App Blueprint Modular")
bpm.write("Bienvenue sur votre première app BPM.")

bpm.metric("Valeur exemple", 142500, delta=3200)
''')
    with open(os.path.join(name, "README.md"), "w", encoding="utf-8") as f:
        f.write(f"# {name}\n\nApp Blueprint Modular.\n\n## Lancer\n\n```\nbpm run app.py\n```\n")
    with open(os.path.join(name, "requirements.txt"), "w", encoding="utf-8") as f:
        f.write("blueprint-modular>=0.1.0\n")
    print(f"App '{name}' créée.")
    print(f"   cd {name}")
    print(f"   bpm run app.py")


def main() -> None:
    from bpm import __version__
    parser = argparse.ArgumentParser(
        prog="bpm",
        description="Blueprint Modular — Framework Python pour interfaces de données",
    )
    parser.add_argument(
        "--version", "-v",
        action="version",
        version=f"blueprint-modular {__version__}",
    )
    sub = parser.add_subparsers(dest="command")
    run_parser = sub.add_parser("run", help="Lancer une app BPM")
    run_parser.add_argument("file", nargs="?", default="app.py", help="Fichier Python (défaut: app.py)")
    run_parser.add_argument("--port", "-p", type=int, default=8501, help="Port (défaut: 8501)")
    run_parser.add_argument("--host", default="127.0.0.1", help="Host (défaut: 127.0.0.1)")
    init_parser = sub.add_parser("init", help="Scaffolder une app vide")
    init_parser.add_argument("--name", default="mon-app", help="Nom du projet (défaut: mon-app)")
    args = parser.parse_args()
    if args.command == "run":
        run(args.file, port=args.port, host=args.host)
    elif args.command == "init":
        init(args.name)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
