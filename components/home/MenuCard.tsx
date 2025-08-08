import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface MenuCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onPress: () => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({
  icon,
  title,
  description,
  onPress,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100"
    >
      <View className="flex-row items-center">
        <View className="w-12 h-12 rounded-xl justify-center items-center mr-4">
          {icon}
        </View>
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900 mb-1">{title}</Text>
          <Text className="text-sm text-gray-500 leading-5">{description}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
