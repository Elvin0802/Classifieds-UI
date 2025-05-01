import React, { useState, useEffect } from 'react';
import { 
  User, Key, Save, Clock, CheckCircle, X, CalendarX, Star, Eye, Pencil, Trash, 
  FileText, Heart, ShieldAlert, Settings, LayoutDashboard, ArrowRight, BookOpen, BadgeAlert
} from 'lucide-react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import profileService from '../../services/profileService';
import userService from '../../services/userService';
import authStorage from '../../services/authStorage';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardFooter, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Label } from '../../components/ui/label';
import { Separator } from '../../components/ui/separator';
import { cn } from '../../components/ui/utils';

const Profile = () => {
  // State tanımlamaları
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [ads, setAds] = useState([]);
  const [adsLoading, setAdsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [passwordData, setPasswordData] = useState({
    userId: '',
    oldPassword: '',
    newPassword: '',
    newPasswordConfirm: ''
  });
  const [formError, setFormError] = useState('');

  // Kullanıcı verilerini getir
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await profileService.getUserData();
        if (response.isSucceeded && response.data?.item) {
          setUserData(response.data.item);
          // Şifre değiştirme formuna userId'yi yerleştir
          setPasswordData(prev => ({ ...prev, userId: response.data.item.id }));
        } else {
          setError('İstifadəçi məlumatını əldə etmək mümkün olmadı');
          toast.error('İstifadəçi məlumatını əldə etmək mümkün olmadı');
        }
      } catch (error) {
        console.error('İstifadəçi məlumatı alınarkən xəta:', error);
        setError('İstifadəçi məlumatı alınarkən xəta baş verdi.');
        toast.error('İstifadəçi məlumatı alınarkən xəta baş verdi.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Kullanıcıya ait ilanları getir (aktif tab değiştiğinde)
  useEffect(() => {
    const fetchAds = async () => {
      setAdsLoading(true);
      try {
        let response;
        
        switch (activeTab) {
          case 'active':
            response = await profileService.getActiveAds();
            break;
          case 'pending':
            response = await profileService.getPendingAds();
            break;
          case 'expired':
            response = await profileService.getExpiredAds();
            break;
          case 'rejected':
            response = await profileService.getRejectedAds();
            break;
          case 'selected':
            response = await profileService.getSelectedAds();
            break;
          default:
            response = await profileService.getActiveAds();
        }
        
        if (response.isSucceeded && response.data?.items) {
          setAds(response.data.items);
        } else {
          setAds([]);
        }
      } catch (error) {
        console.error('Elanları əldə edərkən xəta baş verdi:', error);
        toast.error('Elanları əldə edərkən xəta baş verdi');
        setAds([]);
      } finally {
        setAdsLoading(false);
      }
    };

    fetchAds();
  }, [activeTab]);

  // Şifre değiştirme formu için değişiklik takibi
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  // Şifre değiştirme formu gönderimi
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // Şifre kontrolü
    if (passwordData.newPassword !== passwordData.newPasswordConfirm) {
      setFormError('Yeni şifrə və təkrar şifrə uyğun gəlmir');
      return;
    }
    
    try {
      const response = await userService.changePassword(passwordData);
      if (response.isSucceeded) {
        toast.success('Şifrəniz uğurla yeniləndi.');
        // Formu sıfırla
        setPasswordData(prev => ({
          ...prev,
          oldPassword: '',
          newPassword: '',
          newPasswordConfirm: ''
        }));
      } else {
        setFormError(response.message || 'Parolun dəyişdirilməsi uğursuz oldu');
        toast.error('Parolun dəyişdirilməsi uğursuz oldu');
      }
    } catch (error) {
      console.error('Parol dəyişdirilərkən xəta baş verdi:', error);
      setFormError('Parol dəyişdirilərkən xəta baş verdi');
      toast.error('Parol dəyişdirilərkən xəta baş verdi');
    }
  };

  // İlan durum badgesi için yardımcı fonksiyon
  const getStatusBadge = (ad) => {
    if (ad.isSelected) {
      return <Badge variant="secondary" className="flex items-center gap-1"><Heart className="h-3 w-3" /> Seçilmişlərdə</Badge>;
    }
    if (activeTab === 'active') {
      return <Badge variant="success" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Aktiv</Badge>;
    }
    if (activeTab === 'pending') {
      return <Badge variant="outline" className="flex items-center gap-1 border-blue-200 bg-blue-50 text-blue-700"><Clock className="h-3 w-3" /> Gozləyir</Badge>;
    }
    if (activeTab === 'expired') {
      return <Badge variant="outline" className="flex items-center gap-1 border-gray-200 bg-gray-50 text-gray-700"><CalendarX className="h-3 w-3" /> Vaxtı Bitmiş</Badge>;
    }
    if (activeTab === 'rejected') {
      return <Badge variant="destructive" className="flex items-center gap-1"><X className="h-3 w-3" /> İmtina Edimiş</Badge>;
    }
    return null;
  };

  // Tarihi formatla
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Az öncə';
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} dəqiqə öncə`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} saat öncə`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} gün öncə`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths} ay öncə`;
    
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} il öncə`;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sol Bölüm - Kullanıcı Bilgileri ve Şifre Değiştirme */}
        <div className="lg:col-span-1 space-y-6">
          {/* Kullanıcı Bilgileri Kartı */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    {userData?.name?.charAt(0) || <User />}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-center text-xl">{userData?.name}</CardTitle>
              <CardDescription className="text-center">
                {userData?.isAdmin ? (
                  <Badge variant="outline" className="flex items-center justify-center gap-1 mx-auto">
                    <ShieldAlert className="h-3 w-3" /> Admin
                  </Badge>
                ) : 'Kullanıcı'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Separator className="my-2" />
              <div className="space-y-4 mt-4">
                <div className="flex flex-col space-y-1">
                  <p className="text-xs text-muted-foreground">E-mail</p>
                  <p className="font-medium">{userData?.email}</p>
                </div>
                <div className="flex flex-col space-y-1">
                  <p className="text-xs text-muted-foreground">Telefon Nömrəsi</p>
                  <p className="font-medium">{userData?.phoneNumber || 'Belirtilmemiş'}</p>
                </div>
                <div className="flex flex-col space-y-1">
                  <p className="text-xs text-muted-foreground">Qeydiyyat Tarixi</p>
                  <p className="font-medium">{userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full gap-1" asChild>
                <Link to="/profile/edit">
                  <Settings className="h-4 w-4" /> Edit Profil
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Şifre Değiştirme Kartı */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" /> Şifrəni Dəyişdir
              </CardTitle>
            </CardHeader>
            <CardContent>
              {formError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="oldPassword">Hazırki Şifrə</Label>
                  <Input
                    id="oldPassword"
                    name="oldPassword"
                    type="password"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Yeni Şifrə</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPasswordConfirm">Yeni Şifrənin Tekrarı</Label>
                  <Input
                    id="newPasswordConfirm"
                    name="newPasswordConfirm"
                    type="password"
                    value={passwordData.newPasswordConfirm}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full gap-1">
                  <Save className="h-4 w-4" /> Şifrəni Dəyiş
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        
        {/* Sağ Bölüm - İlanlar */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Elanlarım
              </CardTitle>
              <CardDescription>
              Bütün elanlarınızı idarə edin, redaktə edin və izləyin.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-5 mb-6">
                  <TabsTrigger value="active" className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" /> Aktiv
                  </TabsTrigger>
                  <TabsTrigger value="pending" className="flex items-center gap-1">
                    <Clock className="h-4 w-4" /> Gözləyir
                  </TabsTrigger>
                  <TabsTrigger value="expired" className="flex items-center gap-1">
                    <CalendarX className="h-4 w-4" /> Vaxtı Bitmiş
                  </TabsTrigger>
                  <TabsTrigger value="rejected" className="flex items-center gap-1">
                    <BadgeAlert className="h-4 w-4" /> İmtina Edilmiş
                  </TabsTrigger>
                  <TabsTrigger value="selected" className="flex items-center gap-1">
                    <Heart className="h-4 w-4" /> Seçilmişlər
                  </TabsTrigger>
                </TabsList>
                
                {["active", "pending", "expired", "rejected", "selected"].map((tab) => (
                  <TabsContent key={tab} value={tab} className="space-y-4">
                    {adsLoading ? (
                      <div className="py-12 flex justify-center">
                        <LoadingSpinner />
                      </div>
                    ) : ads.length === 0 ? (
                      <div className="py-12 text-center">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground">Elan Tapılmadı</h3>
                        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                          {tab === 'active' && 'Aktiv elanınız yoxdur. Yeni elan əlavə etmək istərdinizmi?'}
                          {tab === 'pending' && 'Təsdiq gozləyən elanınız yoxdur.'}
                          {tab === 'expired' && 'Vaxtı bitmiş elanınız yoxdur.'}
                          {tab === 'rejected' && 'İmtina edilmiş elanınız yoxdur.'}
                          {tab === 'selected' && 'Sevimlilərə əlavə edilmiş elan yoxdur. Siz elanları kəşf edib seçilmişlərə əlavə edə bilərsiniz.'}
                        </p>
                        
                        {tab === 'active' && (
                          <Button className="mt-4 gap-1" asChild>
                            <Link to="/ads/create">
                              <Pencil className="h-4 w-4" /> Yeni Elan Əlavə Et
                            </Link>
                          </Button>
                        )}
                        
                        {tab === 'selected' && (
                          <Button variant="outline" className="mt-4 gap-1" asChild>
                            <Link to="/ads">
                              <Eye className="h-4 w-4" /> Elanlara Bax
                            </Link>
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {ads.map((ad) => (
                          <Card key={ad.id} className="overflow-hidden">
                            <div className="aspect-video relative bg-muted">
                              {ad.mainImageUrl ? (
                                <img 
                                  src={ad.mainImageUrl} 
                                  alt={ad.title} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-muted">
                                  <FileText className="h-12 w-12 text-muted-foreground" />
                                </div>
                              )}
                              {getStatusBadge(ad) && (
                                <div className="absolute top-2 right-2">
                                  {getStatusBadge(ad)}
                                </div>
                              )}
                            </div>
                            
                            <CardContent className="p-4">
                              <h3 className="font-semibold text-lg line-clamp-1">{ad.title}</h3>
                              
                              <div className="flex justify-between items-center mt-2">
                                <span className="font-bold text-primary">{ad.price} TL</span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(ad.createdAt)}
                                </span>
                              </div>
                              
                              <div className="mt-4 flex items-center gap-2">
                                <Button variant="outline" size="sm" className="flex-1 h-8 gap-1" asChild>
                                  <Link to={`/ads/${ad.id}`}>
                                    <Eye className="h-3.5 w-3.5" /> Bax
                                  </Link>
                                </Button>
                                
                                {activeTab === 'active' && (
                                  <Button variant="outline" size="sm" className="flex-1 h-8 gap-1" asChild>
                                    <Link to={`/ads/edit/${ad.id}`}>
                                      <Pencil className="h-3.5 w-3.5" /> Redaktə et
                                    </Link>
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                    
                    {!adsLoading && ads.length > 0 && (
                      <div className="flex justify-center mt-6">
                        <Button variant="outline" asChild>
                          <Link to={`/ads?myAds=${tab}`} className="flex items-center gap-1">
                            <LayoutDashboard className="h-4 w-4" /> Hamısına Bax <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile; 