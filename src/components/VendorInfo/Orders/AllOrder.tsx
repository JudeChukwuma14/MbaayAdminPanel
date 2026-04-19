import { useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Search,
  Filter,
  Loader2,
  Eye,
} from "lucide-react";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { getAllOrders } from "../../../services/adminApi";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "@/components/redux/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/* ------------------------------------------------------------------ */
/* Status badge                                                        */
/* ------------------------------------------------------------------ */
const StatusBadge = ({ status }: { status?: string }) => {
  const s = status?.toLowerCase();
  let cls = "text-xs font-medium px-2.5 py-0.5 rounded-full ";
  if (s === "delivered") cls += "bg-green-100 text-green-700";
  else if (s === "on delivery" || s === "shipped" || s === "processing")
    cls += "bg-orange-100 text-orange-600";
  else if (s === "pending") cls += "bg-yellow-100 text-yellow-700";
  else if (s === "cancelled") cls += "bg-red-100 text-red-600";
  else cls += "bg-gray-100 text-gray-600";
  return <span className={cls}>{status || "—"}</span>;
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
const AllProductsPage = () => {
  const [currentTab, setCurrentTab] = useState("All");
  const [sortOrder, setSortOrder] = useState<"Newest" | "Oldest">("Newest");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const admin = useSelector((state: RootState) => state.admin);
  const rowsPerPage = 10;

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ["all-orders"],
    queryFn: async () => {
      try {
        const data = await getAllOrders(admin.token);
        return Array.isArray(data) ? data : [];
      } catch (err) {
        console.error("Error fetching orders:", err);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  const formatDate = (iso?: string) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const transformOrderData = (orders: any[]) =>
    orders.map((order) => {
      const totalAmount =
        order.items?.reduce(
          (sum: number, item: any) => sum + item.price * item.quantity,
          0
        ) || 0;
      return {
        id: order._id || order.orderId || "#Unknown",
        rawDate: order.createdAt,
        date: formatDate(order.createdAt),
        customer:
          order.userId?.name ||
          `${order.buyerInfo?.first_name || ""} ${order.buyerInfo?.last_name || ""}`.trim() ||
          "Unknown Customer",
        email: order.userId?.email || order.buyerInfo?.email || "—",
        location:
          order.shippingAddress?.address ||
          order.buyerInfo?.address ||
          "—",
        amount: totalAmount,
        status: order.status || "Unknown",
      };
    });

  const allOrders = orders ? transformOrderData(orders) : [];

  const tabs = ["All", "On Delivery", "Delivered", "Cancelled", "Pending"];

  const filtered = allOrders.filter((o) => {
    const matchesTab = currentTab === "All" || o.status === currentTab;
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      o.customer.toLowerCase().includes(q) ||
      o.email.toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  const sorted = [...filtered].sort((a, b) =>
    sortOrder === "Newest"
      ? new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime()
      : new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime()
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / rowsPerPage));
  const paginated = sorted.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="min-h-screen bg-[#F5F8FA]">
      {/* Header ---------------------------------------------------- */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container px-6 py-4 mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">All Orders</h1>
            <div className="relative">
              <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-gray-400" />
              <Input
                placeholder="Search by name, email or order ID..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 w-80 border-gray-200 focus:ring-orange-400 focus:border-orange-400"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="container px-6 py-8 mx-auto">
        {/* Status tabs + sort -------------------------------------- */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-gray-400" />
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setCurrentTab(tab);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  currentTab === tab
                    ? "bg-[#F87645] text-white shadow-sm"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-orange-50 hover:text-orange-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            onClick={() =>
              setSortOrder(sortOrder === "Newest" ? "Oldest" : "Newest")
            }
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
          >
            {sortOrder}
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Table card ---------------------------------------------- */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            <span className="ml-3 text-sm text-gray-500">Loading orders…</span>
          </div>
        ) : error ? (
          <div className="p-6 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
            Failed to load orders. Please try refreshing.
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="border-gray-200 shadow-sm bg-white">
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <ShoppingCart className="w-5 h-5 text-orange-500" />
                    Orders
                  </CardTitle>
                  <span className="text-sm text-gray-400">
                    {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#F5F8FA] hover:bg-[#F5F8FA]">
                      <TableHead className="text-gray-600 font-semibold">Order ID</TableHead>
                      <TableHead className="text-gray-600 font-semibold">Date</TableHead>
                      <TableHead className="text-gray-600 font-semibold">Customer</TableHead>
                      <TableHead className="text-gray-600 font-semibold">Email</TableHead>
                      <TableHead className="text-gray-600 font-semibold">Location</TableHead>
                      <TableHead className="text-gray-600 font-semibold">Amount</TableHead>
                      <TableHead className="text-gray-600 font-semibold">Status</TableHead>
                      <TableHead className="text-right text-gray-600 font-semibold">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginated.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="py-16 text-center">
                          <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <h3 className="text-base font-semibold text-gray-700">
                            No Orders Found
                          </h3>
                          <p className="mt-1 text-sm text-gray-400">
                            When orders are placed, they will appear here.
                          </p>
                          {(currentTab !== "All" || searchTerm) && (
                            <button
                              onClick={() => {
                                setCurrentTab("All");
                                setSearchTerm("");
                                setCurrentPage(1);
                              }}
                              className="mt-4 flex items-center gap-2 px-4 py-2 mx-auto rounded bg-[#F87645] text-white text-sm hover:bg-orange-600 transition-colors"
                            >
                              <Filter className="w-4 h-4" />
                              Reset Filters
                            </button>
                          )}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginated.map((order, index) => (
                        <motion.tr
                          key={order.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.04 }}
                          className="border-b border-gray-100 hover:bg-orange-50 transition-colors"
                        >
                          <TableCell>
                            <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                              #{order.id.slice(-8).toUpperCase()}
                            </span>
                          </TableCell>
                          <TableCell className="text-gray-500 text-sm whitespace-nowrap">
                            {order.date}
                          </TableCell>
                          <TableCell className="font-medium text-gray-800 whitespace-nowrap">
                            {order.customer}
                          </TableCell>
                          <TableCell className="text-gray-500 text-sm">
                            {order.email}
                          </TableCell>
                          <TableCell className="text-gray-500 text-sm max-w-[180px] truncate">
                            {order.location}
                          </TableCell>
                          <TableCell className="font-semibold text-gray-800">
                            ₦{order.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={order.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <NavLink to={`/order-details/${order.id}`}>
                              <button className="inline-flex items-center gap-1.5 p-1.5 rounded text-gray-500 hover:bg-orange-100 hover:text-orange-600 transition-colors">
                                <Eye className="w-4 h-4" />
                                <span className="text-xs font-medium">View</span>
                              </button>
                            </NavLink>
                          </TableCell>
                        </motion.tr>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Pagination ---------------------------------------- */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-5">
                <p className="text-sm text-gray-500">
                  Showing {paginated.length} of {filtered.length} results
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.max(p - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="p-2 rounded border border-gray-200 bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1.5 rounded border text-sm font-medium transition-colors ${
                          page === currentPage
                            ? "bg-[#F87645] text-white border-[#F87645]"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-orange-50 hover:text-orange-600"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(p + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 rounded border border-gray-200 bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AllProductsPage;
