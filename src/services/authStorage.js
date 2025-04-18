// Auth verilerini localStorage'da yönetmek için yardımcı servis

// LocalStorage anahtarları
const AUTH_KEYS = {
  IS_LOGIN: 'isLogin',
  IS_ADMIN: 'isAdmin',
  USER_ID: 'userId'
};

// Yardımcı fonksiyonlar
function getItem(key) {
  return localStorage.getItem(key);
}

function setItem(key, value) {
  localStorage.setItem(key, value);
}

function removeItem(key) {
  localStorage.removeItem(key);
}

function getBooleanItem(key) {
  const value = localStorage.getItem(key);
  return value === 'true';
}

function setBooleanItem(key, value) {
  localStorage.setItem(key, value ? 'true' : 'false');
}

const authStorage = {
  // Auth verilerini başlat
  initializeAuthData() {
    // Eğer localStorage'da değer yoksa, varsayılan değerleri ayarla
    if (getItem(AUTH_KEYS.IS_LOGIN) === null) {
      setBooleanItem(AUTH_KEYS.IS_LOGIN, false);
    }
    if (getItem(AUTH_KEYS.IS_ADMIN) === null) {
      setBooleanItem(AUTH_KEYS.IS_ADMIN, false);
    }
  },

  // Login durumu işlemleri
  getIsLogin() {
    return getBooleanItem(AUTH_KEYS.IS_LOGIN);
  },
  
  setIsLogin(isLogin) {
    setBooleanItem(AUTH_KEYS.IS_LOGIN, isLogin);
  },

  // Admin durumu işlemleri
  getIsAdmin() {
    return getBooleanItem(AUTH_KEYS.IS_ADMIN);
  },
  
  setIsAdmin(isAdmin) {
    setBooleanItem(AUTH_KEYS.IS_ADMIN, isAdmin);
  },

  // Kullanıcı ID işlemleri
  getUserId() {
    return getItem(AUTH_KEYS.USER_ID);
  },
  
  setUserId(userId) {
    if (userId) {
      setItem(AUTH_KEYS.USER_ID, userId);
    } else {
      removeItem(AUTH_KEYS.USER_ID);
    }
  },

  // Tüm auth verilerini temizle
  clear() {
    setBooleanItem(AUTH_KEYS.IS_LOGIN, false);
    setBooleanItem(AUTH_KEYS.IS_ADMIN, false);
    removeItem(AUTH_KEYS.USER_ID);
  }
};

export default authStorage; 