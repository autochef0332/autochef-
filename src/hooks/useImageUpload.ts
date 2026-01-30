import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useImageUpload() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!user?.id) {
      toast.error("Please log in to upload images");
      return null;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return null;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("Image size must be less than 5MB");
      return null;
    }

    setUploading(true);
    setProgress(0);

    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = "ml_default"; // Using unsigned upload

      if (!cloudName) {
        throw new Error("Cloudinary configuration missing");
      }

      setProgress(30);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      formData.append("folder", `restaurant-menu/${user.id}`);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload to Cloudinary");
      }

      const data = await response.json();

      setProgress(100);
      toast.success("Image uploaded successfully!");
      return data.secure_url;
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
      return null;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const deleteImage = async (url: string): Promise<boolean> => {
    if (!user?.id || !url) return false;

    try {
      // Extract public_id from Cloudinary URL
      // Example URL: https://res.cloudinary.com/dwta5v9wi/image/upload/v1234567890/restaurant-menu/user-id/image.jpg
      const urlParts = url.split("/");
      const uploadIndex = urlParts.indexOf("upload");
      if (uploadIndex === -1) return false;

      const publicIdParts = urlParts.slice(uploadIndex + 2); // Skip "upload" and version
      const publicId = publicIdParts.join("/").split(".")[0];

      // Note: Deleting images from Cloudinary requires authenticated requests
      // For now, we'll just return true as a placeholder
      // In production, you should implement a server-side endpoint to handle deletions
      console.log("Image deletion requested for:", publicId);
      return true;
    } catch (error) {
      console.error("Delete error:", error);
      return false;
    }
  };

  return {
    uploadImage,
    deleteImage,
    uploading,
    progress,
  };
}
