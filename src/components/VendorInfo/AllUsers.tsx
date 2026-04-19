import { useState } from "react";
import {
  Search,
  Users,
  Building2,
  Filter,
  Eye,
  Loader2,
  Shield,
} from "lucide-react";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AllUserDetailed } from "./AllUserDetailed";
import { useQuery } from "@tanstack/react-query";
import { getAllAdmins, getAllUsers, getAllVendor } from "@/services/adminApi";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

/* -------------------------------------------------------------- */
/*   Small helper to render a centered spinner row              */
/* -------------------------------------------------------------- */
const SpinnerRow = ({ colSpan }: { colSpan: number }) => (
  <TableRow>
    <TableCell colSpan={colSpan} className="py-12 text-center">
      <Loader2 className="w-6 h-6 mx-auto animate-spin text-orange-500" />
      <p className="mt-2 text-sm text-gray-500">Loading…</p>
    </TableCell>
  </TableRow>
);

/* ------------------------------------------------------------------ */
/* Status badge helper                                                */
/* ------------------------------------------------------------------ */
const StatusBadge = ({ status }: { status?: string }) => {
  const s = status?.toLowerCase();
  let cls = "text-xs font-medium px-2.5 py-0.5 rounded-full ";
  if (s === "active" || s === "verified" || s === "approved") {
    cls += "bg-green-100 text-green-700";
  } else if (s === "pending") {
    cls += "bg-orange-100 text-orange-600";
  } else if (s === "inactive" || s === "rejected" || s === "not-verified") {
    cls += "bg-red-100 text-red-600";
  } else {
    cls += "bg-gray-100 text-gray-600";
  }
  return <span className={cls}>{status || "—"}</span>;
};

