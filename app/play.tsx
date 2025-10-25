import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { PieceRenderer } from "@/components/chess/PieceRenderer";
import { DeleteGameModal } from "@/components/modals/DeleteGameModal";

import {
  DEFAULT_PIECE_THEME,
  PIECE_THEMES,
} from "@/constants/chessPieceThemes";
import { CHESS_STORAGE_KEYS, USER_STORAGE_KEYS } from "@/constants/storageKeys";
import { WCAGColors, AccessibilitySizes } from "@/constants/wcagColors";
import { speak } from "@/utils/speechUtils";

type TabType = "quick" | "load";

export default function PlayWithAI() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("quick");
  const [selectedLevel, setSelectedLevel] = useState("medium");
  const [selectedColor, setSelectedColor] = useState<"white" | "black">("white");
  const [loading, setLoading] = useState(false);
  const [currentPieceTheme, setCurrentPieceTheme] = useState(DEFAULT_PIECE_THEME);
  const [savedGames, setSavedGames] = useState<any[]>([]);
  const [voiceModeEnabled, setVoiceModeEnabled] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<{ id: string; name: string } | null>(null);

  const difficultyLevels = [
    { id: "easy", label: "Easy", icon: "leaf-outline" },
    { id: "medium", label: "Medium", icon: "person-outline" },
    { id: "hard", label: "Hard", icon: "flame-outline" },
  ];

  useEffect(() => {
    loadSavedSettings();
    loadPieceTheme();
    loadVoiceMode();
  }, []);

  const loadVoiceMode = async () => {
    try {
      const voiceMode = await AsyncStorage.getItem(USER_STORAGE_KEYS.VOICE_MODE);
      setVoiceModeEnabled(voiceMode === "true");

      if (voiceMode === "true") {
        setTimeout(() => {
          speak("Play with AI. Select difficulty and start a new game.");
        }, 500);
      }
    } catch (error) {
      // Error loading voice mode
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSavedGames();
    }, [])
  );

  const loadSavedGames = async () => {
    try {
      const savedGamesJson = await AsyncStorage.getItem(CHESS_STORAGE_KEYS.SAVED_GAMES);
      if (savedGamesJson) {
        const games = JSON.parse(savedGamesJson);
        // Sort by lastPlayed date, most recent first
        games.sort((a: any, b: any) => new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime());
        setSavedGames(games);
      }
    } catch (error) {
      // Error loading saved games
    }
  };

  const loadSavedSettings = async () => {
    try {
      const savedDifficulty = await AsyncStorage.getItem(CHESS_STORAGE_KEYS.DIFFICULTY);
      const savedColor = await AsyncStorage.getItem(CHESS_STORAGE_KEYS.COLOR);

      if (savedDifficulty) {
        setSelectedLevel(savedDifficulty);
      }
      if (savedColor) {
        setSelectedColor(savedColor as "white" | "black");
      }
    } catch (error) {
      // Error loading settings
    }
  };

  const loadPieceTheme = async () => {
    try {
      const savedPieceThemeId = await AsyncStorage.getItem(CHESS_STORAGE_KEYS.PIECE_THEME);
      if (savedPieceThemeId) {
        const theme = PIECE_THEMES.find((t) => t.id === savedPieceThemeId) || DEFAULT_PIECE_THEME;
        setCurrentPieceTheme(theme);
      }
    } catch (error) {
      // Error loading piece theme
    }
  };

  const saveGameSettings = async () => {
    try {
      await AsyncStorage.setItem(CHESS_STORAGE_KEYS.DIFFICULTY, selectedLevel);
      await AsyncStorage.setItem(CHESS_STORAGE_KEYS.COLOR, selectedColor);
      await AsyncStorage.setItem(CHESS_STORAGE_KEYS.GAME_SESSION, "active");
    } catch (error) {
      // Error saving game settings
    }
  };

  const handleStart = async () => {
    setLoading(true);

    if (voiceModeEnabled) {
      const levelNames: Record<string, string> = {
        easy: "Easy",
        medium: "Medium",
        hard: "Hard"
      };
      speak(`Starting ${levelNames[selectedLevel]} game. Playing as ${selectedColor}.`);
    }

    try {
      const userId = await AsyncStorage.getItem("user_id");

      if (!userId) {
        Alert.alert("Error", "User not found. Please login again.");
        if (voiceModeEnabled) {
          speak("Error: User not found. Please login again.");
        }
        setLoading(false);
        return;
      }

      // Generate unique game ID
      const gameId = `game_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

      await AsyncStorage.setItem("game_id", gameId);
      await saveGameSettings();

      router.push("/chess-game");
      setLoading(false);
    } catch (error) {
      Alert.alert("Error", "Failed to start game. Please try again.");
      if (voiceModeEnabled) {
        speak("Failed to start game. Please try again.");
      }
      setLoading(false);
    }
  };

  const handleLevelSelect = (level: string) => {
    setSelectedLevel(level);
    if (voiceModeEnabled) {
      const levelNames: Record<string, string> = {
        easy: "Easy",
        medium: "Medium",
        hard: "Hard"
      };
      speak(`Difficulty selected: ${levelNames[level]}`);
    }
  };

  const handleLoadGame = async (game: any) => {
    try {
      setLoading(true);

      if (voiceModeEnabled) {
        speak(`Loading ${game.name || "saved game"}`);
      }

      // Update lastPlayed timestamp
      const savedGamesJson = await AsyncStorage.getItem(CHESS_STORAGE_KEYS.SAVED_GAMES);
      if (savedGamesJson) {
        const games = JSON.parse(savedGamesJson);
        const updatedGames = games.map((g: any) =>
          g.id === game.id ? { ...g, lastPlayed: new Date().toISOString() } : g
        );
        await AsyncStorage.setItem(CHESS_STORAGE_KEYS.SAVED_GAMES, JSON.stringify(updatedGames));
      }

      // Set game data to AsyncStorage
      await AsyncStorage.setItem("game_id", game.id);
      await AsyncStorage.setItem(CHESS_STORAGE_KEYS.GAME_FEN, game.fen);
      await AsyncStorage.setItem(CHESS_STORAGE_KEYS.DIFFICULTY, game.difficulty);
      await AsyncStorage.setItem(CHESS_STORAGE_KEYS.COLOR, game.playerColor);
      await AsyncStorage.setItem(CHESS_STORAGE_KEYS.GAME_SESSION, "active");

      // Load game states if available
      if (game.gameStates) {
        await AsyncStorage.setItem(CHESS_STORAGE_KEYS.GAME_STATES, JSON.stringify(game.gameStates));
      }

      router.push("/chess-game");
      setLoading(false);
    } catch (error) {
      Alert.alert("Error", "Failed to load game");
      if (voiceModeEnabled) {
        speak("Failed to load game");
      }
      setLoading(false);
    }
  };

  const handleDeleteGame = (gameId: string, gameName: string) => {
    setGameToDelete({ id: gameId, name: gameName });
    setShowDeleteModal(true);
  };

  const confirmDeleteGame = async () => {
    if (!gameToDelete) return;

    try {
      const savedGamesJson = await AsyncStorage.getItem(CHESS_STORAGE_KEYS.SAVED_GAMES);
      if (savedGamesJson) {
        const games = JSON.parse(savedGamesJson);
        const updatedGames = games.filter((g: any) => g.id !== gameToDelete.id);
        await AsyncStorage.setItem(CHESS_STORAGE_KEYS.SAVED_GAMES, JSON.stringify(updatedGames));
        setSavedGames(updatedGames);

        if (voiceModeEnabled) {
          speak("Game deleted successfully");
        }
      }

      setShowDeleteModal(false);
      setGameToDelete(null);
    } catch (error) {
      if (voiceModeEnabled) {
        speak("Failed to delete game");
      }
      setShowDeleteModal(false);
      setGameToDelete(null);
    }
  };

  const handleColorSelect = (color: "white" | "black") => {
    setSelectedColor(color);
    if (voiceModeEnabled) {
      speak(`Playing as ${color}`);
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleSettingsPress = () => {
    router.push("/profile");
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: WCAGColors.neutral.gray50 }}>
        <StatusBar style="dark" />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={WCAGColors.primary.yellow} />
          <Text style={{
            fontSize: AccessibilitySizes.text.lg,
            color: WCAGColors.neutral.gray700,
            marginTop: 16,
          }}>
            Creating game...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: WCAGColors.neutral.white }}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={{
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: WCAGColors.neutral.gray100,
      }}>
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <TouchableOpacity
            onPress={() => {
              if (voiceModeEnabled) {
                speak("Going back");
              }
              handleBackPress();
            }}
            style={{
              width: AccessibilitySizes.minTouchTarget,
              height: AccessibilitySizes.minTouchTarget,
              borderRadius: AccessibilitySizes.minTouchTarget / 2,
              backgroundColor: WCAGColors.primary.yellow,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="arrow-back" size={24} color={WCAGColors.neutral.white} />
          </TouchableOpacity>
          <Text style={{
            fontSize: AccessibilitySizes.text.xl,
            fontWeight: AccessibilitySizes.fontWeight.bold,
            color: WCAGColors.neutral.gray900,
          }}>
            Play Chess
          </Text>
          <TouchableOpacity
            onPress={handleSettingsPress}
            style={{
              width: AccessibilitySizes.minTouchTarget,
              height: AccessibilitySizes.minTouchTarget,
              borderRadius: AccessibilitySizes.minTouchTarget / 2,
              backgroundColor: WCAGColors.neutral.gray100,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="settings-outline" size={24} color={WCAGColors.neutral.gray900} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={{
        flexDirection: "row",
        paddingHorizontal: 20,
        paddingTop: 16,
        gap: 8,
      }}>
        <TouchableOpacity
          onPress={() => {
            setActiveTab("quick");
            if (voiceModeEnabled) {
              speak("Quick Play tab");
            }
          }}
          style={{
            flex: 1,
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: AccessibilitySizes.radius.lg,
            backgroundColor: activeTab === "quick"
              ? WCAGColors.primary.yellow
              : WCAGColors.neutral.gray100,
          }}
        >
          <Text style={{
            fontSize: AccessibilitySizes.text.md,
            fontWeight: AccessibilitySizes.fontWeight.semibold,
            color: activeTab === "quick"
              ? WCAGColors.neutral.white
              : WCAGColors.neutral.gray600,
            textAlign: "center",
          }}>
            Quick Play
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setActiveTab("load");
            if (voiceModeEnabled) {
              speak(`Load Game tab. ${savedGames.length} saved games available.`);
            }
          }}
          style={{
            flex: 1,
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: AccessibilitySizes.radius.lg,
            backgroundColor: activeTab === "load"
              ? WCAGColors.primary.yellow
              : WCAGColors.neutral.gray100,
          }}
        >
          <Text style={{
            fontSize: AccessibilitySizes.text.md,
            fontWeight: AccessibilitySizes.fontWeight.semibold,
            color: activeTab === "load"
              ? WCAGColors.neutral.white
              : WCAGColors.neutral.gray600,
            textAlign: "center",
          }}>
            Load Game
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Play Tab */}
        {activeTab === "quick" && (
          <View>
            {/* Welcome Message */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                if (voiceModeEnabled) {
                  speak("Quick Start. Jump right into a game with default settings. Perfect for a quick match!");
                }
              }}
              style={{
                backgroundColor: WCAGColors.primary.yellowBg,
                padding: 20,
                borderRadius: AccessibilitySizes.radius.lg,
                marginBottom: 24,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                <Ionicons name="flash" size={20} color={WCAGColors.primary.yellowDark} />
                <Text style={{
                  fontSize: AccessibilitySizes.text.sm,
                  fontWeight: AccessibilitySizes.fontWeight.bold,
                  color: WCAGColors.primary.yellowDark,
                  marginLeft: 8,
                  textTransform: "uppercase",
                }}>
                  Quick Start
                </Text>
              </View>
              <Text style={{
                fontSize: AccessibilitySizes.text.base,
                color: WCAGColors.neutral.gray700,
                lineHeight: 24,
              }}>
                Jump right into a game with default settings. Perfect for a quick match!
              </Text>
            </TouchableOpacity>

            {/* Difficulty Selection */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                if (voiceModeEnabled) {
                  speak("Select Difficulty");
                }
              }}
            >
              <Text style={{
                fontSize: AccessibilitySizes.text.lg,
                fontWeight: AccessibilitySizes.fontWeight.bold,
                color: WCAGColors.neutral.gray900,
                marginBottom: 12,
              }}>
                Select Difficulty
              </Text>
            </TouchableOpacity>
            <View style={{ gap: 12, marginBottom: 24 }}>
              {difficultyLevels.map((level) => (
                <TouchableOpacity
                  key={level.id}
                  onPress={() => handleLevelSelect(level.id)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 16,
                    borderRadius: AccessibilitySizes.radius.md,
                    borderWidth: 2,
                    borderColor: selectedLevel === level.id
                      ? WCAGColors.primary.yellow
                      : WCAGColors.neutral.gray200,
                    backgroundColor: selectedLevel === level.id
                      ? WCAGColors.primary.yellowBg
                      : WCAGColors.neutral.white,
                  }}
                >
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: selectedLevel === level.id
                      ? WCAGColors.primary.yellow
                      : WCAGColors.neutral.gray100,
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 12,
                  }}>
                    <Ionicons
                      name={level.icon as any}
                      size={24}
                      color={selectedLevel === level.id
                        ? WCAGColors.neutral.white
                        : WCAGColors.neutral.gray600
                      }
                    />
                  </View>
                  <Text style={{
                    flex: 1,
                    fontSize: AccessibilitySizes.text.lg,
                    fontWeight: AccessibilitySizes.fontWeight.semibold,
                    color: selectedLevel === level.id
                      ? WCAGColors.neutral.gray900
                      : WCAGColors.neutral.gray700,
                  }}>
                    {level.label}
                  </Text>
                  {selectedLevel === level.id && (
                    <Ionicons name="checkmark-circle" size={24} color={WCAGColors.primary.yellow} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Color Selection */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                if (voiceModeEnabled) {
                  speak("Choose Your Color");
                }
              }}
            >
              <Text style={{
                fontSize: AccessibilitySizes.text.lg,
                fontWeight: AccessibilitySizes.fontWeight.bold,
                color: WCAGColors.neutral.gray900,
                marginBottom: 12,
              }}>
                Choose Your Color
              </Text>
            </TouchableOpacity>
            <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
              <TouchableOpacity
                onPress={() => handleColorSelect("white")}
                style={{
                  flex: 1,
                  padding: 20,
                  borderRadius: AccessibilitySizes.radius.md,
                  borderWidth: 2,
                  borderColor: selectedColor === "white"
                    ? WCAGColors.primary.yellow
                    : WCAGColors.neutral.gray200,
                  backgroundColor: selectedColor === "white"
                    ? WCAGColors.primary.yellowBg
                    : WCAGColors.neutral.white,
                  alignItems: "center",
                }}
              >
                <PieceRenderer
                  type="k"
                  color="w"
                  theme={currentPieceTheme.version}
                  size={48}
                />
                <Text style={{
                  fontSize: AccessibilitySizes.text.md,
                  fontWeight: AccessibilitySizes.fontWeight.semibold,
                  color: WCAGColors.neutral.gray900,
                  marginTop: 8,
                }}>
                  White
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleColorSelect("black")}
                style={{
                  flex: 1,
                  padding: 20,
                  borderRadius: AccessibilitySizes.radius.md,
                  borderWidth: 2,
                  borderColor: selectedColor === "black"
                    ? WCAGColors.primary.yellow
                    : WCAGColors.neutral.gray200,
                  backgroundColor: selectedColor === "black"
                    ? WCAGColors.primary.yellowBg
                    : WCAGColors.neutral.white,
                  alignItems: "center",
                }}
              >
                <PieceRenderer
                  type="k"
                  color="b"
                  theme={currentPieceTheme.version}
                  size={48}
                />
                <Text style={{
                  fontSize: AccessibilitySizes.text.md,
                  fontWeight: AccessibilitySizes.fontWeight.semibold,
                  color: WCAGColors.neutral.gray900,
                  marginTop: 8,
                }}>
                  Black
                </Text>
              </TouchableOpacity>
            </View>

            {/* Auto-Save Info */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                if (voiceModeEnabled) {
                  speak("Auto-Save Enabled. Your game progress will be automatically saved. You can continue from where you left off anytime from the Load Game tab.");
                }
              }}
              style={{
                backgroundColor: WCAGColors.semantic.infoBg,
                padding: 16,
                borderRadius: AccessibilitySizes.radius.md,
                borderLeftWidth: 4,
                borderLeftColor: WCAGColors.semantic.info,
                marginTop: 24,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                <Ionicons
                  name="information-circle"
                  size={24}
                  color={WCAGColors.semantic.info}
                  style={{ marginRight: 12, marginTop: 2 }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: AccessibilitySizes.text.base,
                      fontWeight: AccessibilitySizes.fontWeight.semibold,
                      color: WCAGColors.semantic.info,
                      marginBottom: 4,
                    }}
                  >
                    Auto-Save Enabled
                  </Text>
                  <Text
                    style={{
                      fontSize: AccessibilitySizes.text.sm,
                      color: WCAGColors.neutral.gray700,
                      lineHeight: 20,
                    }}
                  >
                    Your game progress will be automatically saved. You can continue from where you left off anytime from the Load Game tab.
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Load Game Tab */}
        {activeTab === "load" && (
          <View>
            {savedGames.length === 0 ? (
              <View style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                paddingVertical: 60,
              }}>
                <Ionicons name="folder-open-outline" size={64} color={WCAGColors.neutral.gray400} />
                <Text style={{
                  fontSize: AccessibilitySizes.text.lg,
                  fontWeight: AccessibilitySizes.fontWeight.semibold,
                  color: WCAGColors.neutral.gray600,
                  marginTop: 16,
                }}>
                  No Saved Games
                </Text>
                <Text style={{
                  fontSize: AccessibilitySizes.text.md,
                  color: WCAGColors.neutral.gray600,
                  marginTop: 8,
                  textAlign: "center",
                }}>
                  Your saved games will appear here
                </Text>
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                {savedGames.map((game, index) => (
                  <View
                    key={game.id || index}
                    style={{
                      backgroundColor: WCAGColors.neutral.white,
                      borderRadius: AccessibilitySizes.radius.md,
                      borderWidth: 2,
                      borderColor: WCAGColors.neutral.gray200,
                      padding: 16,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => handleLoadGame(game)}
                      style={{ flex: 1 }}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                        <View style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: WCAGColors.primary.yellowBg,
                          justifyContent: "center",
                          alignItems: "center",
                          marginRight: 12,
                        }}>
                          <Ionicons name="game-controller-outline" size={24} color={WCAGColors.primary.yellow} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{
                            fontSize: AccessibilitySizes.text.lg,
                            fontWeight: AccessibilitySizes.fontWeight.bold,
                            color: WCAGColors.neutral.gray900,
                          }}>
                            {game.name || `Game ${index + 1}`}
                          </Text>
                          <Text style={{
                            fontSize: AccessibilitySizes.text.sm,
                            color: WCAGColors.neutral.gray600,
                          }}>
                            {game.difficulty ? `${game.difficulty.charAt(0).toUpperCase() + game.difficulty.slice(1)} • ` : ""}{game.playerColor === "white" ? "Playing as White" : "Playing as Black"}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color={WCAGColors.neutral.gray400} />
                      </View>
                      {game.lastPlayed && (
                        <Text style={{
                          fontSize: AccessibilitySizes.text.xs,
                          color: WCAGColors.neutral.gray600,
                        }}>
                          Last played: {new Date(game.lastPlayed).toLocaleDateString()} at {new Date(game.lastPlayed).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleDeleteGame(game.id, game.name || `Game ${index + 1}`)}
                      style={{
                        marginTop: 12,
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        backgroundColor: WCAGColors.semantic.errorBg,
                        borderRadius: AccessibilitySizes.radius.md,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        borderWidth: 1,
                        borderColor: WCAGColors.semantic.error,
                      }}
                    >
                      <Ionicons name="trash-outline" size={18} color={WCAGColors.semantic.error} />
                      <Text style={{
                        fontSize: AccessibilitySizes.text.sm,
                        fontWeight: AccessibilitySizes.fontWeight.semibold,
                        color: WCAGColors.semantic.error,
                        marginLeft: 8,
                      }}>
                        Delete Game
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Start Button */}
      {activeTab === "quick" && (
        <View style={{
          padding: 20,
          paddingBottom: 24,
          borderTopWidth: 1,
          borderTopColor: WCAGColors.neutral.gray100,
          backgroundColor: WCAGColors.neutral.white,
        }}>
          <TouchableOpacity
            onPress={handleStart}
            disabled={loading}
            style={{
              backgroundColor: WCAGColors.primary.yellow,
              paddingVertical: 16,
              borderRadius: AccessibilitySizes.radius.md,
              shadowColor: WCAGColors.primary.yellow,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text style={{
              color: WCAGColors.neutral.white,
              fontSize: AccessibilitySizes.text.lg,
              fontWeight: AccessibilitySizes.fontWeight.bold,
              textAlign: "center",
            }}>
              {loading ? "Creating game..." : "Start Game"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Delete Game Modal */}
      <DeleteGameModal
        visible={showDeleteModal}
        gameName={gameToDelete?.name || "this game"}
        voiceModeEnabled={voiceModeEnabled}
        onClose={() => {
          setShowDeleteModal(false);
          setGameToDelete(null);
        }}
        onConfirm={confirmDeleteGame}
        onTextPress={(text) => voiceModeEnabled && speak(text)}
      />
    </SafeAreaView>
  );
}
