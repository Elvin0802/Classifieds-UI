import apiClient from './axiosConfig';
import { API_URL } from '../config';
import * as signalR from '@microsoft/signalr';
import { toast } from 'react-toastify';
import authStorage from './authStorage';
import { getAccessToken } from './axiosConfig';

// Debug modu (konsol loglarını görmek için)
const DEBUG = true;

const CHAT_URL = `${API_URL}/Chat`;

// SignalR durumu - Global olarak takip edilecek
const SIGNALR_STATE = {
  DISABLED: 'disabled',   // SignalR tamamen devre dışı
  ENABLED: 'enabled',     // SignalR etkin
  CONNECTING: 'connecting', // Bağlantı kurma aşamasında
  CONNECTED: 'connected',  // Bağlı durumda
  RECONNECTING: 'reconnecting', // Yeniden bağlanıyor
  CLOSED: 'closed',        // Kapalı durumda
  ERROR: 'error'          // Hata durumu
};

// Global durum değişkenleri
let signalRState = SIGNALR_STATE.ENABLED; // Başlangıçta etkin
let connection = null;
let connectionFailCount = 0;
const MAX_CONNECTION_FAILURES = 3; // Maksimum bağlantı hatası sayısı
let lastConnectionAttempt = 0;
const CONNECTION_COOLDOWN = 3000; // 3 sn soğuma süresi (10 sn'den düşürüldü)

// Bağlantı işlemini izlemek için promise
let connectionPromise = null;

// Kullanıcı mesaj dinleyicilerini tanımla
const messageObservers = new Map();

// Bağlantı durum değişikliğinde bildirilecek gözlemciler
const connectionObservers = [];

// Debug log
const logDebug = (message, ...args) => {
  if (DEBUG) {
    console.log(`[ChatService] ${message}`, ...args);
  }
};

// Belirli bir sohbet odası için mesajları dinlemek için metot
const addMessageObserver = (chatRoomId, callback) => {
  if (!messageObservers.has(chatRoomId)) {
    messageObservers.set(chatRoomId, []);
  }
  messageObservers.get(chatRoomId).push(callback);
  
  logDebug(`Message observer added for chatRoom: ${chatRoomId}. Total observers: ${messageObservers.get(chatRoomId).length}`);
  
  return () => {
    const observers = messageObservers.get(chatRoomId);
    if (observers) {
      const index = observers.indexOf(callback);
      if (index > -1) {
        observers.splice(index, 1);
        logDebug(`Message observer removed for chatRoom: ${chatRoomId}`);
      }
      if (observers.length === 0) {
        messageObservers.delete(chatRoomId);
      }
    }
  };
};

// Bağlantı durumunu dinlemek için metod
const addConnectionObserver = (callback) => {
  connectionObservers.push(callback);
  
  // Mevcut durumu hemen bildir
  if (signalRState === SIGNALR_STATE.CONNECTED && connection) {
    callback(true);
  } else {
    callback(false);
  }
  
  logDebug(`Connection observer added. Total observers: ${connectionObservers.length}`);
  
  return () => {
    const index = connectionObservers.indexOf(callback);
    if (index > -1) {
      connectionObservers.splice(index, 1);
      logDebug(`Connection observer removed`);
    }
  };
};

// Bağlantı durumunu tüm gözlemcilere bildir
const notifyConnectionState = (isConnected) => {
  connectionObservers.forEach(callback => {
    try {
      callback(isConnected);
    } catch (error) {
      console.error('Connection observer callback error:', error);
    }
  });
};

// Mesaj observerlarını bilgilendir
const notifyMessageObservers = (message, chatRoomId) => {
  // Mesaj nesnesinde chatRoomId yoksa ve fonksiyona ikinci parametre olarak geldiyse kullan
  // NOT: API güncellendi ve artık mesajlarda chatRoomId alanı mevcut
  const messageRoomId = message.chatRoomId || chatRoomId;
  
  if (!message || !messageRoomId) {
    console.error('Invalid message format or missing chatRoomId:', message);
    return;
  }
  
  // İlgili sohbet odasının observerlarını bilgilendir
  const observers = messageObservers.get(messageRoomId);
  if (observers && observers.length > 0) {
    // Eğer mesajda chatRoomId yoksa ekle (artık API'den gelen mesajlarda bu alan var)
    let messageToSend = message;
    if (!message.chatRoomId) {
      messageToSend = { ...message, chatRoomId: messageRoomId };
      if (DEBUG) console.log(`Message had no chatRoomId, adding: ${messageRoomId}`, messageToSend);
    }
    
    observers.forEach(callback => {
      try {
        callback(messageToSend);
      } catch (error) {
        console.error('Message observer callback error:', error);
      }
    });
    logDebug(`Notified ${observers.length} observers for chatRoom: ${messageRoomId}`);
  } else {
    if (DEBUG) console.log(`No observers found for chatRoom: ${messageRoomId}`);
  }
};

