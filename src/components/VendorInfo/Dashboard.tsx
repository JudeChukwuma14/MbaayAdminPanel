import { useState, useMemo, useEffect } from "react";
import { Eye, EyeOff, ShoppingCart, Package } from "lucide-react";
import { Line } from "react-chartjs-2";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import {
  getAllOrders,
  getAdminDashboardStats,
  getAdminNotifications,
} from "../../services/adminApi";
import { RootState } from "@/components/redux/store";
import { ChartOptions } from "chart.js";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
);

const Dashboard = () => {
  const [balanceVisible, setBalanceVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [selectedMonths, setSelectedMonths] = useState(1);

  const admin = useSelector((state: RootState) => state.admin);

  const {
    data: orders = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dashboard-orders"],
    queryFn: async () => {
      const data = await getAllOrders(admin.token);
      return Array.isArray(data) ? data : [];
    },
    enabled: Boolean(admin.token),
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: dashboardStats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const data = await getAdminDashboardStats(admin.token);
      return data;
    },
    enabled: Boolean(admin.token),
    staleTime: 1000 * 60 * 5,
  });

  const { data: recentNotifications = [], isLoading: notificationsLoading } =
    useQuery({
      queryKey: ["dashboard-notifications"],
      queryFn: async () => {
        const data = await getAdminNotifications(admin.token, { limit: 5 });
        return Array.isArray(data?.notifications) ? data.notifications : [];
      },
      enabled: Boolean(admin.token),
      staleTime: 1000 * 60 * 2,
    });

  const parsedOrders = useMemo(() => {
    return orders.map((order: any) => {
      const qty =
        order.items?.reduce(
          (sum: number, item: any) => sum + (item.quantity || 0),
          0,
        ) || 0;
      const totalAmount =
        order.items?.reduce(
          (sum: number, item: any) =>
            sum + (item.price || 0) * (item.quantity || 0),
          0,
        ) || 0;
      return {
        id: order._id || order.orderId || "#Unknown",
        client: order.userId?.name || "Unknown Customer",
        product: order.items?.[0]?.product?.name || "Unknown Product",
        qty,
        price: `$${totalAmount.toLocaleString()}`,
        category: order.items?.[0]?.product?.category || "Unknown",
        status: order.status || "Unknown",
        createdAt: order.createdAt,
      };
    });
  }, [orders]);

  const balance = dashboardStats?.balance ?? 0;
  const totalOrders = dashboardStats?.totalOrders ?? parsedOrders.length;
  const productsSold =
    dashboardStats?.productsSold ??
    parsedOrders.reduce((sum, order) => sum + order.qty, 0);
  const monthlyRevenue = dashboardStats?.monthlyRevenue ?? 0;

  const totalPages = Math.max(1, Math.ceil(parsedOrders.length / rowsPerPage));
  const paginatedOrders = parsedOrders.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  const showingLoading = isLoading || statsLoading;
  const isError = Boolean(error || statsError);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const toggleBalanceVisibility = () => {
    setBalanceVisible(!balanceVisible);
  };

  const dashboardMonthNames = useMemo(() => {
    const now = new Date();
    return Array.from({ length: selectedMonths }, (_, idx) => {
      const monthDate = new Date(
        now.getFullYear(),
        now.getMonth() - (selectedMonths - 1 - idx),
        1,
      );
      return monthDate.toLocaleString("default", { month: "short" });
    });
  }, [selectedMonths]);

  const dashboardMonthData = useMemo(() => {
    const currentMonthShort = new Date().toLocaleString("default", {
      month: "short",
    });
    return dashboardMonthNames.map((month) =>
      month === currentMonthShort ? monthlyRevenue : 0,
    );
  }, [dashboardMonthNames, monthlyRevenue]);

  const chartData = {
    labels: dashboardMonthNames,
    datasets: [
      {
        label: "Monthly Revenue",
        data: dashboardMonthData,
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderWidth: 2,
        tension: 0.4,
        pointBackgroundColor: "rgba(255, 99, 132, 1)",
      },
    ],
  };

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: "top" },
      tooltip: { enabled: true },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: "rgba(200, 200, 200, 0.2)" } },
    },
  };

  return (
    <main className="p-5 flex-1 overflow-auto">
      {/* Cards Section */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          {
            title: "Wallet Balance",
            value: balanceVisible ? `$${balance.toLocaleString()}` : "****",
            icon: balanceVisible ? EyeOff : Eye,
            onClick: toggleBalanceVisibility,
          },
          {
            title: "Total Orders",
            value: totalOrders.toString(),
            icon: ShoppingCart,
          },
          {
            title: "Products Sold",
            value: productsSold.toString(),
            icon: Package,
          },
        ].map((card, index) => (
          <motion.div
            key={index}
            className="bg-white rounded-lg p-5 shadow flex items-center justify-between"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <div>
              <h3 className="text-sm text-gray-500">{card.title}</h3>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            </div>
            {card.icon && (
              <motion.button onClick={card.onClick}>
                <card.icon className="w-6 h-6 text-gray-600" />
              </motion.button>
            )}
          </motion.div>
        ))}
      </div>

      {/* Chart and Notifications */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          className="col-span-2 bg-white rounded-lg p-5 shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-bold mb-4">Revenue Report</h2>
          <div className="flex justify-end mb-3">
            {[1, 3, 6].map((month) => (
              <button
                key={month}
                onClick={() => setSelectedMonths(month)}
                className={`px-3 py-1 rounded ${
                  selectedMonths === month
                    ? "bg-orange-500 text-white"
                    : "bg-gray-200"
                } mx-1`}
              >
                {month} Month{month > 1 && "s"}
              </button>
            ))}
          </div>
          <div className="h-64">
            <Line data={chartData} options={chartOptions} />
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-lg p-5 shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="font-bold mb-4">Recent Notifications</h2>
          {notificationsLoading ? (
            <div className="py-4 text-center text-gray-500">
              Loading notifications...
            </div>
          ) : recentNotifications.length === 0 ? (
            <div className="py-4 text-center text-gray-500">
              No notifications yet
            </div>
          ) : (
            <ul className="text-sm space-y-2">
              {recentNotifications
                .slice(0, 3)
                .map((notif: any, index: number) => (
                  <li
                    key={notif._id || index}
                    className="p-2 bg-gray-100 rounded shadow"
                  >
                    <div className="font-semibold">
                      {notif.title || "Notification"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {notif.type || "General"}
                    </div>
                    <div className="text-sm text-gray-700">{notif.message}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(notif.createdAt).toLocaleString()}
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </motion.div>

        {/* <motion.div
          className="bg-white rounded-lg p-5 shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="font-bold mb-4">Recent Notifications</h2>
          <ul className="text-sm space-y-2">
            {[
              "Your account is logged in",
              "Payment successfully processed",
              "New product added to inventory",
            ].map((notif, index) => (
              <li key={index} className="p-2 bg-gray-100 rounded shadow">
                {notif}
              </li>
            ))}
          </ul>
        </motion.div> */}
      </div>

      {/* Orders Table */}
      <motion.div
        className="bg-white rounded-lg p-5 shadow mt-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="font-bold mb-4">All Orders</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="py-2">ID</th>
              <th>Client Name</th>
              <th>Product Name</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Category</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {showingLoading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500">
                  Loading orders...
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-red-500">
                  Failed to load orders. Please refresh.
                </td>
              </tr>
            ) : paginatedOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500">
                  No orders found.
                </td>
              </tr>
            ) : (
              paginatedOrders.map((order, index) => (
                <motion.tr
                  key={order.id}
                  className="border-b hover:bg-gray-100"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <td className="py-2">{order.id}</td>
                  <td>{order.client}</td>
                  <td>{order.product}</td>
                  <td>{order.qty}</td>
                  <td>{order.price}</td>
                  <td>{order.category}</td>
                  <td
                    className={
                      order.status === "Pending"
                        ? "text-yellow-500"
                        : order.status === "Delivered"
                          ? "text-green-500"
                          : "text-red-500"
                    }
                  >
                    {order.status}
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>

        <div className="flex justify-between items-center mt-4">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Prev
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </motion.div>
    </main>
  );
};

export default Dashboard;
