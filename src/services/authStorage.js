// Auth durumunu localStorage'da yönetmek için yardımcı servis
// Sadece login durumu ve admin durumunu saklar, token ve kullanıcı ID'si saklanmaz

// LocalStorage anahtarları
const AUTH_KEYS = {
  IS_LOGIN: 'isLogin',
  IS_ADMIN: 'isAdmin'
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

  // Tüm auth verilerini temizle
  clear() {
    setBooleanItem(AUTH_KEYS.IS_LOGIN, false);
    setBooleanItem(AUTH_KEYS.IS_ADMIN, false);
  }
};

export default authStorage; 