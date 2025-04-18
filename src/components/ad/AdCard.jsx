import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaHeart, FaRegHeart, FaClock, FaImage, FaStar } from 'react-icons/fa';
import PropTypes from 'prop-types';

const AdCard = ({ ad, onFavoriteToggle }) => {
  // Fiyat formatı
  const formatPrice = (price) => {
    if (!price && price !== 0) return 'Belirtilmemiş';
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Tarih formatı
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Bugün';
    } else if (diffInDays === 1) {
      return 'Dün';
    } else if (diffInDays < 7) {
      return `${diffInDays} gün önce`;
    } else {
      return new Intl.DateTimeFormat('tr-TR', { 
        day: 'numeric', 
        month: 'long'
      }).format(date);
    }
  };

  // İlanın URL'ini oluştur
  const adUrl = `/ilan/${ad.id}`;

  return (
    <div className={`relative h-full rounded-lg shadow-md overflow-hidden bg-white hover:shadow-lg transition-shadow duration-300 ${ad.isFeatured ? 'border-2 border-yellow-400' : ''}`}>
      {ad.isFeatured && (
        <div className="absolute top-2 left-2 z-10">
          <span className="bg-yellow-400 text-yellow-800 text-xs font-semibold px-2 py-1 rounded flex items-center">
            <FaStar className="mr-1" /> VIP İlan
          </span>
        </div>
      )}
      
      <div className="absolute top-2 right-2 z-10">
        <button 
          className="bg-white rounded-full p-1.5 shadow-sm cursor-pointer hover:bg-gray-100"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onFavoriteToggle) onFavoriteToggle(ad.id);
          }}
          title={ad.isSelected ? "Favorilerden Çıkar" : "Favorilere Ekle"}
          type="button"
        >
          {ad.isSelected ? (
            <FaHeart className="text-red-500 w-5 h-5" />
          ) : (
            <FaRegHeart className="text-gray-500 w-5 h-5" />
          )}
        </button>
      </div>
      
      <Link to={adUrl} className="block text-inherit no-underline">
        {/* İlan Resmi */}
        <div className="relative h-48 overflow-hidden bg-gray-100">
          {ad.mainImageUrl ? (
            <img 
              src={ad.mainImageUrl} 
              alt={ad.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex justify-center items-center">
              <FaImage className="text-gray-400 text-4xl" />
            </div>
          )}
          
          {/* Durum etiketi */}
          {ad.isNew !== undefined && (
            <div className="absolute bottom-2 left-2">
              <span className={`px-2 py-1 rounded text-xs text-white ${
                ad.isNew ? 'bg-green-600' : 'bg-blue-600'
              }`}>
                {ad.isNew ? 'Yeni' : 'İkinci El'}
              </span>
            </div>
          )}
        </div>
        
        {/* İlan Detay Bilgileri */}
        <div className="p-4">
          {/* Fiyat */}
          <p className="text-lg font-bold text-primary m-0">
            {formatPrice(ad.price)}
          </p>
          
          {/* Başlık */}
          <h3 className="font-semibold text-base mt-2 mb-2 line-clamp-2 h-12">
            {ad.title}
          </h3>
          
          {/* Lokasyon ve Tarih */}
          <div className="flex flex-col gap-1 text-xs text-gray-500">
            <div className="flex items-center">
              <FaMapMarkerAlt className="mr-1 text-gray-400" />
              <span className="truncate">{ad.locationCityName || 'Konum belirtilmemiş'}</span>
            </div>
            
            <div className="flex items-center">
              <FaClock className="mr-1 text-gray-400" />
              <span>{formatDate(ad.updatedAt)}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

AdCard.propTypes = {
  ad: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    price: PropTypes.number,
    isNew: PropTypes.bool,
    isSelected: PropTypes.bool,
    isFeatured: PropTypes.bool,
    locationCityName: PropTypes.string,
    mainImageUrl: PropTypes.string,
    updatedAt: PropTypes.string
  }).isRequired,
  onFavoriteToggle: PropTypes.func
};

export default AdCard; 