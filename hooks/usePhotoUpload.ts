import axios from "axios";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { Alert } from "react-native";

export interface UploadResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export const usePhotoUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const uploadRequestRef = useRef<any>(null);

  const uploadPhoto = async (photoUri: string): Promise<boolean> => {
    try {
      setIsUploading(true);

      const formData = new FormData();
      const filename = photoUri.split("/").pop() || "photo.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("image", {
        uri: photoUri,
        name: filename,
        type: type,
      } as any);

      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      uploadRequestRef.current = source;

      const response = await axios.post(
        "https://your-api-endpoint.com/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
          timeout: 30000,
          cancelToken: source.token,
        }
      );

      console.log("API Response:", response.data);

      if (response.data && response.data.success) {
        setIsUploading(false);

        Alert.alert("Success!", "Photo uploaded successfully!", [
          {
            text: "OK",
            onPress: () => {
              router.push("/home");
            },
          },
        ]);

        return true;
      } else {
        throw new Error(response.data?.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setIsUploading(false);

      if (axios.isCancel(error)) {
        console.log("Upload cancelled");
        return false;
      }

      return new Promise((resolve) => {
        Alert.alert(
          "Upload Failed",
          "Failed to upload photo. Please try again.",
          [
            {
              text: "Retry",
              onPress: async () => {
                const success = await uploadPhoto(photoUri);
                resolve(success);
              },
            },
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => resolve(false),
            },
          ]
        );
      });
    }
  };

  const cancelUpload = () => {
    if (uploadRequestRef.current) {
      uploadRequestRef.current.cancel("Upload cancelled by user");
      setIsUploading(false);
    }
  };

  const resetUploadState = () => {
    setIsUploading(false);
    if (uploadRequestRef.current) {
      uploadRequestRef.current.cancel("Component reset");
      uploadRequestRef.current = null;
    }
  };

  return {
    isUploading,
    uploadPhoto,
    cancelUpload,
    resetUploadState,
  };
};
