// Konfiguracja aplikacji
// Zmień SERVER_ADDRESS aby połączyć się z innym serwerem

export const CONFIG = {
  // Adres serwera - zmień tutaj aby połączyć się z innym serwerem
  SERVER_ADDRESS: '192.168.8.135:8080',
  
  // Pełny URL API
  get API_BASE_URL() {
    return `http://${this.SERVER_ADDRESS}/api`;
  },
  
  // URL dla meals endpoint
  get MEALS_URL() {
    return `${this.API_BASE_URL}/meals`;
  },
  
  // URL dla auth endpoint
  get AUTH_URL() {
    return `${this.API_BASE_URL}/auth`;
  }
};

// Export dla łatwego dostępu
export const { SERVER_ADDRESS, API_BASE_URL, MEALS_URL, AUTH_URL } = CONFIG;
