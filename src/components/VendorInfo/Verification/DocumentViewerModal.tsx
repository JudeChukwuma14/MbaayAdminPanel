import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, ZoomOut } from "lucide-react";

interface Props {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentViewerModal: React.FC<Props> = ({
  imageUrl,
  isOpen,
  onClose,
}) => {
  const [scale, setScale] = React.useState(1);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="relative max-w-4xl max-h-[90vh] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute z-10 p-1 rounded-full top-2 right-2 bg-white/20 hover:bg-white/40"
            >
              <X className="w-6 h-6 text-black" />
            </button>

            {/* Zoom controls */}
            <div className="absolute z-10 flex gap-2 -translate-x-1/2 bottom-4 left-1/2">
              <button
                onClick={() => setScale((s) => Math.max(s - 0.2, 0.5))}
                className="p-2 text-white rounded-full bg-white/20 hover:bg-white/40"
                title="Zoom out"
              >
                <ZoomOut className="w-5 h-5 text-black" />
              </button>
              <span className="px-3 py-1 text-sm text-white rounded-full bg-white/20">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={() => setScale((s) => Math.min(s + 0.2, 3))}
                className="p-2 text-white rounded-full bg-white/20 hover:bg-white/40"
                title="Zoom in"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
            </div>

            <motion.img
              src={imageUrl}
              alt="KYC document"
              className="object-contain max-w-full max-h-full rounded shadow-xl"
              style={{ transform: `scale(${scale})` }}
              draggable={false}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
