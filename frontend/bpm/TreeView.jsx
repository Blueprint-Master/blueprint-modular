import React, { useState } from 'react';
import './TreeView.css';

/**
 * TreeView : affichage hiérarchique. nodes = [{ id, label, children?: [] }], expandedIds = Set, onSelect(node)
 */
function TreeNode({ node, level, expandedIds, onToggle, onSelect, selectedId }) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;

  return (
    <div className="bpm-tree-node">
      <div
        className={'bpm-tree-row' + (isSelected ? ' bpm-tree-row-selected' : '')}
        style={{ paddingLeft: level * 1.25 + 'rem' }}
        onClick={() => onSelect && onSelect(node)}
      >
        <span
          className="bpm-tree-toggle"
          onClick={(e) => { e.stopPropagation(); hasChildren && onToggle(node.id); }}
          aria-hidden="true"
        >
          {hasChildren ? (isExpanded ? '-' : '+') : ''}
        </span>
        <span className="bpm-tree-label">{node.label}</span>
      </div>
      {hasChildren && isExpanded && (
        <div className="bpm-tree-children">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              expandedIds={expandedIds}
              onToggle={onToggle}
              onSelect={onSelect}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TreeView({ nodes = [], defaultExpandedIds = [], selectedId, onSelect, className = '', ...props }) {
  const [expandedIds, setExpandedIds] = useState(() => new Set(defaultExpandedIds));

  const toggle = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className={'bpm-treeview ' + (className || '')} {...props}>
      {nodes.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          level={0}
          expandedIds={expandedIds}
          onToggle={toggle}
          onSelect={onSelect}
          selectedId={selectedId}
        />
      ))}
    </div>
  );
}

export default TreeView;
