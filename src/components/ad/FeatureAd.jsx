import { useState, useEffect, Fragment } from 'react';
import { FaStar, FaCheckCircle, FaCrown, FaClock, FaMoneyBillWave, FaSpinner } from 'react-icons/fa';
import PropTypes from 'prop-types';
import adService from '../../services/adService';
import { toast } from 'react-toastify';

const FeatureAd = ({ adId, isOpen, onClose, onSuccess }) => {
  const [pricingOptions, setPricingOptions] = useState([]);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fiyatlandırma seçeneklerini al
  useEffect(() => {
    const fetchPricingOptions = async () => {
      if (!isOpen) return;
      
      setIsLoading(true);
      setSelectedOptionId(null); // Her açılışta seçimi sıfırla
      
      try {
        const response = await adService.getPricingOptions();
        if (response && response.isSucceeded && response.data) {
          const options = response.data.items || [];
          console.log('Alınan seçenekler:', options);
          setPricingOptions(options);
          
          // Sadece liste boş değilse varsayılan seçimi yap
          if (options.length > 0) {
            console.log('Varsayılan seçenek ayarlanıyor:', options[0].durationDays);
            setSelectedOptionId(options[0].durationDays);
          }
        } else {
          toast.error('Qiymət seçimlərini yükləmək alınmadı');
        }
      } catch (error) {
        console.error('Fiyatlandırma seçenekleri yüklenemedi:', error);
        toast.error('Qiymət seçimlərini yükləmək alınmadı');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPricingOptions();
  }, [isOpen]);

  // Seçilen opsiyon bilgisini debug et
  useEffect(() => {
    console.log('Seçilen opsiyon ID:', selectedOptionId);
    console.log('Seçim var mı:', selectedOptionId !== null);
  }, [selectedOptionId]);

  // İlan VIP yap
  const handleFeatureAd = async () => {
    if (!selectedOptionId) {
      toast.error('VIP müddəti seçin');
      return;
    }

    setIsProcessing(true);
    try {
      const selectedOption = pricingOptions.find(option => option.durationDays === selectedOptionId);
      if (!selectedOption) {
        toast.error('VIP müddəti tapılmadı');
        setIsProcessing(false);
        return;
      }

      console.log('VIP yapılacak ilan:', adId);
      console.log('Seçilen süre (gün):', selectedOption.durationDays);
      
      const response = await adService.featureAd(adId, selectedOption.durationDays);
      console.log('VIP yapma yanıtı:', response);
      
      if (response && response.isSucceeded) {
        toast.success('Elana VIP təyin olundu');
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(response?.message || 'Elan VIP olmadı');
      }
    } catch (error) {
      console.error('İlan VIP yapılırken hata oluştu:', error);
      toast.error('xəta baş verdi');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FaCrown className="text-yellow-500" /> Elanı VIP Et
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-6">
          Elanınızı VIP etməklə daha çox baxış əldə edin və potensial alıcıların diqqətini cəlb edin. 
          VIP elanlar axtarışlarda və siyahılarda vurğulanır.
          </p>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <FaSpinner className="animate-spin text-primary h-10 w-10" />
            </div>
          ) : (
            <div className="space-y-4">
              {pricingOptions.map((option) => (
                <div 
                  key={`pricing-option-${option.durationDays}`}
                  className={`border-2 rounded-lg p-5 cursor-pointer transition-all duration-200 hover:border-primary hover:shadow-md ${
                    selectedOptionId === option.durationDays 
                      ? 'border-primary bg-primary/5 shadow-md' 
                      : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedOptionId(option.durationDays)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-2 ${
                          selectedOptionId === option.durationDays
                            ? 'border-primary bg-primary'
                            : 'border-gray-300'
                        }`}>
                          {selectedOptionId === option.durationDays && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">{option.durationDays} Gün</h3>
                        {selectedOptionId === option.durationDays && (
                          <FaCheckCircle className="text-primary ml-2" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-2 ml-7">
                        <div className="flex items-center text-gray-600 text-sm">
                          <FaClock className="mr-1 text-gray-500" />
                          <span>{option.durationDays} gün</span>
                        </div>
                        {option.description && (
                          <p className="text-sm text-gray-500">{option.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xl font-bold text-primary flex items-center">
                        <FaMoneyBillWave className="mr-1 text-green-500" />
                        {option.price} AZN
                      </span>
                      {option.originalPrice && option.originalPrice > option.price && (
                        <span className="text-sm text-gray-500 line-through">
                          {option.originalPrice} ₺
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {pricingOptions.length === 0 && !isLoading && (
                <div className="py-8 text-center text-gray-500">
                  Qiymət seçimləri tapılmadı
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button 
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
            onClick={onClose}
            disabled={isProcessing}
          >
            İmtina et
          </button>
          <button 
            className={`px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 ${
              isProcessing || isLoading || !selectedOptionId
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary text-white hover:bg-primary/90'
            }`}
            onClick={handleFeatureAd}
            disabled={isProcessing || isLoading || !selectedOptionId}
          >
            {isProcessing ? (
              <Fragment key="processing">
                <FaSpinner className="animate-spin" />
                <span>Emal olunur...</span>
              </Fragment>
            ) : (
              <Fragment key="not-processing">
                <FaStar />
                <span>VIP Et</span>
              </Fragment>
            )}
          </button>
        </div>

        {/* VIP Avantajları */}
        <div className="px-6 pb-6">
          <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
            <h4 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
              <FaCrown className="text-yellow-500" />
              VIP Elanın Üstünlükləri
            </h4>
            <ul className="space-y-1 text-sm text-yellow-700">
              <li key="advantage-1" className="flex items-start">
                <span className="inline-block w-1.5 h-1.5 bg-yellow-500 rounded-full mr-2 mt-1.5"></span>
                Axtarış və kateqoriya siyahılarının yuxarısında görünür
              </li>
              <li key="advantage-2" className="flex items-start">
                <span className="inline-block w-1.5 h-1.5 bg-yellow-500 rounded-full mr-2 mt-1.5"></span>
                Xüsusi VIP etiketi ilə diqqəti cəlb edir
              </li>
              <li key="advantage-3" className="flex items-start">
                <span className="inline-block w-1.5 h-1.5 bg-yellow-500 rounded-full mr-2 mt-1.5"></span>
                Daha çox potensial alıcıya çatır
              </li>
              <li key="advantage-4" className="flex items-start">
                <span className="inline-block w-1.5 h-1.5 bg-yellow-500 rounded-full mr-2 mt-1.5"></span>
                Elanın satılma şansını artırır
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

FeatureAd.propTypes = {
  adId: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func
};

export default FeatureAd; 