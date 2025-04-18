## System Architecture

İlan uygulaması, modern web teknolojileri kullanan bir client-server mimarisine sahiptir:

1. **Frontend (Client)**:
   - React tabanlı SPA (Single Page Application)
   - Bileşen bazlı UI mimarisi
   - Client-side routing (React Router)
   - Context API tabanlı state yönetimi

2. **Backend (Server)**:
   - ASP.NET Core Web API
   - Repository Pattern
   - Unit of Work
   - CQRS (Command Query Responsibility Segregation)
   - Mediator Pattern (MediatR)

3. **Veritabanı**:
   - SQL Server
   - Code-First yaklaşımı ile Entity Framework Core
   - Migration-based schema yönetimi

## Component Diagrams

### Frontend Bileşen Hiyerarşisi
```
App
├── AuthProvider
├── Layout
│   ├── Header
│   ├── Main Content
│   └── Footer
├── Pages
│   ├── Home
│   ├── Auth
│   │   ├── Login
│   │   └── Register
│   ├── Ads
│   │   ├── AdsList
│   │   ├── AdDetail
│   │   ├── CreateAd
│   │   └── SelectedAds
│   ├── Profile
│   └── Admin
│       ├── AdminLayout
│       └── AdminDashboard
└── Components
    ├── UI
    │   ├── Button
    │   ├── Card
    │   └── Modal
    └── Shared
        ├── Pagination
        ├── SearchFilter
        └── AdCard
```

### API Endpoint Yapısı
```
/api
├── Auth
│   ├── Login
│   ├── Register
│   ├── RefreshTokenLogin
│   └── Logout
├── Ads
│   ├── GetAll
│   ├── GetById
│   ├── Create
│   ├── Update
│   └── Delete
├── Profile
│   ├── GetUserData
│   ├── GetActiveAds
│   ├── GetPendingAds
│   └── GetSelectedAds
└── Admin
    ├── ApproveAd
    ├── RejectAd
    └── GetUsers
```

## Design Patterns Used

### Frontend Patterns

#### 1. Provider Pattern
AuthContext ve diğer context'ler ile uygulama genelinde state yönetimi sağlanmaktadır.

```jsx
// AuthContext örneği
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // ...diğer state'ler ve fonksiyonlar...
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

#### 2. Custom Hook Pattern
Context'lere erişimi kolaylaştırmak için custom hook'lar kullanılmıştır.

```jsx
// useAuth örneği
export const useAuth = () => {
  return useContext(AuthContext);
};
```

#### 3. Interceptor Pattern
API istekleri için merkezi yönetim ve token yapılandırması.

```javascript
// axiosConfig.js içinde interceptor örneği
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // ...loglama ve diğer işlemler...
    return config;
  },
  (error) => {
    // ...hata yönetimi...
    return Promise.reject(error);
  }
);
```

#### 4. Service Pattern
API çağrıları için servis katmanı oluşturulmuştur.

```javascript
// authService.js örneği
const authService = {
  login: async (credentials) => {
    try {
      const response = await apiClient.post(`${AUTH_URL}/Login`, credentials);
      return response.data;
    } catch (error) {
      console.error('Giriş yapılırken hata:', error);
      throw error;
    }
  },
  // ...diğer fonksiyonlar...
};
```

#### 5. HOC Pattern (Higher Order Components)
Protected routes için kullanılmıştır.

```jsx
// PrivateRoute örneği
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};
```

### Backend Patterns

#### 1. Repository Pattern
Veritabanı işlemleri için soyutlama katmanı.

#### 2. Unit of Work
Transaction yönetimi ve repository'lerin orkestrasyonu.

#### 3. CQRS
Okuma ve yazma işlemlerinin ayrılması.

#### 4. Mediator Pattern
MediatR kütüphanesi ile komut ve sorguların yönetimi.

## Integration Points

### Frontend - Backend Entegrasyonu
- RESTful API üzerinden JSON formatında veri alışverişi
- Axios kütüphanesi ile HTTP istekleri
- JWT Token tabanlı kimlik doğrulama
- Refresh token mekanizması

### Ödeme Sistemleri Entegrasyonu (Planlanıyor)
- Stripe veya Iyzico API entegrasyonu
- Webhook handler'lar ile ödeme durumu güncellemeleri

### Dosya Depolama
- Azure Blob Storage ile dosya yönetimi
- İlan fotoğrafları için CDN kullanımı

## Data Flow

### Kimlik Doğrulama Akışı
1. Kullanıcı login formunu doldurur
2. Frontend, credentials'ı API'ye gönderir
3. Backend kimlik doğrulaması yapar ve JWT token üretir
4. Token frontend'e döner ve localStorage'a kaydedilir
5. Sonraki API isteklerinde token, Authorization header'ında gönderilir
6. Token geçersiz olduğunda refresh token ile yenileme yapılır

### İlan Oluşturma Akışı
1. Kullanıcı form bilgilerini ve görselleri girer
2. Frontend, verileri API'ye gönderir
3. Backend doğrulama yapar ve veritabanına kaydeder
4. İlan "beklemede" durumunda oluşturulur
5. Admin onayı sonrası "aktif" durumuna geçer

### İlan Arama Akışı
1. Kullanıcı arama kriterleri ve filtreler girer
2. Frontend, parametreleri API'ye gönderir
3. Backend uygun sorguları oluşturur ve veritabanında arar
4. Sonuçlar sayfalanmış şekilde döner
5. Frontend kullanıcı arayüzünde sonuçları gösterir

## Yeni Eklenen Sistem Bileşenleri

### Axios Merkezi Konfigürasyon
- **axiosConfig.js**: API istekleri için merkezi bir konfigürasyon ve interceptor yönetimi sağlar.
- **Amaç**: Token yönetimi, hata loglama ve 401 durumlarında otomatik yönlendirme gibi işlemleri standartlaştırmak.
- **Avantajlar**: Daha az kod tekrarı, daha tutarlı hata yönetimi ve merkezi bir loglama sistemi.

```javascript
// Token kullanım örneği
apiClient.interceptors.response.use(
  (response) => {
    // Login yanıtından token'ı çıkarıp kaydetme
    if (response.config.url?.includes('/Auth/Login') && response.data?.token) {
      localStorage.setItem('accessToken', response.data.token);
    }
    return response;
  },
  // ...hata yönetimi...
);
```

### AuthContext İyileştirmeleri
- **Basitleştirilmiş Yapı**: Token yönetimi axiosConfig'e taşınarak AuthContext yapısı sadeleştirildi.
- **UseAuth Hook**: Bileşenlerin AuthContext'e erişimini kolaylaştırmak için custom hook eklendi.

### Gelişmiş Loglama Sistemi
- **Amaç**: Geliştirme sürecinde hata ayıklamayı kolaylaştırmak
- **Özellikler**: Kategorize edilmiş loglar, hata detayları ve istek/yanıt detaylarının log edilmesi

```javascript
// Loglama örneği
const logError = (source, error) => {
  console.error(`[API] ${source}:`, {
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
    stack: error.stack
  });
};
```