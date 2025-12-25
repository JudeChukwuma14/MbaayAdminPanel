import { useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { getAllOrders } from "../../../services/adminApi";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "@/components/redux/store";

const AllProductsPage = () => {
  const [currentTab, setCurrentTab] = useState("All");
  const [sortOrder, setSortOrder] = useState("Newest");
  const [currentPage, setCurrentPage] = useState(1);
  const admin = useSelector((state: RootState) => state.admin);
  const rowsPerPage = 5;

  const {
    data: orders,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["all-orders"],
    queryFn: async () => {
      try {
        const data = await getAllOrders(admin.token);
        console.log("Orders data:", data);
        return Array.isArray(data) ? data : [];
      } catch (err) {
        console.error("Error fetching orders:", err);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  // Transform order data to match table structure
  const transformOrderData = (orders: any[]) => {
    return orders.map((order) => {
      // Calculate total amount
      const totalAmount =
        order.items?.reduce((sum: number, item: any) => {
          return sum + item.price * item.quantity;
        }, 0) || 0;

      // Get customer info
      const customerName = order.userId?.name || "Unknown Customer";
      const customerEmail = order.userId?.email || "";

      // Get first product name for display
      const productName = order.items?.[0]?.product?.name || "Unknown Product";

      return {
        id: order._id || order.orderId || "#Unknown",
        date: new Date(order.createdAt).toLocaleString(),
        customer: customerName,
        location: order.shippingAddress?.address || "No address provided",
        amount: `$${totalAmount.toLocaleString()}`,
        status: order.status || "Unknown",
        orderData: order, // Keep original data for details page
        customerEmail: customerEmail,
        productName: productName,
      };
    });
  };

  const orderProducts = orders ? transformOrderData(orders) : [];

  const filteredProducts = orderProducts.filter((product) => {
    if (currentTab === "All") return true;
    return product.status === currentTab;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOrder === "Newest")
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
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
            onClick={() =>
              setSortOrder(sortOrder === "Newest" ? "Oldest" : "Newest")
            }
            className="flex items-center gap-2 px-4 py-2 transition-all duration-300 bg-gray-100 rounded-full shadow-md hover:bg-gray-200"
          >
            {sortOrder} <ChevronDown className="w-4 h-4" />
          </button>
        </motion.div>
      </div>

      {/* Table */}
      <div className="overflow-hidden bg-white rounded-lg shadow-md">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="flex items-center gap-3 text-gray-600">
              <div className="w-6 h-6 border-2 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
              <span>Loading orders...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-10">
            <div className="text-red-500">
              Error loading orders. Please try again.
            </div>
          </div>
        ) : orderProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <div className="text-center">
              <h3 className="mb-2 text-lg font-semibold text-gray-700">
                No Orders Yet
              </h3>
              <p className="text-sm text-gray-500">
                When orders are placed, they will appear here.
              </p>
            </div>
            <div className="flex space-x-2 text-xs text-gray-400">
              <span>🛍️</span>
              <span>🛒</span>
              <span>📦</span>
            </div>
          </div>
        ) : (
          <>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-gray-700 bg-gray-100 border-b">
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((product, index) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.1 }}
                    className="transition-all duration-300 border-b hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">{product.id}</td>
                    <td className="px-4 py-3">{product.date}</td>
                    <td className="px-4 py-3">{product.customer}</td>
                    <td className="px-4 py-3">{product.location}</td>
                    <td className="px-4 py-3">{product.amount}</td>
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
                    <td className="px-4 py-3">
                      <NavLink to={`/app/order-details/${product.id}`}>
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
          </>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 bg-gray-100">
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
