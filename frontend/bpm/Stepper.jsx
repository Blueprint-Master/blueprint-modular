import React from 'react';
import './Stepper.css';

function Stepper({ steps = [], currentStep = 0, onStepClick, className = '', ...props }) {
  return (
    <div className={'bpm-stepper ' + (className || '')} {...props}>
      <div className="bpm-stepper-track" role="list">
        {steps.map((step, i) => {
          const isActive = i === currentStep;
          const isPast = i < currentStep;
          const isOptional = step.optional === true;
          const isClickable = typeof onStepClick === 'function';
          return (
            <div
              key={step.id != null ? step.id : i}
              className={'bpm-stepper-step' + (isActive ? ' bpm-stepper-step-active' : '') + (isPast ? ' bpm-stepper-step-past' : '') + (isClickable ? ' bpm-stepper-step-clickable' : '')}
              role="listitem"
            >
              <button
                type="button"
                className="bpm-stepper-dot"
                onClick={isClickable ? () => onStepClick(i) : undefined}
                disabled={!isClickable}
                aria-current={isActive ? 'step' : undefined}
                aria-label={step.label}
                title={step.label}
              >
                {isPast ? <span className="bpm-stepper-check" aria-hidden="true">OK</span> : <span className="bpm-stepper-num">{i + 1}</span>}
              </button>
              <span className="bpm-stepper-label">
                {step.label}
                {isOptional && <span className="bpm-stepper-optional"> (optionnel)</span>}
              </span>
              {i < steps.length - 1 && <span className="bpm-stepper-line" aria-hidden="true" />}
            </div>
          );
        })}
      </div>
      {steps[currentStep] && steps[currentStep].content && (
        <div className="bpm-stepper-content">{steps[currentStep].content}</div>
      )}
    </div>
  );
}

export default Stepper;
