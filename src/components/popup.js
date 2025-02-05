

export class PopupService {
  static createPopupContent(place) {
    return `
      <div class="custom-popup" style="display: flex; gap: 15px; width: 600px;">
        <div class="popup-image" style="flex: 0 0 250px;">
          ${place.image ? this.createImageElement(place) : this.createPlaceholderElement()}
        </div>
        <div class="popup-info" style="flex: 1; padding-right: 10px;">
          ${this.createInfoContent(place)}
        </div>
        <div class="popup-delete" style="flex: 0 0 250px;">
          ${this.createDeleteButton(place)}
        </div>
      </div>
    `;
  }

  static createImageElement(place) {
    return `
      <img src="data:image/jpeg;base64,${place.image}" 
           alt="${place.name}" 
           style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">
    `;
  }

  static createPlaceholderElement() {
    return `
      <div style="width: 100%; height: 200px; background-color: #f0f0f0; 
                  border-radius: 8px; display: flex; justify-content: center; 
                  align-items: center; font-size: 80px;">
        🛏️
      </div>
    `;
  }

  static createInfoContent(place) {
    return `
      <h3 style="margin-top: 0; margin-bottom: 15px; color: #333;">${place.name}</h3>
      <p style="margin: 8px 0;"><strong>Ville:</strong> ${place.city}</p>
      <p style="margin: 8px 0;"><strong>Pays:</strong> ${place.country}</p>
      <p style="margin: 8px 0;"><strong>Date:</strong> ${place.date}</p>
      <p style="margin: 8px 0;"><strong>Coordonnées:</strong> ${place.latitude}, ${place.longitude}</p>
    `;
  }

  static createDeleteButton(place) {
    return `
      <button 
        onclick="window.handlePlaceDelete(${place.id})" 
        class="delete-button" 
        style="background-color: #ff4444; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;">
        Supprimer
      </button>
    `;
  }
}
