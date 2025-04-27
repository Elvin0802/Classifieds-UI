import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaMapMarkerAlt } from 'react-icons/fa';
import categoryService from '../../services/categoryService';
import locationService from '../../services/locationService';
import adService from '../../services/adService';
import SearchBar from '../../components/home/SearchBar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import AdCard from '../../components/ad/AdCard';

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
          setError(prev => ({ ...prev, categories: 'Kategoriler yüklenemedi.' }));
        }
      } catch (err) {
        console.error('Kategoriler yüklenirken hata:', err);
        setError(prev => ({ ...prev, categories: 'Kategoriler yüklenemedi.' }));
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
          setError(prev => ({ ...prev, locations: 'Lokasyonlar yüklenemedi.' }));
        }
      } catch (err) {
        console.error('Lokasyonlar yüklenirken hata:', err);
        setError(prev => ({ ...prev, locations: 'Lokasyonlar yüklenemedi.' }));
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
          setError(prev => ({ ...prev, featuredAds: 'Öne çıkan ilanlar yüklenemedi.' }));
        }
      } catch (err) {
        console.error('Öne çıkan ilanlar yüklenirken hata:', err);
        setError(prev => ({ ...prev, featuredAds: 'Öne çıkan ilanlar yüklenemedi.' }));
      } finally {
        setLoading(prev => ({ ...prev, featuredAds: false }));
      }
    };

    fetchCategories();
    fetchLocations();
    fetchFeaturedAds();
  }, []);

  return (
    <div className="home-page">
      <div className="bg-primary text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">İstediğinizi Bulun, Hemen Satın</h1>
            <p className="text-xl">
              Türkiye'nin en büyük ilan platformunda aradığınız her şey burada.
            </p>
          </div>
          
          <SearchBar categories={categories} locations={locations} />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Kategoriler Bölümü */}
        <section className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Kategoriler</h2>
            <Link to="/ads" className="flex items-center text-primary border border-primary rounded-md px-4 py-2 hover:bg-primary hover:text-white transition-colors">
              Tüm İlanlar <FaArrowRight className="ml-2" />
            </Link>
          </div>

          {loading.categories ? (
            <LoadingSpinner />
          ) : error.categories ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error.categories}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.slice(0, 12).map((category) => (
                <Link key={category.id} to={`/ads?categoryId=${category.id}`} className="block">
                  <div className="h-full text-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                    <div className="mx-auto mb-3 p-3 rounded-full bg-gray-100 w-16 h-16 flex items-center justify-center">
                      {category.icon ? (
                        <i className={`fa ${category.icon} text-2xl text-primary`}></i>
                      ) : (
                        <i className="fa fa-tag text-2xl text-primary"></i>
                      )}
                    </div>
                    <h3 className="text-lg font-medium">{category.name}</h3>
                    <span className="text-sm text-gray-500">
                      {category.adCount || 0} ilan
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Lokasyonlar Bölümü */}
        <section className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Popüler Lokasyonlar</h2>
            <Link to="/ads" className="flex items-center text-primary border border-primary rounded-md px-4 py-2 hover:bg-primary hover:text-white transition-colors">
              Tüm İlanlar <FaArrowRight className="ml-2" />
            </Link>
          </div>

          {loading.locations ? (
            <LoadingSpinner />
          ) : error.locations ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error.locations}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {locations.slice(0, 12).map((location) => (
                <Link key={location.id} to={`/ads?locationId=${location.id}`} className="block">
                  <div className="h-full text-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                    <div className="mx-auto mb-3 p-3 rounded-full bg-blue-50 w-16 h-16 flex items-center justify-center">
                      <FaMapMarkerAlt className="text-2xl text-blue-500" />
                    </div>
                    <h3 className="text-lg font-medium">{location.city}</h3>
                    <span className="text-sm text-gray-500">
                      {location.country}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Öne Çıkan İlanlar Bölümü */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Öne Çıkan İlanlar</h2>
            <Link to="/ads" className="flex items-center text-primary border border-primary rounded-md px-4 py-2 hover:bg-primary hover:text-white transition-colors">
              Tüm İlanlar <FaArrowRight className="ml-2" />
            </Link>
          </div>

          {loading.featuredAds ? (
            <LoadingSpinner />
          ) : error.featuredAds ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error.featuredAds}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredAds.slice(0, 8).map((ad) => (
                <div key={ad.id}>
                  <AdCard ad={ad} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Home; 