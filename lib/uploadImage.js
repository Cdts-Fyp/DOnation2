import axios from 'axios';

const UPLOAD_URL = 'https://sibaubackend1-klabu0vd.b4a.run/api/v1/upload';
const DELETE_URL = 'https://sibaubackend1-klabu0vd.b4a.run/api/v1/delete';

class ImageUploader {
  constructor(uploadUrl = UPLOAD_URL, deleteUrl = DELETE_URL) {
    this.uploadUrl = uploadUrl;
    this.deleteUrl = deleteUrl;
  }

  handleDrop(event) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        return { error: 'File size should be less than 5MB' };
      }
      if (!file.type.startsWith('image/')) {
        return { error: 'Please select an image file' };
      }
      return { file };
    }
    return { error: 'No file dropped' };
  }

  async handleImageUpload(file, setUploadImage) {
    if (!file) {
      return { error: 'No file to upload' };
    }
    setUploadImage(true);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post(this.uploadUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUploadImage(false);

      return { imageUrl: response.data.imageUrl };
    } catch (err) {
      return { error: err.response?.data?.message || 'Error uploading image' };
    }
  }

  async handleDeleteImage(imageUrl) {
    if (!imageUrl) {
      return { error: 'No image URL provided for deletion.' };
    }

    try {
      const publicId = imageUrl.split('/').pop().split('.')[0];
      await axios.delete(`${this.deleteUrl}/${publicId}`);
      return { success: true };
    } catch (err) {
      return { error: err.response?.data?.message || 'Error deleting image' };
    }
  }

  handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
  }
}

export default ImageUploader;
