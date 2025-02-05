// script.js
document.addEventListener("DOMContentLoaded", () => {
  // Initialisation de la carte
  const map = L.map("map").setView([46.227638, 2.213749], 5);

  // Ajout des tuiles
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  // Fonction pour charger les places
  async function loadPlaces() {
    try {
      const response = await fetch("http://localhost:8000/");
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const places = await response.json();
      if (!places || places.length === 0) return;

      places.forEach((place) => {
        if (place.latitude && place.longitude) {
          const popupContent = `
                <div class="custom-popup" style="display: flex; gap: 15px; width: 600px;">
                    <div class="popup-image" style="flex: 0 0 250px;">
                        ${
                          place.image
                            ? `<img src="data:image/jpeg;base64,${place.image}" 
                                 alt="${place.name}" 
                                 style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">`
                            : `<div style="width: 100%; height: 200px; background-color: #f0f0f0; 
                                         border-radius: 8px; display: flex; justify-content: center; 
                                         align-items: center; font-size: 80px;">
                                 🛏️
                               </div>`
                        }
                    </div>
                    <div class="popup-info" style="flex: 1; padding-right: 10px;">
                        <h3 style="margin-top: 0; margin-bottom: 15px; color: #333;">${
                          place.name
                        }</h3>
                        <p style="margin: 8px 0;"><strong>Ville:</strong> ${
                          place.city
                        }</p>
                        <p style="margin: 8px 0;"><strong>Pays:</strong> ${
                          place.country
                        }</p>
                        <p style="margin: 8px 0;"><strong>Date:</strong> ${
                          place.date
                        }</p>
                        <p style="margin: 8px 0;"><strong>Coordonnées:</strong> ${
                          place.latitude
                        }, ${place.longitude}</p>
                    </div>
                </div>
            `;
          // ... reste du code

          L.marker([place.latitude, place.longitude])
            .addTo(map)
            .bindPopup(popupContent, {
              maxWidth: 300,
              className: "custom-popup",
              autoClose: true,
              closeOnClick: true,
            });
        }
      });
    } catch (error) {
      console.error("Erreur:", error);
    }
  }

  loadPlaces();

  document
    .getElementById("placeForm")
    .addEventListener("submit", async (event) => {
      event.preventDefault();

      // Créer l'objet de données comme avant
      const data = {
        name: document.getElementById("name").value,
        date: document.getElementById("date").value,
        city: document.getElementById("city").value,
        country: document.getElementById("country").value,
        latitude: parseFloat(document.getElementById("latitude").value),
        longitude: parseFloat(document.getElementById("longitude").value),
        image: null, // On ajoutera l'image plus tard si nécessaire
      };

      // Si une image est sélectionnée, la convertir en base64
      const imageFile = document.getElementById("imageUpload").files[0];
      if (imageFile) {
        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        reader.onload = async () => {
          // Enlever le préfixe "data:image/jpeg;base64," du base64
          data.image = reader.result.split(",")[1];

          try {
            const response = await fetch("http://localhost:8000/places/", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            });

            const result = await response.json();
            document.getElementById(
              "responseMessage"
            ).innerText = `Lieu ajouté : ${result.name} en ${result.city}, ${result.country}`;

            // Recharger les places après l'ajout
            loadPlaces();
          } catch (error) {
            console.error("Erreur:", error);
          }
        };
      } else {
        // Si pas d'image, envoyer les données sans image
        try {
          const response = await fetch("http://localhost:8000/places/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });

          const result = await response.json();
          document.getElementById(
            "responseMessage"
          ).innerText = `Lieu ajouté : ${result.name} en ${result.city}, ${result.country}`;

          loadPlaces();
        } catch (error) {
          console.error("Erreur:", error);
        }
      }
    });
});
