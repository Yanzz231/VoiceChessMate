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
  Alert,
  Animated,
  AppState,
  Dimensions,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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

  const createGameFromFEN = async (fen: string) => {
    try {
      setIsCreatingGame(true);

      const chess = new Chess();
      try {
        console.log(fen);
        chess.load(fen);
      } catch (fenError) {
        Alert.alert(
          "Invalid Position",
          "The scanned chess position is not valid. Please try scanning again."
        );
        return;
      }

      if (chess.isGameOver()) {
        Alert.alert(
          "Game Over Position",
          "This chess position appears to be a completed game. Please scan an active game position."
        );
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
        [CHESS_STORAGE_KEYS.COLOR, "white"],
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
      Alert.alert(
        "Error",
        "Failed to create game from scanned position. Please try again."
      );
    } finally {
      setIsCreatingGame(false);
    }
  };

  const handlePhotoCapture = async () => {
    if (!cameraRef?.current || isProcessingRef.current || !isFocused) {
      return;
    }

    if (typeof cameraRef.current.takePictureAsync !== "function") {
      Alert.alert("Error", "Camera not ready");
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

            Alert.alert(
              "Chess Board Detected!",
              "Board position has been analyzed successfully. Start a game with this position?",
              [
                {
                  text: "Retake",
                  style: "cancel",
                  onPress: resetAllState,
                },
                {
                  text: "Start Game",
                  onPress: () => createGameFromFEN(fenString),
                },
              ]
            );
          } else {
            throw new Error("No FEN data received");
          }
        } catch (analysisError) {
          setIsAnalyzing(false);
          Alert.alert(
            "Analysis Failed",
            "Could not analyze the chess board. Please ensure the board is clearly visible and try again.",
            [
              {
                text: "Try Again",
                onPress: resetAllState,
              },
            ]
          );
        }
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
            <Text className="mt-2 text-gray-500">
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
    </View>
  );
};

export default CameraScreen;
