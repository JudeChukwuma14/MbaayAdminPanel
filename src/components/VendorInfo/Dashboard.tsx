import { useState, useMemo, useEffect } from "react";
import {
  Eye,
  EyeOff,
  ShoppingCart,
  Package,
  TrendingUp,
  Bell,
  ArrowRight,
  TrendingDown,
  Wallet,
  Calendar,
} from "lucide-react";
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
  Filler,
} from "chart.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
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
        amount: totalAmount,
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

  /* ------------------------------------------------------------------ */
  /* Functional Chart Logic                                             */
  /* ------------------------------------------------------------------ */
  const chartData = useMemo(() => {
    const monthsToShow = selectedMonths === 1 ? 6 : selectedMonths === 3 ? 6 : selectedMonths; // show at least 6 months if 1 or 3 selected for better trend visual
    const labels: string[] = [];
    const revenueData: number[] = [];
    
    const now = new Date();
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleString("default", { month: "short" });
      labels.push(monthLabel);
      
      // Calculate revenue for this month/year
      const monthTotal = orders.reduce((sum: number, order: any) => {
        const orderDate = new Date(order.createdAt);
        if (
          orderDate.getMonth() === d.getMonth() &&
          orderDate.getFullYear() === d.getFullYear()
        ) {
          const totalAmount = order.items?.reduce(
            (s: number, item: any) => s + (item.price || 0) * (item.quantity || 0),
            0
          ) || 0;
          return sum + totalAmount;
        }
        return sum;
      }, 0);
      revenueData.push(monthTotal);
    }

    return {
      labels,
      datasets: [
        {
          fill: true,
          label: "Revenue (₦)",
          data: revenueData,
          borderColor: "#F87645",
          backgroundColor: "rgba(248, 118, 69, 0.1)",
          borderWidth: 3,
          tension: 0.4,
          pointBackgroundColor: "#F87645",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  }, [orders, selectedMonths]);

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "#fff",
        titleColor: "#111",
        bodyColor: "#666",
        borderColor: "#eee",
        borderWidth: 1,
        padding: 12,
        boxPadding: 4,
        callbacks: {
          label: (context) => `₦${context.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: { 
        grid: { display: false },
        ticks: { color: "#999", font: { size: 12 } }
      },
      y: { 
        grid: { color: "rgba(0, 0, 0, 0.05)" },
        border: { display: false },
        ticks: { 
          color: "#999", 
          font: { size: 12 },
          callback: (value) => `₦${Number(value).toLocaleString()}`
        }
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#F5F8FA]">
      {/* Page Header */}
      <header className="sticky top-0 z-10 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="px-6 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-500">
                Welcome back! Here's what's happening with your platform today.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 items-center gap-2 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-500">
                <Calendar className="w-4 h-4 text-[#F87645]" />
                <span className="font-semibold text-gray-700">
                  {new Date().toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="mx-auto max-w-7xl">
          {/* Stat Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="relative overflow-hidden bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Wallet Balance</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-gray-900">
                      {balanceVisible ? `₦${balance.toLocaleString()}` : "••••••"}
                    </p>
                    <button
                      onClick={toggleBalanceVisibility}
                      className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      {balanceVisible ? (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <Wallet className="w-6 h-6 text-[#F87645]" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-green-600 font-medium">
                <TrendingUp className="w-3 h-3 mr-1" />
                <span>+12.5% from last month</span>
              </div>
              {/* Subtle background decoration */}
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-orange-50 rounded-full opacity-50" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Total Orders</h3>
                  <p className="text-2xl font-bold text-gray-900">{totalOrders.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-green-600 font-medium">
                <TrendingUp className="w-3 h-3 mr-1" />
                <span>+5.2% from last week</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Products Sold</h3>
                  <p className="text-2xl font-bold text-gray-900">{productsSold.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <Package className="w-6 h-6 text-purple-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-red-600 font-medium">
                <TrendingDown className="w-3 h-3 mr-1" />
                <span>-2.1% from last month</span>
              </div>
            </motion.div>
          </div>

          {/* Chart and Notifications View */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="h-full border-gray-200 shadow-sm overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 bg-white p-6">
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-800">Revenue Report</CardTitle>
                    <p className="text-xs text-gray-500 mt-1">Monthly earnings overview</p>
                  </div>
                  <div className="flex p-1 bg-gray-50 rounded-lg border border-gray-100">
                    {[1, 3, 6].map((month) => (
                      <button
                        key={month}
                        onClick={() => setSelectedMonths(month)}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                          selectedMonths === month
                            ? "bg-white text-[#F87645] shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        {month}M
                      </button>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-8 bg-white">
                  <div className="h-[300px]">
                    <Line data={chartData} options={chartOptions} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="h-full border-gray-200 shadow-sm overflow-hidden">
                <CardHeader className="border-b border-gray-100 bg-white p-6">
                  <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-[#F87645]" />
                    Recent Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 bg-white">
                  <div className="max-h-[385px] overflow-y-auto">
                    {notificationsLoading ? (
                      <div className="p-12 text-center text-gray-400 flex flex-col items-center">
                        <motion.div 
                          animate={{ rotate: 360 }} 
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        >
                          <TrendingUp className="w-8 h-8 opacity-20" />
                        </motion.div>
                        <p className="mt-2 text-sm italic">Gathering alerts...</p>
                      </div>
                    ) : recentNotifications.length === 0 ? (
                      <div className="p-12 text-center text-gray-400">
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-10" />
                        <p className="text-sm">Everything caught up!</p>
                      </div>
                    ) : (
                      <ul className="divide-y divide-gray-100">
                        {recentNotifications.slice(0, 5).map((notif: any, index: number) => (
                          <li
                            key={notif._id || index}
                            className="p-4 hover:bg-orange-50/30 transition-colors group cursor-pointer"
                          >
                            <div className="flex gap-3">
                              <div className={`mt-1 p-1.5 rounded-full ${
                                notif.type === 'order' ? 'bg-blue-50 text-blue-500' :
                                notif.type === 'payment' ? 'bg-green-50 text-green-500' :
                                'bg-orange-50 text-[#F87645]'
                              }`}>
                                <Bell className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <h4 className="text-sm font-semibold text-gray-800 line-clamp-1">
                                    {notif.title || "Notification"}
                                  </h4>
                                  <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                    {new Date(notif.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                                  {notif.message}
                                </p>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="p-4 border-t border-gray-50 text-center">
                    <button className="text-xs font-bold text-[#F87645] hover:underline flex items-center justify-center mx-auto gap-1">
                      View All Notifications
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Orders Table Section */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="border-gray-200 shadow-sm bg-white overflow-hidden">
              <CardHeader className="border-b border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-orange-500" />
                    Latest Orders
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#F5F8FA] hover:bg-[#F5F8FA]">
                      <TableHead className="text-gray-600 font-semibold px-6 py-4">ID</TableHead>
                      <TableHead className="text-gray-600 font-semibold">Customer</TableHead>
                      <TableHead className="text-gray-600 font-semibold">Product</TableHead>
                      <TableHead className="text-gray-600 font-semibold">Qty</TableHead>
                      <TableHead className="text-gray-600 font-semibold">Price</TableHead>
                      <TableHead className="text-gray-600 font-semibold">Status</TableHead>
                      <TableHead className="text-right text-gray-600 font-semibold px-6">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {showingLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-20 text-center">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            className="inline-block"
                          >
                            <TrendingUp className="w-8 h-8 text-orange-500 opacity-50" />
                          </motion.div>
                          <p className="mt-3 text-gray-400 animate-pulse">Syncing orders...</p>
                        </TableCell>
                      </TableRow>
                    ) : isError ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-20 text-center text-red-500">
                          <p className="font-semibold italic">Failed to load order stream.</p>
                        </TableCell>
                      </TableRow>
                    ) : paginatedOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-20 text-center text-gray-400 italic">
                          No recent transactions recorded.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedOrders.map((order) => (
                        <TableRow
                          key={order.id}
                          className="hover:bg-orange-50/50 transition-colors border-b border-gray-50"
                        >
                          <TableCell className="px-6">
                            <span className="font-mono text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                              #{order.id.slice(-6).toUpperCase()}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium text-gray-700">{order.client}</TableCell>
                          <TableCell className="text-gray-500 text-sm max-w-[200px] truncate">
                            {order.product}
                          </TableCell>
                          <TableCell className="text-gray-600">{order.qty}</TableCell>
                          <TableCell className="font-semibold text-gray-900">
                            ₦{order.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={`rounded-full px-2.5 py-0.5 border-transparent ${
                                order.status === "Delivered" ? "bg-green-50 text-green-700" :
                                order.status === "Pending" ? "bg-orange-50 text-orange-600" :
                                "bg-red-50 text-red-600"
                              }`}
                            >
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right px-6">
                            <button className="p-1.5 rounded-lg text-gray-400 hover:bg-orange-100 hover:text-orange-600 transition-all">
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 bg-gray-50 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Showing Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handlePrev}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
