import React, { useState, useCallback } from 'react';
import { ModalConfig } from '@/components/admin/ModalSystem';

export const useModal = () => {
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openModal = useCallback((config: ModalConfig) => {
    setModalConfig(config);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setModalConfig(null);
  }, []);

  const showConfirmation = useCallback((
    title: string,
    message: string,
    onConfirm: () => void | Promise<void>,
    onCancel?: () => void,
    severity: 'info' | 'warning' | 'error' | 'success' = 'warning'
  ) => {
    openModal({
      type: 'confirmation',
      title,
      content: message,
      severity,
      onConfirm,
      onCancel,
    });
  }, [openModal]);

  const showForm = useCallback((
    title: string,
    fields: any[],
    onSubmit: (data: Record<string, any>) => void | Promise<void>,
    onCancel?: () => void
  ) => {
    openModal({
      type: 'form',
      title,
      fields,
      onSubmit,
      onCancel,
    });
  }, [openModal]);

  const showBulkOperation = useCallback((
    title: string,
    description: string,
    items: Array<{ id: string; label: string; description?: string }>,
    operations: Array<{ label: string; action: string; icon: React.ReactNode }>,
    onExecute: (operation: string, selectedItems: string[]) => void | Promise<void>
  ) => {
    openModal({
      type: 'bulk',
      title,
      content: React.createElement('div', {
        props: {
          config: {
            title,
            description,
            items,
            operations,
            onExecute,
          },
        },
      }),
    });
  }, [openModal]);

  const showPreview = useCallback((
    title: string,
    content: React.ReactNode,
    actions?: any[]
  ) => {
    openModal({
      type: 'preview',
      title,
      content,
      actions,
      size: 'lg',
    });
  }, [openModal]);

  const showCustom = useCallback((
    config: Omit<ModalConfig, 'type'>
  ) => {
    openModal({
      ...config,
      type: 'custom',
    });
  }, [openModal]);

  return {
    modalConfig,
    isOpen,
    openModal,
    closeModal,
    showConfirmation,
    showForm,
    showBulkOperation,
    showPreview,
    showCustom,
  };
}; 