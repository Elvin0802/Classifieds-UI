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

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [featuredAds, setFeaturedAds] = useState([]);
  const [loading, setLoading] = useState({
    categories: true,
    locations: true,
    featuredAds: true
  });
  const [error, setError] = useState({
    categories: null,
    locations: null,
    featuredAds: null
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getAllCategories();
        if (response && response.isSucceeded && response.data && response.data.items) {
          setCategories(response.data.items);
        } else {
          setError(prev => ({ ...prev, categories: 'Kategoriyalar yuklenmedi.' }));
        }
      } catch (err) {
        console.error('kategoriyalari yukleyende xeta yarandi:', err);
        setError(prev => ({ ...prev, categories: 'Kategoriyalar yuklenmedi.' }));
      } finally {
        setLoading(prev => ({ ...prev, categories: false }));
      }
    };

    const fetchLocations = async () => {
      try {
        const response = await locationService.getAll();
        if (response && response.isSucceeded && response.data && response.data.items) {
          setLocations(response.data.items);
        } else {
          setError(prev => ({ ...prev, locations: 'mekanlar yuklenmedi.' }));
        }
      } catch (err) {
        console.error('mekanlari yukleyende xeta yarandi:', err);
        setError(prev => ({ ...prev, locations: 'mekanlar yuklenmedi.' }));
      } finally {
        setLoading(prev => ({ ...prev, locations: false }));
      }
    };

    const fetchFeaturedAds = async () => {
      try {
        // İstek parametreleri - Sadece öne çıkan ilanları getir
        const featuredParams = {
          pageNumber: 1,
          pageSize: 8, // Ana sayfada 8 ilan gösteriliyor
          sortBy: 'createdAt',
          isDescending: true,
          adStatus: 1 // Aktif ilanlar
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

    fetchCategories();
    fetchLocations();
    fetchFeaturedAds();
  }, []);

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
            
            <SearchBar categories={categories} locations={locations} />
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
        {/* Kategoriler Bölümü */}
        <section className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Tag className="h-6 w-6 text-primary" /> Kategoriyalar
            </h2>
            <Link 
              to="/ads" 
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "gap-1"
              )}
            >
              Bütün Elanlar <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading.categories ? (
            <div className="py-8 flex justify-center">
              <LoadingSpinner />
            </div>
          ) : error.categories ? (
            <Alert variant="destructive">
              <AlertDescription>{error.categories}</AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.slice(0, 12).map((category) => (
                <Link key={category.id} to={`/ads?categoryId=${category.id}`}>
                  <Card className="h-full hover:shadow-md transition-shadow overflow-hidden group">
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                      <div className="mb-3 p-3 rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Tag className="h-7 w-7 text-primary" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground">{category.name}</h3>
                      <span className="text-sm text-muted-foreground mt-1">
                        {category.adCount || 0} elan
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Lokasyonlar Bölümü */}
        <section className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <MapPin className="h-6 w-6 text-primary" /> Məkanlar
            </h2>
            <Link 
              to="/ads" 
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "gap-1"
              )}
            >
              Bütün Elanlar <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading.locations ? (
            <div className="py-8 flex justify-center">
              <LoadingSpinner />
            </div>
          ) : error.locations ? (
            <Alert variant="destructive">
              <AlertDescription>{error.locations}</AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {locations.slice(0, 12).map((location) => (
                <Link key={location.id} to={`/ads?locationId=${location.id}`}>
                  <Card className="h-full hover:shadow-md transition-shadow overflow-hidden group">
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                      <div className="mb-3 p-3 rounded-full bg-blue-500/10 w-16 h-16 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                        <MapPin className="h-7 w-7 text-blue-500" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground">{location.city}</h3>
                      <span className="text-sm text-muted-foreground mt-1">
                        {location.country}
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

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