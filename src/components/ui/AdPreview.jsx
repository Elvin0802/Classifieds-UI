import React from 'react';
import { FaHeart, FaRegHeart, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import PropTypes from 'prop-types';

const AdPreview = ({
  imageUrl = '',
  title,
  location = '',
  price,
  date = '',
  isFavorite = false,
  onFavoriteToggle = () => {},
  className = '',
}) => {
  // Tarih formatı düzenleme fonksiyonu
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      
      // Geçersiz tarih kontrolü
      if (isNaN(date.getTime())) {
        return '-';
      }
      
      return new Intl.DateTimeFormat('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    } catch (error) {
      console.error('Tarih formatı hatası:', error);
      return '-';
    }
  };

  // Fiyat formatı düzenleme fonksiyonu
  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className={`overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm flex flex-col h-full ${className || ''}`}>
      <div className="relative h-48 w-full">
        <img 
          src={imageUrl || "/placeholder.jpg"} 
          alt={title} 
          className="object-cover h-full w-full"
        />
      </div>

      <div className="p-3 flex flex-col flex-grow">
        <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2">{title}</h3>

        <div className="flex-grow"></div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1 text-gray-500">
            <FaMapMarkerAlt size={14} className="text-green-500" />
            <span className="text-sm truncate max-w-[120px]">{location}</span>
          </div>

          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1 text-gray-500">
              <FaClock size={12} />
              <span className="text-xs">{formatDate(date)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
          <span className="text-primary font-medium text-lg">{formatPrice(price)}</span>
          <button
            onClick={onFavoriteToggle}
            className="flex items-center justify-center h-8 w-8"
            aria-label={isFavorite ? "Favorilerden çıkar" : "Favorilere ekle"}
          >
            {isFavorite ? (
              <FaHeart size={18} className="fill-red-500 text-red-500" />
            ) : (
              <FaRegHeart size={18} className="text-gray-400" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

AdPreview.propTypes = {
  imageUrl: PropTypes.string,
  title: PropTypes.string.isRequired,
  location: PropTypes.string,
  price: PropTypes.number.isRequired,
  date: PropTypes.string,
  isFavorite: PropTypes.bool,
  onFavoriteToggle: PropTypes.func,
  className: PropTypes.string,
};

export default AdPreview; 