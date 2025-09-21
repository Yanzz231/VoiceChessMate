import { User } from "@supabase/supabase-js";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface HomeHeaderProps {
  user: User | null;
  onSignOut: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({ user, onSignOut }) => {
  const ProfileImage = () => {
    const photoUrl =
      user?.user_metadata?.picture || user?.user_metadata?.avatar_url;
    const userName =
      user?.user_metadata?.name || user?.user_metadata?.full_name || "Guest";

    if (photoUrl) {
      return (
        <Image
          source={{ uri: photoUrl }}
          className="w-10 h-10 rounded-full"
          resizeMode="cover"
        />
      );
    }

    return (
      <View className="w-10 h-10 rounded-full bg-white/20 justify-center items-center">
        <Text className="text-white font-semibold text-lg">
          {userName.charAt(0).toUpperCase()}
        </Text>
      </View>
    );
  };

  return (
    <View className="px-6 pt-10">
      <View className="flex-row justify-between items-center mb-6">
        <View className="flex-row items-center">
          <View className="mr-3">
            <ProfileImage />
          </View>
          <View>
            <Text className="text-white/80 text-sm">
              Hi {user?.user_metadata?.name?.split(" ")[0] || "Guest"}
            </Text>
            <Text className="text-white text-lg font-semibold">Welcome</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={onSignOut}
          className="bg-white/20 px-4 py-2 rounded-xl"
        >
          <Text className="text-white font-medium">Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
