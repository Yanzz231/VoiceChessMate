import { useState } from 'react';
import { AlertType } from '@/components/modals/AccessibleAlert';

interface AlertConfig {
  visible: boolean;
  type: AlertType;
  title: string;
  message: string;
  primaryButtonText: string;
  secondaryButtonText?: string;
  onPrimaryPress: () => void;
  onSecondaryPress?: () => void;
}

const defaultConfig: AlertConfig = {
  visible: false,
  type: 'info',
  title: '',
  message: '',
  primaryButtonText: 'OK',
  onPrimaryPress: () => {},
};

export const useAccessibleAlert = () => {
  const [alertConfig, setAlertConfig] = useState<AlertConfig>(defaultConfig);

  const showAlert = (
    type: AlertType,
    title: string,
    message: string,
    options?: {
      primaryButtonText?: string;
      secondaryButtonText?: string;
      onPrimaryPress?: () => void;
      onSecondaryPress?: () => void;
    }
  ) => {
    setAlertConfig({
      visible: true,
      type,
      title,
      message,
      primaryButtonText: options?.primaryButtonText || 'OK',
      secondaryButtonText: options?.secondaryButtonText,
      onPrimaryPress: options?.onPrimaryPress || hideAlert,
      onSecondaryPress: options?.onSecondaryPress,
    });
  };

  const hideAlert = () => {
    setAlertConfig(defaultConfig);
  };

  const showSuccess = (title: string, message: string, onPress?: () => void) => {
    showAlert('success', title, message, {
      primaryButtonText: 'OK',
      onPrimaryPress: onPress || hideAlert,
    });
  };

  const showError = (title: string, message: string, onPress?: () => void) => {
    showAlert('error', title, message, {
      primaryButtonText: 'OK',
      onPrimaryPress: onPress || hideAlert,
    });
  };

  const showWarning = (title: string, message: string, onPress?: () => void) => {
    showAlert('warning', title, message, {
      primaryButtonText: 'OK',
      onPrimaryPress: onPress || hideAlert,
    });
  };

  const showInfo = (title: string, message: string, onPress?: () => void) => {
    showAlert('info', title, message, {
      primaryButtonText: 'OK',
      onPrimaryPress: onPress || hideAlert,
    });
  };

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmText: string = 'Ya',
    cancelText: string = 'Batal'
  ) => {
    showAlert('confirm', title, message, {
      primaryButtonText: confirmText,
      secondaryButtonText: cancelText,
      onPrimaryPress: () => {
        onConfirm();
        hideAlert();
      },
      onSecondaryPress: () => {
        if (onCancel) onCancel();
        hideAlert();
      },
    });
  };

  return {
    alertConfig,
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    hideAlert,
  };
};
