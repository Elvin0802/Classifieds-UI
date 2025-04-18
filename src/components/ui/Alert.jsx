import React from 'react';
import { FaInfoCircle, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaTimes } from 'react-icons/fa';

// Alert bileşeni - Bildirimler ve uyarılar için
const Alert = ({ 
  type = 'info', 
  title,
  message, 
  className = '', 
  onClose,
  showIcon = true,
  ...props 
}) => {
  // Tip'e göre stiller ve ikonlar
  const types = {
    info: {
      bgColor: 'bg-info/10',
      borderColor: 'border-info',
      textColor: 'text-info',
      icon: FaInfoCircle
    },
    success: {
      bgColor: 'bg-success/10',
      borderColor: 'border-success',
      textColor: 'text-success',
      icon: FaCheckCircle
    },
    warning: {
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning',
      textColor: 'text-warning',
      icon: FaExclamationTriangle
    },
    error: {
      bgColor: 'bg-danger/10',
      borderColor: 'border-danger',
      textColor: 'text-danger',
      icon: FaTimesCircle
    }
  };

  const { bgColor, borderColor, textColor, icon: Icon } = types[type];

  // Bileşen stili
  const alertStyle = `
    flex 
    items-start 
    p-4 
    rounded-lg 
    border-l-4 
    ${bgColor} 
    ${borderColor}
    ${className}
  `;

  return (
    <div className={alertStyle} role="alert" {...props}>
      {showIcon && (
        <div className={`flex-shrink-0 ${textColor} mr-3`}>
          <Icon size={20} />
        </div>
      )}
      
      <div className="flex-grow">
        {title && <h4 className={`font-medium ${textColor} text-sm`}>{title}</h4>}
        {message && <div className="text-gray-600 text-sm mt-1">{message}</div>}
      </div>
      
      {onClose && (
        <button 
          onClick={onClose} 
          className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600"
          aria-label="Kapat"
        >
          <FaTimes size={16} />
        </button>
      )}
    </div>
  );
};

export default Alert; 