// ChatHub URL'ini oluştur - Doğrudan API_URL kullanılacak
const getChatHubUrl = () => `${API_URL}/chatHub`;

// Bağlantıyı tamamen kapat ve temizle
const cleanupConnection = () => {
  logDebug('Cleaning up SignalR connection');
  
  if (connection) {
    try {
      // Tüm event listenerları temizle
      connection.off('ReceiveMessage');
      connection.off('MessagesRead');
      
      // Bağlantıyı kapat
      connection.stop().catch(err => {
        console.warn('Error stopping connection:', err);
      });
    } catch (err) {
      console.warn('Error during connection cleanup:', err);
    }
    
    connection = null;
  }
};

// SignalR bağlantısını başlat
const startConnection = async () => {
  // Eğer aktif bir bağlantı işlemi varsa, onu bekle
  if (connectionPromise) {
    logDebug('Connection already in progress, waiting for it to complete...');
    return connectionPromise;
  }
  
  // SignalR devre dışı bırakıldıysa bağlanma
  if (signalRState === SIGNALR_STATE.DISABLED) {
    logDebug('SignalR is disabled, not connecting');
    return Promise.reject(new Error('SignalR is disabled'));
  }
  
  // Soğuma süresi kontrolü
  const now = Date.now();
  if (lastConnectionAttempt > 0 && (now - lastConnectionAttempt) < CONNECTION_COOLDOWN) {
    // Bağlantı zaten kuruluysa, başarılı kabul et
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
      logDebug('Connection cooldown active but already connected, reusing connection');
      return Promise.resolve(connection);
    }
    
    // Soğuma süresini hesapla
    const remainingCooldown = CONNECTION_COOLDOWN - (now - lastConnectionAttempt);
    logDebug(`Connection cooldown active (${remainingCooldown}ms remaining), waiting...`);
    
    // Sadece konsola uyarı ver ama engellemek yerine yine de devam et
    // return Promise.reject(new Error('Connection cooldown active'));
  }
  
  // Bağlantı zaten kuruluysa tekrar bağlanma
  if (connection && connection.state === signalR.HubConnectionState.Connected) {
    logDebug('Already connected, using existing connection');
    return Promise.resolve(connection);
  }
  
  // Bağlantı kurulurken veya yeniden bağlanırken ise uygun duruma geçelim
  if (connection && (
      connection.state === signalR.HubConnectionState.Connecting || 
      connection.state === signalR.HubConnectionState.Reconnecting)) {
    logDebug('Connection in connecting/reconnecting state, updating internal state');
    signalRState = connection.state === signalR.HubConnectionState.Connecting ? 
                   SIGNALR_STATE.CONNECTING : SIGNALR_STATE.RECONNECTING;
    notifyConnectionState(false);
    
    // Mevcut bağlantıyı sonlanana kadar bekle
    return new Promise((resolve, reject) => {
      const checkConnection = setInterval(() => {
        if (connection && connection.state === signalR.HubConnectionState.Connected) {
          clearInterval(checkConnection);
          resolve(connection);
        } else if (!connection || connection.state === signalR.HubConnectionState.Disconnected) {
          clearInterval(checkConnection);
          reject(new Error('Connection failed or closed'));
        }
      }, 500);
      
      // 10 saniye sonra zaman aşımı
      setTimeout(() => {
        clearInterval(checkConnection);
        reject(new Error('Connection check timed out'));
      }, 10000);
    });
  }
  
  // Yeni bir bağlantı başlatma işlemi oluştur
  connectionPromise = (async () => {
    try {
      // Eski bağlantıyı temizle
      cleanupConnection();
      
      // Durumu güncelle
      signalRState = SIGNALR_STATE.CONNECTING;
      notifyConnectionState(false);
      lastConnectionAttempt = Date.now();
      
      // Kullanıcı giriş yapmamışsa bağlantı kurma
      if (!authStorage.getIsLogin()) {
        signalRState = SIGNALR_STATE.CLOSED;
        logDebug('User not logged in, not connecting');
        throw new Error('User not logged in');
      }
      
      // Token al
      let token = getAccessToken();
      if (!token) {
        signalRState = SIGNALR_STATE.ERROR;
        logDebug('No access token available');
        throw new Error('No access token');
      }
      
      const hubUrl = getChatHubUrl();
      logDebug(`Connecting to SignalR hub at: ${hubUrl}`);
      
      // Yeni bir bağlantı oluştur
      connection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => token
        })
        .withAutomaticReconnect() // Varsayılan yeniden bağlantı gecikmelerini kullan
        .configureLogging(signalR.LogLevel.Information)
        .build();
      
      // Event dinleyicileri kur
      setupEventListeners();
      
      // Bağlantıyı başlat
      logDebug('Starting SignalR connection...');
      await connection.start();
      
      logDebug('SignalR connection started, checking if it is really connected...');
      
      // Bağlantı durumunu kontrol et
      if (connection.state !== signalR.HubConnectionState.Connected) {
        logDebug(`Connection state after start: ${connection.state}`);
        throw new Error(`Connection is not in Connected state after start: ${connection.state}`);
      }
      
      logDebug(`Connection established with ID: ${connection.connectionId}`);
      
      // Bu noktada bağlantı çalışıyor, hub metotlarını test et
      try {
        // Hub'a katıl - Bu bir örnek fonksiyon, hub'ınızda bulunmayabilir
        if (typeof connection.invoke === 'function') {
          logDebug('Testing hub methods...');
          
          // Örnek: Kullanıcıyı hub'a bağla
          try {
            await connection.invoke('JoinHub').catch(err => {
              logDebug(`JoinHub method not available or failed: ${err.message}`);
            });
          } catch (err) {
            logDebug(`Error testing JoinHub method: ${err.message}`);
          }
          
          // Örnek: Kullanılabilir metotları getir
          if (DEBUG) {
            console.log('SignalR connection methods:', Object.keys(connection.methods || {}));
            console.log('SignalR connection state after tests:', connection.state);
          }
        }
      } catch (err) {
        logDebug(`Error testing hub methods: ${err.message}`);
        // Bu hata bağlantıyı etkilememeli, devam et
      }
      
      // Başarılı bağlantı
      signalRState = SIGNALR_STATE.CONNECTED;
      notifyConnectionState(true);
      connectionFailCount = 0; // Başarılı bağlantıda sayacı sıfırla
      
      logDebug('SignalR connection established successfully!');
      
      return connection;
    } catch (error) {
      console.error('SignalR connection failed:', error);
      connection = null;
      signalRState = SIGNALR_STATE.ERROR;
      notifyConnectionState(false);
      
      // Bağlantı hata sayacını artır
      connectionFailCount++;
      
      if (connectionFailCount >= MAX_CONNECTION_FAILURES) {
        logDebug(`Disabling SignalR after ${MAX_CONNECTION_FAILURES} failed attempts`);
        signalRState = SIGNALR_STATE.DISABLED;
        toast.error('Gerçek zamanlı mesajlaşma devre dışı bırakıldı. Lütfen sayfayı yenileyin.', {
          toastId: 'signalr-disabled',
          autoClose: 8000
        });
      }
      
      throw error;
    } finally {
      // Bağlantı işlemi tamamlandı, promise'i temizle
      connectionPromise = null;
    }
  })();
  
  return connectionPromise;
};

