import { GoogleSvg } from "@/components/icons/Google";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface LoginFormProps {
  loading: boolean;
  onSignInPress: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  loading,
  onSignInPress,
}) => {
  return (
    <View className="bg-white rounded-t-3xl px-8 pt-10 pb-12 shadow-2xl">
      <View className="flex-row items-center mb-6">
        <View className="w-20 h-20 rounded-lg  justify-center items-center mr-3">
          <Image
            source={require("../../assets/images/logo.png")}
            style={{ width: 120, height: 100 }}
            resizeMode="contain"
          />
        </View>
        <Text className="text-2xl font-bold text-gray-900">ChessMate</Text>
      </View>

      <Text className="text-lg font-semibold text-gray-900 leading-7 mb-4">
        Rasakan setiap langkah - mainkan catur dengan mudah, hanya menggunakan
        suara Anda
      </Text>

      <Text className="text-sm text-gray-600 leading-6 mb-9">
        Tanpa layar, tanpa gangguan, ucapkan langkah Anda, dan dengarkan
        permainan berlangsung. ChessMate dirancang intuitif dan memberdayakan,
        membuat catur dapat diakses dengan cara yang terasa imersif untuk semua
      </Text>

      <TouchableOpacity
        onPress={onSignInPress}
        disabled={loading}
        className="rounded-xl overflow-hidden shadow-lg"
        style={{ opacity: loading ? 0.6 : 1 }}
      >
        <LinearGradient
          colors={["#6366F1", "#8B5CF6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="py-4 px-5 items-center justify-center flex flex-row gap-4"
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <GoogleSvg height={20} width={20} />
          )}
          <Text className="text-white text-base font-semibold">
            {loading ? "Sedang masuk..." : "Masuk dengan Google"}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};
