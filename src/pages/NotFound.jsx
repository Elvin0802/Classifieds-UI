import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';
import React from 'react';
import { Button } from '../components/ui/button';

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-4xl px-4 py-8">
        <div className="bg-card rounded-lg shadow-xl overflow-hidden border border-border">
          <div className="flex flex-col md:flex-row">
            {/* Sol taraf - İllüstrasyon */}
            <div className="bg-primary md:w-1/2 p-8 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-9xl font-bold text-primary-foreground">404</h1>
                <div className="w-16 h-1 bg-primary-foreground mx-auto my-4"></div>
                <p className="text-primary-foreground text-xl">Səhifə Tapılmadı.</p>
              </div>
            </div>
            
            {/* Sağ taraf - İçerik */}
            <div className="md:w-1/2 p-8">
              <div className="max-w-md mx-auto">
                <h2 className="text-3xl font-bold text-foreground mb-4">Upss! Bir şeylər səhv getdi.</h2>
                
                <p className="text-muted-foreground mb-8">
                Axtardığınız səhifə mövcud deyil və ya başqa bir xəta baş verdi. Aşağıdakı variantları sınaya bilərsiniz:
                </p>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary text-sm">1</span>
                    </div>
                    <p className="ml-3 text-muted-foreground">
                    Əsas səhifəyə qayıdın və yenidən başlayın
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary text-sm">2</span>
                    </div>
                    <p className="ml-3 text-muted-foreground">
                    Elanlar bölməsinə daxil olun
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary text-sm">3</span>
                    </div>
                    <p className="ml-3 text-muted-foreground">
                      Əvvəlki səhifəyə qayıdın
                    </p>
                  </li>
                </ul>
                
                <div className="space-y-3">
                  <Button asChild className="w-full">
                    <Link to="/" className="flex items-center justify-center">
                      <Home className="mr-2 h-4 w-4" /> Əsas səhifəyə qayıt
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/ilanlar" className="flex items-center justify-center">
                      <Search className="mr-2 h-4 w-4" /> Elanlara bax
                    </Link>
                  </Button>
                  <Button 
                    onClick={() => window.history.back()} 
                    variant="ghost"
                    className="w-full"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Geri qayıt
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFound; 