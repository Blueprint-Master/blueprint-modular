import React from 'react';
import MuiTooltip from '@mui/material/Tooltip';
import './Tooltip.css';

/**
 * Tooltip basé sur MUI (https://mui.com/material-ui/react-tooltip/).
 * API compatible avec l’ancien composant bpm : text → title, position → placement.
 */
const Tooltip = ({ text, children, position = 'top' }) => {
  const muiPlacement = position === 'bottom-end' ? 'bottom-end'
    : position === 'top-start' ? 'top-start'
    : position === 'top-end' ? 'top-end'
    : position === 'bottom-start' ? 'bottom-start'
    : position === 'left' ? 'left'
    : position === 'right' ? 'right'
    : position === 'bottom' ? 'bottom'
    : 'top';

  return (
    <MuiTooltip
      title={text}
      placement={muiPlacement}
      arrow
      enterDelay={300}
      leaveDelay={0}
      slotProps={{
        popper: {
          sx: {
            '& .MuiTooltip-tooltip': {
              maxWidth: 380,
              minWidth: 280,
              fontSize: 13,
              lineHeight: 1.4,
            },
          },
        },
      }}
    >
      <span className="bpm-tooltip-container">
        {children}
      </span>
    </MuiTooltip>
  );
};

export default Tooltip;
