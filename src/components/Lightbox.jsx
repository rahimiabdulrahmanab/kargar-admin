// src/components/Lightbox.jsx
// Full-screen image viewer. Click anywhere to close.

import { useEffect } from "react";

export default function Lightbox({ src, onClose }) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!src) return null;

  return (
    <div className="lightbox" onClick={onClose} aria-label="Close image">
      <img src={src} alt="Full view" onClick={(e) => e.stopPropagation()} />
    </div>
  );
}
