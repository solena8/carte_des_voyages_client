import { SELECTED_LOCATION } from "../config/config.js";
import { ApiService } from "../services/api.service.js";
import { ImageService } from "../services/image.service.js";
import { MapService } from "../services/map.service.js";


export class FormHandler {
  static initializeFormSubmission(map) {
    const form = document.getElementById("placeForm");
    form.addEventListener("submit", (event) =>
      this.handleFormSubmit(event, map)
    );
  }

  static async handleFormSubmit(event, map) {
    console.log('Form submission data:', this.collectFormData());

    event.preventDefault();

    if (!SELECTED_LOCATION.latitude || !SELECTED_LOCATION.longitude) {
      alert("Veuillez sélectionner une adresse valide");
      return;
    }

    const data = this.collectFormData();
    const imageFile = document.getElementById("imageUpload").files[0];

    try {
      if (imageFile) {
        data.image = await ImageService.processImage(imageFile);
      }

      const result = await ApiService.submitPlace(data);
      this.showSuccessMessage(result);
      await window.updateStats();
      const newMap = MapService.resetMap();
      await ApiService.loadPlaces(newMap);

      
      
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      alert("Une erreur est survenue lors de l'enregistrement");
    }
  }

  static collectFormData() {
    return {
      name: document.getElementById("name").value,
      date: document.getElementById("date").value,
      city: SELECTED_LOCATION.city,
      country: SELECTED_LOCATION.country,
      latitude: SELECTED_LOCATION.latitude,
      longitude: SELECTED_LOCATION.longitude,
      image: null,
    };
  }

  static showSuccessMessage(result) {
    document.getElementById(
      "responseMessage"
    ).innerText = `Lieu ajouté : ${result.name} à ${result.city}, ${result.country}`;
  }
}
