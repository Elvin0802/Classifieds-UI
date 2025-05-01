import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Classname yardımcı fonksiyonu
 * Birden fazla className'i birleştirmeye yarar.
 * undefined, null, false değerlerini filtreleyerek temiz bir className oluşturur.
 * tailwind sınıfları arasındaki çakışmaları çözer.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
} 