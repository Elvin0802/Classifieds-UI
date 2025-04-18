import React, { forwardRef } from 'react';

// Input bileşeni - Yeniden kullanılabilir form elemanı
const Input = forwardRef(({ 
  label, 
  name, 
  type = 'text', 
  placeholder = '', 
  className = '', 
  error = '', 
  helperText = '',
  required = false,
  disabled = false,
  ...props 
}, ref) => {
  // Hata durumuna göre stiller
  const inputBaseStyle = `
    w-full 
    p-2 
    border 
    rounded-md 
    focus:outline-none 
    focus:ring-2 
    focus:ring-primary/50
    transition-colors
  `;

  const inputStyles = error 
    ? `${inputBaseStyle} border-danger focus:border-danger text-danger` 
    : `${inputBaseStyle} border-gray-300 focus:border-primary`;

  const disabledStyle = disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white';
  
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label 
          htmlFor={name} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      
      <input
        ref={ref}
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        className={`${inputStyles} ${disabledStyle}`}
        {...props}
      />
      
      {helperText && !error && (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      )}
      
      {error && (
        <p className="mt-1 text-xs text-danger">{error}</p>
      )}
    </div>
  );
});

// Bileşen adı ayarla (DevTools'da görünecek ad)
Input.displayName = 'Input';

export default Input; 