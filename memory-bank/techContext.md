## Technology Stack

### Frontend
- React (UI bileşen kütüphanesi)
- React Router (Client-side routing)
- Tailwind CSS (Responsive UI framework)
- Axios (HTTP istekleri için)
- React Toast (Bildirimler için)
- React Icons (UI ikonları)
- React Hook Form (Form yönetimi)

### Backend
- ASP.NET Core Web API (.NET 7)
- Entity Framework Core (ORM)
- SQL Server (Veritabanı)
- JWT Authentication (Kimlik doğrulama)
- AutoMapper (DTO haritalama)

### Deployment & DevOps
- Docker (Konteynerizasyon)
- Azure (Cloud hosting)
- CI/CD pipeline (GitHub Actions)

## Development Environment

### Gereksinimler
- Node.js 16+ ve npm/yarn
- .NET 7 SDK
- SQL Server veya SQL Server Express
- Git
- IDE: Visual Studio Code, Visual Studio 2022

### Kurulum Adımları
1. Backend: `dotnet restore` ve `dotnet run`
2. Frontend: `npm install` ve `npm start`
3. Veritabanı: `dotnet ef database update`

### Yeni Eklenen Yapılandırmalar
- **axiosConfig.js**: API istekleri için merkezi konfigürasyon dosyası
  - withCredentials: true (CORS cookie desteği)
  - Token yönetimi için interceptors
  - Hata loglama sistemi

## Deployment Process

### Backend Deployment
1. Azure App Service üzerine .NET Core API deployment
2. Azure SQL veritabanı yapılandırması
3. Application Insights entegrasyonu

### Frontend Deployment
1. npm build ile statik dosyaların oluşturulması
2. Azure Static Web App veya Azure App Service üzerine deployment
3. Content Delivery Network (CDN) yapılandırması

## Performance Considerations

### Optimizasyon Stratejileri
- API caching (veritabanı yükünü azaltmak için)
- React lazy loading (yalnızca gerektiğinde bileşen yükleme)
- Image optimization (WebP ve responsive images)
- Code splitting (chunk'lar halinde JS yükleme)

### Ölçeklendirme Planı
- Backend: Horizontal scaling (load balancer arkasında birden fazla instance)
- Veritabanı: Read replicas ve sharding
- CDN: Statik içerik dağıtımı için

## Technical Debt

### Bilinen Borçlar
- ~~Token yönetimi ve auth sistemi iyileştirilmesi gerekiyor~~ (Çözüldü)
- API istekleri için hata yönetimi standartlaştırılmalı
- Form validation için daha kapsamlı bir yaklaşım gerekli
- Unit ve integration testlerin eksikliği

### Çözülen Teknik Borçlar
- ✅ Token yönetimi ve auth sistemi iyileştirilmesi
- ✅ API isteklerinin merkezi bir yapı üzerinden yönetilmesi
- ✅ 401 Unauthorized durumlarında otomatik yönlendirme

### Planlanan İyileştirmeler
1. Test coverage'ın artırılması
2. TypeScript entegrasyonu
3. State management çözümünün (Context yerine Redux veya Recoil) değerlendirilmesi
4. Daha kapsamlı loglama ve monitoring çözümü