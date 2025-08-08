import { CampSvg } from "@/components/icons/Camp";
import React from "react";
import { View } from "react-native";

export const LoginHeader: React.FC = () => {
  return (
    <View className="flex-[0.6] justify-center items-center pt-24">
      <View className="w-64 h-64 justify-center items-center shadow-xl pt-0.5">
        <CampSvg height={350} width={350} />
      </View>
    </View>
  );
};
