import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaMapMarkerAlt, FaClock, FaStar } from 'react-icons/fa';

const AdCard = ({
  id,
  title,
  description = 'Açıklama bulunmuyor',
  price = 0,
  location = 'Belirtilmemiş',
  imageUrl,
  createdAt,
  isFavorite = false,
  isFeatured = false,
  onFavoriteClick,
  className = '',
  disableLink = false
}) => {
  const formatDate = (dateString) => {
    if (!dateString) {
      return 'Tarih belirtilmemiş';
    }
    
    try {
      const date = new Date(dateString);
      // Geçerli tarih kontrolü (Invalid Date kontrolü)
      if (isNaN(date.getTime())) {
        return 'Geçersiz tarih';
      }
      
      return new Intl.DateTimeFormat('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date);
    } catch (error) {
      console.error('Tarih biçimlendirme hatası:', error);
      return 'Geçersiz tarih';
    }
  };

  const formatPrice = (price) => {
    try {
      if (price === null || price === undefined) {
        return '₺0,00';
      }
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY'
      }).format(price);
    } catch (error) {
      console.error('Fiyat biçimlendirme hatası:', error);
      return '₺0,00';
    }
  };

  // Default image URL
  const defaultImageUrl = '/placeholder-image.jpg';
  
  // Use fallback for empty or null image URLs
  const adImageUrl = imageUrl || defaultImageUrl;

  // İlan içeriğini render eden bileşen
  const AdCardContent = () => (
    <>
      <div className="relative h-48">
        <img
          src={adImageUrl}
          alt={title || 'İlan görseli'}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = defaultImageUrl;
          }}
        />
        
        {/* Favorilere ekleme butonu */}
        {onFavoriteClick && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onFavoriteClick(id);
            }}
            className="absolute top-2 right-2 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors"
          >
            {isFavorite ? (
              <FaHeart className="text-red-500 w-5 h-5" />
            ) : (
              <FaRegHeart className="text-gray-500 w-5 h-5" />
            )}
          </button>
        )}
        
        {/* VIP ilan rozeti */}
        {isFeatured && (
          <div className="absolute top-2 left-2 bg-yellow-400 text-gray-800 px-2 py-1 rounded-md flex items-center text-xs font-bold">
            <FaStar className="mr-1" /> VIP
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1">
          {title || 'İsimsiz İlan'}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {description}
        </p>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center text-gray-500 text-sm">
            <FaMapMarkerAlt className="mr-1" />
            <span>{location}</span>
          </div>
          <div className="flex items-center text-gray-500 text-sm">
            <FaClock className="mr-1" />
            <span>{formatDate(createdAt)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-blue-600">
            {formatPrice(price)}
          </span>
          <span className="text-sm text-blue-500 hover:text-blue-600 font-medium">
            Detayları Gör →
          </span>
        </div>
      </div>
    </>
  );

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${isFeatured ? 'border-2 border-yellow-400' : ''} ${className}`}>
      {disableLink ? (
        <AdCardContent />
      ) : (
        <Link to={`/ads/${id}`} className="block">
          <AdCardContent />
        </Link>
      )}
    </div>
  );
};

export default AdCard; 