const AllUsers = () => {
  const [activeTab, setActiveTab] = useState<"users" | "vendors" | "admins">(
    "users"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDetail, setSelectedDetail] = useState<{
    type: "user" | "vendor" | "admin";
    id: string | null;
  } | null>(null);
  const admin = useSelector((state: RootState) => state.admin);
  const isAdminSuperAdmin = admin?.role === "Super Admin";


  const { data: vendor = [], isLoading: vendorLoading } = useQuery({
    queryKey: ["vendors"],
    queryFn: async () => {
      try {
        const data = await getAllVendor(admin.token);
        console.log(data);
        return Array.isArray(data) ? data : [];
      } catch (err) {
        console.error("Error fetching vendors:", err);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
  });


  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      try {
        const data = await getAllUsers(admin.token);
        console.log(data);
        return Array.isArray(data) ? data : [];
      } catch (err) {
        console.error("Error fetching user:", err);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: admins = [], isLoading: adminLoading } = useQuery({
    queryKey: ["admins"],
    queryFn: async () => {
      try {
        const data = await getAllAdmins(admin.token);
        console.log(data);
        return Array.isArray(data) ? data : [];
      } catch (err) {
        console.error("Error fetching user:", err);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
  });
  console.log("Admin", admins);
  /* -------------------------------------------------------------- */
  /* Filter helpers                                                 */
  /* -------------------------------------------------------------- */
  const filteredUsers = users.filter((u: any) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "verified" && u.isverified) ||
      (statusFilter === "not-verified" && !u.isverified);
    return matchesSearch && matchesStatus;
  });

  const filteredVendors = vendor.filter((v) => {
    const matchesSearch =
      v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.storeName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      v.verificationStatus?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const filteredAdmins = admins.filter((a: any) => {
    const matchesSearch =
      a.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && (a.status?.toLowerCase() === "active" || !a.status)) ||
      (statusFilter === "inactive" && a.status?.toLowerCase() === "inactive");
    return matchesSearch && matchesStatus;
  });

  /* -------------------------------------------------------------- */
  /* UI helpers                                                     */
  /* -------------------------------------------------------------- */
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleViewDetail = (
    type: "user" | "vendor" | "admin",
    id: string | null
  ) => setSelectedDetail({ type, id });

  const handleBackToMain = () => setSelectedDetail(null);

  /* -------------------------------------------------------------- */
  /* Tab switch – reset filter                                      */
  /* -------------------------------------------------------------- */
  const switchTab = (tab: "users" | "vendors" | "admins") => {
    setActiveTab(tab);
    setStatusFilter("all");
  };

  /* -------------------------------------------------------------- */
  /* Early return for detail view                                   */
  /* -------------------------------------------------------------- */
  if (selectedDetail)
    return (
      <AllUserDetailed
        type={selectedDetail.type}
        id={selectedDetail.id}
        onBack={handleBackToMain}
      />
    );

  /* -------------------------------------------------------------- */
  /* Tab button helper                                              */
  /* -------------------------------------------------------------- */
  const TabBtn = ({
    tab,
    label,
    Icon,
  }: {
    tab: "users" | "vendors" | "admins";
    label: string;
    Icon: React.ComponentType<{ className?: string }>;
  }) => {
    const isActive = activeTab === tab;
    return (
      <button
        onClick={() => switchTab(tab)}
        className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors ${isActive
            ? "bg-[#F87645] text-white shadow-sm"
            : "bg-white text-gray-700 border border-gray-200 hover:bg-orange-50 hover:text-orange-600"
          }`}
      >
        <Icon className="w-4 h-4" />
        {label}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F8FA]">
      {/* Header ---------------------------------------------------- */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container px-6 py-4 mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">
              User Management
            </h1>
            <div className="relative">
              <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-gray-400" />
              <Input
                placeholder={`Search ${activeTab === "users" ? "users" : activeTab === "vendors" ? "vendors" : "admins"}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80 border-gray-200 focus:ring-orange-400 focus:border-orange-400"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="container px-6 py-8 mx-auto">
        {/* Tabs ------------------------------------------------------ */}
        <div className="flex gap-2 mb-8">
          <TabBtn tab="users" label="Users" Icon={Users} />
          <TabBtn tab="vendors" label="Vendors" Icon={Building2} />
          {isAdminSuperAdmin && (
            <TabBtn tab="admins" label="Admins" Icon={Shield} />
          )}
        </div>

        {/* Users table ----------------------------------------------- */}
        {activeTab === "users" && (
          <Card className="border-gray-200 shadow-sm bg-white">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Users className="w-5 h-5 text-orange-500" />
                  Users Management
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40 border-gray-200">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="not-verified">Not verified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F5F8FA] hover:bg-[#F5F8FA]">
                    <TableHead className="text-gray-600 font-semibold">Name</TableHead>
                    <TableHead className="text-gray-600 font-semibold">Email</TableHead>
                    <TableHead className="text-gray-600 font-semibold">Phone</TableHead>
                    <TableHead className="text-gray-600 font-semibold">Status</TableHead>
                    <TableHead className="text-right text-gray-600 font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersLoading ? (
                    <SpinnerRow colSpan={5} />
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12 text-center">
                        <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-semibold text-gray-700">No User Found</h3>
                        <p className="mt-1 text-sm text-gray-400">
                          Try adjusting your filters or search term.
                        </p>
                        <button
                          onClick={() => {
                            setStatusFilter("all");
                            setSearchTerm("");
                          }}
                          className="mt-4 flex items-center gap-2 px-4 py-2 mx-auto rounded bg-[#F87645] text-white text-sm hover:bg-orange-600 transition-colors"
                        >
                          <Filter className="w-4 h-4" />
                          Reset Filters
                        </button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((u: any) => (
                      <TableRow key={u._id} className="hover:bg-orange-50 transition-colors">
                        <TableCell className="font-medium text-gray-800">{u.name}</TableCell>
                        <TableCell className="text-gray-500">
                          {u.email}
                        </TableCell>
                        <TableCell className="text-gray-700">{u.phoneNumber}</TableCell>
                        <TableCell>
                          <StatusBadge status={u.isverified ? "Verified" : "Not verified"} />
                        </TableCell>
                        <TableCell className="text-right">
                          <button
                            onClick={() => handleViewDetail("user", u._id)}
                            className="p-1.5 rounded text-gray-500 hover:bg-orange-100 hover:text-orange-600 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Vendors table --------------------------------------------- */}
        {activeTab === "vendors" && (
          <Card className="border-gray-200 shadow-sm bg-white">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Building2 className="w-5 h-5 text-orange-500" />
                  Vendors Management
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32 border-gray-200">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F5F8FA] hover:bg-[#F5F8FA]">
                    <TableHead className="text-gray-600 font-semibold">Company Name</TableHead>
                    <TableHead className="text-gray-600 font-semibold">Email</TableHead>
                    <TableHead className="text-gray-600 font-semibold">Category</TableHead>
                    <TableHead className="text-gray-600 font-semibold">Status</TableHead>
                    <TableHead className="text-gray-600 font-semibold">Join Date</TableHead>
                    <TableHead className="text-right text-gray-600 font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendorLoading ? (
                    <SpinnerRow colSpan={6} />
                  ) : filteredVendors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12 text-center">
                        <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-semibold text-gray-700">
                          No Vendors Found
                        </h3>
                        <p className="mt-1 text-sm text-gray-400">
                          Try adjusting your filters or search term.
                        </p>
                        <button
                          onClick={() => setStatusFilter("all")}
                          className="mt-4 flex items-center gap-2 px-4 py-2 mx-auto rounded bg-[#F87645] text-white text-sm hover:bg-orange-600 transition-colors"
                        >
                          <Filter className="w-4 h-4" />
                          Reset Filters
                        </button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVendors.map((v) => (
                      <TableRow key={v._id} className="hover:bg-orange-50 transition-colors">
                        <TableCell className="font-medium text-gray-800">
                          {v.storeName}
                        </TableCell>
                        <TableCell className="text-gray-500">
                          {v.email}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-orange-200 text-orange-600 bg-orange-50">
                            {v.craftCategories[0]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={v.verificationStatus} />
                        </TableCell>
                        <TableCell className="text-gray-500">
                          {formatDate(v.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <button
                            onClick={() => handleViewDetail("vendor", v._id)}
                            className="p-1.5 rounded text-gray-500 hover:bg-orange-100 hover:text-orange-600 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Admins table ---------------------------------------------- */}
        {activeTab === "admins" && isAdminSuperAdmin && (
          <Card className="border-gray-200 shadow-sm bg-white">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Shield className="w-5 h-5 text-orange-500" />
                  Admins Management
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32 border-gray-200">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F5F8FA] hover:bg-[#F5F8FA]">
                    <TableHead className="text-gray-600 font-semibold">Name</TableHead>
                    <TableHead className="text-gray-600 font-semibold">Email</TableHead>
                    <TableHead className="text-gray-600 font-semibold">Role</TableHead>
                    <TableHead className="text-gray-600 font-semibold">Status</TableHead>
                    <TableHead className="text-gray-600 font-semibold">Join Date</TableHead>
                    <TableHead className="text-right text-gray-600 font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminLoading ? (
                    <SpinnerRow colSpan={6} />
                  ) : filteredAdmins.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12 text-center">
                        <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-semibold text-gray-700">
                          No Admins Found
                        </h3>
                        <p className="mt-1 text-sm text-gray-400">
                          No admin accounts are available.
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAdmins.map((a: any) => (
                      <TableRow key={a._id} className="hover:bg-orange-50 transition-colors">
                        <TableCell className="font-medium text-gray-800">{a.name}</TableCell>
                        <TableCell className="text-gray-500">
                          {a.email}
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-600">
                            {a.role}
                          </span>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={a.status || "Active"} />
                        </TableCell>
                        <TableCell className="text-gray-500">
                          {formatDate(a.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <button
                            onClick={() => handleViewDetail("admin", a._id)}
                            className="p-1.5 rounded text-gray-500 hover:bg-orange-100 hover:text-orange-600 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AllUsers;
