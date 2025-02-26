"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Smile, Image, MapPin, Paperclip } from "lucide-react"

interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-x-4 top-20 md:inset-auto md:top-[50%] md:left-[50%] md:max-w-lg w-full md:-translate-x-[50%] md:-translate-y-[50%] bg-white rounded-xl shadow-xl"
          >
            <div className="p-4">
              <motion.button onClick={onClose} className="absolute top-4 left-4 text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </motion.button>

              <div className="mt-6 mb-4 flex items-center space-x-3">
                <img src="/placeholder.svg?height=48&width=48" alt="Profile" className="w-12 h-12 rounded-full" />
                <div>
                  <h3 className="font-semibold">Ogbonna Finbarr</h3>
                  <p className="text-sm text-gray-600">Beauty and SkinCare</p>
                </div>
              </div>

              <textarea
                placeholder="Share your Ideas..."
                className="w-full h-40 p-3 text-gray-700 bg-gray-100 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
              />

              <div className="mt-4 flex items-center justify-between">
                <div className="flex space-x-4">
                  <motion.button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
                    <Smile className="w-6 h-6" />
                  </motion.button>
                  <motion.button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
                    <Image className="w-6 h-6" />
                  </motion.button>
                  <motion.button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
                    <MapPin className="w-6 h-6" />
                  </motion.button>
                  <motion.button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
                    <Paperclip className="w-6 h-6" />
                  </motion.button>
                </div>
                <button className="px-4 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
                  Post Idea
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

