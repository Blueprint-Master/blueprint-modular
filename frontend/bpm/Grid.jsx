import React from 'react';
import './Grid.css';

const Grid = ({
  cols = 1,
  gap = '1rem',
  className = '',
  children,
  ...props
}) => {
  const style = {
    '--bpm-grid-gap': typeof gap === 'number' ? gap + 'px' : gap,
    '--bpm-grid-cols': typeof cols === 'object' ? undefined : cols,
  };
  const classes = [
    'bpm-grid',
    typeof cols === 'object' && cols.xs != null && 'bpm-grid-cols-xs-' + cols.xs,
    typeof cols === 'object' && cols.sm != null && 'bpm-grid-cols-sm-' + cols.sm,
    typeof cols === 'object' && cols.md != null && 'bpm-grid-cols-md-' + cols.md,
    typeof cols === 'object' && cols.lg != null && 'bpm-grid-cols-lg-' + cols.lg,
  ].filter(Boolean).join(' ');
  return (
    <div
      className={classes + (className ? ' ' + className : '')}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
};

export default Grid;
