// Auth durumunu localStorage'da yönetmek için yardımcı servis
// Sadece login durumu ve admin durumunu saklar, token ve kullanıcı ID'si saklanmaz

// LocalStorage anahtarları
const AUTH_KEYS = {
  IS_LOGIN: 'isLogin',
  IS_ADMIN: 'isAdmin',
  USER_ID: 'userId',
  CHAT_NOTIFICATIONS_ENABLED: 'chatNotificationsEnabled' // Chat notification toggle
};

// Yardımcı fonksiyonlar
function getItem(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error('LocalStorage getItem hatası:', error);
    return null;
  }
}

function setItem(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error('LocalStorage setItem hatası:', error);
    return false;
  }
}

function removeItem(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('LocalStorage removeItem hatası:', error);
    return false;
  }
}

function getBooleanItem(key) {
  const value = getItem(key);
  return value === 'true';
}

function setBooleanItem(key, value) {
  return setItem(key, value ? 'true' : 'false');
}

function getBooleanItemWithDefault(key, defaultValue) {
  const value = getItem(key);
  if (value === null || value === undefined) return defaultValue;
  return value === 'true';
}

const authStorage = {
  // Login durumu işlemleri
  getIsLogin() {
    return getBooleanItem(AUTH_KEYS.IS_LOGIN);
  },
  
  setIsLogin(isLogin) {
    return setBooleanItem(AUTH_KEYS.IS_LOGIN, isLogin);
  },

  // Admin durumu işlemleri
  getIsAdmin() {
    return getBooleanItem(AUTH_KEYS.IS_ADMIN);
  },
  
  setIsAdmin(isAdmin) {
    return setBooleanItem(AUTH_KEYS.IS_ADMIN, isAdmin);
  },

  // UserId işlemleri
  getUserId() {
    return getItem(AUTH_KEYS.USER_ID);
  },
  setUserId(userId) {
    return setItem(AUTH_KEYS.USER_ID, userId);
  },

  // Chat notification işlemleri
  getChatNotificationsEnabled() {
    // Varsayılan: true
    return getBooleanItemWithDefault(AUTH_KEYS.CHAT_NOTIFICATIONS_ENABLED, true);
  },
  setChatNotificationsEnabled(enabled) {
    return setBooleanItem(AUTH_KEYS.CHAT_NOTIFICATIONS_ENABLED, enabled);
  },

  // Tüm auth verilerini temizle
  clear() {
    setBooleanItem(AUTH_KEYS.IS_LOGIN, false);
    setBooleanItem(AUTH_KEYS.IS_ADMIN, false);
    removeItem(AUTH_KEYS.USER_ID);
    setBooleanItem(AUTH_KEYS.CHAT_NOTIFICATIONS_ENABLED, true); // Varsayılan true
  }
};

export default authStorage; 