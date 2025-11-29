import { useState, useCallback } from 'react';

export interface UseModalReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

/**
 * Custom hook for managing modal open/close state.
 *
 * @param initialOpen - Initial open state (default: false)
 *
 * @example
 * const { isOpen, open, close } = useModal();
 *
 * <Button onClick={open}>Open Modal</Button>
 * <Modal isOpen={isOpen} onClose={close}>
 *   Modal content
 * </Modal>
 */
export function useModal(initialOpen = false): UseModalReturn {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return { isOpen, open, close, toggle };
}

/**
 * Hook for managing multiple modals by key.
 *
 * @example
 * const modals = useModals(['create', 'edit', 'delete']);
 *
 * modals.open('create');
 * modals.isOpen('create'); // true
 * modals.close('create');
 */
export function useModals<T extends string>(
  _keys: T[]
): {
  isOpen: (key: T) => boolean;
  open: (key: T) => void;
  close: (key: T) => void;
  closeAll: () => void;
  toggle: (key: T) => void;
} {
  const [openModals, setOpenModals] = useState<Set<T>>(new Set());

  const isOpen = useCallback((key: T) => openModals.has(key), [openModals]);

  const open = useCallback((key: T) => {
    setOpenModals(prev => new Set([...prev, key]));
  }, []);

  const close = useCallback((key: T) => {
    setOpenModals(prev => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const closeAll = useCallback(() => {
    setOpenModals(new Set());
  }, []);

  const toggle = useCallback((key: T) => {
    setOpenModals(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  return { isOpen, open, close, closeAll, toggle };
}

export default useModal;
