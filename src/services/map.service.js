import { CONFIG } from "../config/config.js";
import { PopupService } from "../components/popup.js";

export class MapService {
  static initializeMap() {
    const map = L.map("map", {
      dragging: true, 
      scrollWheelZoom: true, 
      tap: true, 
    }).setView(CONFIG.MAP.center, CONFIG.MAP.zoom);

    L.tileLayer(CONFIG.MAP.tileLayer, {
      attribution: CONFIG.MAP.attribution,
    }).addTo(map);

    return map;
  }

  static addMarker(place, map) {
    if (!place.latitude || !place.longitude) return null;

    const marker = L.marker([place.latitude, place.longitude])
      .addTo(map)
      .bindPopup(PopupService.createPopupContent(place), {
        maxWidth: 300,
        className: "custom-popup",
        autoClose: true,
        closeOnClick: true,
      });

    return marker;
  }

  static resetMap() {
    const container = L.DomUtil.get("map");
    if (container._leaflet_id) {
      container._leaflet_id = null;
    }
    return this.initializeMap();
  }
}
