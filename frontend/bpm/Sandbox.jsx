import React, { useMemo } from 'react';
import Panel from './Panel';
import Button from './Button';
import Message from './Message';
import Box from './Box';
import Tabs from './Tabs';
import Metric from './Metric';
import Table from './Table';

/**
 * Sandbox BPM — Affiche un composant BPM seul, sans sidebar ni topbar.
 * Usage : /sandbox?component=bpm.panel&variant=warning&title=Test
 * Ou : ?sandbox=1&component=bpm.panel&variant=warning (en racine)
 * Thème : theme=dark ou th=dark pour le mode sombre.
 * Permet l'embed en iframe pour documentation.beam-consulting.fr.
 */
const parseSearch = () => {
  const s = typeof window !== 'undefined' ? window.location.search : '';
  const params = new URLSearchParams(s);
  return {
    component: params.get('component') || params.get('c') || 'bpm.panel',
    variant: params.get('variant') || params.get('v') || 'info',
    title: params.get('title') || params.get('t') || '',
    value: params.get('value') || '',
    label: params.get('label') || '',
    theme: (params.get('theme') || params.get('th') || 'light').toLowerCase(),
  };
};

const BpmSandbox = () => {
  const params = useMemo(parseSearch, []);
  const isDark = params.theme === 'dark';

  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    if (isDark) document.documentElement.classList.add('theme-dark');
    else document.documentElement.classList.remove('theme-dark');
    return () => document.documentElement.classList.remove('theme-dark');
  }, [isDark]);

  const content = useMemo(() => {
    const comp = (params.component || '').toLowerCase();

    if (comp === 'bpm.panel' || comp === 'panel') {
      return (
        <Panel variant={params.variant} title={params.title || `Panneau ${params.variant}`}>
          Contenu du panneau. Variante : <strong>{params.variant}</strong>.
        </Panel>
      );
    }

    if (comp === 'bpm.message' || comp === 'message') {
      return (
        <Message type={params.variant}>
          {params.title ? <strong>{params.title}</strong> : null}
          {params.title && <br />}
          Contenu du message.
        </Message>
      );
    }

    if (comp === 'bpm.button' || comp === 'button') {
      return (
        <Box className="bpm-box" style={{ padding: 16 }}>
          <Button size="small">Small</Button>
          <Button style={{ marginLeft: 8 }}>Default</Button>
          <Button variant="primary" style={{ marginLeft: 8 }}>Primary</Button>
        </Box>
      );
    }

    if (comp === 'bpm.metric' || comp === 'metric') {
      return (
        <Box className="bpm-box" style={{ padding: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Metric label="Exemple 1" value={params.value || '12,5 %'} />
          <Metric label="Exemple 2" value="1 234 €" />
          <Metric label="Tendance" value="+3,2 %" delta={3.2} />
        </Box>
      );
    }

    if (comp === 'bpm.table' || comp === 'table') {
      const columns = [{ key: 'name', label: 'Nom' }, { key: 'value', label: 'Valeur' }];
      const data = [{ name: 'A', value: '1' }, { name: 'B', value: '2' }];
      return (
        <Box className="bpm-box" style={{ padding: 16 }}>
          <Table columns={columns} data={data} />
        </Box>
      );
    }

    if (comp === 'bpm.tabs' || comp === 'tabs') {
      const tabItems = [
        { label: 'Onglet 1', content: <div>Contenu onglet 1</div> },
        { label: 'Onglet 2', content: <div>Contenu onglet 2</div> },
      ];
      return (
        <Box className="bpm-box" style={{ padding: 16 }}>
          <Tabs tabs={tabItems} />
        </Box>
      );
    }

    if (comp === 'bpm.box' || comp === 'box') {
      return (
        <Box
          title={params.title || 'Exemple Box'}
          status={params.label || 'Statut'}
          isConnected={params.variant !== 'error'}
          lastCheck={new Date()}
          details={`Contenu de la box. Variante : ${params.variant || 'info'}.`}
        />
      );
    }

    return (
      <Panel variant="info" title="Sandbox BPM">
        <p>Composant inconnu : <code>{params.component}</code></p>
        <p>Exemples :</p>
        <ul style={{ marginTop: 8, paddingLeft: 20 }}>
          <li><code>?component=bpm.panel&amp;variant=warning&amp;title=Test</code></li>
          <li><code>?component=bpm.message</code></li>
          <li><code>?component=bpm.metric</code></li>
          <li><code>?component=bpm.button</code></li>
          <li><code>?component=bpm.table</code></li>
          <li><code>?component=bpm.tabs</code></li>
          <li><code>?component=bpm.box</code></li>
          <li><code>?theme=dark</code> (mode sombre)</li>
        </ul>
      </Panel>
    );
  }, [params]);

  return (
    <div
      className={`bpm-sandbox ${isDark ? 'theme-dark' : ''}`}
      style={{
        minHeight: '100vh',
        background: 'var(--bpm-bg-secondary, #f5f5f5)',
        padding: 24,
        boxSizing: 'border-box',
      }}
    >
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        {content}
      </div>
    </div>
  );
};

export default BpmSandbox;
