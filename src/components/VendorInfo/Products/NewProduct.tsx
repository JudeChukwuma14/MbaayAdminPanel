import { useState } from "react";
import { motion } from "framer-motion";
import { FiUploadCloud } from "react-icons/fi";
import { CiVideoOn } from "react-icons/ci";
import { FaYoutube } from "react-icons/fa";
// import ReactQuill from "react-quill";
// import "react-quill/dist/quill.snow.css";

const NewProduct = () => {
  const [productName, setProductName] = useState("");
  // const [productDescription, setProductDescription] = useState("");
  const [category, setCategory] = useState("Fashion");
  const [subCategory, setSubCategory] = useState("Men's Wears");
  const [quantity, setQuantity] = useState("0");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  // const [value, setValue] = useState("");

  // const toolbarOptions = [['bold', 'italic'], ['link', 'image']];

  const handleDiscard = () => {
    console.log("Discard remove.");
  };
  const handleSaveDraft = () => {
    console.log("Draft saved.");
  };

  const handleAddProduct = () => {
    console.log("Product added.");
  };

  return (
    <motion.div
      className="p-6 space-y-6 bg-gray-100 min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-2xl font-bold">New Product</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Description Section */}
        <motion.div
          className="bg-white p-5 rounded-lg shadow space-y-4"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold">Description</h2>
          <input
            type="text"
            placeholder="Product Name"
            className="w-full p-2 border rounded outline-orange-500 border-orange-500"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
          {/* <ReactQuill theme="snow"  placeholder="Product Description"  value={value} onChange={setValue} className="border outline-orange-500 border-orange-500"/> */}
          {/* <textarea
            placeholder="Product Description"
            className="w-full p-2 border rounded h-32 outline-orange-500 border-orange-500"
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
          /> */}
        </motion.div>

        {/* Product Images Section */}
        <motion.div
          className="bg-white p-5 rounded-lg shadow space-y-4"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-lg font-semibold">Product Images</h2>
          <div className="border-dashed border-2 border-orange-500 p-5 rounded-lg text-center space-y-2">
            <FiUploadCloud size={40} className="mx-auto text-gray-400" />
            <p>Click to upload or drag and drop</p>
          </div>
        </motion.div>

        {/* Category Section */}
        <motion.div
          className="bg-white p-5 rounded-lg shadow space-y-4"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-lg font-semibold">Category</h2>
          <motion.select
            className="w-full p-2 border rounded outline-orange-500 border-orange-500"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="Fashion">Fashion</option>
            <option value="Electronics">Electronics</option>
          </motion.select>
          <motion.select
            className="w-full p-2 border rounded outline-orange-500 border-orange-500"
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
          >
            <option value="Men's Wears">Men's Wears</option>
            <option value="Women's Wears">Women's Wears</option>
          </motion.select>
        </motion.div>

        {/* Product Video Section */}
        <motion.div
          className="bg-white p-5 rounded-lg shadow space-y-4"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex justify-between items-center space-x-2">
            <h2 className="text-lg font-semibold">Product Video (Optional)</h2>
            <div className="flex justify-between items-center cursor-pointer">
              <FaYoutube size={30} className="mr-1 text-red-600" />
              <h4 className="text-blue-600">Add youtube video</h4>
            </div>
          </div>
          <div className="border-dashed border-2 border-orange-500 p-5 rounded-lg text-center space-y-2">
            <CiVideoOn size={40} className="mx-auto text-gray-400" />
            <p>Click to upload or drag and drop</p>
          </div>
        </motion.div>

        {/* Inventory Section */}
        <motion.div
          className="bg-white p-5 rounded-lg shadow space-y-4"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <h2 className="text-lg font-semibold">Inventory</h2>
          <input
            type="number"
            placeholder="Quantity"
            className="w-full p-2 border rounded outline-orange-500 border-orange-500"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
          <input
            type="text"
            placeholder="SKU (Optional)"
            className="w-full p-2 border rounded outline-orange-500 border-orange-500"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
          />
        </motion.div>

        {/* Pricing Section */}
        <motion.div
          className="bg-white p-5 rounded-lg shadow space-y-4"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <h2 className="text-lg font-semibold">Pricing</h2>
          <input
            type="text"
            placeholder="Price"
            className="w-full p-2 border rounded outline-orange-500 border-orange-500"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <input
            type="text"
            placeholder="Compare at pricing (Optional)"
            className="w-full p-2 border rounded outline-orange-500 border-orange-500"
            value={comparePrice}
            onChange={(e) => setComparePrice(e.target.value)}
          />
        </motion.div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          className="border border-orange-500 text-red-500 px-4 py-2 rounded-lg"
          onClick={handleDiscard}
        >
          Discard
        </button>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded-lg"
          onClick={handleSaveDraft}
        >
          Save Draft
        </button>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded-lg"
          onClick={handleAddProduct}
        >
          Add Product
        </button>
      </div>
    </motion.div>
  );
};

export default NewProduct;
