"use client";

import { useEffect, useRef, useState } from "react";

type ConfirmSubmitButtonProps = {
  className?: string;
  confirmMessage: string;
  label: string;
};

export function ConfirmSubmitButton({
  className,
  confirmMessage,
  label,
}: ConfirmSubmitButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hiddenSubmitRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <button className={className} onClick={() => setIsOpen(true)} type="button">
        {label}
      </button>
      <button hidden ref={hiddenSubmitRef} type="submit" />
      {isOpen ? (
        <div className="confirm-modal-backdrop" onClick={() => setIsOpen(false)} role="presentation">
          <div
            aria-labelledby="confirm-modal-title"
            aria-modal="true"
            className="confirm-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="stack-md">
              <div className="stack-sm">
                <p className="eyebrow">Confirm action</p>
                <h3 id="confirm-modal-title">{label}</h3>
                <p className="muted-text">{confirmMessage}</p>
              </div>
              <div className="button-row confirm-modal-actions">
                <button className="button button-secondary" onClick={() => setIsOpen(false)} type="button">
                  Cancel
                </button>
                <button
                  className="button button-danger"
                  onClick={() => {
                    setIsOpen(false);
                    hiddenSubmitRef.current?.click();
                  }}
                  type="button"
                >
                  {label}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
