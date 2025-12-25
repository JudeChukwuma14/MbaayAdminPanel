import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Loader2, CreditCard, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { getAllCustomer_PaymentStats } from "@/services/adminApi";

const CustomersPage: React.FC = () => {
  const [filter, setFilter] = useState<
    "All" | "Successful" | "Pending" | "Failed"
  >("All");
  const [currentPage, setCurrentPage] = useState(1);

  const admin = useSelector((s: RootState) => s.admin);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["customersPayments"],
    queryFn: () => getAllCustomer_PaymentStats(admin.token),
    enabled: !!admin.token,
  });

  const customers = data?.customers || [];
  const paymentSummary = data?.paymentSummary || {
    totalRevenue: 0,
    successfulPayments: 0,
    pendingPayments: 0,
    failedPayments: 0,
  };

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(customers.length / pageSize));

  const filteredCustomers =
    filter === "All"
      ? customers
      : customers.filter((c: any) => c.payStatus === filter);

  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const formatDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleString() : "-";

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Summary Boxes */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="p-4 bg-white rounded-lg shadow-lg flex items-center space-x-3"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="bg-blue-100 p-3 rounded-full">
            <User className="text-blue-500" size={24} />
          </div>
          <div>
            <h2 className="text-sm font-medium">Total Orders</h2>
            <p className="text-2xl font-semibold">{customers.length}</p>
          </div>
        </motion.div>

        <motion.div
          className="p-4 bg-white rounded-lg shadow-lg flex items-center space-x-3"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="bg-green-100 p-3 rounded-full">
            <CreditCard className="text-green-500" size={24} />
          </div>
          <div>
            <h2 className="text-sm font-medium">Total Revenue</h2>
            <p className="text-2xl font-semibold">
              ${paymentSummary.totalRevenue}
            </p>
          </div>
        </motion.div>

        <motion.div
          className="p-4 bg-white rounded-lg shadow-lg flex flex-col justify-center"
          whileHover={{ scale: 1.02 }}
        >
          <div className="text-sm font-medium">Successful Payments</div>
          <div className="text-2xl font-semibold">
            {paymentSummary.successfulPayments}
          </div>
        </motion.div>

        <motion.div
          className="p-4 bg-white rounded-lg shadow-lg flex flex-col justify-center"
          whileHover={{ scale: 1.02 }}
        >
          <div className="text-sm font-medium">Pending / Failed</div>
          <div className="text-2xl font-semibold">
            {paymentSummary.pendingPayments} / {paymentSummary.failedPayments}
          </div>
        </motion.div>
      </motion.div>

      {/* Filter and Table */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3"
      >
        <h1 className="text-2xl font-bold">Orders / Customers</h1>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="border border-gray-300 p-2 rounded"
          >
            <option value="All">All</option>
            <option value="Successful">Successful</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 rounded">Failed to load customers.</div>
      ) : customers.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-full max-w-md p-8 bg-white rounded-lg shadow text-center">
            <div className="flex items-center justify-center mb-4">
              <User className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              No orders or customers found
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              There are no orders to display right now. When customers place
              orders, they'll appear here with payment details.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => refetch()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary text-white"
              >
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded border"
              >
                Reload App
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="overflow-x-auto shadow rounded-lg">
            <table className="min-w-full bg-white rounded-lg">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">
                    Order ID
                  </th>
                  <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">
                    Customer
                  </th>
                  <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">
                    Products
                  </th>
                  <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">
                    Total
                  </th>
                  <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">
                    Pay Status
                  </th>
                  <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedCustomers.map((order: any, idx: number) => (
                  <motion.tr
                    key={order._id || idx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.02 * idx }}
                    className="border-b"
                    whileHover={{ scale: 1.01 }}
                  >
                    <td className="py-2 px-4 text-sm">
                      {(order._id || "").slice(0, 8)}
                    </td>
                    <td className="py-2 px-4 text-sm">
                      <div className="font-medium">
                        {order.userId?.name || order.user?.name || "-"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {order.userId?.email || order.user?.email || "-"}
                      </div>
                    </td>
                    <td className="py-2 px-4 text-sm">
                      {(order.items || []).length} items
                    </td>
                    <td className="py-2 px-4 text-sm">
                      ${order.totalPrice ?? 0}
                    </td>
                    <td className="py-2 px-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          order.payStatus === "Successful"
                            ? "bg-green-100 text-green-700"
                            : order.payStatus === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {order.payStatus || "-"}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-sm">
                      {formatDate(order.createdAt)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <motion.div
            className="flex justify-between items-center mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-sm text-gray-600">
              Showing {paginatedCustomers.length} of {filteredCustomers.length}{" "}
              results
            </p>
            <div className="flex items-center space-x-2">
              <motion.button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded bg-white text-gray-600 disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
              >
                Prev
              </motion.button>
              {Array.from({ length: totalPages }).map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => handlePageChange(index + 1)}
                  className={`px-3 py-1 border rounded ${
                    currentPage === index + 1
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-600"
                  }`}
                  whileHover={{ scale: 1.05 }}
                >
                  {index + 1}
                </motion.button>
              ))}
              <motion.button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded bg-white text-gray-600 disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
              >
                Next
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;
