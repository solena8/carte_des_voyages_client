export class ImageService {
    static initializeImageUpload() {
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
  
    static async processImage(imageFile) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });
    }
  }
  