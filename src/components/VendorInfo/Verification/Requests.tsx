import type React from "react";
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Search, Filter, Eye, Building2, Loader2 } from "lucide-react";
import { findOneAdmin } from "../../../services/adminApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type RequestStatus = "Pending" | "Approved" | "Rejected";

/* ------------------------------------------------------------------ */
/* Status badge                                                        */
/* ------------------------------------------------------------------ */
const StatusBadge = ({ status }: { status?: string }) => {
  const s = status?.toLowerCase();
  let cls = "text-xs font-medium px-2.5 py-0.5 rounded-full ";
  if (s === "approved") cls += "bg-green-100 text-green-700";
  else if (s === "pending") cls += "bg-orange-100 text-orange-600";
  else if (s === "rejected") cls += "bg-red-100 text-red-600";
  else cls += "bg-gray-100 text-gray-600";
  return <span className={cls}>{status || "—"}</span>;
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
const RequestPage: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<RequestStatus | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const user = useSelector((state: any) => state.admin);

  useEffect(() => {
    const fetchAdmin = async () => {
      if (!user?.token) return;
      setLoading(true);
      try {
        const adminData = await findOneAdmin(user.token);
        // Safely coerce response to array regardless of wrapper shape
        if (Array.isArray(adminData)) {
          setData(adminData);
        } else if (adminData && typeof adminData === "object") {
          const inner =
            adminData.data ??
            adminData.vendors ??
            adminData.requests ??
            adminData.results ??
            [];
          setData(Array.isArray(inner) ? inner : []);
        } else {
          setData([]);
        }
      } catch (error) {
        console.error("Error fetching requests:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmin();
  }, [user?.token]);

  const filteredRequests = useMemo(() => {
    return data.filter((req: any) => {
      const matchesFilter =
        filter === "all" || req.verificationStatus === filter;
      const matchesSearch =
        req.storeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.craftCategories?.[0]
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [data, filter, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / itemsPerPage));
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const filterOptions: (RequestStatus | "all")[] = [
    "all",
    "Pending",
    "Approved",
    "Rejected",
  ];

  return (
    <div className="min-h-screen bg-[#F5F8FA]">
      {/* Header ---------------------------------------------------- */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container px-6 py-4 mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">
              Vendor Requests
            </h1>
            <div className="relative">
              <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-gray-400" />
              <Input
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 w-72 border-gray-200 focus:ring-orange-400 focus:border-orange-400"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="container px-6 py-8 mx-auto">
        {/* Filter tabs --------------------------------------------- */}
        <div className="flex gap-2 mb-6">
          <Filter className="w-4 h-4 text-gray-400 self-center" />
          {filterOptions.map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-[#F87645] text-white shadow-sm"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-orange-50 hover:text-orange-600"
              }`}
            >
              {f === "all" ? "All" : f}
            </button>
          ))}
        </div>

        {/* Table card ---------------------------------------------- */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-gray-200 shadow-sm bg-white">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Building2 className="w-5 h-5 text-orange-500" />
                Vendor Applications ({loading ? "…" : filteredRequests.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                  <span className="ml-3 text-sm text-gray-500">
                    Loading requests…
                  </span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#F5F8FA] hover:bg-[#F5F8FA]">
                      <TableHead className="text-gray-600 font-semibold">
                        Store Name
                      </TableHead>
                      <TableHead className="text-gray-600 font-semibold">
                        Email
                      </TableHead>
                      <TableHead className="text-gray-600 font-semibold">
                        Category
                      </TableHead>
                      <TableHead className="text-gray-600 font-semibold">
                        Status
                      </TableHead>
                      <TableHead className="text-right text-gray-600 font-semibold">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence initial={false}>
                      {paginatedRequests.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="py-16 text-center"
                          >
                            <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <h3 className="text-base font-semibold text-gray-700">
                              No requests found
                            </h3>
                            <p className="mt-1 text-sm text-gray-400">
                              Try adjusting your filters or search term.
                            </p>
                            <button
                              onClick={() => {
                                setFilter("all");
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
                        paginatedRequests.map((request: any) => (
                          <motion.tr
                            key={request._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.25 }}
                            className="border-b border-gray-100 hover:bg-orange-50 transition-colors"
                          >
                            <TableCell className="font-medium text-gray-800">
                              {request.storeName}
                            </TableCell>
                            <TableCell className="text-gray-500">
                              {request.email}
                            </TableCell>
                            <TableCell className="text-gray-700">
                              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200">
                                {request.craftCategories?.[0] ?? "—"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <StatusBadge
                                status={request.verificationStatus}
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <Link
                                to={`request-detail/${request._id}`}
                                className="inline-flex items-center gap-1.5 p-1.5 rounded text-gray-500 hover:bg-orange-100 hover:text-orange-600 transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                <span className="text-xs font-medium">
                                  View
                                </span>
                              </Link>
                            </TableCell>
                          </motion.tr>
                        ))
                      )}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Pagination ----------------------------------------------- */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 mt-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded border border-gray-200 text-sm text-gray-600 bg-white hover:bg-orange-50 hover:text-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
            ))}

            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(p + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded border border-gray-200 text-sm text-gray-600 bg-white hover:bg-orange-50 hover:text-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestPage;