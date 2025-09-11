import { useGameStorage } from "@/hooks/useGameStorage";
import { useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";
import { MenuCard } from "./MenuCard";

// Icons
import { Ai } from "@/components/icons/Ai";
import { Analyze } from "@/components/icons/Analyze";
import { Lesson } from "@/components/icons/Lesson";
import { Scan } from "@/components/icons/Scan";
import { Setting } from "@/components/icons/Setting";

export const HomeMenuList: React.FC = () => {
  const router = useRouter();
  const { clearGameSession } = useGameStorage();

  const menuItems = [
    {
      id: "play",
      icon: <Ai height={40} width={40} />,
      title: "Play with AI",
      description:
        "Challenge advanced AI opponents with voice-controlled moves",
      onPress: () => {
        router.push("/play");
        clearGameSession();
      },
    },
    {
      id: "scan",
      icon: <Scan height={40} width={40} />,
      title: "Scan",
      description: "Analyze chess positions and get strategic insights",
      onPress: () => {
        router.push("/scan");
      },
    },
    {
      id: "lesson",
      icon: <Lesson height={40} width={40} />,
      title: "Lesson",
      description: "Learn chess through voice-guided tutorials and exercises",
      onPress: () => {
        // TODO: Implement lesson functionality
        console.log("Lesson pressed");
      },
    },
    {
      id: "analyze",
      icon: <Analyze height={40} width={40} />,
      title: "Analyze",
      description: "Review performance and track improvement over time",
      onPress: () => {
        // TODO: Implement analyze functionality
        console.log("Analyze pressed");
      },
    },
    {
      id: "settings",
      icon: <Setting height={40} width={40} />,
      title: "Settings",
      description: "Customize voice commands and game preferences",
      onPress: () => {
        router.push("/settings");
      },
    },
  ];

  return (
    <View className="flex-1 bg-gray-50 rounded-t-[32px] px-6 pt-8">
      {menuItems.map((item) => (
        <MenuCard
          key={item.id}
          icon={item.icon}
          title={item.title}
          description={item.description}
          onPress={item.onPress}
        />
      ))}
    </View>
  );
};
