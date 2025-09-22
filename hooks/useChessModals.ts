import { useState } from "react";

export const useChessModals = () => {
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [showBackModal, setShowBackModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [hintMessage, setHintMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [gameOverData, setGameOverData] = useState<{
    type: "checkmate" | "stalemate" | "draw";
    winner?: string;
    message: string;
  } | null>(null);

  const showHint = (message: string) => {
    setHintMessage(message);
    setShowHintModal(true);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setShowErrorModal(true);
  };

  const showGameOver = (data: {
    type: "checkmate" | "stalemate" | "draw";
    winner?: string;
    message: string;
  }) => {
    setGameOverData(data);
    setTimeout(() => {
      setShowGameOverModal(true);
    }, 1000);
  };

  const closeAllModals = () => {
    setShowWelcomePopup(false);
    setShowQuitModal(false);
    setShowBackModal(false);
    setShowSettingsModal(false);
    setShowOptionsModal(false);
    setShowHintModal(false);
    setShowErrorModal(false);
    setShowGameOverModal(false);
  };

  const isAnyModalOpen = () => {
    return (
      showWelcomePopup ||
      showQuitModal ||
      showBackModal ||
      showSettingsModal ||
      showOptionsModal ||
      showHintModal ||
      showErrorModal ||
      showGameOverModal
    );
  };

  return {
    showWelcomePopup,
    setShowWelcomePopup,
    showQuitModal,
    setShowQuitModal,
    showBackModal,
    setShowBackModal,
    showSettingsModal,
    setShowSettingsModal,
    showOptionsModal,
    setShowOptionsModal,
    showHintModal,
    setShowHintModal,
    showErrorModal,
    setShowErrorModal,
    showGameOverModal,
    setShowGameOverModal,
    hintMessage,
    errorMessage,
    gameOverData,
    showHint,
    showError,
    showGameOver,
    closeAllModals,
    isAnyModalOpen,
  };
};
