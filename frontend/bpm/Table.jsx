import React, { useState, useMemo } from 'react';
import './Table.css';

const Table = ({ columns, data, striped = true, hover = true, onRowClick, defaultSortColumn = null, defaultSortDirection = 'asc', name = null, keyColumn = null }) => {
  const [sortColumn, setSortColumn] = useState(defaultSortColumn);
  const [sortDirection, setSortDirection] = useState(defaultSortDirection);

  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      // Si on clique sur la même colonne, inverser l'ordre
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Nouvelle colonne, trier par ordre croissant
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortColumn) return data;

    return [...data].sort((a, b) => {
      let aValue = a[sortColumn];
      let bValue = b[sortColumn];

      // Gérer les valeurs null/undefined
      if (aValue == null) aValue = '';
      if (bValue == null) bValue = '';

      // Gérer les objets Decimal (venant de l'API)
      if (typeof aValue === 'object' && aValue !== null && 'value' in aValue) {
        aValue = parseFloat(aValue.value);
      }
      if (typeof bValue === 'object' && bValue !== null && 'value' in bValue) {
        bValue = parseFloat(bValue.value);
      }

      // Convertir en nombres si possible
      const aNum = parseFloat(aValue);
      const bNum = parseFloat(bValue);
      const isNumeric = !isNaN(aNum) && !isNaN(bNum) && isFinite(aNum) && isFinite(bNum);

      if (isNumeric) {
        return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
      }

      // Tri alphabétique
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      if (sortDirection === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  }, [data, sortColumn, sortDirection]);

  return (
    <div className="bpm-table-wrapper" data-name={name || undefined} data-key-column={keyColumn || undefined}>
      <div className="bpm-table-container">
        <table className={`bpm-table ${striped ? 'bpm-table-striped' : ''} ${hover ? 'bpm-table-hover' : ''}`}>
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  className={`${sortColumn === col.key ? `bpm-table-sorted bpm-table-sorted-${sortDirection}` : ''} ${col.className || ''}`}
                  onClick={() => col.key && handleSort(col.key)}
                  style={{ 
                    textAlign: col.align || 'left',
                    cursor: col.key ? 'pointer' : 'default'
                  }}
                >
                  <div className="bpm-table-header-content">
                    {col.label}
                    {sortColumn === col.key && (
                      <span className="bpm-table-sort-indicator">
                        {sortDirection === 'asc' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="rgb(81, 81, 84)">
                            <path d="M466-212v-482L232-460l-20-20 268-268 268 268-20 20-234-234v482h-28Z"/>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="rgb(81, 81, 84)">
                            <path d="M466-748v482L232-500l-20 20 268 268 268-268-20-20-234 234v-482h-28Z"/>
                          </svg>
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, rowIdx) => (
              <tr 
                key={rowIdx}
                onClick={() => onRowClick && onRowClick(row)}
                style={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={col.className || ''} style={{ textAlign: col.align || 'left' }}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;