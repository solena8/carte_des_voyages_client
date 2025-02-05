// Configuration initiale
const API_URL = 'http://localhost:8000';
const MAP_CONFIG = {
  center: [46.227638, 2.213749],
  zoom: 5,
  tileLayer: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution: "© OpenStreetMap contributors"
};

// Variables globales pour stocker les données de l'adresse
let selectedLocation = {
  city: '',
  country: '',
  latitude: null,
  longitude: null
};

// Initialisation au chargement du DOM
document.addEventListener("DOMContentLoaded", initializeApp);

// Fonction principale d'initialisation
function initializeApp() {
  const map = initializeMap();
  initializeImageUpload();
  GeocodingService.initializeAddressSearch();
  initializeFormSubmission(map);
  loadPlaces(map);
}

// Initialisation de la carte
function initializeMap() {
  const map = L.map("map").setView(MAP_CONFIG.center, MAP_CONFIG.zoom);
  
  L.tileLayer(MAP_CONFIG.tileLayer, {
    attribution: MAP_CONFIG.attribution,
  }).addTo(map);
  
  return map;
}

// Gestion du chargement de l'image
function initializeImageUpload() {
  const imageUpload = document.getElementById("imageUpload");
  const uploadLabel = document.querySelector('label[for="imageUpload"]');
  const preview = document.getElementById("preview");

  imageUpload.addEventListener("change", (event) => {
    if (event.target.files.length > 0) {
      uploadLabel.textContent = "Image sélectionnée";
      const reader = new FileReader();
      reader.onload = (e) => {
        preview.src = e.target.result;
        preview.style.display = 'block';
      };
      reader.readAsDataURL(event.target.files[0]);
    } else {
      uploadLabel.textContent = "Choisir une image";
      preview.style.display = 'none';
    }
  });
}

// Création du contenu des popups
function createPopupContent(place) {
  return `
    <div class="custom-popup" style="display: flex; gap: 15px; width: 600px;">
      <div class="popup-image" style="flex: 0 0 250px;">
        ${place.image 
          ? createImageElement(place) 
          : createPlaceholderElement()}
      </div>
      <div class="popup-info" style="flex: 1; padding-right: 10px;">
        ${createInfoContent(place)}
      </div>
      <div class="popup-delete" style="flex: 0 0 250px;">
        ${createDeleteButton(place)}
    </div>
  `;
}

// Création de l'élément image pour le popup
function createImageElement(place) {
  return `
    <img src="data:image/jpeg;base64,${place.image}" 
         alt="${place.name}" 
         style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">
  `;
}

function createDeleteButton(place) {
  return `
    <button 
      onclick="deletePlace(${place.id})" 
      class="delete-button" 
      style="background-color: #ff4444; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;">
      Supprimer
    </button>
  `;
}

async function deletePlace(id) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce lieu ?')) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/places/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      // Récupérer le conteneur de la carte
      const container = L.DomUtil.get('map');
      
      // Nettoyer l'ID Leaflet existant
      if (container._leaflet_id) {
        container._leaflet_id = null;
      }
      
      // Réinitialiser la carte
      const map = initializeMap();
      
      // Recharger les marqueurs
      await loadPlaces(map);
    } else {
      throw new Error('Erreur lors de la suppression');
    }
  } catch (error) {
    console.error('Erreur:', error);
    alert('Une erreur est survenue lors de la suppression');
  }
}




// Création du placeholder pour le popup sans image
function createPlaceholderElement() {
  return `
    <div style="width: 100%; height: 200px; background-color: #f0f0f0; 
                border-radius: 8px; display: flex; justify-content: center; 
                align-items: center; font-size: 80px;">
      🛏️
    </div>
  `;
}

// Création du contenu informatif du popup
function createInfoContent(place) {
  return `
    <h3 style="margin-top: 0; margin-bottom: 15px; color: #333;">${place.name}</h3>
    <p style="margin: 8px 0;"><strong>Ville:</strong> ${place.city}</p>
    <p style="margin: 8px 0;"><strong>Pays:</strong> ${place.country}</p>
    <p style="margin: 8px 0;"><strong>Date:</strong> ${place.date}</p>
    <p style="margin: 8px 0;"><strong>Coordonnées:</strong> ${place.latitude}, ${place.longitude}</p>
  `;
}

// Chargement des lieux depuis l'API
async function loadPlaces(map) {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const places = await response.json();
    if (!places || places.length === 0) return;

    // Créer un groupe de marqueurs
    const markers = [];

    places.forEach(place => {
      if (place.latitude && place.longitude) {
        const marker = addPlaceMarker(place, map);
        markers.push([place.latitude, place.longitude]);
      }
    });

    // S'il y a des marqueurs, ajuster la vue
    if (markers.length > 0) {
      map.fitBounds(markers, {
        padding: [50, 50], // Ajoute une marge autour des marqueurs
        maxZoom: 15        // Limite le zoom maximum
      });
    }
  } catch (error) {
    console.error("Erreur:", error);
  }
}

// Ajout d'un marqueur sur la carte
function addPlaceMarker(place, map) {
  if (!place.latitude || !place.longitude) return null;

  const marker = L.marker([place.latitude, place.longitude])
    .addTo(map)
    .bindPopup(createPopupContent(place), {
      maxWidth: 300,
      className: "custom-popup",
      autoClose: true,
      closeOnClick: true,
    });

  return marker;
}

// Initialisation de la soumission du formulaire
function initializeFormSubmission(map) {
  const form = document.getElementById("placeForm");
  form.addEventListener("submit", (event) => handleFormSubmit(event, map));
}

// Gestion de la soumission du formulaire
async function handleFormSubmit(event, map) {
  event.preventDefault();
  
  if (!selectedLocation.latitude || !selectedLocation.longitude) {
    alert("Veuillez sélectionner une adresse valide");
    return;
  }

  const data = collectFormData();
  const imageFile = document.getElementById("imageUpload").files[0];

  if (imageFile) {
    await handleSubmitWithImage(data, imageFile, map);
  } else {
    await handleSubmitWithoutImage(data, map);
  }
}

// Collecte des données du formulaire
function collectFormData() {
  return {
    name: document.getElementById("name").value,
    date: document.getElementById("date").value,
    city: selectedLocation.city,
    country: selectedLocation.country,
    latitude: selectedLocation.latitude,
    longitude: selectedLocation.longitude,
    image: null
  };
}

// Soumission avec image
async function handleSubmitWithImage(data, imageFile, map) {
  const reader = new FileReader();
  reader.readAsDataURL(imageFile);
  reader.onload = async () => {
    data.image = reader.result.split(",")[1];
    await submitData(data, map);
  };
}

// Soumission sans image
async function handleSubmitWithoutImage(data, map) {
  await submitData(data, map);
}

// Envoi des données à l'API
async function submitData(data, map) {
  try {
    const response = await fetch(`${API_URL}/places/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    showSuccessMessage(result);
    loadPlaces(map);
  } catch (error) {
    console.error("Erreur:", error);
  }
}

// Affichage du message de succès
function showSuccessMessage(result) {
  document.getElementById("responseMessage").innerText = 
    `Lieu ajouté : ${result.name} en ${result.city}, ${result.country}`;
}
