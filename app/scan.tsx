import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  AppState,
  Dimensions,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { usePhotoUpload } from "../hooks/usePhotoUpload";

const { width, height } = Dimensions.get("window");

const CameraScreen = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [facing, setFacing] = useState<"back" | "front">("back");

  const cameraRef = useRef<CameraView>(null);
  const isProcessingRef = useRef(false);
  const appStateRef = useRef(AppState.currentState);
  const hasNavigatedRef = useRef(false);

  const { isUploading, uploadPhoto, resetUploadState } = usePhotoUpload();

  const flashAnimation = useRef(new Animated.Value(0)).current;
  const crosshairAnimation = useRef(new Animated.Value(1)).current;
  const captureAnimation = useRef(new Animated.Value(1)).current;

  const isFocused = useIsFocused();

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
    setIsCapturing(false);
    isProcessingRef.current = false;
    hasNavigatedRef.current = false;
    resetUploadState();
  };

  useFocusEffect(
    React.useCallback(() => {
      resetAllState();
      return () => {
        hasNavigatedRef.current = false;
        resetUploadState();
      };
    }, [])
  );

  useEffect(() => {
    requestPermission();
    startCrosshairAnimation();
  }, []);

  const startCrosshairAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(crosshairAnimation, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(crosshairAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handlePhotoCapture = async () => {
    if (!cameraRef || !cameraRef.current) {
      Alert.alert("Error", "Camera not ready");
      return;
    }

    if (isProcessingRef.current || !isFocused || isUploading) {
      return;
    }

    try {
      if (typeof cameraRef.current.takePictureAsync !== "function") {
        Alert.alert("Error", "Camera does not support taking pictures");
        return;
      }

      setIsCapturing(true);
      isProcessingRef.current = true;

      Animated.sequence([
        Animated.timing(captureAnimation, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(captureAnimation, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      const photo = await cameraRef.current.takePictureAsync({
        base64: false,
        quality: 0.8,
        skipProcessing: false,
      });

      if (photo && photo.uri) {
        setIsCapturing(false);
        try {
          await MediaLibrary.saveToLibraryAsync(photo.uri);
        } catch (mediaError) {}

        Alert.alert("Photo Captured!", "Would you like to upload this photo?", [
          {
            text: "Retake",
            style: "cancel",
            onPress: () => {
              resetAllState();
            },
          },
          {
            text: "Upload",
            onPress: async () => {
              const success = await uploadPhoto(photo.uri);
              if (success) {
                resetAllState();
              }
            },
          },
        ]);
      } else {
        Alert.alert("Error", "Failed to capture image");
        setIsCapturing(false);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to capture photo");
      setIsCapturing(false);
    } finally {
      isProcessingRef.current = false;
    }
  };

  const switchCamera = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  if (!permission) {
    return (
      <View className="flex-1 justify-center items-center bg-black px-5">
        <Text className="text-white text-lg text-center">
          Requesting camera permission...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 justify-center items-center bg-black px-5">
        <Ionicons name="camera-outline" size={80} color="#666" />
        <Text className="text-white text-lg mt-5 mb-7 text-center">
          Camera permission required
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="bg-red-500 px-8 py-4 rounded-3xl"
        >
          <Text className="text-white text-base font-semibold">
            Grant Permission
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {isUploading && (
        <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/75 justify-center items-center z-50">
          <View className="bg-white p-6 rounded-xl items-center">
            <ActivityIndicator size="large" color="#ff4757" />
            <Text className="mt-4 text-lg font-medium text-black">
              Uploading photo...
            </Text>
            <Text className="mt-2 text-gray-500">
              Please wait while we process your image
            </Text>
          </View>
        </View>
      )}

      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing={facing}
        flash={isFlashOn ? "on" : "off"}
        onCameraReady={() => {
          setIsCameraReady(true);
        }}
      >
        <View className="flex-1 relative">
          <View className="absolute top-12 left-0 right-0 items-center z-20">
            <View className="bg-black/50 px-5 py-2.5 rounded-2xl flex-row items-center">
              <Ionicons name="camera" size={16} color="#fff" />
              <Text className="text-white text-sm font-medium ml-2">
                Photo Mode
              </Text>
            </View>
          </View>

          <View className="absolute top-12 right-5 z-20">
            <TouchableOpacity
              onPress={switchCamera}
              className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/50 justify-center items-center"
            >
              <Ionicons name="camera-reverse" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <View className="absolute inset-0 flex items-center justify-center">
            <View
              className="absolute border-white/80"
              style={{
                top: height * 0.25,
                left: width * 0.15,
                width: 30,
                height: 30,
                borderTopWidth: 3,
                borderLeftWidth: 3,
              }}
            />
            <View
              className="absolute border-white/80"
              style={{
                top: height * 0.25,
                right: width * 0.15,
                width: 30,
                height: 30,
                borderTopWidth: 3,
                borderRightWidth: 3,
              }}
            />
            <View
              className="absolute border-white/80"
              style={{
                bottom: height * 0.25,
                left: width * 0.15,
                width: 30,
                height: 30,
                borderBottomWidth: 3,
                borderLeftWidth: 3,
              }}
            />
            <View
              className="absolute border-white/80"
              style={{
                bottom: height * 0.25,
                right: width * 0.15,
                width: 30,
                height: 30,
                borderBottomWidth: 3,
                borderRightWidth: 3,
              }}
            />

            <Animated.View
              className="w-12 h-12 justify-center items-center border-2 border-white/80 rounded-full"
              style={{
                transform: [{ scale: crosshairAnimation }],
              }}
            >
              <View className="absolute w-16 h-0.5 bg-white/80" />
              <View className="absolute w-0.5 h-16 bg-white/80" />
            </Animated.View>
          </View>

          <View className="absolute bottom-12 left-0 right-0 flex-row justify-center items-center z-20">
            <Animated.View
              className="w-20 h-20 rounded-full bg-red-500 border-4 border-white justify-center items-center"
              style={{
                transform: [{ scale: captureAnimation }],
                shadowColor: "#ff4757",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.5,
                shadowRadius: 10,
                elevation: 5,
              }}
            >
              <TouchableOpacity
                onPress={handlePhotoCapture}
                className="w-full h-full justify-center items-center rounded-full"
                disabled={!isCameraReady || isCapturing || isUploading}
              >
                <View className="w-15 h-15 bg-white rounded-full" />
              </TouchableOpacity>
            </Animated.View>
          </View>

          <View className="absolute top-0 left-0 right-0 bottom-0 z-10 pointer-events-none">
            <View
              className="absolute bg-white/30"
              style={{ left: "33.33%", top: 0, bottom: 0, width: 1 }}
            />
            <View
              className="absolute bg-white/30"
              style={{ left: "66.66%", top: 0, bottom: 0, width: 1 }}
            />
            <View
              className="absolute bg-white/30"
              style={{ top: "33.33%", left: 0, right: 0, height: 1 }}
            />
            <View
              className="absolute bg-white/30"
              style={{ top: "66.66%", left: 0, right: 0, height: 1 }}
            />
          </View>
        </View>
      </CameraView>
    </View>
  );
};

export default CameraScreen;
