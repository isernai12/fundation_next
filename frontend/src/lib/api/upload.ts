import { apiClient } from "./client";
import { MediaUploadResponse, MediaDeleteResponse } from "./types";

export const uploadApi = {
  /**
   * Upload a binary File or Blob to FastAPI backend
   */
  async uploadFile(
    file: File | Blob,
    folder: string = "foundation-erp",
    filenameOrToken?: string,
    token?: string
  ): Promise<MediaUploadResponse> {
    let resolvedFilename = (file as File).name || "upload";
    let resolvedToken = token;

    if (filenameOrToken) {
      // If 3 arguments were passed and the 3rd argument looks like a JWT/token
      if (!token && (filenameOrToken.startsWith("eyJ") || filenameOrToken.length > 50 || !filenameOrToken.includes("."))) {
        resolvedToken = filenameOrToken;
      } else {
        resolvedFilename = filenameOrToken;
      }
    }

    const formData = new FormData();
    formData.append("file", file, resolvedFilename);
    formData.append("folder", folder);
    formData.append("resource_type", "auto");

    return apiClient.post<MediaUploadResponse>("/api/v1/upload", formData, { token: resolvedToken });
  },

  /**
   * Upload a base64 encoded data URI string to FastAPI backend
   */
  async uploadBase64(
    base64Data: string,
    folder: string = "foundation-erp",
    filenameOrToken?: string,
    token?: string
  ): Promise<MediaUploadResponse> {
    let resolvedFilename: string | undefined = undefined;
    let resolvedToken = token;

    if (filenameOrToken) {
      if (!token && (filenameOrToken.startsWith("eyJ") || filenameOrToken.length > 50 || !filenameOrToken.includes("."))) {
        resolvedToken = filenameOrToken;
      } else {
        resolvedFilename = filenameOrToken;
      }
    }

    return apiClient.post<MediaUploadResponse>(
      "/api/v1/upload/base64",
      {
        data: base64Data,
        folder,
        filename: resolvedFilename,
      },
      { token: resolvedToken }
    );
  },

  /**
   * Delete a media asset from Cloudinary via FastAPI backend
   */
  async deleteFile(
    publicId: string,
    resourceType: string = "image",
    token?: string
  ): Promise<MediaDeleteResponse> {
    return apiClient.delete<MediaDeleteResponse>(
      `/api/v1/upload/${encodeURIComponent(publicId)}`,
      {
        params: { resource_type: resourceType },
        token,
      }
    );
  },
};