// Event dinleyicileri kur
const setupEventListeners = () => {
  if (!connection) return;
  
  logDebug('Setting up SignalR event listeners');
  
  // Önce mevcut dinleyicileri temizle
  connection.off('ReceiveMessage');
  connection.off('MessagesRead');
  
  // Tüm hub metotlarını test amacıyla logla
  try {
    if (DEBUG) {
      const connMethods = Object.keys(connection.methods || {});
      console.log('SignalR connection available methods:', connMethods);
      console.log('SignalR connection state:', connection.state);
      console.log('SignalR connection ID:', connection.connectionId);
    }
  } catch (err) {
    console.warn('Error checking SignalR methods:', err);
  }
  
  // Mesaj alma olayını dinle
  connection.on('ReceiveMessage', (message) => {
    logDebug('Received message from SignalR:', message);
    
    // Mesaj detaylarını görüntüle - hata ayıklama için
    if (DEBUG) {
      console.log('SignalR ReceiveMessage event triggered!');
      console.log('SignalR message details:', {
        id: message.id,
        chatRoomId: message.chatRoomId, // API artık bu alanı içeriyor
        content: message.content,
        senderId: message.senderId,
        createdAt: message.createdAt
      });
      
      // JSON stringini göster
      console.log('Raw SignalR message:', JSON.stringify(message));
    }
    
    // Mesaj boş veya tanımsız mı kontrolü
    if (!message) {
      console.warn('Received empty message from SignalR');
      return;
    }
    
    // API güncellemesi sonrası mesaj artık chatRoomId içeriyor
    if (message.chatRoomId) {
      notifyMessageObservers(message);
    } else {
      console.warn('Received message without chatRoomId:', message);
    }
  });
  
  // Genel Hub olaylarını dinle
  try {
    // Bağlantı kurulan herhangi bir hub olayını dinle (isim önemli değil)
    if (connection.connection && typeof connection.connection.on === 'function') {
      logDebug('Adding general message handler for all events');
      connection.connection.on('message', (msg) => {
        if (DEBUG) {
          console.log('Raw SignalR message received:', msg);
        }
      });
    }
  } catch (err) {
    console.warn('Error setting up general message handler:', err);
  }
  
  // Mesajlar okundu olayını dinle
  connection.on('MessagesRead', (chatRoomId) => {
    logDebug('Messages marked as read for chatRoom:', chatRoomId);
  });
  
  // Bağlantı kapatıldığında
  connection.onclose((error) => {
    logDebug('SignalR connection closed', error);
    signalRState = SIGNALR_STATE.CLOSED;
    notifyConnectionState(false);
    
    if (error) {
      connectionFailCount++;
      console.warn('Connection closed with error:', error);
      
      // Maksimum hata sayısına ulaşıldıysa, SignalR'ı devre dışı bırak
      if (connectionFailCount >= MAX_CONNECTION_FAILURES) {
        logDebug(`Disabling SignalR after ${MAX_CONNECTION_FAILURES} connection errors`);
        signalRState = SIGNALR_STATE.DISABLED;
        toast.error('Gerçek zamanlı mesajlaşma devre dışı bırakıldı. Lütfen sayfayı yenileyin.', {
          toastId: 'signalr-disabled',
          autoClose: 8000
        });
      }
    }
  });
  
  // Yeniden bağlanma durumunda
  connection.onreconnecting((error) => {
    logDebug('SignalR reconnecting', error);
    signalRState = SIGNALR_STATE.RECONNECTING;
    notifyConnectionState(false);
  });
  
  // Yeniden bağlandığında
  connection.onreconnected((connectionId) => {
    logDebug('SignalR reconnected with connectionId:', connectionId);
    signalRState = SIGNALR_STATE.CONNECTED;
    notifyConnectionState(true);
    connectionFailCount = 0; // Başarılı yeniden bağlantıda sayacı sıfırla
  });
};

