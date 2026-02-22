import React from 'react';
import './SparklineMetric.css';

function SparklineMetric(props) {
  const { label, value, delta, deltaType = 'normal', sparklineData = [], className = '' } = props;
  const max = sparklineData.length ? Math.max(...sparklineData) : 1;
  const min = sparklineData.length ? Math.min(...sparklineData) : 0;
  const range = max - min || 1;
  const points = sparklineData.map((v, i) => i + ',' + (24 - (v - min) / range * 24)).join(' ');

  return (
    <div className={'bpm-sparkline-metric ' + className}>
      <div className="bpm-sparkline-metric-label">{label}</div>
      <div className="bpm-sparkline-metric-value">{value}</div>
      {delta != null && (
        <div className={'bpm-sparkline-metric-delta ' + (deltaType === 'inverse' ? (delta > 0 ? 'negative' : 'positive') : delta > 0 ? 'positive' : 'negative')}>
          {delta > 0 ? '+' : ''}{delta}
        </div>
      )}
      {sparklineData.length > 0 && (
        <div className="bpm-sparkline-metric-chart" aria-hidden="true">
          <svg viewBox={'0 0 ' + sparklineData.length + ' 24'} preserveAspectRatio="none">
            <polyline fill="none" stroke="currentColor" strokeWidth="1" points={points} />
          </svg>
        </div>
      )}
    </div>
  );
}

export default SparklineMetric;
