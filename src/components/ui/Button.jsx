import React from 'react';

// Button bileşeni - Yeniden kullanılabilir buton
const Button = ({ 
  children, 
  type = 'button', 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  isLoading = false,
  isFullWidth = false,
  disabled = false,
  onClick, 
  ...props 
}) => {
  // Variant'a göre stiller
  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-primary-dark',
    secondary: 'bg-secondary text-gray-800 hover:bg-secondary-dark',
    success: 'bg-success text-white hover:bg-success-dark',
    danger: 'bg-danger text-white hover:bg-danger-dark',
    outline: 'bg-transparent border border-primary text-primary hover:bg-primary/10',
    link: 'bg-transparent text-primary hover:underline p-0'
  };

  // Boyuta göre stiller
  const sizeStyles = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3'
  };

  // Tam genişlik
  const widthStyle = isFullWidth ? 'w-full' : '';

  // Disabled durumu
  const disabledStyle = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  // Bileşen stili
  const buttonStyle = `
    ${variantStyles[variant]} 
    ${sizeStyles[size]} 
    ${widthStyle} 
    ${disabledStyle}
    rounded-md 
    font-medium 
    transition-all 
    duration-200
    focus:outline-none 
    focus:ring-2 
    focus:ring-primary/50
    ${className}
  `;

  return (
    <button
      type={type}
      className={buttonStyle}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Yükleniyor...
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button; 