import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Loader2,
  CreditCard,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Filter,
  Search,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { getAllCustomer_PaymentStats } from "@/services/adminApi";
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
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
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

const getCustomerName = (order: any): string => {
  const full =
    `${order.buyerInfo?.first_name || ""} ${order.buyerInfo?.last_name || ""}`.trim();
  if (full) return full;
  if (order.userId?.name) return order.userId.name;
  if (order.user?.name) return order.user.name;
  return "Unknown Customer";
};

const getCustomerEmail = (order: any): string =>
  order.buyerInfo?.email || order.user?.email || "—";

/* ------------------------------------------------------------------ */
/* Status pill                                                         */
/* ------------------------------------------------------------------ */
const PayStatusBadge = ({ status }: { status?: string }) => {
  const s = status?.toLowerCase();
  let cls = "text-xs font-medium px-2.5 py-0.5 rounded-full ";
  if (s === "successful") cls += "bg-green-100 text-green-700";
  else if (s === "pending") cls += "bg-orange-100 text-orange-600";
  else if (s === "failed") cls += "bg-red-100 text-red-600";
  else cls += "bg-gray-100 text-gray-600";
  return <span className={cls}>{status || "—"}</span>;
};

const OrderStatusBadge = ({ status }: { status?: string }) => {
  const s = status?.toLowerCase();
  let cls = "text-xs font-medium px-2.5 py-0.5 rounded-full ";
  if (s === "delivered") cls += "bg-green-100 text-green-700";
  else if (s === "processing" || s === "pending")
    cls += "bg-orange-100 text-orange-600";
  else if (s === "cancelled") cls += "bg-red-100 text-red-600";
  else cls += "bg-gray-100 text-gray-600";
  return <span className={cls}>{status || "—"}</span>;
};

