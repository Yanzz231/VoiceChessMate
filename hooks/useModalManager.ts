import { useState } from "react";

interface ModalData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export const useModalManager = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState<ModalData | null>(null);

  const showConfirmModal = ({
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
  }: ModalData) => {
    setModalData({
      title,
      message,
      confirmText,
      cancelText,
      onConfirm,
      onCancel,
    });
    setShowModal(true);
  };

  const hideModal = () => {
    setShowModal(false);
    setModalData(null);
  };

  const handleConfirm = () => {
    modalData?.onConfirm?.();
    hideModal();
  };

  const handleCancel = () => {
    modalData?.onCancel?.();
    hideModal();
  };

  return {
    showModal,
    modalData,
    showConfirmModal,
    hideModal,
    handleConfirm,
    handleCancel,
  };
};
