import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

// Configure Cloudinary
// It will automatically use the CLOUDINARY_URL environment variable if set
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadFileOptions {
  folder?: string;
  resource_type?: 'image' | 'video' | 'raw' | 'auto';
  public_id?: string;
}

export async function uploadToCloudinary(
  buffer: Buffer,
  options: UploadFileOptions = {}
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'foundation-erp',
        resource_type: options.resource_type || 'auto',
        public_id: options.public_id,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve(result);
        } else {
          reject(new Error("Unknown error during cloudinary upload"));
        }
      }
    );

    uploadStream.end(buffer);
  });
}

export async function deleteFromCloudinary(publicId: string, resourceType: 'image' | 'video' | 'raw' | 'auto' = 'auto'): Promise<any> {
  try {
    return await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error("Cloudinary deletion failed:", error);
    throw error;
  }
}

export async function replaceInCloudinary(
  oldPublicId: string,
  newBuffer: Buffer,
  options: UploadFileOptions = {}
): Promise<UploadApiResponse> {
  // First, delete the old one
  if (oldPublicId) {
    await deleteFromCloudinary(oldPublicId, options.resource_type);
  }
  // Then upload the new one
  return await uploadToCloudinary(newBuffer, options);
}
