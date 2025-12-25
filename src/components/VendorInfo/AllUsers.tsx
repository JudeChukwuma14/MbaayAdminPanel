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
import { Button } from "@/components/ui/button";
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
      <Loader2 className="w-6 h-6 mx-auto animate-spin text-primary" />
      <p className="mt-2 text-sm text-muted-foreground">Loading…</p>
    </TableCell>
  </TableRow>
);

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */
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

  /* -------------------------------------------------------------- */
  /* Vendor query                                                   */
  /* -------------------------------------------------------------- */
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

  /* -------------------------------------------------------------- */
  /* User query – ready to be replaced with real API                */
  /* -------------------------------------------------------------- */
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
      v.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      v.kycStatus?.toLowerCase() === statusFilter.toLowerCase();
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

  const getStatusBadgeVariant = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "verified":
      case "approved":
        return "default";
      case "pending":
        return "secondary";
      case "inactive":
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header ---------------------------------------------------- */}
      <header className="border-b border-border bg-card">
        <div className="container px-6 py-4 mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">
              User Management
            </h1>
            <div className="relative">
              <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
              <Input
                placeholder="Search users or vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="container px-6 py-8 mx-auto">
        {/* Tabs ------------------------------------------------------ */}
        <div className="flex gap-2 mb-8">
          <Button
            variant={activeTab === "users" ? "default" : "outline"}
            onClick={() => switchTab("users")}
            className="flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Users
          </Button>
          <Button
            variant={activeTab === "vendors" ? "default" : "outline"}
            onClick={() => switchTab("vendors")}
            className="flex items-center gap-2"
          >
            <Building2 className="w-4 h-4" />
            Vendors
          </Button>
          {isAdminSuperAdmin && (
            <Button
              variant={activeTab === "admins" ? "default" : "outline"}
              onClick={() => switchTab("admins")}
              className="flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Admins
            </Button>
          )}
        </div>

        {/* Users table ----------------------------------------------- */}
        {activeTab === "users" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Users Management
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
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
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersLoading ? (
                    <SpinnerRow colSpan={5} />
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12 text-center">
                        <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">No User Found</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Try adjusting your filters or search term.
                        </p>
                        <Button
                          onClick={() => {
                            setStatusFilter("all");
                            setSearchTerm("");
                          }}
                          className="mt-4"
                          size="sm"
                        >
                          <Filter className="w-4 h-4 mr-2" />
                          Reset Filters
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((u: any) => (
                      <TableRow key={u._id}>
                        <TableCell className="font-medium">{u.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {u.email}
                        </TableCell>
                        <TableCell>{u.phoneNumber}</TableCell>
                        <TableCell>
                          <Badge
                            variant={u.isverified ? "default" : "destructive"}
                          >
                            {u.isverified ? "Verified" : "Not verified"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetail("user", u._id)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
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
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Vendors Management
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
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
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendorLoading ? (
                    <SpinnerRow colSpan={6} />
                  ) : filteredVendors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12 text-center">
                        <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">
                          No Vendors Found
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Try adjusting your filters or search term.
                        </p>
                        <Button
                          onClick={() => setStatusFilter("all")}
                          className="mt-4"
                          size="sm"
                        >
                          <Filter className="w-4 h-4 mr-2" />
                          Reset Filters
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVendors.map((v) => (
                      <TableRow key={v._id}>
                        <TableCell className="font-medium">
                          {v.storeName}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {v.email}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {v.craftCategories[0]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(v.kycStatus)}>
                            {v.kycStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(v.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetail("vendor", v._id)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  {/* {filteredVendors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                          <Building2 className="w-12 h-12 mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-semibold">
                            No Vendors Found
                          </h3>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Try adjusting your filters or search term.
                          </p>
                          <Button
                            onClick={() => setStatusFilter("all")}
                            className="mt-4"
                          >
                            <Filter className="w-4 h-4 mr-2" />
                            Reset Filters
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVendors.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell className="font-medium">
                          {v.storeName}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {v.email}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {v.craftCategories[0]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(v.kycStatus)}>
                            {v.kycStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(v.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetail("vendor", v.id)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )} */}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Admins table ---------------------------------------------- */}
        {activeTab === "admins" && isAdminSuperAdmin && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Admins Management
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
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
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminLoading ? (
                    <SpinnerRow colSpan={6} />
                  ) : admins.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12 text-center">
                        <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">
                          No Admins Found
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          No admin accounts are available.
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    admins.map((a: any) => (
                      <TableRow key={a._id}>
                        <TableCell className="font-medium">{a.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {a.email}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{a.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(a.status)}>
                            {a.status || "Active"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(a.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetail("admin", a._id)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
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
