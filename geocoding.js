// geocoding.js
const POSITIONSTACK_CONFIG = {
    apiKey: 'c5ace827c5639c7a8af709633d80d3ec',
    baseUrl: 'http://api.positionstack.com/v1'
  };
  
  class GeocodingService {
    static async searchAddress(query) {
      try {
        const response = await fetch(
          `${POSITIONSTACK_CONFIG.baseUrl}/forward?` + 
          `access_key=${POSITIONSTACK_CONFIG.apiKey}&` +
          `query=${encodeURIComponent(query)}&` +
          `limit=5`
        );
        
        const data = await response.json();
        return data.data || [];
      } catch (error) {
        console.error('Erreur de géocodage:', error);
        return [];
      }
    }
  
    static initializeAddressSearch() {
      const addressInput = document.getElementById('address');
      const suggestionsContainer = document.getElementById('suggestions');
      
      let debounceTimer;
  
      addressInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        
        if (e.target.value.length < 3) {
          suggestionsContainer.style.display = 'none';
          return;
        }
  
        debounceTimer = setTimeout(async () => {
          const results = await this.searchAddress(e.target.value);
          this.displaySuggestions(results, {
            addressInput,
            suggestionsContainer
          });
        }, 300);
      });
    }
  
    static displaySuggestions(results, elements) {
      const { addressInput, suggestionsContainer } = elements;
  
      if (!results.length) {
        suggestionsContainer.style.display = 'none';
        return;
      }
  
      suggestionsContainer.innerHTML = '';
      results.forEach(result => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.textContent = result.label;
        
        div.addEventListener('click', () => {
          addressInput.value = result.label;
          // Mettre à jour les données de localisation globales
          selectedLocation = {
            city: result.city || '',
            country: result.country || '',
            latitude: result.latitude,
            longitude: result.longitude
          };
          suggestionsContainer.style.display = 'none';
        });
  
        suggestionsContainer.appendChild(div);
      });
      
      suggestionsContainer.style.display = 'block';
    }
  }
  
  
  // Exporter la classe pour l'utiliser dans script.js
  window.GeocodingService = GeocodingService;
  