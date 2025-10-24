import { BishopV1 } from "@/components/chess/ChessBishopV1";
import { BishopV2 } from "@/components/chess/ChessBishopV2";
import { BishopV3 } from "@/components/chess/ChessBishopV3";
import { HorseV1 } from "@/components/chess/ChessHorseV1";
import { HorseV2 } from "@/components/chess/ChessHorseV2";
import { HorseV3 } from "@/components/chess/ChessHorseV3";
import { KingV1 } from "@/components/chess/ChessKingV1";
import { KingV2 } from "@/components/chess/ChessKingV2";
import { KingV3 } from "@/components/chess/ChessKingV3";
import { PawnV1 } from "@/components/chess/ChessPawnV1";
import { PawnV2 } from "@/components/chess/ChessPawnV2";
import { PawnV3 } from "@/components/chess/ChessPawnV3";
import { QueenV1 } from "@/components/chess/ChessQueenV1";
import { QueenV2 } from "@/components/chess/ChessQueenV2";
import { QueenV3 } from "@/components/chess/ChessQueenV3";
import { RookV1 } from "@/components/chess/ChessRookV1";
import { RookV2 } from "@/components/chess/ChessRookV2";
import { RookV3 } from "@/components/chess/ChessRookV3";
import { TabBar } from "@/components/home/TabBar";
import { PIECE_THEMES } from "@/constants/chessPieceThemes";
import { CHESS_THEMES } from "@/constants/chessThemes";
import { USER_STORAGE_KEYS } from "@/constants/storageKeys";
import { AccessibilitySizes, WCAGColors } from "@/constants/wcagColors";
import { useAuth } from "@/hooks/useAuth";
import { speak } from "@/utils/speechUtils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Speech from "expo-speech";
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

