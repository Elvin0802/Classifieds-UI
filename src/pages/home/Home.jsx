import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Tag, Search, BadgeCheck, Clock, BanknoteIcon, ShieldCheck } from 'lucide-react';
import categoryService from '../../services/categoryService';
import locationService from '../../services/locationService';
import adService from '../../services/adService';
import SearchBar from '../../components/home/SearchBar';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import AdCard from '../../components/ad/AdCard';
import { Button, buttonVariants } from '../../components/ui/button';
import { cn } from '../../components/ui/utils';
import { Card, CardContent } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/Alert';
import { toast } from 'react-toastify';
import authStorage from '../../services/authStorage';

const Home = () => {
  const [featuredAds, setFeaturedAds] = useState([]);
  const [loading, setLoading] = useState({
    featuredAds: true
  });
  const [error, setError] = useState({
    featuredAds: null
  });

  useEffect(() => {
    const fetchFeaturedAds = async () => {
      try {
        // İstek parametreleri - Sadece öne çıkan ilanları getir
        const featuredParams = {
          pageNumber: 1,
          pageSize: 8, // Ana sayfada 8 ilan gösteriliyor
          sortBy: 'createdAt',
          isDescending: true,
          adStatus: 1, // Aktif ilanlar
          isFeatured: true // VIP ilanlar için ekle
        };
        
        // Öne çıkan ilanları getir
        const response = await adService.getFeaturedAds(featuredParams);
        if (response && response.data && response.data.items) {
          setFeaturedAds(response.data.items);
        } else {
          setError(prev => ({ ...prev, featuredAds: 'VİP elanalar yüklənmədi.' }));
        }
      } catch (err) {
        console.error('VİP elanları yükləyəndə xəta yarandı:', err);
        setError(prev => ({ ...prev, featuredAds: 'VİP elanalar yüklənmədi.' }));
      } finally {
        setLoading(prev => ({ ...prev, featuredAds: false }));
      }
    };

    fetchFeaturedAds();
  }, []);

  // Favorilere ekle/çıkar
  const handleFavoriteToggle = async (adId) => {
    try {
      // İlanı bul
      const adToUpdate = featuredAds.find(ad => ad.id === adId);
      
      if (!adToUpdate) {
        console.error('İlan bulunamadı:', adId);
        toast.error('elan yoxdur.');
        return;
      }
      
      // Kendi ilanımızı favoriye ekleyemeyiz
      if (adToUpdate.isOwner) {
        toast.info('Öz elanınızı seçə bilməzsiniz.');
        return;
      }

      console.log('İlan işlemi:', adToUpdate);
      
      // İlanın durumuna göre işlem yap
      if (adToUpdate.isSelected) {
        // Önce API isteği gönder ve başarılı olursa UI'ı güncelle
        const response = await adService.unselectAd(adId);
        
        if (response && response.isSucceeded) {
          // UI'ı güncelle
          setFeaturedAds(featuredAds.map(ad => 
            ad.id === adId ? { ...ad, isSelected: false } : ad
          ));
          toast.success('elan çıxarıldı.');
        } else {
          toast.error('xəta: ' + (response?.message || 'İşlem başarısız oldu'));
        }
      } else {
        // Önce API isteği gönder ve başarılı olursa UI'ı güncelle
        const response = await adService.selectAd(adId);
        
        if (response && response.isSucceeded) {
          // UI'ı güncelle
          setFeaturedAds(featuredAds.map(ad => 
            ad.id === adId ? { ...ad, isSelected: true } : ad
          ));
          toast.success('elan əlavə olundu.');
        } else {
          toast.error('xəta: ' + (response?.message || 'İşlem başarısız oldu'));
        }
      }
    } catch (err) {
      console.error('Favori işlemi sırasında hata oluştu:', err);
      toast.error('xəta: ' + (err.message || 'xəta'));
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-blue-700 text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              İstədiyiniz hər şey burada , elanlara bax və ya elan paylaş.
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Kainatın ən kiçik elan platforması.
            </p>
            
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Özellikler */}
      <section className="bg-card py-12 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 p-3 rounded-full">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Sürətli platforma.</h3>
                <p className="text-sm text-muted-foreground">Saniyələr içində elan paylaşın.</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 p-3 rounded-full">
                <BanknoteIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Pulsuz Elanlar.</h3>
                <p className="text-sm text-muted-foreground">Pul ödəmədən elan paylaşma imkanı.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Öne Çıkan İlanlar */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <BadgeCheck className="h-6 w-6 text-primary" /> VİP Elanlar
            </h2>
            <Link 
              to="/ads?isFeatured=true" 
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "gap-1"
              )}
            >
              Bütün VİP Elanlar <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading.featuredAds ? (
            <div className="py-8 flex justify-center">
              <LoadingSpinner />
            </div>
          ) : error.featuredAds ? (
            <Alert variant="destructive">
              <AlertDescription>{error.featuredAds}</AlertDescription>
            </Alert>
          ) : featuredAds.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                VİP elan yoxdur.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredAds.map(ad => (
                <AdCard
                  key={ad.id}
                  ad={ad}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Home; 