import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, User, Search, Clock, ChevronRight, PlusCircle, Shield } from 'lucide-react';
import chatService from '../../services/chatService';
import { useAuth } from '../../contexts/AuthContext';
import authStorage from '../../services/authStorage';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { cn } from '../../components/ui/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/Alert';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';

const MessagesList = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await chatService.getChatRooms();
        
        console.log('ChatRooms API yanıtı:', response);
        
        if (response && response.isSucceeded) {
          if (response.data === null || response.data === undefined) {
            console.warn('API yanıtında veri yok (null/undefined)');
            setConversations([]);
          } else if (Array.isArray(response.data)) {
            setConversations(response.data);
          } else if (response.data.items && Array.isArray(response.data.items)) {
            setConversations(response.data.items);
          } else {
            console.error('API yanıtı beklenen formatta değil:', response.data);
            setConversations([]);
            setError('Mesajlar alınarkən xəta baş verdi.');
          }
        } else {
          console.error('API yanıtı başarısız:', response);
          setConversations([]);
          setError(response?.message || 'Mesajlar yüklənmədi.');
        }
      } catch (err) {
        console.error('Mesajlar yüklenirken hata oluştu:', err);
        setConversations([]);
        setError('Mesajlar yüklənmədi.');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
    
    const unsubscribeConnectionObserver = chatService.addConnectionObserver((isConnected) => {
      if (isConnected) {
        fetchConversations();
      }
    });
    
    chatService.ensureConnection().catch(err => {
      console.warn('SignalR bağlantısı başlatılamadı:', err);
    });

    // --- YENİ MESAJ GELİNCE OTOMATİK YENİLEME ---
    const unsubscribeMessageObserver = chatService.addMessageObserver('*', (message) => {
      // Sadece ilgili sohbetin unreadCount'unu artır
      if (message && message.chatRoomId) {
        setConversations(prevConversations => {
          let found = false;
          const updated = prevConversations.map(conv => {
            if (conv.id === message.chatRoomId) {
              found = true;
              // Eğer gönderen mevcut kullanıcı değilse unread artır
              const currentUserId = user?.id || authStorage.getUserId();
              if (message.senderId !== currentUserId) {
                return {
                  ...conv,
                  unreadCount: (conv.unreadCount || 0) + 1,
                  lastMessageAt: message.createdAt || message.timestamp || conv.lastMessageAt
                };
              }
            }
            return conv;
          });
          // Eğer ilgili sohbet yoksa, tam yenileme yap
          if (!found) {
            fetchConversations();
            return prevConversations;
          }
          return updated;
        });
      } else {
        // chatRoomId yoksa tam yenileme
        fetchConversations();
      }
    });
    // --- SON ---

    return () => {
      if (unsubscribeConnectionObserver) unsubscribeConnectionObserver();
      if (unsubscribeMessageObserver) unsubscribeMessageObserver();
    };
  }, []);

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
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

  const conversationsList = Array.isArray(conversations) ? conversations : [];

  const getOtherUserInfo = (conversation) => {
    if (!conversation) return { userName: 'Naməlum İstifadəçi' };
    
    // Önce user.id'yi kontrol et, yoksa localStorage'dan userId'yi al
    const currentUserId = user?.id || authStorage.getUserId();
    
    // userId yoksa veya buyerId ile karşılaştırılamıyorsa default değer döndür
    if (!currentUserId) {
      console.warn('Kullanıcı ID bulunamadı, mesaj listesi karşılaştırması yapılamıyor');
      return { userName: 'Naməlum İstifadəçi' };
    }
    
    // Ben alıcı mıyım satıcı mıyım belirle
    const iAmBuyer = currentUserId === conversation.buyerId;
    
    // Admin bilgisini localStorage'dan al
    const isAdmin = authStorage.getIsAdmin();
    
    // Debug için loglama
    console.log('Mesaj karşılaştırma:', { 
      currentUserId, 
      buyerId: conversation.buyerId, 
      sellerId: conversation.sellerId,
      iAmBuyer, 
      showUser: iAmBuyer ? conversation.sellerName : conversation.buyerName,
      isAdmin
    });
    
    return {
      userId: iAmBuyer ? conversation.sellerId : conversation.buyerId,
      userName: iAmBuyer ? conversation.sellerName : conversation.buyerName,
      isAdmin: isAdmin // LocalStorage'dan alınan admin bilgisi
    };
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Card className="overflow-hidden">
        <CardHeader className="pb-4 border-b">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-primary" />
            Mesajlarım
          </CardTitle>
          <CardDescription>
          Burada digər istifadəçilərlə mesajlaşmanızı idarə edə bilərsiniz.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="p-6">
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          ) : conversationsList.length === 0 ? (
            <div className="p-12 text-center">
              <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Hələ heç bir mesajınız yoxdur</h3>
              <p className="text-muted-foreground mb-6">Elan sahibləriylə əlaqə saxlayaraq mesajlaşmağa başlaya bilərsiniz.</p>
              <Button asChild variant="outline">
                <Link to="/ads">
                  <PlusCircle className="h-4 w-4 mr-2" /> Elanlara Baxın
                </Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {conversationsList.map(conversation => {
                const otherUser = getOtherUserInfo(conversation);
                
                return (
                  <li key={conversation.id || Math.random().toString()}>
                    <Link 
                      to={`/messages/${conversation.id}`} 
                      className="block hover:bg-accent/50 transition-colors"
                    >
                      <div className="p-4 sm:px-6 flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <Avatar className="h-12 w-12">
                            {conversation.adImageUrl ? (
                              <AvatarImage 
                                src={conversation.adImageUrl} 
                                alt={otherUser.userName || 'Kullanıcı'} 
                              />
                            ) : null}
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {otherUser.userName?.charAt(0) || <User className="h-6 w-6" />}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <h3 className="text-base font-semibold text-foreground truncate flex items-center gap-1">
                              {otherUser.userName || 'Naməlum İstifadəçi'}
                              {otherUser.isAdmin && <Shield className="h-3.5 w-3.5 text-primary ml-1" />}
                            </h3>
                            <span className="text-xs text-muted-foreground flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatMessageTime(conversation.lastMessageAt)}
                            </span>
                          </div>
                          
                          <p className="text-sm text-muted-foreground truncate pr-8">
                            Elan: {conversation.adTitle || 'Elan datası yoxdur.'}
                          </p>
                          
                          {conversation.adPrice && (
                            <p className="text-sm text-primary truncate mt-1">
                              {conversation.adPrice} AZN
                            </p>
                          )}
                          
                          {conversation.unreadCount > 0 && (
                            <Badge variant="default" className="mt-1">
                              {conversation.unreadCount} yeni
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex-shrink-0">
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MessagesList; 