/* ------------------------------------------------------------------ */
/* Stat card                                                           */
/* ------------------------------------------------------------------ */
const StatCard = ({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string; size?: number }>;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string | number;
}) => (
  <motion.div
    className="flex items-center gap-4 p-5 bg-white rounded-lg border border-gray-200 shadow-sm"
    whileHover={{ scale: 1.02 }}
    transition={{ duration: 0.2 }}
  >
    <div className={`p-3 rounded-lg ${iconBg}`}>
      <Icon className={iconColor} size={22} />
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </motion.div>
);

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
const CustomersPage: React.FC = () => {
  const [filter, setFilter] = useState<"All" | "Successful" | "Pending" | "Failed">("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const admin = useSelector((s: RootState) => s.admin);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["customersPayments"],
    queryFn: () => getAllCustomer_PaymentStats(admin.token),
    enabled: !!admin.token,
  });

  const customers: any[] = data?.customers || [];
  const paymentSummary = data?.paymentSummary || {
    totalRevenue: 0,
    successfulPayments: 0,
    pendingPayments: 0,
    failedPayments: 0,
  };

  // Filter by payStatus + search
  const filtered = customers.filter((order: any) => {
    const matchesStatus = filter === "All" || order.payStatus === filter;
    const name = getCustomerName(order).toLowerCase();
    const email = getCustomerEmail(order).toLowerCase();
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm || name.includes(q) || email.includes(q) || (order._id || "").includes(q);
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const filterOptions = ["All", "Successful", "Pending", "Failed"] as const;

  return (
    <div className="min-h-screen bg-[#F5F8FA]">
      {/* Header ---------------------------------------------------- */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container px-6 py-4 mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">
              Orders &amp; Customers
            </h1>
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
        {/* Stat cards ------------------------------------------------ */}
        <motion.div
          className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <StatCard
            icon={ShoppingBag}
            iconBg="bg-orange-100"
            iconColor="text-orange-500"
            label="Total Orders"
            value={customers.length}
          />
          <StatCard
            icon={TrendingUp}
            iconBg="bg-green-100"
            iconColor="text-green-600"
            label="Total Revenue"
            value={`$${paymentSummary.totalRevenue.toLocaleString()}`}
          />
          <StatCard
            icon={CreditCard}
            iconBg="bg-blue-100"
            iconColor="text-blue-500"
            label="Successful Payments"
            value={paymentSummary.successfulPayments}
          />
          <StatCard
            icon={User}
            iconBg="bg-red-100"
            iconColor="text-red-400"
            label="Pending / Failed"
            value={`${paymentSummary.pendingPayments} / ${paymentSummary.failedPayments}`}
          />
        </motion.div>

        {/* Filter tabs ---------------------------------------------- */}
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-4 h-4 text-gray-400" />
          {filterOptions.map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${filter === f
                  ? "bg-[#F87645] text-white shadow-sm"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-orange-50 hover:text-orange-600"
                }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Table card ----------------------------------------------- */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            <span className="ml-3 text-sm text-gray-500">Loading orders…</span>
          </div>
        ) : error ? (
          <div className="p-6 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
            Failed to load customers. Please try refreshing.
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
                    <ShoppingBag className="w-5 h-5 text-orange-500" />
                    Customer Orders
                  </CardTitle>
                  <span className="text-sm text-gray-400">
                    {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {customers.length === 0 ? (
                  /* Empty state */
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <ShoppingBag className="w-12 h-12 mb-4 text-gray-300" />
                    <h3 className="text-base font-semibold text-gray-700">
                      No orders found
                    </h3>
                    <p className="mt-1 text-sm text-gray-400 max-w-xs">
                      When customers place orders, they'll appear here with
                      payment details.
                    </p>
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => refetch()}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm text-white rounded bg-[#F87645] hover:bg-orange-600 transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                      </button>
                    </div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#F5F8FA] hover:bg-[#F5F8FA]">
                        <TableHead className="text-gray-600 font-semibold">
                          Order ID
                        </TableHead>
                        <TableHead className="text-gray-600 font-semibold">
                          Customer Name
                        </TableHead>
                        <TableHead className="text-gray-600 font-semibold">
                          Email
                        </TableHead>
                        <TableHead className="text-gray-600 font-semibold">
                          Items
                        </TableHead>
                        <TableHead className="text-gray-600 font-semibold">
                          Total
                        </TableHead>
                        <TableHead className="text-gray-600 font-semibold">
                          Order Status
                        </TableHead>
                        <TableHead className="text-gray-600 font-semibold">
                          Pay Status
                        </TableHead>
                        <TableHead className="text-gray-600 font-semibold">
                          Date
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginated.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={8}
                            className="py-14 text-center"
                          >
                            <User className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                            <p className="text-sm text-gray-400">
                              No orders match your current filters.
                            </p>
                            <button
                              onClick={() => {
                                setFilter("All");
                                setSearchTerm("");
                                setCurrentPage(1);
                              }}
                              className="mt-4 flex items-center gap-2 px-4 py-2 mx-auto rounded bg-[#F87645] text-white text-sm hover:bg-orange-600 transition-colors"
                            >
                              <Filter className="w-4 h-4" />
                              Reset Filters
                            </button>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginated.map((order: any, idx: number) => (
                          <motion.tr
                            key={order._id || idx}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.02 * idx }}
                            className="border-b border-gray-100 hover:bg-orange-50 transition-colors"
                          >
                            {/* Order ID */}
                            <TableCell>
                              <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                #{(order._id || "").slice(-8).toUpperCase()}
                              </span>
                            </TableCell>

                            {/* Customer Name */}
                            <TableCell className="font-medium text-gray-800 whitespace-nowrap">
                              {getCustomerName(order)}
                            </TableCell>

                            {/* Email */}
                            <TableCell className="text-gray-500 text-sm">
                              {getCustomerEmail(order)}
                            </TableCell>

                            {/* Items count */}
                            <TableCell className="text-gray-700 text-center">
                              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200">
                                {(order.items || []).length} item
                                {(order.items || []).length !== 1 ? "s" : ""}
                              </span>
                            </TableCell>

                            {/* Total */}
                            <TableCell className="font-semibold text-gray-800">
                              ₦{(order.totalPrice ?? 0).toLocaleString()}
                            </TableCell>

                            {/* Order Status */}
                            <TableCell>
                              <OrderStatusBadge status={order.status} />
                            </TableCell>

                            {/* Pay Status */}
                            <TableCell>
                              <PayStatusBadge status={order.payStatus} />
                            </TableCell>

                            {/* Date */}
                            <TableCell className="text-gray-500 text-sm whitespace-nowrap">
                              {formatDate(order.createdAt)}
                            </TableCell>
                          </motion.tr>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Pagination ------------------------------------------ */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-5">
                <p className="text-sm text-gray-500">
                  Showing {paginated.length} of {filtered.length} results
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded border border-gray-200 text-sm text-gray-600 bg-white hover:bg-orange-50 hover:text-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1.5 rounded border text-sm font-medium transition-colors ${page === currentPage
                            ? "bg-[#F87645] text-white border-[#F87645]"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-orange-50 hover:text-orange-600"
                          }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded border border-gray-200 text-sm text-gray-600 bg-white hover:bg-orange-50 hover:text-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
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

export default CustomersPage;
