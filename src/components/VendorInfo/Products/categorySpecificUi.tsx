"use client";

import { motion } from "framer-motion";
import { MdSpa } from "react-icons/md";
import { FaGem } from "react-icons/fa";

interface CategorySpecificUIProps {
  activeCategory: string;
  getCurrentTheme: () => { primary: string; secondary: string; accent: string };
}

export default function CategorySpecificUI({
  activeCategory,
  getCurrentTheme,
}: CategorySpecificUIProps) {
  if (!activeCategory) {
    return (
      <div className="text-center p-10">
        <p className="text-lg text-gray-500">
          Please select a category to continue
        </p>
      </div>
    );
  }

  const theme = getCurrentTheme();
  const secondaryColor = `bg-${theme.secondary}`;
  const accentColor = `text-${theme.accent}`;
  const borderColor = `border-${theme.primary}`;

  switch (activeCategory) {
    case "Beauty and Wellness":
      return (
        <div className="space-y-6">
          <motion.div
            className={`${secondaryColor} p-5 rounded-lg shadow space-y-4`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2
              className={`text-lg font-semibold ${accentColor} flex items-center gap-2`}
            >
              <MdSpa /> Beauty Product Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Skin Type
                </label>
                <motion.select
                  className={`w-full p-2 border rounded outline-none ${borderColor}`}
                >
                  <option value="">Select Skin Type</option>
                  <option value="normal">Normal</option>
                  <option value="dry">Dry</option>
                  <option value="oily">Oily</option>
                  <option value="combination">Combination</option>
                  <option value="sensitive">Sensitive</option>
                </motion.select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Product Type
                </label>
                <motion.select
                  className={`w-full p-2 border rounded outline-none ${borderColor}`}
                >
                  <option value="">Select Product Type</option>
                  <option value="cleanser">Cleanser</option>
                  <option value="moisturizer">Moisturizer</option>
                  <option value="serum">Serum</option>
                  <option value="mask">Mask</option>
                  <option value="sunscreen">Sunscreen</option>
                </motion.select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Key Ingredients
              </label>
              <input
                type="text"
                className={`w-full p-2 border rounded outline-none ${borderColor}`}
                placeholder="e.g., Hyaluronic Acid, Vitamin C, Retinol"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Volume/Weight
                </label>
                <input
                  type="text"
                  className={`w-full p-2 border rounded outline-none ${borderColor}`}
                  placeholder="e.g., 50ml, 100g"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Expiry Period After Opening
                </label>
                <input
                  type="text"
                  className={`w-full p-2 border rounded outline-none ${borderColor}`}
                  placeholder="e.g., 12 months"
                />
              </div>
            </div>
          </motion.div>
        </div>
      );

    case "Jewelry and Gemstones":
      return (
        <div className="space-y-6">
          <motion.div
            className={`${secondaryColor} p-5 rounded-lg shadow space-y-4`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2
              className={`text-lg font-semibold ${accentColor} flex items-center gap-2`}
            >
              <FaGem /> Jewelry Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Material
                </label>
                <motion.select
                  className={`w-full p-2 border rounded outline-none ${borderColor}`}
                >
                  <option value="">Select Material</option>
                  <option value="gold">Gold</option>
                  <option value="silver">Silver</option>
                  <option value="platinum">Platinum</option>
                  <option value="stainless_steel">Stainless Steel</option>
                  <option value="brass">Brass</option>
                </motion.select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Gemstone Type
                </label>
                <motion.select
                  className={`w-full p-2 border rounded outline-none ${borderColor}`}
                >
                  <option value="">Select Gemstone</option>
                  <option value="diamond">Diamond</option>
                  <option value="ruby">Ruby</option>
                  <option value="emerald">Emerald</option>
                  <option value="sapphire">Sapphire</option>
                  <option value="none">No Gemstone</option>
                </motion.select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Carat Weight
                </label>
                <input
                  type="text"
                  className={`w-full p-2 border rounded outline-none ${borderColor}`}
                  placeholder="e.g., 0.5ct, 1.2ct"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Chain Length
                </label>
                <input
                  type="text"
                  className={`w-full p-2 border rounded outline-none ${borderColor}`}
                  placeholder="e.g., 18 inches"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Certification
              </label>
              <input
                type="text"
                className={`w-full p-2 border rounded outline-none ${borderColor}`}
                placeholder="e.g., GIA, IGI, None"
              />
            </div>
          </motion.div>
        </div>
      );

    // Add other category cases here...
    // For brevity, I'm only including two categories in this example
    // You would add all the other categories from the original file

    default:
      return (
        <div className="text-center p-10">
          <p className="text-lg text-gray-500">
            Please select a category to continue
          </p>
        </div>
      );
  }
}
