# Konfiguracja Serwera - FoodGenie

## Jak zmienić adres serwera

### Szybka zmiana (najłatwiejszy sposób)

Edytuj plik `app/config/config.ts` i zmień wartość `SERVER_ADDRESS`:

```typescript
export const CONFIG = {
  // Zmień tutaj adres serwera
  SERVER_ADDRESS: '192.168.0.157:8080', // <-- Zmień ten adres
  
  // Reszta konfiguracji jest automatycznie generowana
  get API_BASE_URL() {
    return `http://${this.SERVER_ADDRESS}/api`;
  }
  // ...
};
```

### Przykłady adresów:

- **Lokalny serwer**: `localhost:8080`
- **Android Emulator**: `10.0.2.2:8080`
- **Inny komputer w sieci**: `192.168.x.x:8080`
- **Serwer zdalny**: `your-domain.com:8080`

### Pliki które używają tej konfiguracji:

- `store/authStore.ts` - uwierzytelnianie
- `app/(tabs)/library/index.tsx` - lista dań
- `app/(tabs)/library/[dishId].tsx` - szczegóły dania
- `services/apiService.ts` - ogólne API

### Uwagi:

1. Po zmianie adresu, restart aplikacji może być konieczny
2. Upewnij się, że serwer jest dostępny pod nowym adresem
3. Sprawdź czy port jest otwarty w firewall'u
