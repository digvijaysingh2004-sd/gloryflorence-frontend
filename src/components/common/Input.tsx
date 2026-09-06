import React, { forwardRef } from 'react';
import './Input.css';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>, 'size'> {
  label?: string;
  error?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  onIconRightClick?: () => void;
  as?: 'input' | 'textarea';
  rows?: number;
}

export const Input = forwardRef<HTMLInputElement & HTMLTextAreaElement, InputProps>(
  (
    {
      label,
      error,
      iconLeft,
      iconRight,
      onIconRightClick,
      as = 'input',
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
    const hasIconLeft = !!iconLeft;
    const hasIconRight = !!iconRight;

    const baseClass = `input-field ${hasIconLeft ? 'input-field-has-icon-left' : ''} ${
      hasIconRight ? 'input-field-has-icon-right' : ''
    } ${error ? 'input-field-error' : ''} ${className}`;

    return (
      <div className="input-group">
        {label && (
          <label htmlFor={inputId} className="input-label">
            {label}
          </label>
        )}
        <div className="input-wrapper">
          {iconLeft && <span className="input-icon-left">{iconLeft}</span>}
          
          {as === 'textarea' ? (
            <textarea
              id={inputId}
              ref={ref as React.Ref<HTMLTextAreaElement>}
              className={`${baseClass} input-field-textarea`}
              {...props as React.TextareaHTMLAttributes<HTMLTextAreaElement>}
            />
          ) : (
            <input
              id={inputId}
              ref={ref as React.Ref<HTMLInputElement>}
              className={baseClass}
              {...props as React.InputHTMLAttributes<HTMLInputElement>}
            />
          )}

          {iconRight && (
            <span
              className="input-icon-right"
              onClick={onIconRightClick}
              role={onIconRightClick ? 'button' : undefined}
            >
              {iconRight}
            </span>
          )}
        </div>
        {error && <span className="input-error-msg">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
