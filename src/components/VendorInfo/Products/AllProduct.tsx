import  { useState } from "react";
import { HiDotsVertical } from "react-icons/hi";
import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { NavLink } from "react-router-dom";

ChartJS.register(ArcElement, Tooltip, Legend);

const AllProduct = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");

  const products = [
    {
      id: "#1234509",
      name: "Traditional Wears",
      category: "Igbo Wears",
      subCategory: "Men's Wear",
      amount: "$50,000",
      stock: "Stock",
      date: "23/04/13",
    },
    {
      id: "#1234508",
      name: "Ankara Dress",
      category: "Fashion",
      subCategory: "Women's Wear",
      amount: "$35,000",
      stock: "Out-Of-Stock",
      date: "12/02/13",
    },
    // Add more products here
  ];

  const totalPages = Math.ceil(products.length / rowsPerPage);
  const paginatedProducts = products.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleFilter = () => {
    // Add filter logic here
    console.log(`Category: ${category}, Status: ${status}`);
  };

  const chartData = {
    labels: ["Clicks", "Sales", "Views"],
    datasets: [
      {
        label: "Overview",
        data: [25, 15, 40], // Replace with real data
        backgroundColor: ["#FFA500", "#4CAF50", "#2196F3"],
        hoverOffset: 6,
      },
    ],
  };

  return (
    <main className="p-5">
      <motion.div
        className="flex justify-between items-center mb-5"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold">Products Overview</h1>
        <NavLink to={"/app/new-product"}>
        <button className="bg-orange-500 text-white px-4 py-2 rounded-lg">
          + New Product
        </button>
        </NavLink>
      </motion.div>

      <div className="grid grid-cols-3 gap-5 mb-5">
        <motion.div
          className="col-span-2 bg-white p-5 rounded-lg shadow"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Doughnut data={chartData} />
        </motion.div>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <motion.select
          className="border p-2 rounded outline-orange-500 border-orange-500"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Category</option>
          <option value="Fashion">Fashion</option>
          <option value="Electronics">Electronics</option>
        </motion.select>
        <motion.select
          className="border p-2 rounded border-orange-500 outline-orange-500"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Status</option>
          <option value="Stock">Stock</option>
          <option value="Out-Of-Stock">Out-Of-Stock</option>
        </motion.select>
        <button
          className="bg-orange-500 text-white px-4 py-2 rounded-lg "
          onClick={handleFilter}
        >
          Filter
        </button>
        <input
          type="text"
          placeholder="Search Product..."
          className="border p-2 flex-1 rounded border-orange-500 outline-orange-500"
        />
      </div>

      <motion.table
        className="w-full bg-white rounded-lg shadow overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left p-3">Product ID</th>
            <th className="text-left p-3">Product Name</th>
            <th className="text-left p-3">Category</th>
            <th className="text-left p-3">Sub-Category</th>
            <th className="text-left p-3">Amount</th>
            <th className="text-left p-3">Stock</th>
            <th className="text-left p-3">Date</th>
          </tr>
        </thead>
        <tbody>
          {paginatedProducts.map((product, index) => (
            <motion.tr
              key={index}
              className="hover:bg-gray-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <td className="p-3">{product.id}</td>
              <td className="p-3">{product.name}</td>
              <td className="p-3">{product.category}</td>
              <td className="p-3">{product.subCategory}</td>
              <td className="p-3">{product.amount}</td>
              <td
                className={`p-3 ${
                  product.stock === "Stock"
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {product.stock}
              </td>
              <td className="p-3 flex items-center gap-2">
              {product.date}
            <HiDotsVertical className="w-4 h-4 text-gray-500" />
          </td>

            </motion.tr>
          ))}
        </tbody>
      </motion.table>

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Prev
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Next
        </button>
      </div>
    </main>
  );
};

export default AllProduct;