// Bağlantıyı durdur
const stopConnection = async () => {
  logDebug('Stopping SignalR connection');
  
  cleanupConnection();
  signalRState = SIGNALR_STATE.CLOSED;
  notifyConnectionState(false);
};

// SignalR'ı tamamen devre dışı bırak
const disableSignalR = () => {
  logDebug('Manually disabling SignalR');
  signalRState = SIGNALR_STATE.DISABLED;
  cleanupConnection();
  notifyConnectionState(false);
  toast.info('Gerçek zamanlı mesajlaşma devre dışı bırakıldı', {
    toastId: 'signalr-manual-disable',
    autoClose: 3000
  });
};

// SignalR'ı yeniden etkinleştir
const enableSignalR = () => {
  logDebug('Re-enabling SignalR');
  if (signalRState === SIGNALR_STATE.DISABLED) {
    signalRState = SIGNALR_STATE.ENABLED;
    connectionFailCount = 0;
    lastConnectionAttempt = 0;
    
    toast.info('Gerçek zamanlı mesajlaşma etkinleştirildi', {
      toastId: 'signalr-enable',
      autoClose: 3000
    });
    
    // Bağlantıyı hemen başlatma (kullanıcı etkileşimi gerektirir)
  }
};

// Bağlantı durumunu kontrol et ve gerekirse yeniden bağlan
const ensureConnection = async () => {
  // SignalR devre dışı bırakıldıysa, sessizce null döndür
  if (signalRState === SIGNALR_STATE.DISABLED) {
    logDebug('SignalR is disabled, not establishing connection');
    return null;
  }
  
  // Kullanıcı login değilse bağlanma
  if (!authStorage.getIsLogin()) {
    return null;
  }
  
  // Bağlantı yoksa veya kapalıysa yeniden bağlan
  if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
    try {
      // Aktif bir bağlantı süreci varsa onu bekle
      if (connectionPromise) {
        logDebug('Connection process already in progress, waiting for it');
        return await connectionPromise;
      }
      
      // Önceden tanımlanmış durumlarla tutarlı olalım
      if (signalRState !== SIGNALR_STATE.CONNECTING && signalRState !== SIGNALR_STATE.RECONNECTING) {
        logDebug('Connection not established, connecting...');
        return await startConnection();
      } else {
        logDebug('Connection already in progress (signalRState), waiting');
        // Bu durumda bile bir bağlantı denemesi yapalım, ama hatayı yutarız
        try {
          return await startConnection();
        } catch (err) {
          logDebug('Failed to connect while in connecting/reconnecting state:', err);
          return null;
        }
      }
    } catch (err) {
      // Sessizce hatayı yakala, işlemlerin devam etmesine izin ver
      console.warn('Connection ensure failed:', err);
      return null;
    }
  }
  
  return connection;
};

