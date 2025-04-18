import React from 'react';

// Card bileşeni - İlan ve bilgi kartları için
const Card = ({ 
  children, 
  title, 
  subtitle, 
  className = '', 
  padding = 'normal', 
  shadow = 'md', 
  onClick,
  ...props 
}) => {
  // Shadow seçenekleri
  const shadowStyles = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };

  // Padding seçenekleri
  const paddingStyles = {
    none: 'p-0',
    small: 'p-2',
    normal: 'p-4',
    large: 'p-6'
  };

  // Tıklanabilir kart için cursor
  const cursorStyle = onClick ? 'cursor-pointer' : '';

  // Bileşen stili
  const cardStyle = `
    bg-white 
    rounded-lg 
    border 
    border-gray-200 
    overflow-hidden 
    ${shadowStyles[shadow]} 
    ${paddingStyles[padding]} 
    ${cursorStyle} 
    transition-shadow 
    duration-200
    ${className}
  `;

  return (
    <div 
      className={cardStyle} 
      onClick={onClick} 
      {...props}
    >
      {title && (
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          {subtitle && <p className="text-gray-600 text-sm mt-1">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card; 