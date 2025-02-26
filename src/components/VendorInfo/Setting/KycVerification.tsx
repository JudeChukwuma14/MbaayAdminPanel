import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Upload } from "lucide-react"

const KYCVerification: React.FC = () => {
  const [country, setCountry] = useState("")
  const [documentType, setDocumentType] = useState("")
  const [frontFile, setFrontFile] = useState<File | null>(null)
  const [backFile, setBackFile] = useState<File | null>(null)
  const [agreed, setAgreed] = useState(false)

  const countries = ["United States", "United Kingdom", "Canada", "Australia", "Nigeria", "Ghana", "South Africa"]

  const documentTypes = ["National ID Card", "Passport", "Driver's License", "Residence Permit"]

  const handleFileChange = (side: "front" | "back") => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    if (side === "front") {
      setFrontFile(file)
    } else {
      setBackFile(file)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-8"
      >
        <h1 className="text-2xl font-bold text-center mb-2">Upload a proof of your identity</h1>
        <p className="text-center text-gray-600 mb-8">
          Mfery requires a valid government-issued ID (driver's license, passport, national ID)
        </p>

        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
              Your Country
            </label>
            <select
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-orange-500"
            >
              <option value="">Select Your Country</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-1">
              Document Type
            </label>
            <select
              id="documentType"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-orange-500"
            >
              <option value="">Select a document type</option>
              {documentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Front side of your Document</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-orange-500 transition-colors">
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="bg-gray-100 p-3 rounded-full">
                  <Upload className="w-6 h-6 text-gray-500" />
                </div>
                <p className="text-sm text-gray-500">Upload the front side of your document</p>
                <p className="text-xs text-gray-400">Supports: JPG/PNG/PDF</p>
                <button
                  onClick={() => document.getElementById("front-file")?.click()}
                  className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                >
                  Choose File
                </button>
                <motion.input
                  type="file"
                  id="front-file"
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={handleFileChange("front")}
                />
                {frontFile && <p className="text-sm text-green-600 mt-2">{frontFile.name}</p>}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Back side of your Document</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-orange-500 transition-colors">
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="bg-gray-100 p-3 rounded-full">
                  <Upload className="w-6 h-6 text-gray-500" />
                </div>
                <p className="text-sm text-gray-500">Upload the back side of your document</p>
                <p className="text-xs text-gray-400">Supports: JPG/PNG/PDF</p>
                <button
                  onClick={() => document.getElementById("back-file")?.click()}
                  className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                >
                  Choose File
                </button>
                <motion.input
                  type="file"
                  id="back-file"
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={handleFileChange("back")}
                />
                {backFile && <p className="text-sm text-green-600 mt-2">{backFile.name}</p>}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="flex items-start space-x-2 mb-6">
          <input
            type="checkbox"
            id="terms"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1"
          />
          <label htmlFor="terms" className="text-sm text-gray-600">
            I confirm that I uploaded valid government-issued ID. This ID includes my picture, signature, name, date of
            birth and address
          </label>
        </motion.div>

        <motion.div variants={itemVariants}>
          <button
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!agreed || !frontFile || !backFile || !country || !documentType}
          >
            Continue
          </button>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default KYCVerification

