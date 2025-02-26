import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

interface CommunityModalProps {
  isOpen: boolean
  onClose: () => void
  onSend: (topic: string, message: string) => void
}

export default function CommunityModal({ isOpen, onClose, onSend }: CommunityModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSend(name, description)
    setName("")
    setDescription("")
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
          >
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Create Community</h2>
                <motion.button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-500 transition-colors">
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="p-4 space-y-4">
                <div>
                    <h1 className="text-bold font-bold mb-3">Name:</h1>
                  <input
                    type="text"
                    placeholder="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 rounded-lg text-sm focus:outline-none border"
                    required
                  />
                </div>
                <div>
                <h1 className="text-bold font-bold mb-3">Description:</h1>
                  <textarea
                    placeholder="Type your description here..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 bg-gray-50 rounded-lg text-sm focus:outline-none resize-none border"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 p-4 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#FF6B00] hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#FF6B00] hover:bg-[#00B33C] rounded-lg transition-colors"
                >
                  create
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

