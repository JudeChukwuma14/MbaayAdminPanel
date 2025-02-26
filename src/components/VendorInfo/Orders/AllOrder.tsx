import { useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";

const AllProductsPage = () => {
  const [currentTab, setCurrentTab] = useState("All");
  const [sortOrder, setSortOrder] = useState("Newest");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const products = [
    { id: "#1234509", date: "Nov 20th 2024 09:21AM", customer: "James Ikenna", location: "Center Park Orange St, London", amount: "$50,000", status: "On Delivery" },
    { id: "#1234509", date: "Nov 20th 2024 09:21AM", customer: "James Ikenna", location: "Center Park Orange St, London", amount: "$50,000", status: "Cancelled" },
    { id: "#1234509", date: "Nov 20th 2024 09:21AM", customer: "James Ikenna", location: "Center Park Orange St, London", amount: "$50,000", status: "Delivered" },
    { id: "#1234509", date: "Nov 20th 2024 09:21AM", customer: "James Ikenna", location: "Center Park Orange St, London", amount: "$50,000", status: "Cancelled" },
    { id: "#1234509", date: "Nov 20th 2024 09:21AM", customer: "James Ikenna", location: "Center Park Orange St, London", amount: "$50,000", status: "Delivered" },
    { id: "#1234509", date: "Nov 20th 2024 09:21AM", customer: "James Ikenna", location: "Center Park Orange St, London", amount: "$50,000", status: "On Delivery" },
  ];

  const filteredProducts = products.filter((product) => {
    if (currentTab === "All") return true;
    return product.status === currentTab;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOrder === "Newest") return new Date(b.date).getTime() - new Date(a.date).getTime();
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  const paginatedProducts = sortedProducts.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const totalPages = Math.ceil(sortedProducts.length / rowsPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <main className="p-5">
      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        {["All", "On Delivery", "Delivered", "Cancelled"].map((tab) => (
          <motion.button
            key={tab}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentTab(tab)}
            className={`px-5 py-2 rounded-full transition-all duration-300 font-semibold ${
              currentTab === tab
                ? "bg-orange-500 text-white shadow-lg"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            {tab}
          </motion.button>
        ))}
      </div>

      {/* Sort Dropdown */}
      <div className="flex justify-end mb-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="relative"
        >
          <button
            onClick={() => setSortOrder(sortOrder === "Newest" ? "Oldest" : "Newest")}
            className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full shadow-md hover:bg-gray-200 transition-all duration-300"
          >
            {sortOrder} <ChevronDown className="w-4 h-4" />
          </button>
        </motion.div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700 border-b">
              <th className="py-3 px-4">Order ID</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.map((product, index) => (
              <motion.tr
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.1 }}
                className="border-b hover:bg-gray-50 transition-all duration-300"
              >
                <td className="py-3 px-4">{product.id}</td>
                <td className="py-3 px-4">{product.date}</td>
                <td className="py-3 px-4">{product.customer}</td>
                <td className="py-3 px-4">{product.location}</td>
                <td className="py-3 px-4">{product.amount}</td>
                <td
                  className={`py-3 px-4 font-semibold ${
                    product.status === "On Delivery"
                      ? "text-yellow-500"
                      : product.status === "Delivered"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {product.status}
                </td>
                <td className="py-3 px-4">
                <NavLink to={"/app/order-details"}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-blue-500 hover:underline"
                  >
                    View Details
                  </motion.button>
                  </NavLink>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-between items-center p-4 bg-gray-100">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 rounded-full shadow hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </motion.button>

          <span className="text-gray-600">
            Page {currentPage} of {totalPages}
          </span>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 rounded-full shadow hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </main>
  );
};

export default AllProductsPage;
