import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// CAMERA
import { CameraView, useCameraPermissions } from "expo-camera";

// ICON
import FeatherIcon from "react-native-vector-icons/Feather";

// FUNCTION
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// NAVIGATE
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import type { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/AppNavigator";

type Props = StackScreenProps<RootStackParamList, "OneTakePicture">;

export default function TakePicture({ navigation }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [photoBase64, setPhotoBase64] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const isProcessingRef = useRef(false);
  const appStateRef = useRef(AppState.currentState);
  const hasNavigatedRef = useRef(false);
  const previousPhotoRef = useRef<string>("");
  const activeRequestRef = useRef<any>(null);

  const isFocused = useIsFocused();

  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        resetAllState();
      }
      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const resetAllState = () => {
    resetPhoto();
    setIsLoading(false);
    isProcessingRef.current = false;
    hasNavigatedRef.current = false;
    previousPhotoRef.current = "";

    if (
      activeRequestRef.current &&
      typeof activeRequestRef.current.cancel === "function"
    ) {
      activeRequestRef.current.cancel("Component unmounted");
    }
    activeRequestRef.current = null;
  };

  useFocusEffect(
    React.useCallback(() => {
      resetAllState();

      AsyncStorage.removeItem("pending_photo_process");

      return () => {
        hasNavigatedRef.current = false;

        if (
          activeRequestRef.current &&
          typeof activeRequestRef.current.cancel === "function"
        ) {
          activeRequestRef.current.cancel("Component unmounted");
        }
      };
    }, [])
  );

  useEffect(() => {
    requestPermission();

    const checkPendingProcess = async () => {
      try {
        const pendingProcess = await AsyncStorage.getItem(
          "pending_photo_process"
        );
        if (pendingProcess === "true") {
          await AsyncStorage.removeItem("pending_photo_process");
        }
      } catch (e) {
        console.error("Error checking pending process:", e);
      }
    };

    checkPendingProcess();
  }, []);

  const takePicture = async () => {
    if (!cameraRef || !cameraRef.current) {
      Alert.alert("Error", "Camera not ready");
      return;
    }

    try {
      if (typeof cameraRef.current.takePictureAsync !== "function") {
        Alert.alert("Error", "Camera does not support taking pictures");
        return;
      }

      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.8,
      });

      if (photo && photo.base64) {
        setPhotoBase64(photo.base64);

        Alert.alert(
          "Yay! Photo captured successfully",
          "Would you like to continue or retake the picture?",
          [
            {
              text: "Continue",
              onPress: async () => {
                try {
                  if (
                    !isFocused ||
                    isProcessingRef.current ||
                    hasNavigatedRef.current
                  ) {
                    console.log("Preventing duplicate processing");
                    return;
                  }

                  isProcessingRef.current = true;

                  previousPhotoRef.current = photo.base64 || "";

                  await AsyncStorage.setItem("pending_photo_process", "true");

                  setIsLoading(true);

                  const formData = new FormData();

                  const fileUri = photo.uri;
                  const filename = fileUri.split("/").pop() || "food.jpg";
                  const match = /\.(\w+)$/.exec(filename);
                  const type = match ? `image/${match[1]}` : "image/jpeg";

                  formData.append("foods", {
                    uri: fileUri,
                    name: filename,
                    type: type,
                  } as any);

                  const CancelToken = axios.CancelToken;
                  const source = CancelToken.source();
                  activeRequestRef.current = source;

                  const response = await axios.post(
                    "https://back-end-service-693437063823.asia-southeast2.run.app/image/prepared-food",
                    formData,
                    {
                      headers: {
                        "Content-Type": "multipart/form-data",
                        Accept: "application/json",
                      },
                      cancelToken: source.token,
                    }
                  );

                  if (!isFocused) {
                    return;
                  }

                  if (response.data && response.data.data) {
                    const { ingredients, nutrition_info } =
                      response?.data?.data;

                    if (ingredients) {
                      await AsyncStorage.setItem(
                        "ingredients",
                        JSON.stringify(ingredients)
                      );
                    }

                    if (nutrition_info) {
                      await AsyncStorage.setItem(
                        "nutrition_info",
                        JSON.stringify(nutrition_info)
                      );
                    }

                    hasNavigatedRef.current = true;
                    await AsyncStorage.removeItem("pending_photo_process");

                    setIsLoading(false);
                    resetPhoto();
                    isProcessingRef.current = false;

                    if (isFocused) {
                      navigation.navigate("TypeIngredient");
                    }
                  } else {
                    throw new Error("Invalid response format");
                  }
                } catch (error) {
                  if (axios.isCancel(error)) {
                    console.log("Request canceled:", error.message);
                  } else {
                    console.error("Camera error:", error);
                    Alert.alert(
                      "Error",
                      "Failed to process image. Please try again."
                    );
                  }

                  await AsyncStorage.removeItem("pending_photo_process");
                  resetPhoto();
                  setIsLoading(false);
                  isProcessingRef.current = false;
                  hasNavigatedRef.current = false;
                }
              },
            },
            {
              text: "Retake",
              onPress: resetPhoto,
            },
          ]
        );
      } else {
        Alert.alert("Error", "Failed to capture image");
      }
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert("Error", "Failed to capture image");
    }
  };

  const resetPhoto = () => {
    setPhotoBase64("");
  };

  if (!permission) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>No access to camera</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-black/75 justify-center items-center">
        <View className="bg-white p-6 rounded-xl items-center">
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text className="mt-4 text-lg font-medium">
            Processing your image...
          </Text>
          <Text className="mt-2 text-gray-500">
            This may take a few seconds
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <View className="w-full flex-row justify-between items-center px-4 pt-12 pb-6 bg-white">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full flex justify-center items-center"
        >
          <FeatherIcon name="arrow-left" size={20} color="black" />
        </TouchableOpacity>

        <Text className="text-xl font-bold">Food Analysis</Text>

        <TouchableOpacity
          onPress={() => console.log("menu")}
          className="w-10 h-10 rounded-full flex justify-center items-center"
        >
          <FeatherIcon name="more-vertical" size={20} color="black" />
        </TouchableOpacity>
      </View>

      <View className="flex-1">
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back">
          <View className="flex-1 relative">
            <View className="absolute inset-0 flex items-center justify-center">
              <View className="w-72 h-72 border-2 border-white rounded-lg" />
            </View>

            <View className="absolute top-40 self-center bg-green-500 px-4 py-2 rounded-full">
              <Text className="text-white font-bold">Take Picture of Food</Text>
            </View>

            <View className="absolute bottom-0 left-0 right-0">
              <TouchableOpacity
                className="bg-blue-800 py-3 items-center mx-10 rounded-lg mb-3"
                onPress={takePicture}
              >
                <Text className="text-white font-bold text-lg">
                  Take Picture
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </View>
    </View>
  );
}
