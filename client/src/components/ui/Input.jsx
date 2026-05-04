import { forwardRef } from 'react';

const Input = forwardRef(
  (
    {
      label,
      error,
      type = 'text',
      placeholder = '',
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-neutral-700"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          placeholder={placeholder}
          className={`w-full rounded-lg border px-4 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${
            error
              ? 'border-error focus:ring-error focus:border-error'
              : 'border-neutral-300'
          } ${className}`}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-1 text-sm text-error"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
