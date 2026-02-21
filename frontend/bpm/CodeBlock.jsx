import React from 'react';
import './CodeBlock.css';

/**
 * Bloc de code pour la doc BPM.
 * @param {Object} props
 * @param {string} props.children - Code source
 * @param {string} [props.language='text'] - Langage (python, bash, js, etc.) pour affichage
 * @param {string} [props.className]
 */
const CodeBlock = ({ children, language = 'text', className = '' }) => (
  <pre className={`bpm-code-block ${className}`.trim()} data-language={language}>
    <code>{children}</code>
  </pre>
);

export default CodeBlock;
