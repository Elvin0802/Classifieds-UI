import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Heart, Clock, ImageIcon, Star, Flag } from 'lucide-react';
import PropTypes from 'prop-types';
import { cn } from '../ui/utils';
import ReportModal from '../report/ReportModal';

const AdCard = ({ ad, onFavoriteToggle }) => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  
  // Fiyat formatı
  const formatPrice = (price) => {
    if (!price && price !== 0) return 'Təyin olunmayıb';
    return new Intl.NumberFormat('az-AZ', {
      style: 'currency',
      currency: 'AZN',
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
      return 'Dünən';
    } else if (diffInDays < 7) {
      return `${diffInDays} gün öncə`;
    } else {
      return new Intl.DateTimeFormat('az-AZ', { 
        day: 'numeric', 
        month: 'long'
      }).format(date);
    }
  };

  // İlanın URL'ini oluştur
  const adUrl = `/ilanlar/${ad.id}`;
  
  // Rapor modalını açma işlevi
  const openReportModal = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsReportModalOpen(true);
  };

  return (
    <>
      <div className={cn(
        "group relative h-full rounded-xl overflow-hidden bg-white border border-gray-200 transition-all duration-200 hover:shadow-md hover:border-gray-300",
        ad.isFeatured ? "ring-2 ring-yellow-400 ring-offset-1" : ""
      )}>
        {ad.isFeatured && (
          <div className="absolute top-2 left-2 z-10">
            <span className="bg-yellow-400 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
              <Star className="h-3 w-3" /> VİP Elan
            </span>
          </div>
        )}
        
        <div className="absolute top-2 right-2 z-10 flex gap-2">
          <button 
            className="bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm cursor-pointer hover:bg-white transition-colors"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onFavoriteToggle) onFavoriteToggle(ad.id);
            }}
            title={ad.isSelected ? "Seçilmişlərdən çıxar" : "Seçilmişlərə əlavə et"}
            type="button"
          >
            <Heart 
              className={cn(
                "w-5 h-5", 
                ad.isSelected ? "fill-red-500 text-red-500" : "text-gray-500"
              )}
            />
          </button>
          
          {/* Rapor Et Butonu */}
          <button 
            className="bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm cursor-pointer hover:bg-white transition-colors"
            onClick={openReportModal}
            title="Elanı Şikayət Et"
            type="button"
          >
            <Flag className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <Link to={adUrl} className="block text-inherit no-underline">
          {/* İlan Resmi */}
          <div className="relative h-48 overflow-hidden bg-gray-100">
            {ad.mainImageUrl ? (
              <img 
                src={ad.mainImageUrl} 
                alt={ad.title} 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex justify-center items-center">
                <ImageIcon className="text-gray-400 h-12 w-12" />
              </div>
            )}
            
            {/* Durum etiketi */}
            {ad.isNew !== undefined && (
              <div className="absolute bottom-2 left-2">
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium text-white",
                  ad.isNew ? "bg-green-500" : "bg-blue-500"
                )}>
                  {ad.isNew ? 'Yeni' : 'İşlənmiş'}
                </span>
              </div>
            )}
          </div>
          
          {/* İlan Detay Bilgileri */}
          <div className="p-4">
            {/* Fiyat */}
            <p className="text-lg font-bold text-primary">
              {formatPrice(ad.price)}
            </p>
            
            {/* Başlık */}
            <h3 className="font-medium text-base mt-2 mb-2 line-clamp-2 text-gray-900 min-h-[48px]">
              {ad.title}
            </h3>
            
            {/* Lokasyon ve Tarih */}
            <div className="flex flex-col gap-1 text-xs text-gray-500 mt-auto">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-gray-400" />
                <span className="truncate">{ad.locationCityName || 'Məkan təyin olunmayıb'}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-gray-400" />
                <span>{formatDate(ad.updatedAt)}</span>
              </div>
            </div>
          </div>
        </Link>
      </div>
      
      {/* Rapor Modalı */}
      <ReportModal 
        adId={ad.id}
        adTitle={ad.title}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </>
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