import React from 'react';

const Loading = ({ size = 'default', fullScreen = false }) => {
  const spinnerClasses = {
    small: 'w-5 h-5',
    default: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50'
    : 'flex items-center justify-center p-4';

  return (
    <div className={containerClasses}>
      <div
        className={`${spinnerClasses[size]} animate-spin rounded-full border-4 border-gray-200 border-t-blue-500`}
        role="status"
      >
        <span className="sr-only">Yükleniyor...</span>
      </div>
    </div>
  );
};

export default Loading; 