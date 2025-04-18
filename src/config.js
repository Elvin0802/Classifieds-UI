// API ve diğer yapılandırma ayarları

// API URL'si
export const API_URL = 'http://localhost:5097/api';

// Uygulama adı
export const APP_NAME = 'İlanCepte';

// Resim yükleme limitleri
export const IMAGE_UPLOAD_LIMIT = 5; // Maksimum yüklenebilecek resim sayısı
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Sayfalama ayarları
export const DEFAULT_PAGE_SIZE = 10;

// İlan bildirme nedenleri
export const REPORT_REASONS = [
  'Yanıltıcı bilgi veya dolandırıcılık',
  'Yasaklı ürün veya hizmet',
  'Uygunsuz veya rahatsız edici içerik',
  'Telif hakkı ihlali',
  'Aynı ilan birden fazla kez yayınlanmış',
  'Diğer'
];

// Ödeme yöntemleri
export const PAYMENT_METHODS = [
  { id: 1, name: 'Kredi Kartı' },
  { id: 2, name: 'Havale/EFT' },
  { id: 3, name: 'Kapıda Ödeme' }
];

// Uygulama tema renkleri
export const THEME_COLORS = {
  primary: '#1e88e5',
  secondary: '#ff8f00',
  success: '#43a047',
  danger: '#e53935',
  warning: '#fdd835',
  info: '#29b6f6',
  light: '#f5f5f5',
  dark: '#212121'
};

// İlan durumları
export const AD_STATUSES = {
  PENDING: 'pending',
  ACTIVE: 'active',
  SOLD: 'sold',
  EXPIRED: 'expired',
  REJECTED: 'rejected'
};

// Kullanıcı rolleri
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  MODERATOR: 'moderator'
}; 