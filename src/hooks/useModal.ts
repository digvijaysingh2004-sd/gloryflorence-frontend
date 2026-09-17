import { useState, useCallback } from 'react';

/**
 * Custom hook for managing modal and dialog open/close state.
 * @param initialState Initial boolean state (default: false)
 */
export function useModal<T = any>(initialState: boolean = false) {
  const [isOpen, setIsOpen] = useState<boolean>(initialState);
  const [modalData, setModalData] = useState<T | null>(null);

  const openModal = useCallback((data?: T) => {
    if (data !== undefined) {
      setModalData(data);
    }
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setModalData(null);
  }, []);

  const toggleModal = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    isOpen,
    modalData,
    openModal,
    closeModal,
    toggleModal,
    setModalData,
  };
}

export default useModal;
