import { API_CONFIG } from "../config/api.config.js";
import { SELECTED_LOCATION } from "../config/config.js";

export class GeocodingService {
  static async searchAddress(query) {
    try {
      const response = await fetch(
        `${API_CONFIG.POSITIONSTACK.baseUrl}/forward?` +
          `access_key=${API_CONFIG.POSITIONSTACK.apiKey}&` +
          `query=${encodeURIComponent(query)}&` +
          `limit=5`
      );

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Erreur de géocodage:", error);
      return [];
    }
  }

  static initializeAddressSearch() {
    const addressInput = document.getElementById("address");
    const suggestionsContainer = document.getElementById("suggestions");

    let debounceTimer;

    addressInput.addEventListener("input", (e) => {
      clearTimeout(debounceTimer);

      if (e.target.value.length < 1) {
        suggestionsContainer.style.display = "none";
        return;
      }

      debounceTimer = setTimeout(async () => {
        const results = await this.searchAddress(e.target.value);
        this.displaySuggestions(results, {
          addressInput,
          suggestionsContainer,
        });
      }, 300);
    });
  }

  static displaySuggestions(results, elements) {
    const { addressInput, suggestionsContainer } = elements;

    if (!results.length) {
      suggestionsContainer.style.display = "none";
      return;
    }

    suggestionsContainer.innerHTML = "";
    results.forEach((result) => {
      const div = document.createElement("div");
      div.className = "suggestion-item";
      div.textContent = result.label;

      div.addEventListener("click", () => {
        console.log("Result from geocoding:", result); 
        addressInput.value = result.label;
        Object.assign(SELECTED_LOCATION, {
          city: result.locality || "",
          country: result.country || "",
          latitude: result.latitude,
          longitude: result.longitude,
        });
        suggestionsContainer.style.display = "none";
      });

      suggestionsContainer.appendChild(div);
    });

    suggestionsContainer.style.display = "block";
  }
}