const chatService = {
  /**
   * Yeni sohbet odası oluştur
   * @param {string} adId - İlan ID'si
   * @returns {Promise<Object>} - Oluşturulan sohbet odası
   */
  createChatRoom: async (adId) => {
    try {
      const response = await apiClient.post(`${CHAT_URL}/CreateChatRoom`, { adId });
      if (response.data && response.data.isSucceeded) {
        toast.success('Sohbet başlatıldı', { autoClose: 2000 });
        
        // Sohbet odası oluşturulduğunda bağlantıyı kontrol et
        if (signalRState !== SIGNALR_STATE.DISABLED) {
          ensureConnection().catch(err => console.warn('Connection error:', err));
        }
      }
      return response.data;
    } catch (error) {
      console.error('Sohbet odası oluşturulurken hata:', error);
      toast.error('Sohbet başlatılamadı: ' + (error.response?.data?.message || 'Beklenmeyen bir hata oluştu'));
      throw error;
    }
  },

  /**
   * Kullanıcının sohbet odalarını getir
   * @returns {Promise<Object>} - Sohbet odaları listesi
   */
  getChatRooms: async () => {
    try {
      const response = await apiClient.post(`${CHAT_URL}/GetChatRooms`);
      
      // Mesaj listesi yüklendiğinde bağlantıyı sessizce kontrol et
      if (signalRState !== SIGNALR_STATE.DISABLED) {
        ensureConnection().catch(err => console.warn('Connection error:', err));
      }
      
      return response.data;
    } catch (error) {
      console.error('Sohbet odaları alınırken hata:', error);
      toast.error('Mesajlar yüklenirken bir hata oluştu');
      throw error;
    }
  },

  /**
   * Belirli bir sohbet odasını getir
   * @param {string} chatRoomId - Sohbet odası ID'si
   * @returns {Promise<Object>} - Sohbet odası
   */
  getChatRoom: async (chatRoomId) => {
    try {
      // Sohbet odasına giriş yapıldığında bağlantıyı kontrol et
      if (signalRState !== SIGNALR_STATE.DISABLED) {
        ensureConnection().catch(err => console.warn('Connection error:', err));
      }
      
      const response = await apiClient.post(`${CHAT_URL}/GetChatRoom`, { id: chatRoomId });
      return response.data;
    } catch (error) {
      console.error('Sohbet odası alınırken hata:', error);
      toast.error('Sohbet bilgileri yüklenirken bir hata oluştu');
      throw error;
    }
  },

  /**
   * Belirli bir sohbet odasındaki mesajları getir
   * @param {string} chatRoomId - Sohbet odası ID'si
   * @returns {Promise<Object>} - Mesajlar listesi
   */
  getChatMessages: async (chatRoomId) => {
    try {
      const response = await apiClient.post(`${CHAT_URL}/GetChatMessages`, { chatRoomId });
      return response.data;
    } catch (error) {
      console.error('Sohbet mesajları alınırken hata:', error);
      toast.error('Mesajlar yüklenirken bir hata oluştu');
      throw error;
    }
  },

  /**
   * İlan hakkında sohbet bilgisini getir
   * @param {string} adId - İlan ID'si
   * @returns {Promise<Object>} - İlan bilgileri
   */
  getAdChatInfo: async (adId) => {
    try {
      const response = await apiClient.post(`${CHAT_URL}/GetAdChatInfo`, { id: adId });
      return response.data;
    } catch (error) {
      console.error('İlan sohbet bilgisi alınırken hata:', error);
      toast.error('İlan mesajlaşma bilgisi alınamadı');
      throw error;
    }
  },

  /**
   * Mesaj gönder
   * @param {string} chatRoomId - Sohbet odası ID'si
   * @param {string} content - Mesaj içeriği
   * @returns {Promise<Object>} - Gönderilen mesaj
   */
  sendMessage: async (chatRoomId, content) => {
    try {
      // Mesaj göndermeden önce bağlantıyı kontrol et
      let signalRConnected = false;
      if (signalRState !== SIGNALR_STATE.DISABLED) {
        try {
          const conn = await ensureConnection();
          // Bağlantı başarılı mı kontrol et
          signalRConnected = !!(conn && conn.state === signalR.HubConnectionState.Connected);
          if (signalRConnected) {
            logDebug('SignalR connected, message will be received through real-time connection');
          } else {
            logDebug('SignalR not connected, will use manual notification');
          }
        } catch (err) {
          console.warn('Connection before sending message failed:', err);
        }
      }
      
      // API'ye mesaj gönder
      const response = await apiClient.post(`${CHAT_URL}/SendMessage`, {
        chatRoomId,
        content
      });
      
      if (!response.data || !response.data.isSucceeded) {
        toast.error('Mesaj gönderilemedi: ' + (response.data?.message || 'Sunucu hatası'));
        return response.data;
      }
      
      // Mesaj gönderildiyse işle
      if (response.data.isSucceeded && response.data.data) {
        const message = response.data.data;
        
        // API artık chatRoomId dönüyor, fakat olmadığı durumda ekleyelim
        const completeMessage = message.chatRoomId ? message : { ...message, chatRoomId };
        
        if (DEBUG) {
          console.log('API response for sent message:', message);
          console.log('Complete message with chatRoomId:', completeMessage);
        }
        
        // ÖNEMLİ: SignalR bağlantısı olsa bile her zaman mesajı manuel olarak ekleyelim
        // çünkü SignalR mesajları bazı durumlarda gecikmeli gelebilir veya hiç gelmeyebilir
        logDebug('Mesajı manuel olarak bildiriyoruz (her durumda)');
        notifyMessageObservers(completeMessage);
        
        if (signalRConnected) {
          logDebug('SignalR bağlantısı açık, mesaj SignalR üzerinden de gelecek');
          // Eğer aynı mesaj SignalR üzerinden de gelirse, observer içindeki ID kontrolü
          // sayesinde mesaj tekrar eklenmeyecek
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('Mesaj gönderilirken hata:', error);
      toast.error('Mesaj gönderilemedi: ' + (error.response?.data?.message || 'Bağlantı hatası'));
      throw error;
    }
  },

  /**
   * Mesajları okundu olarak işaretle
   * @param {string} chatRoomId - Sohbet odası ID'si
   * @returns {Promise<Object>} - İşlem sonucu
   */
  markMessagesAsRead: async (chatRoomId) => {
    try {
      const response = await apiClient.post(`${CHAT_URL}/MarkMessagesAsRead`, { chatRoomId });
      return response.data;
    } catch (error) {
      console.error('Mesajlar okundu olarak işaretlenirken hata:', error);
      // Bu işlem başarısız olursa sessizce devam et, kullanıcıya bildirim gösterme
      throw error;
    }
  },
  
  // Durum bilgilerini al
  getSignalRState: () => signalRState,
  
  isSignalREnabled: () => signalRState !== SIGNALR_STATE.DISABLED,
  
  isConnected: () => signalRState === SIGNALR_STATE.CONNECTED && 
                      connection && 
                      connection.state === signalR.HubConnectionState.Connected,
  
  // SignalR yönetim metotları
  startConnection,
  stopConnection,
  ensureConnection,
  disableSignalR,
  enableSignalR,
  
  // Observer metotları
  addConnectionObserver,
  addMessageObserver
};

export default chatService; 