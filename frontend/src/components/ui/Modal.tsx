import {
    type ReactNode,
    useEffect,
  } from "react";
  
  interface ModalProps {
    title: string;
    children: ReactNode;
    onClose: () => void;
  }
  
  export function Modal({
    title,
    children,
    onClose,
  }: ModalProps) {
    useEffect(() => {
      function handleKeyDown(
        event: KeyboardEvent,
      ) {
        if (event.key === "Escape") {
          onClose();
        }
      }
  
      window.addEventListener(
        "keydown",
        handleKeyDown,
      );
  
      return () => {
        window.removeEventListener(
          "keydown",
          handleKeyDown,
        );
      };
    }, [onClose]);
  
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4"
        onMouseDown={(event) => {
          if (
            event.target === event.currentTarget
          ) {
            onClose();
          }
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="w-full max-w-md rounded-2xl bg-white shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2
              id="modal-title"
              className="text-lg font-semibold text-slate-900"
            >
              {title}
            </h2>
  
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close"
            >
              ×
            </button>
          </div>
  
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    );
  }