import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { User, ArrowLeft, Send, Tag, BanknoteIcon, Shield, Info, ChevronRight, MessageCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import chatService from '../../services/chatService';
import { useAuth } from '../../contexts/AuthContext';
import authStorage from '../../services/authStorage';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/Alert';
import { Separator } from '../../components/ui/separator';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { cn } from '../../components/ui/utils';

function MessageDetail() {
  const { chatRoomId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [chatRoom, setChatRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const messageContainerRef = useRef(null);
  
  // Yönlendirme kontrolü - kullanıcı giriş yapmamışsa login sayfasına yönlendir
  useEffect(() => {
    if (!isAuthenticated) {
      toast.info('Bu səhifəyə baxmaq üçün daxil olmalısınız.');
      navigate('/login', { state: { from: `/messages/${chatRoomId}` } });
    }
  }, [isAuthenticated, navigate, chatRoomId]);
  
  // SignalR ile mesajları dinle
  useEffect(() => {
    let removeListener = null;
    
    const setupSignalRListener = async () => {
      try {
        // SignalR bağlantısını başlat
        await chatService.startConnection().catch(err => {
          console.error('SignalR bağlantısı kurulamadı:', err);
        });
        
        // Mesaj dinleyicisi ekle
        if (chatRoomId) {
          console.log(`Mesaj dinleyicisi ekleniyor - chatRoomId: ${chatRoomId}`);
          removeListener = chatService.addMessageObserver(chatRoomId, (message) => {
            console.log(`Yeni mesaj alındı (${chatRoomId}):`, message);
            
            // API'den gelen mesajda chatRoomId olmayabilir, ekleyelim
            const currentRoomId = message.chatRoomId || chatRoomId;
            
            // Farklı sohbet odasına ait mesajları filtrele
            if (currentRoomId !== chatRoomId) {
              console.log(`Farklı sohbet odasına ait mesaj, bu odada gösterilmeyecek. Mesaj odası: ${currentRoomId}, Mevcut oda: ${chatRoomId}`);
              return;
            }
            
            // Mesaj formatını düzenle (timestamp eklenmesi)
            const formattedMessage = {
              ...message,
              timestamp: message.createdAt || message.timestamp // API'den gelen createdAt alanını kullan
            };
            
            // Mesajın zaten eklenip eklenmediğini kontrol et
            setMessages(prevMessages => {
              // Mesaj ID'si ile aynı ID'ye sahip bir mesaj var mı kontrol et
              const messageExists = prevMessages.some(m => m.id === formattedMessage.id);
              
              if (messageExists) {
                console.log('Mesaj zaten mevcut, tekrar eklenmiyor:', formattedMessage.id);
                return prevMessages; // Mesajı ekleme, mevcut listeyi döndür
              }
              
              // Mesaj mevcut değilse listeye ekle
              console.log('Yeni mesaj ekleniyor:', formattedMessage.id);
              
              return [...prevMessages, formattedMessage];
            });
            
            // Mesajları okundu olarak işaretle
            chatService.markMessagesAsRead(chatRoomId).catch(err => {
              console.warn('Mesajlar okundu olarak işaretlenemedi:', err);
            });
          });
          
          console.log('Mesaj dinleyicisi başarıyla eklendi');
          
          // Bağlantı durumunu dinle
          const removeConnectionListener = chatService.addConnectionObserver(isConnected => {
            console.log(`SignalR bağlantı durumu değişti: ${isConnected ? 'bağlı' : 'bağlı değil'}`);
          });
          
          // Temizleme işlevini güncelle
          const originalRemoveListener = removeListener;
          removeListener = () => {
            originalRemoveListener();
            removeConnectionListener();
          };
        }
      } catch (err) {
        console.error('SignalR bağlantısı kurulurken hata:', err);
      }
    };
    
    if (isAuthenticated && chatRoomId) {
      setupSignalRListener();
    }
    
    return () => {
      // Component unmount olduğunda dinleyiciyi kaldır
      if (removeListener) {
        console.log('Mesaj dinleyicisi kaldırılıyor');
        removeListener();
      }
    };
  }, [isAuthenticated, chatRoomId]);
  
  // Sohbet odası ve mesajları getir
  useEffect(() => {
    const fetchChatData = async () => {
      if (!isAuthenticated || !chatRoomId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Sohbet odası bilgilerini al
        const roomResponse = await chatService.getChatRoom(chatRoomId);
        
        if (roomResponse && roomResponse.isSucceeded && roomResponse.data && roomResponse.data.item) {
          setChatRoom(roomResponse.data.item);
          
          // Mesajları al
          const messagesResponse = await chatService.getChatMessages(chatRoomId);
          
          if (messagesResponse && messagesResponse.isSucceeded && messagesResponse.data) {
            // API'den gelen mesajlara chatRoomId ekle
            const messagesWithRoomId = (messagesResponse.data.items || []).map(message => ({
              ...message,
              timestamp: message.createdAt, // timestamp olarak createdAt kullan
              chatRoomId  // Mevcut chatRoomId'yi ekle
            }));
            
            setMessages(messagesWithRoomId);
            
            // Mesajları okundu olarak işaretle
            await chatService.markMessagesAsRead(chatRoomId);
          } else {
            setError('Mesajları yükləyərkən xəta baş verdi');
          }
        } else {
          setError('Söhbət məlumatını əldə etmək mümkün olmadı');
          navigate('/messages');
        }
      } catch (err) {
        console.error('Sohbet verisi yüklenirken hata:', err);
        setError('Söhbət məlumatlarını yükləmək alınmadı. Daha sonra yenidən cəhd edin.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAuthenticated && chatRoomId) {
      fetchChatData();
    }
  }, [isAuthenticated, chatRoomId, navigate]);
  
  // Yeni mesaj geldiğinde en alta otomatik kaydırma
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Mesaj gönder
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    setIsSending(true);
    
    try {
      const response = await chatService.sendMessage(chatRoomId, newMessage);
      
      if (response && response.isSucceeded && response.data) {
        // API'den gelen mesajı kullan (zaten SignalR ile yeni mesaj gelecek)
        // API yanıtını formatlayarak ekle
        const sentMessage = {
          ...response.data,
          timestamp: response.data.createdAt // timestamp için createdAt kullan
        };
        
        // Mesajı doğrudan eklemiyoruz, SignalR ile gelecek
        // Ancak signalR gecikmesi veya hata durumları için mesajı ekleyelim
        setMessages(prevMessages => {
          // Aynı ID'ye sahip bir mesaj var mı kontrol et
          const messageExists = prevMessages.some(m => m.id === sentMessage.id);
          if (messageExists) {
            return prevMessages;
          }
          return [...prevMessages, sentMessage];
        });
        
        setNewMessage('');
      } else {
        toast.error('Mesaj göndərmək mümkün olmadı');
      }
    } catch (err) {
      console.error('Mesaj göndərilərkən xəta baş verdi:', err);
      toast.error('Mesaj göndərilərkən xəta baş verdi');
    } finally {
      setIsSending(false);
    }
  };
  
  // Tarih formatla
  const formatTime = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('az-AZ', { day: 'numeric', month: 'long', year: 'numeric' });
  };
  
  // Mesajları tarihe göre grupla
  const groupMessagesByDate = () => {
    const groups = {};
    let hasUnreadMessages = false; // Okunmamış mesaj olup olmadığını takip et
    
    // Önce grupları oluştur
    messages.forEach(message => {
      if (!message.timestamp) return;
      
      const date = new Date(message.timestamp);
      const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD formatı
      
      if (!groups[dateString]) {
        groups[dateString] = [];
      }
      
      groups[dateString].push(message);
    });
    
    // Her tarih için ilk okunmamış mesajı işaretle
    Object.keys(groups).forEach(dateString => {
      const messagesInGroup = groups[dateString];
      let firstUnreadFound = false;
      
      // Tarihe göre sıralı olması için
      messagesInGroup.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      
      // İlk okunmamış mesajı işaretle
      groups[dateString] = messagesInGroup.map(message => {
        const isMyMessage = isCurrentUserMessage(message.senderId);
        const isUnread = message.isRead === false;
        
        // Sadece diğer kullanıcının gönderdiği okunmamış mesajlar için
        if (!isMyMessage && isUnread && !firstUnreadFound && !hasUnreadMessages) {
          firstUnreadFound = true;
          hasUnreadMessages = true;
          return { ...message, isFirstUnread: true };
        }
        
        return { ...message, isFirstUnread: false };
      });
    });
    
    return groups;
  };
  
  // Mevcut kullanıcı ID'sini al
  const getCurrentUserId = () => {
    if (user && user.id) {
      return user.id;
    }
    
    // Kullanıcı bilgisi yoksa localStorage'dan al
    const userId = authStorage.getUserId();
    if (userId) {
      return userId;
    }
    
    return null;
  };
  
  // Mesaj gönderen mevcut kullanıcı mı kontrol et
  const isCurrentUserMessage = (senderId) => {
    const currentUserId = getCurrentUserId();
    return currentUserId === senderId;
  };
  
  // Mesajları render et
  const renderMessages = () => {
    const groupedMessages = groupMessagesByDate();
    
    return Object.keys(groupedMessages).map(dateString => {
      const formattedDate = formatDate(dateString);
      
      return (
        <div key={dateString} className="mb-6">
          <div className="flex justify-center mb-4">
            <Badge variant="outline" className="bg-background">
              {formattedDate}
            </Badge>
          </div>
          
          {groupedMessages[dateString].map(message => {
            const isCurrentUser = isCurrentUserMessage(message.senderId);
            
            return (
              <div key={message.id}>
                {/* Okunmamış mesajlar için gösterge */}
                {message.isFirstUnread && (
                  <div className="flex justify-center my-3">
                    <Badge variant="outline" className="bg-red-100 text-red-600 border-red-300 flex items-center gap-1 px-3 py-1">
                      <MessageCircle className="h-3 w-3" /> Oxunmamış mesajlar
                    </Badge>
                  </div>
                )}
                
                <div
                  className={cn(
                    "mb-3 flex",
                    isCurrentUser ? "justify-end" : "justify-start"
                  )}
                >
                  <div className={cn(
                    "max-w-[75%]",
                    isCurrentUser 
                      ? "bg-primary text-primary-foreground rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl"
                      : "bg-muted rounded-tl-2xl rounded-tr-2xl rounded-br-2xl",
                    "px-4 py-2.5 shadow-sm"
                  )}>
                    <div className="text-sm">{message.content}</div>
                    <div className={cn(
                      "text-[10px] mt-1 flex justify-end",
                      isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}>
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    });
  };
  
  // Diğer kullanıcının bilgilerini getir
  const getOtherUserInfo = () => {
    if (!chatRoom) return { userName: 'Naməlum İstifadəçi' };
    
    const currentUserId = getCurrentUserId();
    // Ben alıcı mıyım satıcı mıyım belirle
    const iAmBuyer = currentUserId === chatRoom.buyerId;
    
    return {
      userId: iAmBuyer ? chatRoom.sellerId : chatRoom.buyerId,
      userName: iAmBuyer ? chatRoom.sellerName : chatRoom.buyerName,
      isAdmin: false // API'den bu bilgi gelmiyor, varsayılan olarak false
    };
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  const otherUser = getOtherUserInfo();
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          asChild 
          className="gap-1 text-muted-foreground"
        >
          <Link to="/messages">
            <ArrowLeft className="h-4 w-4" /> Bütün Mesajlar
          </Link>
        </Button>
      </div>
      
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <Card className="overflow-hidden">
          {/* Mesajlaşma Başlığı */}
          <CardHeader className="py-3 px-4 bg-muted/50 flex flex-row items-center gap-3">
            <Avatar className="h-10 w-10">
              {chatRoom.adImageUrl ? (
                <AvatarImage 
                  src={chatRoom.adImageUrl} 
                  alt={otherUser.userName} 
                />
              ) : null}
              <AvatarFallback className="bg-primary/10 text-primary">
                {otherUser.userName?.charAt(0) || <User className="h-5 w-5" />}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <CardTitle className="text-base flex items-center gap-1">
                {otherUser.userName || 'Naməlum İstifadəçi'}
                {otherUser.isAdmin && <Shield className="h-3.5 w-3.5 text-primary ml-1" />}
              </CardTitle>
              
              {chatRoom.adTitle && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Tag className="h-3 w-3" />
                  <span>Elan: {chatRoom.adTitle}</span>
                  {chatRoom.adPrice && (
                    <>
                      <BanknoteIcon className="h-3 w-3 ml-2" />
                      <span>{chatRoom.adPrice} AZN</span>
                    </>
                  )}
                </div>
              )}
            </div>
            
            {chatRoom.adId && (
              <Button 
                variant="ghost" 
                size="sm" 
                asChild 
                className="flex items-center gap-1 text-xs h-8"
              >
                <Link to={`/ads/${chatRoom.adId}`}>
                  <Info className="h-3.5 w-3.5" /> Elana bax <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            )}
          </CardHeader>
          
          <Separator />
          
          {/* Mesajlaşma Alanı */}
          <CardContent 
            ref={messageContainerRef}
            className="p-4 h-[400px] overflow-y-auto space-y-4"
          >
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
                  <MessageCircle className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-medium text-foreground">Mesajlaşmaya başlayın</h3>
                <p className="text-muted-foreground text-sm max-w-md mt-1">
                Hələ heç bir mesaj göndərilməyib. Siz dərhal mesaj göndərməyə başlaya bilərsiniz.
                </p>
              </div>
            ) : (
              renderMessages()
            )}
            <div ref={messagesEndRef} />
          </CardContent>
          
          {/* Mesaj Gönderme Alanı */}
          <CardFooter className="p-3 border-t">
            <form onSubmit={handleSendMessage} className="flex items-center w-full gap-2">
              <Input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Mesajınızı yazın..."
                className="flex-1"
                disabled={isSending}
              />
              <Button 
                type="submit" 
                disabled={!newMessage.trim() || isSending}
                className="gap-1"
              >
                {isSending ? (
                  <LoadingSpinner className="h-4 w-4" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Gönder
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

export default MessageDetail; 