import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaCalendar, FaChevronRight, FaEnvelope, FaDotCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import chatService from '../../services/chatService';
import { useAuth } from '../../contexts/AuthContext';

function MessagesList() {
  const [chatRooms, setChatRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Yönlendirme kontrolü - kullanıcı giriş yapmamışsa login sayfasına yönlendir
  useEffect(() => {
    if (!isAuthenticated) {
      toast.info('Bu sayfayı görüntülemek için giriş yapmalısınız');
      navigate('/login', { state: { from: '/messages' } });
    }
  }, [isAuthenticated, navigate]);
  
  // Sohbet odalarını getir
  useEffect(() => {
    const fetchChatRooms = async () => {
      if (!isAuthenticated) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await chatService.getChatRooms();
        
        if (response && response.isSucceeded && response.data) {
          setChatRooms(response.data.items || []);
        } else {
          setError('Mesajlar yüklenirken bir hata oluştu');
        }
      } catch (err) {
        console.error('Mesajlar yüklenirken hata:', err);
        setError('Mesajlar yüklenemedi. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAuthenticated) {
      fetchChatRooms();
    }
  }, [isAuthenticated]);
  
  // Tarih formatla
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Bugün ise saat göster
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    }
    // Dün ise "Dün" yaz
    else if (date.toDateString() === yesterday.toDateString()) {
      return 'Dün';
    }
    // Bu yıl içinde ise gün ve ay göster
    else if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
    }
    // Diğer durumlarda tam tarih göster
    else {
      return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Mesajlarım</h1>
      
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : chatRooms.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <FaEnvelope className="mx-auto text-gray-300 text-5xl mb-4" />
          <h2 className="text-xl font-semibold mb-2">Henüz mesajınız yok</h2>
          <p className="text-gray-600 mb-6">İlanları inceleyerek satıcılara mesaj gönderebilirsiniz.</p>
          <Link to="/ads" className="btn btn-primary">
            İlanları İncele
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="divide-y">
            {chatRooms.map((chatRoom) => (
              <Link 
                key={chatRoom.id} 
                to={`/messages/${chatRoom.id}`}
                className="block p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {chatRoom.adImageUrl ? (
                      <img 
                        src={chatRoom.adImageUrl} 
                        alt={chatRoom.adTitle} 
                        className="w-16 h-16 object-cover rounded-md mr-4"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-md mr-4 flex items-center justify-center">
                        <FaUser className="text-gray-400 text-xl" />
                      </div>
                    )}
                    
                    <div>
                      <h3 className="font-medium">{chatRoom.adTitle}</h3>
                      <p className="text-sm text-gray-600">
                        {chatRoom.buyerId === chatRoom.sellerId ? 
                          "Satıcı ile sohbet" : 
                          `${chatRoom.sellerName} ile sohbet`}
                      </p>
                      <p className="text-sm text-primary mt-1">
                        {chatRoom.adPrice > 0 ? 
                          new Intl.NumberFormat('tr-TR', {
                            style: 'currency',
                            currency: 'TRY',
                            minimumFractionDigits: 0
                          }).format(chatRoom.adPrice) : 
                          'Fiyat belirtilmemiş'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-gray-500 mb-2">
                      {formatDate(chatRoom.lastMessageAt)}
                    </span>
                    
                    {chatRoom.unreadCount > 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary text-white">
                        {chatRoom.unreadCount}
                      </span>
                    )}
                    
                    <FaChevronRight className="text-gray-400 ml-2 mt-2" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MessagesList; 