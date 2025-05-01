import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '../ui/utils';
import { Button } from '../ui/button';

const Pagination = ({ 
  totalItems, 
  pageSize, 
  currentPage, 
  onPageChange,
  siblingCount = 1,
  className
}) => {
  // Sayfa sayısını hesapla
  const totalPages = Math.ceil(totalItems / pageSize);
  
  // Toplam öge 0 ise veya sayfa sayısı 1 ise pagination gösterme
  if (totalItems === 0 || totalPages <= 1) {
    return null;
  }
  
  // Geçerli sayfaya komşu sayfaları oluştur
  const getPageNumbers = () => {
    // Maksimum gösterilecek sayfa butonları (önceki, sonraki ve ... düğmeleri hariç)
    const maxVisiblePageButtons = siblingCount * 2 + 3; // İlk sayfa + son sayfa + mevcut sayfa + siblingCount*2
    
    // Eğer toplam sayfa sayısı maksimum gösterilecek sayfa butonlarından az ise
    // tüm sayfaları göster
    if (totalPages <= maxVisiblePageButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // Left ve right sibling indexleri, ... göstermek için kullanılacak eşikler
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);
    
    // Başlangıçta veya sonda ... gösterme kararı
    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;
    
    // İlk sayfa ve son sayfa daima gösterilecek
    const firstPageIndex = 1;
    const lastPageIndex = totalPages;
    
    // Sol ... göster, sağ ... göster
    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [firstPageIndex, 'leftDots', ...middleRange, 'rightDots', lastPageIndex];
    }
    
    // Sol ... göster, sağ ... gösterme
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightRange = Array.from(
        { length: totalPages - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [firstPageIndex, 'leftDots', ...rightRange];
    }
    
    // Sol ... gösterme, sağ ... göster
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftRange = Array.from(
        { length: rightSiblingIndex },
        (_, i) => i + 1
      );
      return [...leftRange, 'rightDots', lastPageIndex];
    }
    
    // Hatalı durum için boş array döndür
    return [];
  };
  
  // Sayfa butonlarını oluştur
  const pageNumbers = getPageNumbers();
  
  return (
    <nav className={cn("flex justify-center mt-6", className)} aria-label="Sayfalama">
      <ul className="flex items-center space-x-1">
        {/* Önceki sayfa butonu */}
        <li>
          <Button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-md"
            aria-label="Əvvəlki Səhifə"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </li>
        
        {/* Sayfa numaraları */}
        {pageNumbers.map((pageNumber, index) => {
          // ... gösterimi için
          if (pageNumber === 'leftDots' || pageNumber === 'rightDots') {
            return (
              <li key={`dots-${index}`} className="px-1">
                <span className="flex items-center justify-center">
                  <MoreHorizontal className="h-4 w-4 text-gray-400" />
                </span>
              </li>
            );
          }
          
          // Sayfa numarası butonları için
          return (
            <li key={pageNumber}>
              <Button
                onClick={() => onPageChange(pageNumber)}
                variant={currentPage === pageNumber ? "default" : "outline"}
                size="icon"
                className="h-9 w-9 rounded-md"
                aria-label={`Səhifə ${pageNumber}`}
                aria-current={currentPage === pageNumber ? "page" : undefined}
              >
                {pageNumber}
              </Button>
            </li>
          );
        })}
        
        {/* Sonraki sayfa butonu */}
        <li>
          <Button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-md"
            aria-label="Sonrakı Səhifə"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination; 