import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";

interface ExitConfirmationModalProps {
  visible: boolean;
  appName: string;
  onStayHere: () => void;
  onExit: () => void;
}

export const ExitConfirmationModal: React.FC<ExitConfirmationModalProps> = ({
  visible,
  appName,
  onStayHere,
  onExit,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onStayHere}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-8">
        <View className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
          {/* Header */}
          <View className="mb-6">
            <Text className="text-xl font-bold text-gray-900 text-center mb-2">
              Exit {appName}
            </Text>
            <Text className="text-base text-gray-600 text-center leading-relaxed">
              Are you sure you want to close the {appName} app?
            </Text>
          </View>

          <View className="gap-3">
            <TouchableOpacity
              onPress={onExit}
              className="bg-red-600 py-4 rounded-2xl shadow-lg active:bg-red-700"
            >
              <Text className="text-white text-lg font-semibold text-center">
                Yes, Exit
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onStayHere}
              className="bg-gray-100 py-4 rounded-2xl active:bg-gray-200"
            >
              <Text className="text-gray-700 text-lg font-medium text-center">
                Stay Here
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
