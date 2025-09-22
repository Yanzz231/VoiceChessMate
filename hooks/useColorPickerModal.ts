import { useState } from "react";

export const useColorPickerModal = () => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorPickerData, setColorPickerData] = useState<{
    title: string;
    message: string;
    fenData: string;
    onSelectColor: (color: "white" | "black") => void;
  } | null>(null);

  const showColorSelection = ({
    title,
    message,
    fenData,
    onSelectColor,
  }: {
    title: string;
    message: string;
    fenData: string;
    onSelectColor: (color: "white" | "black") => void;
  }) => {
    setColorPickerData({
      title,
      message,
      fenData,
      onSelectColor,
    });
    setShowColorPicker(true);
  };

  const hideColorPicker = () => {
    setShowColorPicker(false);
    setColorPickerData(null);
  };

  const handleColorSelect = (color: "white" | "black") => {
    colorPickerData?.onSelectColor(color);
    hideColorPicker();
  };

  return {
    showColorPicker,
    colorPickerData,
    showColorSelection,
    hideColorPicker,
    handleColorSelect,
  };
};
