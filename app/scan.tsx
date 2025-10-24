import { CHESS_STORAGE_KEYS, USER_STORAGE_KEYS } from "@/constants/storageKeys";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { Chess } from "chess.js";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  AppState,
  BackHandler,
  Dimensions,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
} from "react-native";

import { useColorPickerModal } from "@/hooks/useColorPickerModal";
import { useModalManager } from "@/hooks/useModalManager";
import { ScanConfirmModal } from "@/components/scan/ScanConfirmModal";
import { ScanColorPickerModal } from "@/components/scan/ScanColorPickerModal";
import { ExitModal } from "@/components/modals/ExitModal";
import { WCAGColors, AccessibilitySizes } from "@/constants/wcagColors";
import { speak } from "@/utils/speechUtils";

const { width, height } = Dimensions.get("window");

interface ChessBoardAnalysisResponse {
  fen: string;
}

const CameraScreen = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [facing, setFacing] = useState<"back" | "front">("back");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  const [voiceModeEnabled, setVoiceModeEnabled] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [showToast, setShowToast] = useState(false);

  const cameraRef = useRef<CameraView>(null);
  const isProcessingRef = useRef(false);
  const appStateRef = useRef(AppState.currentState);
  const hasSpokenCapturing = useRef(false);
  const hasSpokenAnalyzing = useRef(false);
  const hasSpokenCreating = useRef(false);

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
    hasSpokenCapturing.current = false;
    hasSpokenAnalyzing.current = false;
    hasSpokenCreating.current = false;
  };

  const handleBackPress = () => {
    if (isAnalyzing || isCapturing || isCreatingGame) {
      setShowExitModal(true);
      if (voiceModeEnabled) {
        speak("Do you want to quit scanning?");
      }
      return true;
    }
    return false;
  };

  const handleExitConfirm = () => {
    setShowExitModal(false);
    if (voiceModeEnabled) {
      speak("Returning to home");
    }
    resetAllState();
    router.replace("/home");
  };

  const handleExitCancel = () => {
    setShowExitModal(false);
    if (voiceModeEnabled) {
      speak("Continue scanning");
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      resetAllState();

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        handleBackPress
      );

      return () => {
        resetAllState();
        backHandler.remove();
      };
    }, [isAnalyzing, isCapturing, isCreatingGame])
  );

  useEffect(() => {
    requestPermission();
    startCrosshairAnimation();

    const loadVoiceMode = async () => {
      const voiceMode = await AsyncStorage.getItem(USER_STORAGE_KEYS.VOICE_MODE);
      setVoiceModeEnabled(voiceMode === "true");

      if (voiceMode === "true") {
        setTimeout(() => {
          speak("Chess Board Scanner. Point camera at chess board and tap capture button.");
        }, 500);
      }
    };

    loadVoiceMode();
  }, []);

  const showToastMessage = (message: string, duration: number = 2000) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, duration);
  };

  useEffect(() => {
    if (!voiceModeEnabled) return;

    if (isCapturing && !hasSpokenCapturing.current) {
      speak("Capturing photo");
      hasSpokenCapturing.current = true;
      showToastMessage("Capturing photo...");
    }
  }, [isCapturing, voiceModeEnabled]);

  useEffect(() => {
    if (!voiceModeEnabled) return;

    if (isAnalyzing && !hasSpokenAnalyzing.current) {
      speak("Analyzing chess board");
      hasSpokenAnalyzing.current = true;
      showToastMessage("Analyzing chess board...", 3000);
    }
  }, [isAnalyzing, voiceModeEnabled]);

  useEffect(() => {
    if (!voiceModeEnabled) return;

    if (isCreatingGame && !hasSpokenCreating.current) {
      speak("Creating game");
      hasSpokenCreating.current = true;
      showToastMessage("Creating game...");
    }
  }, [isCreatingGame, voiceModeEnabled]);

  useEffect(() => {
    if (isCapturing) {
      showToastMessage("Capturing photo...");
    } else if (isAnalyzing) {
      showToastMessage("Analyzing chess board...", 3000);
    } else if (isCreatingGame) {
      showToastMessage("Creating game...");
    }
  }, [isCapturing, isAnalyzing, isCreatingGame]);

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
      formData.append("file", {
        uri: imageUri,
        type: "image/jpeg",
        name: "chess_board.jpg",
      } as any);

      const response = await fetch(
        "https://fastapi-production-079a.up.railway.app/occ/detect?force_openai_full=true&fen_only=true",
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
      return data.fen;
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
        params: {
          fromScan: "true",
          fen: fen,
          selectedColor: selectedColor,
        },
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
    const newFacing = facing === "back" ? "front" : "back";
    setFacing(newFacing);
    if (voiceModeEnabled) {
      speak(newFacing === "front" ? "Switching to front camera" : "Switching to back camera");
    }
  };

  const renderConfirmModal = () => {
    if (!showModal || !modalData) return null;
    return (
      <ScanConfirmModal
        visible={showModal}
        title={modalData.title}
        message={modalData.message}
        confirmText={modalData.confirmText || "OK"}
        cancelText={modalData.cancelText}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        voiceModeEnabled={voiceModeEnabled}
      />
    );
  };

  const renderColorPickerModal = () => {
    if (!showColorPicker || !colorPickerData) return null;
    return (
      <ScanColorPickerModal
        visible={showColorPicker}
        title={colorPickerData.title}
        message={colorPickerData.message}
        onSelectColor={handleColorSelect}
        onCancel={hideColorPicker}
        voiceModeEnabled={voiceModeEnabled}
      />
    );
  };

  const isProcessing = isCapturing || isAnalyzing || isCreatingGame;

  if (!permission) {
    return (
      <View style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: WCAGColors.neutral.black,
        paddingHorizontal: 20
      }}>
        <Text style={{
          color: WCAGColors.neutral.white,
          fontSize: AccessibilitySizes.text.lg,
          textAlign: "center"
        }}>
          Requesting camera permission...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: WCAGColors.neutral.black,
        paddingHorizontal: 20
      }}>
        <Ionicons name="camera-outline" size={80} color={WCAGColors.neutral.gray600} />
        <Text style={{
          color: WCAGColors.neutral.white,
          fontSize: AccessibilitySizes.text.lg,
          marginTop: 20,
          marginBottom: 28,
          textAlign: "center"
        }}>
          Camera permission required
        </Text>
        <TouchableOpacity
          onPress={() => {
            if (voiceModeEnabled) {
              speak("Granting camera permission");
            }
            requestPermission();
          }}
          style={{
            backgroundColor: WCAGColors.semantic.error,
            paddingHorizontal: 32,
            paddingVertical: 16,
            borderRadius: AccessibilitySizes.radius.xxl
          }}
        >
          <Text style={{
            color: WCAGColors.neutral.white,
            fontSize: AccessibilitySizes.text.base,
            fontWeight: AccessibilitySizes.fontWeight.semibold
          }}>
            Grant Permission
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: WCAGColors.neutral.black }}>
      <StatusBar style="light" />

      {showToast && (
        <View style={{
          position: "absolute",
          top: 100,
          left: 20,
          right: 20,
          zIndex: 50,
        }}>
          <View style={{
            backgroundColor: WCAGColors.neutral.white,
            padding: 20,
            borderRadius: AccessibilitySizes.radius.lg,
            flexDirection: "row",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 8,
          }}>
            <ActivityIndicator size="small" color={WCAGColors.primary.yellow} />
            <Text style={{
              flex: 1,
              marginLeft: 16,
              fontSize: AccessibilitySizes.text.md,
              fontWeight: AccessibilitySizes.fontWeight.semibold,
              color: WCAGColors.neutral.gray900,
            }}>
              {toastMessage}
            </Text>
          </View>
        </View>
      )}

      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing={facing}
        onCameraReady={() => setIsCameraReady(true)}
      >
        <View style={{ flex: 1, position: "relative" }}>
          <SafeAreaView style={{ zIndex: 20 }}>
            <View style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 20,
              paddingTop: 12,
              paddingBottom: 12,
              gap: 12,
            }}>
              <TouchableOpacity
                onPress={() => {
                  if (isProcessing) {
                    setShowExitModal(true);
                    if (voiceModeEnabled) {
                      speak("Do you want to quit scanning?");
                    }
                  } else {
                    if (voiceModeEnabled) {
                      speak("Returning to home");
                    }
                    router.replace("/home");
                  }
                }}
                style={{
                  width: AccessibilitySizes.minTouchTarget,
                  height: AccessibilitySizes.minTouchTarget,
                  borderRadius: AccessibilitySizes.minTouchTarget / 2,
                  backgroundColor: WCAGColors.primary.yellow,
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: WCAGColors.primary.yellow,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Ionicons name="arrow-back" size={24} color={WCAGColors.neutral.white} />
              </TouchableOpacity>

              <View style={{
                backgroundColor: WCAGColors.primary.yellow,
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 20,
                flexDirection: "row",
                alignItems: "center",
                shadowColor: WCAGColors.primary.yellow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 3,
              }}>
                <Ionicons name="camera" size={18} color={WCAGColors.neutral.white} />
                <Text style={{
                  color: WCAGColors.neutral.white,
                  fontSize: AccessibilitySizes.text.md,
                  fontWeight: "600",
                  marginLeft: 8,
                }}>
                  Chess Board Scanner
                </Text>
              </View>

              <TouchableOpacity
                onPress={switchCamera}
                disabled={isProcessing}
                style={{
                  width: AccessibilitySizes.minTouchTarget,
                  height: AccessibilitySizes.minTouchTarget,
                  borderRadius: AccessibilitySizes.minTouchTarget / 2,
                  backgroundColor: WCAGColors.primary.yellow,
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: WCAGColors.primary.yellow,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Ionicons name="camera-reverse" size={24} color={WCAGColors.neutral.white} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          <View style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: "center",
            justifyContent: "center"
          }}>
            <View
              style={{
                position: "absolute",
                borderColor: "rgba(255, 255, 255, 0.8)",
                top: height * 0.25,
                left: width * 0.15,
                width: 30,
                height: 30,
                borderTopWidth: 3,
                borderLeftWidth: 3,
              }}
            />
            <View
              style={{
                position: "absolute",
                borderColor: "rgba(255, 255, 255, 0.8)",
                top: height * 0.25,
                right: width * 0.15,
                width: 30,
                height: 30,
                borderTopWidth: 3,
                borderRightWidth: 3,
              }}
            />
            <View
              style={{
                position: "absolute",
                borderColor: "rgba(255, 255, 255, 0.8)",
                bottom: height * 0.25,
                left: width * 0.15,
                width: 30,
                height: 30,
                borderBottomWidth: 3,
                borderLeftWidth: 3,
              }}
            />
            <View
              style={{
                position: "absolute",
                borderColor: "rgba(255, 255, 255, 0.8)",
                bottom: height * 0.25,
                right: width * 0.15,
                width: 30,
                height: 30,
                borderBottomWidth: 3,
                borderRightWidth: 3,
              }}
            />

            <Animated.View
              style={{
                width: 48,
                height: 48,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 2,
                borderColor: "rgba(255, 255, 255, 0.8)",
                borderRadius: AccessibilitySizes.radius.full,
                transform: [{ scale: crosshairAnimation }],
              }}
            >
              <View style={{
                position: "absolute",
                width: 64,
                height: 2,
                backgroundColor: "rgba(255, 255, 255, 0.8)"
              }} />
              <View style={{
                position: "absolute",
                width: 2,
                height: 64,
                backgroundColor: "rgba(255, 255, 255, 0.8)"
              }} />
            </Animated.View>
          </View>

          <View style={{
            position: "absolute",
            bottom: 48,
            left: 0,
            right: 0,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 20
          }}>
            <Animated.View
              style={{
                width: 80,
                height: 80,
                borderRadius: AccessibilitySizes.radius.full,
                backgroundColor: WCAGColors.semantic.error,
                borderWidth: 4,
                borderColor: WCAGColors.neutral.white,
                justifyContent: "center",
                alignItems: "center",
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
                style={{
                  width: "100%",
                  height: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: AccessibilitySizes.radius.full
                }}
                disabled={!isCameraReady || isProcessing}
              >
                <View style={{
                  width: 60,
                  height: 60,
                  backgroundColor: WCAGColors.neutral.white,
                  borderRadius: AccessibilitySizes.radius.full
                }} />
              </TouchableOpacity>
            </Animated.View>
          </View>

          <View style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10,
            pointerEvents: "none"
          }}>
            <View
              style={{
                position: "absolute",
                backgroundColor: "rgba(255, 255, 255, 0.3)",
                left: "33.33%",
                top: 0,
                bottom: 0,
                width: 1
              }}
            />
            <View
              style={{
                position: "absolute",
                backgroundColor: "rgba(255, 255, 255, 0.3)",
                left: "66.66%",
                top: 0,
                bottom: 0,
                width: 1
              }}
            />
            <View
              style={{
                position: "absolute",
                backgroundColor: "rgba(255, 255, 255, 0.3)",
                top: "33.33%",
                left: 0,
                right: 0,
                height: 1
              }}
            />
            <View
              style={{
                position: "absolute",
                backgroundColor: "rgba(255, 255, 255, 0.3)",
                top: "66.66%",
                left: 0,
                right: 0,
                height: 1
              }}
            />
          </View>
        </View>
      </CameraView>

      {renderConfirmModal()}
      {renderColorPickerModal()}

      <ExitModal
        visible={showExitModal}
        onConfirm={handleExitConfirm}
        onCancel={handleExitCancel}
      />
    </View>
  );
};

export default CameraScreen;
