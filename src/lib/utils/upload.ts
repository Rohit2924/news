export async function uploadImage(file: File, folder: string) {
  try {
    // Create a FormData instance
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    // Upload to your storage service (e.g., Cloudinary, AWS S3, etc.)
    // For now, we'll just save it locally in the public folder
    const fileName = `${Date.now()}-${file.name}`;
    const path = `/public/uploads/${folder}/${fileName}`;
    
    // In a real application, you would upload the file to a storage service here
    // For now, we'll just return the path
    return path;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}
