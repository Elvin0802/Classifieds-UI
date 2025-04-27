import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaUser, FaArrowLeft, FaPaperPlane, FaSpinner, FaTag, FaLiraSign } from 'react-icons/fa';
import { toast } from 'react-toastify';
import chatService from '../../services/chatService';
import { useAuth } from '../../contexts/AuthContext';

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
      toast.info('Bu sayfayı görüntülemek için giriş yapmalısınız');
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
            
            // Mesajın zaten eklenip eklenmediğini kontrol et
            setMessages(prevMessages => {
              // Mesaj ID'si ile aynı ID'ye sahip bir mesaj var mı kontrol et
              const messageExists = prevMessages.some(m => m.id === message.id);
              
              if (messageExists) {
                console.log('Mesaj zaten mevcut, tekrar eklenmiyor:', message.id);
                return prevMessages; // Mesajı ekleme, mevcut listeyi döndür
              }
              
              // Mesaj mevcut değilse listeye ekle
              console.log('Yeni mesaj ekleniyor:', message.id);
              
              // Her zaman chatRoomId ekle
              const messageToAdd = !message.chatRoomId 
                ? { ...message, chatRoomId } 
                : message;
              
              return [...prevMessages, messageToAdd];
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
              chatRoomId  // Mevcut chatRoomId'yi ekle
            }));
            
            setMessages(messagesWithRoomId);
            
            // Mesajları okundu olarak işaretle
            await chatService.markMessagesAsRead(chatRoomId);
          } else {
            setError('Mesajlar yüklenirken bir hata oluştu');
          }
        } else {
          setError('Sohbet bilgileri alınamadı');
          navigate('/messages');
        }
      } catch (err) {
        console.error('Sohbet verisi yüklenirken hata:', err);
        setError('Sohbet verileri yüklenemedi. Lütfen daha sonra tekrar deneyin.');
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
        // setMessages([...messages, response.data]);
        setNewMessage('');
      } else {
        toast.error('Mesaj gönderilemedi');
      }
    } catch (err) {
      console.error('Mesaj gönderilirken hata:', err);
      toast.error('Mesaj gönderilirken bir hata oluştu');
    } finally {
      setIsSending(false);
    }
  };
  
  // Tarih formatla
  const formatTime = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  };
  
  // Mesajları tarih bazlı grupla
  const groupMessagesByDate = () => {
    const groups = {};
    
    messages.forEach(message => {
      const date = new Date(message.createdAt);
      const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!groups[dateString]) {
        groups[dateString] = [];
      }
      
      groups[dateString].push(message);
    });
    
    return groups;
  };
  
  // Kullanıcı mesajı mı kontrol et
  const isCurrentUserMessage = (senderId) => {
    return user && user.id === senderId;
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <Link to="/messages" className="btn btn-primary">
          <FaArrowLeft className="mr-2" /> Mesajlara Dön
        </Link>
      </div>
    );
  }
  
  if (!chatRoom) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Sohbet bulunamadı
        </div>
        <Link to="/messages" className="btn btn-primary">
          <FaArrowLeft className="mr-2" /> Mesajlara Dön
        </Link>
      </div>
    );
  }
  
  const groupedMessages = groupMessagesByDate();
  
  return (
    <div className="container mx-auto px-4 py-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Sohbet Başlığı */}
        <div className="p-4 border-b flex items-center justify-between bg-gray-50">
          <div className="flex items-center">
            <Link to="/messages" className="mr-4 text-gray-500 hover:text-primary">
              <FaArrowLeft className="text-xl" />
            </Link>
            
            <div>
              <h1 className="font-medium">{chatRoom.adTitle}</h1>
              <div className="flex items-center text-sm text-gray-600">
                <FaTag className="mr-1" />
                <span>
                  {chatRoom.adPrice > 0 ? 
                    new Intl.NumberFormat('tr-TR', {
                      style: 'currency',
                      currency: 'TRY',
                      minimumFractionDigits: 0
                    }).format(chatRoom.adPrice) : 
                    'Fiyat belirtilmemiş'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm font-medium">
              {user?.id === chatRoom.buyerId ? chatRoom.sellerName : chatRoom.buyerName}
            </div>
            <div className="text-xs text-gray-500">
              {user?.id === chatRoom.buyerId ? 'Satıcı' : 'Alıcı'}
            </div>
          </div>
        </div>
        
        {/* Mesajlar */}
        <div 
          className="p-4 h-[calc(100vh-250px)] overflow-y-auto bg-gray-50"
          ref={messageContainerRef}
        >
          {Object.keys(groupedMessages).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Henüz mesaj yok. İlk mesajı gönderen siz olun!
            </div>
          ) : (
            Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date} className="mb-6">
                <div className="flex justify-center mb-4">
                  <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                    {formatDate(date)}
                  </div>
                </div>
                
                {dateMessages.map(message => (
                  <div 
                    key={message.id}
                    className={`flex mb-4 ${isCurrentUserMessage(message.senderId) ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isCurrentUserMessage(message.senderId) && (
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                        <FaUser className="text-gray-500 text-sm" />
                      </div>
                    )}
                    
                    <div 
                      className={`rounded-lg px-4 py-3 max-w-[75%] ${
                        isCurrentUserMessage(message.senderId) 
                          ? 'bg-primary text-white rounded-tr-none' 
                          : 'bg-white text-gray-800 rounded-tl-none shadow-sm'
                      }`}
                    >
                      <div className="break-words">{message.content}</div>
                      <div 
                        className={`text-xs mt-1 text-right ${
                          isCurrentUserMessage(message.senderId) ? 'text-primary-light' : 'text-gray-500'
                        }`}
                      >
                        {formatTime(message.createdAt)}
                      </div>
                    </div>
                    
                    {isCurrentUserMessage(message.senderId) && (
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center ml-2 flex-shrink-0">
                        <FaUser className="text-white text-sm" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Mesaj Gönderme Formu */}
        <div className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex items-center">
            <input
              type="text"
              className="flex-1 border rounded-lg px-4 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Mesajınızı yazın..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={isSending}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSending || !newMessage.trim()}
            >
              {isSending ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaPaperPlane />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default MessageDetail; 