const UserIcon = ({ size = 24, color = WCAGColors.neutral.gray700 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2" />
    <Path
      d="M6 21V19C6 16.7909 7.79086 15 10 15H14C16.2091 15 18 16.7909 18 19V21"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

const PaletteIcon = ({ size = 24, color = WCAGColors.neutral.gray700 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C13.1 22 14 21.1 14 20C14 19.5 13.82 19.04 13.53 18.69C13.24 18.35 13.08 17.91 13.08 17.43C13.08 16.32 13.98 15.42 15.09 15.42H17C19.76 15.42 22 13.18 22 10.42C22 5.86 17.52 2 12 2Z"
      stroke={color}
      strokeWidth="2"
    />
    <Circle cx="7" cy="10" r="1.5" fill={color} />
    <Circle cx="12" cy="7" r="1.5" fill={color} />
    <Circle cx="17" cy="10" r="1.5" fill={color} />
    <Circle cx="15" cy="14" r="1.5" fill={color} />
  </Svg>
);

const ChessPieceIcon = ({ size = 24, color = WCAGColors.neutral.gray700 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M8 18h8v3H8v-3zM15 6h-2V3h-2v3H9c-1.1 0-2 .9-2 2v4c0 2.8 2.2 5 5 5s5-2.2 5-5V8c0-1.1-.9-2-2-2z"
      stroke={color}
      strokeWidth="2"
      fill={color}
      opacity="0.3"
    />
  </Svg>
);

const VolumeIcon = ({ size = 24, color = WCAGColors.neutral.gray700 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const SpeedIcon = ({ size = 24, color = WCAGColors.neutral.gray700 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20.38 8.57l-1.23 1.85a8 8 0 0 1-.22 7.58H5.07A8 8 0 0 1 15.58 6.85l1.85-1.23A10 10 0 0 0 3.35 19a2 2 0 0 0 1.72 1h13.85a2 2 0 0 0 1.74-1 10 10 0 0 0-.27-10.44z"
      stroke={color}
      strokeWidth="2"
    />
    <Path
      d="M10.59 15.41a2 2 0 0 0 2.83 0l5.66-8.49-8.49 5.66a2 2 0 0 0 0 2.83z"
      fill={color}
    />
  </Svg>
);

const LogoutIcon = ({ size = 24, color = WCAGColors.neutral.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const BackIcon = ({ size = 24, color = WCAGColors.neutral.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 12H5M5 12L12 19M5 12L12 5"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Mini Chess Board Preview Component
const MiniChessBoard = ({ theme }: { theme: any }) => {
  const squareSize = 16;
  const board = [
    [1, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 1, 0, 1],
  ];

  return (
    <View
      style={{
        flexDirection: "column",
        borderRadius: 4,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: WCAGColors.neutral.gray300,
      }}
    >
      {board.map((row, rowIndex) => (
        <View key={rowIndex} style={{ flexDirection: "row" }}>
          {row.map((isLight, colIndex) => (
            <View
              key={colIndex}
              style={{
                width: squareSize,
                height: squareSize,
                backgroundColor: isLight ? theme.lightSquare : theme.darkSquare,
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

type TabType = "settings" | "themes";

const speedLabels = ["0.5x", "0.75x", "1x", "1.25x", "1.5x", "1.75x", "2x"];
const speedValues = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

export default function ProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user, signOut } = useAuth();
  const [voiceModeEnabled, setVoiceModeEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("settings");
  const [selectedTheme, setSelectedTheme] = useState("classic");
  const [selectedPieceTheme, setSelectedPieceTheme] = useState("v1");
  const [ttsSpeed, setTtsSpeed] = useState(1.0);
  const [showWhitePieces, setShowWhitePieces] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      const voiceMode = await AsyncStorage.getItem(
        USER_STORAGE_KEYS.VOICE_MODE
      );
      const theme = await AsyncStorage.getItem("chess_theme");
      const pieceTheme = await AsyncStorage.getItem("chess_piece_theme");
      const speed = await AsyncStorage.getItem("tts_speed");

      setVoiceModeEnabled(voiceMode === "true");
      setSelectedTheme(theme || "classic");
      setSelectedPieceTheme(pieceTheme || "v1");
      setTtsSpeed(speed ? parseFloat(speed) : 1.0);

      if (params.tab === "themes") {
        setActiveTab("themes");
      }

      if (voiceMode === "true") {
        speak("Profile. Manage your account and preferences.");
      }
    };
    loadSettings();
  }, [params.tab]);

  const handleTextPress = (text: string) => {
    if (voiceModeEnabled) {
      speak(text);
    }
  };

  const handleVoiceModeToggle = async (value: boolean) => {
    setVoiceModeEnabled(value);
    await AsyncStorage.setItem(USER_STORAGE_KEYS.VOICE_MODE, value.toString());
    if (value) {
      Speech.speak("Voice mode enabled", { rate: ttsSpeed });
    }
  };

  const handleTtsSpeedChange = async (speed: number) => {
    setTtsSpeed(speed);
    await AsyncStorage.setItem("tts_speed", speed.toString());
    if (voiceModeEnabled) {
      const speedLabel = speedLabels[speedValues.indexOf(speed)];
      Speech.speak(`Speed ${speedLabel}`, { rate: speed });
    }
  };

  const testTtsSpeed = () => {
    Speech.speak("This is a test of the text to speech speed", {
      rate: ttsSpeed,
    });
  };

  const handleThemeSelect = async (themeId: string) => {
    setSelectedTheme(themeId);
    await AsyncStorage.setItem("chess_theme", themeId);
    const themeName =
      CHESS_THEMES.find((t) => t.id === themeId)?.name || themeId;
    if (voiceModeEnabled) {
      Speech.speak(`${themeName} theme selected`, { rate: ttsSpeed });
    }
  };

  const handlePieceThemeSelect = async (version: string) => {
    setSelectedPieceTheme(version);
    await AsyncStorage.setItem("chess_piece_theme", version);
    const themeName =
      PIECE_THEMES.find((t) => t.version === version)?.name || version;
    if (voiceModeEnabled) {
      Speech.speak(`${themeName} piece theme selected`, { rate: ttsSpeed });
    }
  };

  const handleSignOut = async () => {
    if (voiceModeEnabled) {
      Speech.speak("Signing out", { rate: ttsSpeed });
    }
    await signOut();
    router.replace("/login");
  };

  const handleTabPress = (tab: TabType) => {
    setActiveTab(tab);
    if (voiceModeEnabled) {
      Speech.speak(tab === "settings" ? "Settings tab" : "Themes tab", {
        rate: ttsSpeed,
      });
    }
  };

  const handleBottomTabPress = (
    tab: "home" | "play" | "scan" | "analyze" | "profile"
  ) => {
    if (tab !== "profile") {
      switch (tab) {
        case "home":
          router.replace("/home");
          break;
        case "play":
          router.replace("/play");
          break;
        case "scan":
          router.replace("/scan");
          break;
        case "analyze":
          router.replace("/analyze");
          break;
      }
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: WCAGColors.neutral.gray50 }}
    >
      <StatusBar backgroundColor={WCAGColors.primary.yellow} />

      <LinearGradient
        colors={[WCAGColors.primary.yellow, WCAGColors.primary.yellowDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          paddingTop: 56,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              justifyContent: "center",
              alignItems: "center",
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <BackIcon size={24} color={WCAGColors.neutral.white} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleTextPress("Profile")}
            style={{ flex: 1, alignItems: "center", marginHorizontal: 12 }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Profile"
          >
            <Text
              style={{
                fontSize: AccessibilitySizes.text.xxl,
                fontWeight: AccessibilitySizes.fontWeight.bold,
                color: WCAGColors.neutral.white,
                textShadowColor: "rgba(0, 0, 0, 0.1)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
              }}
            >
              Profile
            </Text>
          </TouchableOpacity>

          <View style={{ width: 44 }} />
        </View>

        <View style={{ alignItems: "center", marginBottom: 16 }}>
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: WCAGColors.neutral.white,
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 4,
              borderColor: "rgba(255, 255, 255, 0.5)",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            <UserIcon size={48} color={WCAGColors.primary.yellow} />
          </View>
          <TouchableOpacity
            onPress={() =>
              handleTextPress(user?.email?.split("@")[0] || "User")
            }
            style={{ marginTop: 12 }}
            accessible={true}
            accessibilityRole="button"
          >
            <Text
              style={{
                fontSize: AccessibilitySizes.text.xl,
                fontWeight: AccessibilitySizes.fontWeight.bold,
                color: WCAGColors.neutral.white,
                textShadowColor: "rgba(0, 0, 0, 0.1)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
              }}
            >
              {user?.email?.split("@")[0] || "User"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleTextPress(user?.email || "No email")}
            accessible={true}
            accessibilityRole="button"
          >
            <Text
              style={{
                fontSize: AccessibilitySizes.text.sm,
                color: "rgba(255, 255, 255, 0.9)",
                marginTop: 4,
              }}
            >
              {user?.email || "No email"}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View
        style={{
          flexDirection: "row",
          backgroundColor: WCAGColors.neutral.white,
          marginHorizontal: 16,
          marginTop: -20,
          borderRadius: AccessibilitySizes.radius.lg,
          padding: 4,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <TouchableOpacity
          onPress={() => handleTabPress("settings")}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: AccessibilitySizes.radius.md,
            backgroundColor:
              activeTab === "settings"
                ? WCAGColors.primary.yellow
                : "transparent",
          }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Settings tab"
          accessibilityState={{ selected: activeTab === "settings" }}
        >
          <Text
            style={{
              fontSize: AccessibilitySizes.text.md,
              fontWeight: AccessibilitySizes.fontWeight.bold,
              color:
                activeTab === "settings"
                  ? WCAGColors.neutral.white
                  : WCAGColors.neutral.gray600,
              textAlign: "center",
            }}
          >
            Settings
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleTabPress("themes")}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: AccessibilitySizes.radius.md,
            backgroundColor:
              activeTab === "themes"
                ? WCAGColors.primary.yellow
                : "transparent",
          }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Themes tab"
          accessibilityState={{ selected: activeTab === "themes" }}
        >
          <Text
            style={{
              fontSize: AccessibilitySizes.text.md,
              fontWeight: AccessibilitySizes.fontWeight.bold,
              color:
                activeTab === "themes"
                  ? WCAGColors.neutral.white
                  : WCAGColors.neutral.gray600,
              textAlign: "center",
            }}
          >
            Themes
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 120,
        }}
      >
        {activeTab === "settings" ? (
          <View>
            <View
              style={{
                backgroundColor: WCAGColors.neutral.white,
                borderRadius: AccessibilitySizes.radius.lg,
                padding: 16,
                marginBottom: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <VolumeIcon size={24} color={WCAGColors.primary.yellow} />
                <TouchableOpacity
                  onPress={() => handleTextPress("Voice Mode")}
                  style={{ flex: 1, marginLeft: 12 }}
                  accessible={true}
                  accessibilityRole="button"
                >
                  <Text
                    style={{
                      fontSize: AccessibilitySizes.text.lg,
                      fontWeight: AccessibilitySizes.fontWeight.bold,
                      color: WCAGColors.neutral.gray900,
                    }}
                  >
                    Voice Mode
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() =>
                  handleTextPress(
                    "Enable voice announcements and text-to-speech"
                  )
                }
                accessible={true}
                accessibilityRole="button"
              >
                <Text
                  style={{
                    fontSize: AccessibilitySizes.text.sm,
                    color: WCAGColors.neutral.gray600,
                    marginBottom: 12,
                  }}
                >
                  Enable voice announcements and text-to-speech
                </Text>
              </TouchableOpacity>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: 12,
                  borderTopWidth: 1,
                  borderTopColor: WCAGColors.neutral.gray200,
                }}
              >
                <TouchableOpacity
                  onPress={() =>
                    handleTextPress(
                      voiceModeEnabled
                        ? "Voice mode is on"
                        : "Voice mode is off"
                    )
                  }
                  accessible={true}
                  accessibilityRole="button"
                >
                  <Text
                    style={{
                      fontSize: AccessibilitySizes.text.md,
                      fontWeight: AccessibilitySizes.fontWeight.semibold,
                      color: voiceModeEnabled
                        ? WCAGColors.primary.yellow
                        : WCAGColors.neutral.gray600,
                    }}
                  >
                    {voiceModeEnabled ? "Enabled" : "Disabled"}
                  </Text>
                </TouchableOpacity>
                <Switch
                  value={voiceModeEnabled}
                  onValueChange={handleVoiceModeToggle}
                  trackColor={{
                    false: WCAGColors.neutral.gray300,
                    true: WCAGColors.primary.yellow,
                  }}
                  thumbColor={WCAGColors.neutral.white}
                  accessible={true}
                  accessibilityRole="switch"
                  accessibilityLabel="Voice mode toggle"
                  accessibilityState={{ checked: voiceModeEnabled }}
                />
              </View>
            </View>

            <View
              style={{
                backgroundColor: WCAGColors.neutral.white,
                borderRadius: AccessibilitySizes.radius.lg,
                padding: 16,
                marginBottom: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <SpeedIcon size={24} color={WCAGColors.primary.yellow} />
                <TouchableOpacity
                  onPress={() => handleTextPress("Speech Speed")}
                  style={{ flex: 1, marginLeft: 12 }}
                  accessible={true}
                  accessibilityRole="button"
                >
                  <Text
                    style={{
                      fontSize: AccessibilitySizes.text.lg,
                      fontWeight: AccessibilitySizes.fontWeight.bold,
                      color: WCAGColors.neutral.gray900,
                    }}
                  >
                    Speech Speed
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() =>
                  handleTextPress(
                    "Adjust how fast text-to-speech reads content"
                  )
                }
                accessible={true}
                accessibilityRole="button"
                style={{ marginBottom: 16 }}
              >
                <Text
                  style={{
                    fontSize: AccessibilitySizes.text.sm,
                    color: WCAGColors.neutral.gray600,
                  }}
                >
                  Adjust how fast text-to-speech reads content
                </Text>
              </TouchableOpacity>

              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                {speedValues.map((speed, index) => {
                  const isSelected = Math.abs(ttsSpeed - speed) < 0.01;
                  return (
                    <TouchableOpacity
                      key={speed}
                      onPress={() => handleTtsSpeedChange(speed)}
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: AccessibilitySizes.radius.md,
                        backgroundColor: isSelected
                          ? WCAGColors.primary.yellow
                          : WCAGColors.neutral.gray100,
                        minWidth: 42,
                        alignItems: "center",
                      }}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={`Speed ${speedLabels[index]}`}
                      accessibilityState={{ selected: isSelected }}
                    >
                      <Text
                        style={{
                          fontSize: AccessibilitySizes.text.xs,
                          fontWeight: isSelected
                            ? AccessibilitySizes.fontWeight.bold
                            : AccessibilitySizes.fontWeight.medium,
                          color: isSelected
                            ? WCAGColors.neutral.white
                            : WCAGColors.neutral.gray700,
                        }}
                      >
                        {speedLabels[index]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                onPress={testTtsSpeed}
                style={{
                  backgroundColor: WCAGColors.primary.yellowBg,
                  paddingVertical: 12,
                  borderRadius: AccessibilitySizes.radius.md,
                  marginTop: 8,
                  borderWidth: 2,
                  borderColor: WCAGColors.primary.yellow,
                }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Test speech speed"
              >
                <Text
                  style={{
                    fontSize: AccessibilitySizes.text.sm,
                    fontWeight: AccessibilitySizes.fontWeight.bold,
                    color: WCAGColors.primary.yellowDark,
                    textAlign: "center",
                  }}
                >
                  Test Speed
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleSignOut}
              style={{
                backgroundColor: WCAGColors.semantic.error,
                paddingVertical: 16,
                paddingHorizontal: 20,
                borderRadius: AccessibilitySizes.radius.lg,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: WCAGColors.semantic.error,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Sign out"
            >
              <LogoutIcon size={24} color={WCAGColors.neutral.white} />
              <Text
                style={{
                  color: WCAGColors.neutral.white,
                  fontSize: AccessibilitySizes.text.lg,
                  fontWeight: AccessibilitySizes.fontWeight.bold,
                  marginLeft: 12,
                }}
              >
                Sign Out
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <View
              style={{
                backgroundColor: WCAGColors.neutral.white,
                borderRadius: AccessibilitySizes.radius.lg,
                padding: 16,
                marginBottom: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <PaletteIcon size={24} color={WCAGColors.primary.yellow} />
                <TouchableOpacity
                  onPress={() => handleTextPress("Board Theme")}
                  style={{ flex: 1, marginLeft: 12 }}
                  accessible={true}
                  accessibilityRole="button"
                >
                  <Text
                    style={{
                      fontSize: AccessibilitySizes.text.lg,
                      fontWeight: AccessibilitySizes.fontWeight.bold,
                      color: WCAGColors.neutral.gray900,
                    }}
                  >
                    Board Theme
                  </Text>
                </TouchableOpacity>
              </View>
              {CHESS_THEMES.map((theme) => {
                const isSelected = selectedTheme === theme.id;
                return (
                  <TouchableOpacity
                    key={theme.id}
                    onPress={() => handleThemeSelect(theme.id)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      padding: 12,
                      marginBottom: 8,
                      borderRadius: AccessibilitySizes.radius.md,
                      backgroundColor: isSelected
                        ? WCAGColors.primary.yellowBg
                        : WCAGColors.neutral.gray50,
                      borderWidth: 2,
                      borderColor: isSelected
                        ? WCAGColors.primary.yellow
                        : "transparent",
                    }}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={`${theme.name} theme`}
                    accessibilityState={{ selected: isSelected }}
                  >
                    <View style={{ marginRight: 12 }}>
                      <MiniChessBoard theme={theme} />
                    </View>
                    <Text
                      style={{
                        fontSize: AccessibilitySizes.text.md,
                        fontWeight: isSelected
                          ? AccessibilitySizes.fontWeight.bold
                          : AccessibilitySizes.fontWeight.medium,
                        color: isSelected
                          ? WCAGColors.primary.yellowDark
                          : WCAGColors.neutral.gray900,
                        flex: 1,
                      }}
                    >
                      {theme.name}
                    </Text>
                    {isSelected && (
                      <Svg
                        width={24}
                        height={24}
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <Circle
                          cx="12"
                          cy="12"
                          r="10"
                          fill={WCAGColors.primary.yellow}
                        />
                        <Path
                          d="M8 12l2 2 4-4"
                          stroke={WCAGColors.neutral.white}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </Svg>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <View
              style={{
                backgroundColor: WCAGColors.neutral.white,
                borderRadius: AccessibilitySizes.radius.lg,
                padding: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <ChessPieceIcon size={24} color={WCAGColors.primary.yellow} />
                <TouchableOpacity
                  onPress={() => handleTextPress("Piece Theme")}
                  style={{ flex: 1, marginLeft: 12 }}
                  accessible={true}
                  accessibilityRole="button"
                >
                  <Text
                    style={{
                      fontSize: AccessibilitySizes.text.lg,
                      fontWeight: AccessibilitySizes.fontWeight.bold,
                      color: WCAGColors.neutral.gray900,
                    }}
                  >
                    Piece Theme
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
                <TouchableOpacity
                  onPress={() => {
                    setShowWhitePieces(true);
                    if (voiceModeEnabled) {
                      Speech.speak("White Pieces", { rate: ttsSpeed });
                    }
                  }}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    borderRadius: AccessibilitySizes.radius.md,
                    backgroundColor: showWhitePieces
                      ? WCAGColors.primary.yellow
                      : WCAGColors.neutral.gray100,
                    borderWidth: 2,
                    borderColor: showWhitePieces
                      ? WCAGColors.primary.yellow
                      : WCAGColors.neutral.gray300,
                  }}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Show white pieces"
                >
                  <Text
                    style={{
                      fontSize: AccessibilitySizes.text.md,
                      fontWeight: showWhitePieces
                        ? AccessibilitySizes.fontWeight.bold
                        : AccessibilitySizes.fontWeight.medium,
                      color: showWhitePieces
                        ? WCAGColors.neutral.white
                        : WCAGColors.neutral.gray700,
                      textAlign: "center",
                    }}
                  >
                    White Pieces
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setShowWhitePieces(false);
                    if (voiceModeEnabled) {
                      Speech.speak("Black Pieces", { rate: ttsSpeed });
                    }
                  }}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    borderRadius: AccessibilitySizes.radius.md,
                    backgroundColor: !showWhitePieces
                      ? WCAGColors.primary.yellow
                      : WCAGColors.neutral.gray100,
                    borderWidth: 2,
                    borderColor: !showWhitePieces
                      ? WCAGColors.primary.yellow
                      : WCAGColors.neutral.gray300,
                  }}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Show black pieces"
                >
                  <Text
                    style={{
                      fontSize: AccessibilitySizes.text.md,
                      fontWeight: !showWhitePieces
                        ? AccessibilitySizes.fontWeight.bold
                        : AccessibilitySizes.fontWeight.medium,
                      color: !showWhitePieces
                        ? WCAGColors.neutral.white
                        : WCAGColors.neutral.gray700,
                      textAlign: "center",
                    }}
                  >
                    Black Pieces
                  </Text>
                </TouchableOpacity>
              </View>

              {PIECE_THEMES.map((theme) => {
                const isSelected = selectedPieceTheme === theme.version;

                const PawnComponent =
                  theme.version === "v1"
                    ? PawnV1
                    : theme.version === "v2"
                    ? PawnV2
                    : PawnV3;
                const HorseComponent =
                  theme.version === "v1"
                    ? HorseV1
                    : theme.version === "v2"
                    ? HorseV2
                    : HorseV3;
                const BishopComponent =
                  theme.version === "v1"
                    ? BishopV1
                    : theme.version === "v2"
                    ? BishopV2
                    : BishopV3;
                const RookComponent =
                  theme.version === "v1"
                    ? RookV1
                    : theme.version === "v2"
                    ? RookV2
                    : RookV3;
                const QueenComponent =
                  theme.version === "v1"
                    ? QueenV1
                    : theme.version === "v2"
                    ? QueenV2
                    : QueenV3;
                const KingComponent =
                  theme.version === "v1"
                    ? KingV1
                    : theme.version === "v2"
                    ? KingV2
                    : KingV3;

                const pieceColor = showWhitePieces ? "#FFFFFF" : "#000000";

                return (
                  <TouchableOpacity
                    key={theme.id}
                    onPress={() => handlePieceThemeSelect(theme.version)}
                    style={{
                      padding: 12,
                      marginBottom: 8,
                      borderRadius: AccessibilitySizes.radius.md,
                      backgroundColor: isSelected
                        ? WCAGColors.primary.yellowBg
                        : WCAGColors.neutral.gray50,
                      borderWidth: 2,
                      borderColor: isSelected
                        ? WCAGColors.primary.yellow
                        : "transparent",
                    }}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={`Piece theme ${theme.name}`}
                    accessibilityState={{ selected: isSelected }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: AccessibilitySizes.text.md,
                          fontWeight: isSelected
                            ? AccessibilitySizes.fontWeight.bold
                            : AccessibilitySizes.fontWeight.medium,
                          color: isSelected
                            ? WCAGColors.primary.yellowDark
                            : WCAGColors.neutral.gray900,
                        }}
                      >
                        {theme.name}
                      </Text>
                      {isSelected && (
                        <Svg
                          width={24}
                          height={24}
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <Circle
                            cx="12"
                            cy="12"
                            r="10"
                            fill={WCAGColors.primary.yellow}
                          />
                          <Path
                            d="M8 12l2 2 4-4"
                            stroke={WCAGColors.neutral.white}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </Svg>
                      )}
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-around",
                        paddingVertical: 8,
                        paddingHorizontal: 4,
                        backgroundColor: WCAGColors.neutral.white,
                        borderRadius: AccessibilitySizes.radius.sm,
                      }}
                    >
                      <KingComponent
                        width={28}
                        height={28}
                        color={pieceColor}
                      />
                      <QueenComponent
                        width={28}
                        height={28}
                        color={pieceColor}
                      />
                      <RookComponent
                        width={28}
                        height={28}
                        color={pieceColor}
                      />
                      <BishopComponent
                        width={28}
                        height={28}
                        color={pieceColor}
                      />
                      <HorseComponent
                        width={28}
                        height={28}
                        color={pieceColor}
                      />
                      <PawnComponent
                        width={28}
                        height={28}
                        color={pieceColor}
                      />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      <TabBar activeTab="profile" onTabPress={handleBottomTabPress} />
    </SafeAreaView>
  );
}
