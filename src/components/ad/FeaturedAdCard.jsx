import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaHeart, FaRegHeart, FaImage } from 'react-icons/fa';

const FeaturedAdCard = ({ ad }) => {
  // Fiyat formatı
  const formatPrice = (price) => {
    if (!price) return 'Belirtilmemiş';
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

  return (
    <div className="h-full relative rounded-lg shadow-md overflow-hidden bg-white">
      {ad.isFeatured && (
        <div className="absolute top-2 left-2 z-10">
          <span className="bg-yellow-400 text-yellow-800 text-xs font-semibold px-2 py-1 rounded">
            Öne Çıkan
          </span>
        </div>
      )}
      
      <div className="absolute top-2 right-2 z-10">
        {ad.isFavorite ? (
          <FaHeart className="text-red-500 text-xl" />
        ) : (
          <FaRegHeart className="text-gray-500 text-xl" />
        )}
      </div>
      
      <Link to={`/ads/${ad.id}`} className="block no-underline text-inherit">
        <div className="h-48 overflow-hidden">
          {ad.images && ad.images.length > 0 ? (
            <img 
              src={ad.images[0].url} 
              alt={ad.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex justify-center items-center">
              <FaImage className="text-gray-400 text-4xl" />
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-semibold truncate mb-2">{ad.title}</h3>
          
          <p className="text-primary font-bold mb-2">
            {formatPrice(ad.price)}
          </p>
          
          <div className="flex justify-between items-center mb-2">
            <span className="bg-gray-100 text-gray-800 text-xs border border-gray-300 px-2 py-1 rounded">
              {ad.category?.name || 'Kategori'}
            </span>
            <span className="text-gray-500 text-sm">
              {formatDate(ad.createdAt)}
            </span>
          </div>
          
          <div className="flex items-center text-gray-500 text-sm">
            <FaMapMarkerAlt className="mr-1" /> 
            <span className="truncate">{ad.location || 'Konum belirtilmemiş'}</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default FeaturedAdCard; 