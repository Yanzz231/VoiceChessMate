import React from "react";
import { Pressable } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import { WCAGColors } from "@/constants/wcagColors";

interface VoiceNavigationButtonProps {
  isRecording: boolean;
  onLongPress: () => void;
  onPressOut: () => void;
}

export const VoiceNavigationButton: React.FC<VoiceNavigationButtonProps> = ({
  isRecording,
  onLongPress,
  onPressOut,
}) => {
  return (
    <Pressable
      onLongPress={onLongPress}
      onPressOut={onPressOut}
      delayLongPress={3000}
      style={{
        position: "absolute",
        bottom: 100,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: isRecording
          ? WCAGColors.semantic.error
          : WCAGColors.primary.yellow,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 1C11.4477 1 11 1.44772 11 2V11H2C1.44772 11 1 11.4477 1 12C1 12.5523 1.44772 13 2 13H11V22C11 22.5523 11.4477 23 12 23C12.5523 23 13 22.5523 13 22V13H22C22.5523 13 23 12.5523 23 12C23 11.4477 22.5523 11 22 11H13V2C13 1.44772 12.5523 1 12 1Z"
          fill={WCAGColors.neutral.white}
        />
        <Circle cx="12" cy="6" r="2" fill={WCAGColors.neutral.white} />
      </Svg>
    </Pressable>
  );
};
