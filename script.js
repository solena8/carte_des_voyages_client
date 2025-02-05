// Configuration initiale
const API_URL = 'http://localhost:8000';
const MAP_CONFIG = {
  center: [46.227638, 2.213749],
  zoom: 5,
  tileLayer: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution: "© OpenStreetMap contributors"
};

// Initialisation au chargement du DOM
document.addEventListener("DOMContentLoaded", initializeApp);

// Fonction principale d'initialisation
function initializeApp() {
  const map = initializeMap();
  initializeImageUpload();
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

  imageUpload.addEventListener("change", (event) => {
    uploadLabel.textContent = event.target.files.length > 0 
      ? "Image sélectionnée" 
      : "Choisir une image";
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

    places.forEach(place => addPlaceMarker(place, map));
  } catch (error) {
    console.error("Erreur:", error);
  }
}

// Ajout d'un marqueur sur la carte
function addPlaceMarker(place, map) {
  if (!place.latitude || !place.longitude) return;

  L.marker([place.latitude, place.longitude])
    .addTo(map)
    .bindPopup(createPopupContent(place), {
      maxWidth: 300,
      className: "custom-popup",
      autoClose: true,
      closeOnClick: true,
    });
}

// Initialisation de la soumission du formulaire
function initializeFormSubmission(map) {
  const form = document.getElementById("placeForm");
  form.addEventListener("submit", (event) => handleFormSubmit(event, map));
}

// Gestion de la soumission du formulaire
async function handleFormSubmit(event, map) {
  event.preventDefault();
  const data = collectFormData();
  const imageFile = document.getElementById("imageUpload").files[0];

  if (imageFile) {
    handleSubmitWithImage(data, imageFile, map);
  } else {
    handleSubmitWithoutImage(data, map);
  }
}

// Collecte des données du formulaire
function collectFormData() {
  return {
    name: document.getElementById("name").value,
    date: document.getElementById("date").value,
    city: document.getElementById("city").value,
    country: document.getElementById("country").value,
    latitude: parseFloat(document.getElementById("latitude").value),
    longitude: parseFloat(document.getElementById("longitude").value),
    image: null
  };
}

// Soumission avec image
function handleSubmitWithImage(data, imageFile, map) {
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
