import { API_CONFIG } from "../config/api.config.js";
import { MapService } from "./map.service.js";

export class ApiService {
  static async loadPlaces(map) {
    try {
      const response = await fetch(`${API_CONFIG.MAIN.URL}/places/`);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const places = await response.json();
      if (!places || places.length === 0) return;

      const markers = [];
      places.forEach((place) => {
        place.date = new Date(place.date).toLocaleDateString();
        if (place.latitude && place.longitude) {
          const marker = MapService.addMarker(place, map);
          markers.push([place.latitude, place.longitude]);
        }
      });

      if (markers.length > 0) {
        map.fitBounds(markers, {
          padding: [50, 50],
          maxZoom: 15,
        });
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  }

  static async submitPlace(data) {
    try {
      const response = await fetch(`${API_CONFIG.MAIN.URL}/places/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error("Erreur:", error);
      throw error;
    }
  }

  static async deletePlace(id) {
    try {
      const response = await fetch(`${API_CONFIG.MAIN.URL}/places/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur:", error);
      throw error;
    }
  }

  static async getStats() {
    try {
      const response = await fetch(`${API_CONFIG.MAIN.URL}/places/api/stats`);
      if (!response.ok)
        throw new Error("Erreur lors de la récupération des statistiques");

      return await response.json();
    } catch (error) {
      console.error("Erreur:", error);
      return { totalEntries: 0, uniqueCountries: 0 };
    }
  }
}

async function updateStats() {
  const result = await ApiService.getStats();

  document.getElementById(
    "compteur"
  ).innerText = `Nb de pays visités : ${result.uniqueCountries} \nNb de lits visités : ${result.totalEntries}`;
}

document.addEventListener("DOMContentLoaded", async () => {
  await updateStats();
});

window.updateStats = updateStats;