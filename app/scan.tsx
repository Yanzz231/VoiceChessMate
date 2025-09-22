import { CHESS_STORAGE_KEYS } from "@/constants/storageKeys";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { Chess } from "chess.js";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  AppState,
  Dimensions,
  Modal,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useColorPickerModal } from "@/hooks/useColorPickerModal";
import { useModalManager } from "@/hooks/useModalManager";

const { width, height } = Dimensions.get("window");

interface ChessBoardAnalysisResponse {
  data: string;
}

const CameraScreen = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [facing, setFacing] = useState<"back" | "front">("back");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCreatingGame, setIsCreatingGame] = useState(false);

  const cameraRef = useRef<CameraView>(null);
  const isProcessingRef = useRef(false);
  const appStateRef = useRef(AppState.currentState);

  const flashAnimation = useRef(new Animated.Value(0)).current;
  const crosshairAnimation = useRef(new Animated.Value(1)).current;
  const captureAnimation = useRef(new Animated.Value(1)).current;

  const isFocused = useIsFocused();

  const {
    showModal,
    modalData,
    showConfirmModal,
    hideModal,
    handleConfirm,
    handleCancel,
  } = useModalManager();
  const {
    showColorPicker,
    colorPickerData,
    showColorSelection,
    hideColorPicker,
    handleColorSelect,
  } = useColorPickerModal();

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
    setIsAnalyzing(false);
    setIsCreatingGame(false);
    isProcessingRef.current = false;
  };

  useFocusEffect(
    React.useCallback(() => {
      resetAllState();
      return () => resetAllState();
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

  const analyzeBoardImage = async (
    imageUri: string
  ): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append("image", {
        uri: imageUri,
        type: "image/jpeg",
        name: "chess_board.jpg",
      } as any);

      const response = await fetch(
        "https://voicechessmatebe-production.up.railway.app/api/analysis/fen-from-image",
        {
          method: "POST",
          headers: {
            "Content-Type": "multipart/form-data",
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ChessBoardAnalysisResponse = await response.json();
      return data.data;
    } catch (error) {
      throw error;
    }
  };

  const createGameFromFEN = async (
    fen: string,
    selectedColor: "white" | "black"
  ) => {
    try {
      setIsCreatingGame(true);

      const chess = new Chess();
      try {
        chess.load(fen);
      } catch (fenError) {
        showConfirmModal({
          title: "Invalid Position",
          message:
            "The scanned chess position is not valid. Please try scanning again.",
          confirmText: "OK",
          onConfirm: resetAllState,
        });
        return;
      }

      if (chess.isGameOver()) {
        showConfirmModal({
          title: "Game Over Position",
          message:
            "This chess position appears to be a completed game. Please scan an active game position.",
          confirmText: "OK",
          onConfirm: resetAllState,
        });
        return;
      }

      const userId = await AsyncStorage.getItem("user_id");
      if (!userId) {
        await AsyncStorage.setItem("user_id", "temp_user_" + Date.now());
      }

      const gameId = "scanned_game_" + Date.now();

      await AsyncStorage.multiSet([
        ["game_id", gameId],
        [CHESS_STORAGE_KEYS.GAME_FEN, fen],
        [CHESS_STORAGE_KEYS.DIFFICULTY, "medium"],
        [CHESS_STORAGE_KEYS.COLOR, selectedColor],
        [CHESS_STORAGE_KEYS.GAME_SESSION, "active"],
      ]);

      const initialGameState = {
        fen: fen,
        moveHistory: chess.history(),
        timestamp: Date.now(),
        moveNumber: chess.history().length,
        turn: chess.turn(),
      };

      await AsyncStorage.setItem(
        CHESS_STORAGE_KEYS.GAME_STATES,
        JSON.stringify([initialGameState])
      );

      router.push({
        pathname: "/chess-game",
        params: { fromScan: "true", fen: fen },
      });
    } catch (error) {
      showConfirmModal({
        title: "Error",
        message:
          "Failed to create game from scanned position. Please try again.",
        confirmText: "OK",
        onConfirm: resetAllState,
      });
    } finally {
      setIsCreatingGame(false);
    }
  };

  const handlePhotoCapture = async () => {
    if (!cameraRef?.current || isProcessingRef.current || !isFocused) {
      return;
    }

    if (typeof cameraRef.current.takePictureAsync !== "function") {
      showConfirmModal({
        title: "Error",
        message: "Camera not ready. Please wait a moment and try again.",
        confirmText: "OK",
      });
      return;
    }

    try {
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

      if (photo?.uri) {
        try {
          await MediaLibrary.saveToLibraryAsync(photo.uri);
        } catch (mediaError) {}

        setIsCapturing(false);
        setIsAnalyzing(true);

        try {
          const fenString = await analyzeBoardImage(photo.uri);

          if (fenString) {
            setIsAnalyzing(false);

            showColorSelection({
              title: "Chess Board Detected!",
              message:
                "Board position has been analyzed successfully. Choose your color:",
              fenData: fenString,
              onSelectColor: (color) => createGameFromFEN(fenString, color),
            });
          } else {
            throw new Error("No FEN data received");
          }
        } catch (analysisError) {
          setIsAnalyzing(false);
          showConfirmModal({
            title: "Analysis Failed",
            message:
              "Could not analyze the chess board. Please ensure the board is clearly visible and try again.",
            confirmText: "Try Again",
            onConfirm: resetAllState,
          });
        }
      } else {
        showConfirmModal({
          title: "Error",
          message: "Failed to capture image. Please try again.",
          confirmText: "OK",
          onConfirm: resetAllState,
        });
        setIsCapturing(false);
      }
    } catch (error) {
      showConfirmModal({
        title: "Error",
        message: "Failed to capture photo. Please try again.",
        confirmText: "OK",
        onConfirm: resetAllState,
      });
      setIsCapturing(false);
    } finally {
      isProcessingRef.current = false;
    }
  };

  const switchCamera = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const renderConfirmModal = () => {
    if (!showModal || !modalData) return null;

    return (
      <Modal visible={showModal} transparent={true} animationType="fade">
        <View className="flex-1 bg-black/70 justify-center items-center">
          <View className="bg-white rounded-3xl mx-6 p-6 shadow-2xl max-w-sm w-full">
            <Text className="text-xl font-bold text-gray-800 text-center mb-2">
              {modalData.title}
            </Text>
            <Text className="text-base text-gray-600 text-center mb-6 leading-relaxed">
              {modalData.message}
            </Text>
            <View className="gap-3">
              {modalData.onConfirm && (
                <TouchableOpacity
                  onPress={handleConfirm}
                  className={`py-4 rounded-2xl shadow-lg ${
                    modalData.title === "Error" ||
                    modalData.title === "Analysis Failed"
                      ? "bg-red-600 active:bg-red-700"
                      : "bg-indigo-600 active:bg-indigo-700"
                  }`}
                >
                  <Text className="text-white text-lg font-semibold text-center">
                    {modalData.confirmText}
                  </Text>
                </TouchableOpacity>
              )}
              {modalData.onCancel && modalData.cancelText && (
                <TouchableOpacity
                  onPress={handleCancel}
                  className="bg-gray-100 py-4 rounded-2xl active:bg-gray-200"
                >
                  <Text className="text-gray-700 text-lg font-medium text-center">
                    {modalData.cancelText}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderColorPickerModal = () => {
    if (!showColorPicker || !colorPickerData) return null;

    return (
      <Modal visible={showColorPicker} transparent={true} animationType="fade">
        <View className="flex-1 bg-black/70 justify-center items-center">
          <View className="bg-white rounded-3xl mx-6 p-6 shadow-2xl max-w-sm w-full">
            <Text className="text-xl font-bold text-gray-800 text-center mb-2">
              {colorPickerData.title}
            </Text>
            <Text className="text-base text-gray-600 text-center mb-6 leading-relaxed">
              {colorPickerData.message}
            </Text>

            <View className="gap-3 mb-4">
              <TouchableOpacity
                onPress={() => handleColorSelect("white")}
                className="bg-white border-2 border-gray-300 py-6 rounded-2xl shadow-sm active:bg-gray-50 flex-row items-center justify-center"
              >
                <View className="w-8 h-8 bg-white border-2 border-gray-400 rounded-full mr-3" />
                <Text className="text-gray-800 text-lg font-semibold">
                  Play as White
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleColorSelect("black")}
                className="bg-gray-800 py-6 rounded-2xl shadow-lg active:bg-gray-900 flex-row items-center justify-center"
              >
                <View className="w-8 h-8 bg-gray-800 border-2 border-gray-600 rounded-full mr-3" />
                <Text className="text-white text-lg font-semibold">
                  Play as Black
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={hideColorPicker}
              className="bg-gray-100 py-3 rounded-2xl active:bg-gray-200"
            >
              <Text className="text-gray-700 text-base font-medium text-center">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const isProcessing = isCapturing || isAnalyzing || isCreatingGame;

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

      {isProcessing && (
        <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/75 justify-center items-center z-50">
          <View className="bg-white p-6 rounded-xl items-center">
            <ActivityIndicator size="large" color="#ff4757" />
            <Text className="mt-4 text-lg font-medium text-black">
              {isCapturing && "Capturing photo..."}
              {isAnalyzing && "Analyzing chess board..."}
              {isCreatingGame && "Creating game..."}
            </Text>
            <Text className="mt-2 text-gray-500 text-center">
              {isCapturing && "Please wait while we capture the image"}
              {isAnalyzing && "Detecting pieces and board position"}
              {isCreatingGame && "Setting up your chess game"}
            </Text>
          </View>
        </View>
      )}

      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing={facing}
        flash={isFlashOn ? "on" : "off"}
        onCameraReady={() => setIsCameraReady(true)}
      >
        <View className="flex-1 relative">
          <View className="absolute top-12 left-0 right-0 items-center z-20">
            <View className="bg-black/50 px-5 py-2.5 rounded-2xl flex-row items-center">
              <Ionicons name="camera" size={16} color="#fff" />
              <Text className="text-white text-sm font-medium ml-2">
                Chess Board Scanner
              </Text>
            </View>
          </View>

          <View className="absolute top-12 right-5 z-20">
            <TouchableOpacity
              onPress={switchCamera}
              className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/50 justify-center items-center"
              disabled={isProcessing}
            >
              <Ionicons name="camera-reverse" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <View className="absolute inset-0 flex items-center justify-center">
            {/* Top Left Corner */}
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
            {/* Top Right Corner */}
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
            {/* Bottom Left Corner */}
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
            {/* Bottom Right Corner */}
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
                disabled={!isCameraReady || isProcessing}
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

      {renderConfirmModal()}
      {renderColorPickerModal()}
    </View>
  );
};

export default CameraScreen;
