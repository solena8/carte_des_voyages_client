import { MapService } from "./services/map.service.js";
import { ApiService } from "./services/api.service.js";
import { FormHandler } from "./components/form.js";
import { ImageService } from "./services/image.service.js";
import { GeocodingService } from "./services/geocoding.service.js";

window.handlePlaceDelete = async (id) => {
  if (!confirm("Êtes-vous sûr de vouloir supprimer ce lieu ?")) {
    return;
  }

  try {
    await ApiService.deletePlace(id);
    await window.updateStats();
    const newMap = MapService.resetMap();
    await ApiService.loadPlaces(newMap);
  } catch (error) {
    alert("Une erreur est survenue lors de la suppression");
  }
};

function initializeApp() {
  const map = MapService.initializeMap();
  ImageService.initializeImageUpload();
  GeocodingService.initializeAddressSearch();
  FormHandler.initializeFormSubmission(map);
  ApiService.loadPlaces(map);
}

document.addEventListener("DOMContentLoaded", initializeApp);
