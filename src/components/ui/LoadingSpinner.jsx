import React from 'react';

const LoadingSpinner = ({ size = 'md', color = 'primary' }) => {
  // Boyut sınıflarını belirle
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-3',
    lg: 'h-16 w-16 border-4',
    xl: 'h-24 w-24 border-4'
  };
  
  // Renk sınıflarını belirle
  const colorClasses = {
    primary: 'border-primary',
    secondary: 'border-secondary',
    success: 'border-green-600',
    danger: 'border-red-600',
    warning: 'border-yellow-500',
    info: 'border-blue-500',
    light: 'border-gray-300',
    dark: 'border-gray-800'
  };
  
  return (
    <div className="flex items-center justify-center">
      <div 
        className={`
          animate-spin rounded-full 
          ${sizeClasses[size] || sizeClasses.md} 
          border-t-transparent border-b-transparent 
          ${colorClasses[color] || colorClasses.primary}
        `}
      />
    </div>
  );
};

export default LoadingSpinner; 