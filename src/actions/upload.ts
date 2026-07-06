"use server";

import { v2 as cloudinary } from "cloudinary";

/**
 * Server action to upload a file to Cloudinary.
 * Accepts FormData containing the file.
 */
export async function uploadToCloudinary(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) {
    return { success: false, error: "No file provided" };
  }

  // Defensively cleanse values of quotes/whitespace (common source of signature issues)
  const cloudName = (
    process.env.CLOUDINARY_CLOUD_NAME || 
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 
    ""
  ).trim().replace(/^["']|["']$/g, "");

  const apiKey = (
    process.env.CLOUDINARY_API_KEY || 
    ""
  ).trim().replace(/^["']|["']$/g, "");

  const apiSecret = (
    process.env.CLOUDINARY_API_SECRET || 
    ""
  ).trim().replace(/^["']|["']$/g, "");

  // Configure Cloudinary
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  // Basic check for API credentials
  if (!cloudName) {
    return { success: false, error: "Cloudinary configuration is missing CLOUDINARY_CLOUD_NAME." };
  }
  if (!apiKey) {
    return { success: false, error: "Cloudinary configuration is missing CLOUDINARY_API_KEY." };
  }
  if (!apiSecret) {
    return { success: false, error: "Cloudinary configuration is missing CLOUDINARY_API_SECRET." };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
          folder: "cineverse/chat",
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(buffer);
    });

    return {
      success: true,
      url: result.secure_url,
      name: file.name,
      size: file.size,
      type: result.resource_type,
    };
  } catch (error: any) {
    console.error("Cloudinary upload error:", error);
    return { success: false, error: error.message || "Upload failed" };
  }
}
