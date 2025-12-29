import { useState } from "react";
import {
  ArrowLeft,
  Shield,
  Mail,
  Calendar,
  Building2,
  User,
  Phone,
  Ban,
  CheckCircle,
  Trash2,
  X,
  Send,
  CreditCard,
  FileText,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUserById,
  getVendorById,
  getAdminById,
  BlockUnblockDeleteUser,
  sendPrivateMessage,
} from "@/services/adminApi";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { toast, ToastContainer } from "react-toastify";

interface UserVendorDetailProps {
  type: "user" | "vendor" | "admin" | "customerCare";
  id: string | null;
  onBack: () => void;
}

export function AllUserDetailed({ type, id, onBack }: UserVendorDetailProps) {
  /* ---------------------------------------------------------- */
  /* local state                                                */
  /* ---------------------------------------------------------- */
  const [adminNotes, setAdminNotes] = useState("");
  // const [isBlocked, setIsBlocked] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messageTitle, setMessageTitle] = useState("");

  /* ---------------------------------------------------------- */
  /* single query – endpoint returns user OR vendor object      */
  /* ---------------------------------------------------------- */
  const userQuery = useQuery({
    queryKey: ["user", id],
    queryFn: () => getUserById(id!),
    enabled: type === "user" && !!id,
    staleTime: 1000 * 60 * 5,
  });
  console.log("UserData", userQuery.data);
  const vendorQuery = useQuery({
    queryKey: ["vendor", id],
    queryFn: () => getVendorById(id),
    enabled: type === "vendor" && !!id,
    staleTime: 1000 * 60 * 5,
  });

  const adminQuery = useQuery({
    queryKey: ["admin", id],
    queryFn: () => getAdminById(id, admin.token),
    enabled: (type === "admin" || type === "customerCare") && !!id,
    staleTime: 1000 * 60 * 5,
  });

  console.log("VendorData", vendorQuery.data);
  console.log("AdminData", adminQuery.data);

  // Determine the actual type based on admin role
  const actualType =
    type === "admin" && adminQuery.data?.role === "customerCare"
      ? "customerCare"
      : type;

  // Check if user is super admin (hide quick actions)
  const isSuperAdmin =
    type === "admin" && adminQuery.data?.role === "Super Admin";

  // Check if user is admin or customer care (hide private messages)
  const shouldHidePrivateMessages =
    (type === "admin" || actualType === "customerCare") &&
    adminQuery.data?.role !== "Super Admin";

  const data =
    actualType === "user"
      ? userQuery.data
      : actualType === "vendor"
      ? vendorQuery.data
      : adminQuery.data;

  const isLoading =
    type === "user"
      ? userQuery.isLoading
      : type === "vendor"
      ? vendorQuery.isLoading
      : adminQuery.isLoading;

  const error =
    type === "user"
      ? userQuery.error
      : type === "vendor"
      ? vendorQuery.error
      : adminQuery.error;

  const isBlocked = data?.isBlocked;
  // Handle both boolean and string values for isBlocked
  const isBlockedStatus =
    typeof isBlocked === "boolean"
      ? isBlocked
      : typeof isBlocked === "string"
      ? isBlocked.toLowerCase() === "true"
      : false;
  console.log("isBlock", isBlocked, "isBlockedStatus", isBlockedStatus);

  /* ---------------------------------------------------------- */
  /* admin state                                                */
  /* ---------------------------------------------------------- */
  const admin = useSelector((state: RootState) => state.admin);

  /* ---------------------------------------------------------- */
  /* mutation for block/unblock/delete                          */
  /* ---------------------------------------------------------- */
  const queryClient = useQueryClient();
  const blockUnblockDeleteMutation = useMutation({
    mutationFn: ({
      userId,
      userType,
      action,
    }: {
      userId: string;
      userType: "user" | "vendor" | "admin" | "customerCare";
      action: "block" | "unblock" | "delete";
    }) => BlockUnblockDeleteUser(userId, userType, action, admin.token),
    onSuccess: (data, variables) => {
      console.log(
        `${variables.action} ${variables.userType} successful:`,
        data
      );
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["user", id] });
      queryClient.invalidateQueries({ queryKey: ["vendor", id] });
      queryClient.invalidateQueries({ queryKey: ["admin", id] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
    onError: (error, variables) => {
      console.error(
        `Error ${variables.action}ing ${variables.userType}:`,
        error
      );
    },
  });

  /* ---------------------------------------------------------- */
  /* mutation for sending private messages                      */
  /* ---------------------------------------------------------- */
  const sendPrivateMessageMutation = useMutation({
    mutationFn: ({
      recipientId,
      recipientType,
      title,
      message,
    }: {
      recipientId: string;
      recipientType: "user" | "vendor";
      title: string;
      message: string;
    }) =>
      sendPrivateMessage(
        recipientId,
        recipientType,
        title,
        message,
        admin.token
      ),
    onSuccess: (data) => {
      console.log("Private message sent successfully:", data);
      toast.success("Message sent successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    },
    onError: (error) => {
      console.error("Send private message error:", error);
      toast.error("Failed to send message. Please try again.", {
        position: "top-right",
        autoClose: 5000,
      });
    },
  });
  /* ---------------------------------------------------------- */
  /* early states                                               */
  /* ---------------------------------------------------------- */
  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );

  if (error || !data)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-2 bg-background">
        <p className="text-muted-foreground">Could not load {type} details.</p>
        <Button onClick={onBack}>Go back</Button>
      </div>
    );

  /* ---------------------------------------------------------- */
  /* derived helpers                                            */
  /* ---------------------------------------------------------- */
  const getDisplayName = () =>
    type === "user" ? data.name : data.storeName || data.name;

  const getStatusInfo = () => {
    if (type === "user")
      return {
        label: data.isverified ? "Verified" : "Not verified",
        variant: data.isverified
          ? ("default" as const)
          : ("destructive" as const),
      };
    return {
      label: data.verificationStatus || data.kycStatus || "Pending",
      variant: getStatusBadgeVariant(data.verificationStatus || data.kycStatus),
    };
  };

  const getStatusBadgeVariant = (st?: string) => {
    switch (st?.toLowerCase()) {
      case "verified":
      case "approved":
      case "active":
        return "default";
      case "pending":
        return "secondary";
      case "rejected":
      case "blocked":
        return "destructive";
      default:
        return "outline";
    }
  };

  /* ---------------------------------------------------------- */
  /* handlers                                                   */
  /* ---------------------------------------------------------- */
  const handleBlockToggle = () => setShowBlockModal(true);
  const confirmBlock = () => {
    if (!id) return;
    const action = isBlockedStatus ? "unblock" : "block";
    blockUnblockDeleteMutation.mutate({
      userId: id,
      userType: type,
      action: action,
    });
    setShowBlockModal(false);
  };
  const handleDelete = () => {
    if (!id) return;
    blockUnblockDeleteMutation.mutate({
      userId: id,
      userType: type,
      action: "delete",
    });
  };
  const sendMessage = () => {
    if (!messageText.trim() || !messageTitle.trim()) return;
    sendPrivateMessageMutation.mutate({
      recipientId: id!,
      recipientType: type === "user" ? "user" : "vendor",
      title: messageTitle,
      message: messageText,
    });
    setMessageText("");
    setMessageTitle("");
    setShowMessageModal(false);
  };
  const handleSaveNote = () => {
    // TODO: Implement save note functionality
    console.log("Saving note:", adminNotes);
  };

  /* ---------------------------------------------------------- */
  /* render                                                     */
  /* ---------------------------------------------------------- */
  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen bg-background">
      {/* ------- header ------- */}
      <header className="border-b border-border bg-card">
        <div className="container px-6 py-4 mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to{" "}
              {type === "user"
                ? "Users"
                : type === "vendor"
                ? "Vendors"
                : "Admins"}
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <h1 className="text-2xl font-bold text-foreground">
              {type === "user"
                ? "User"
                : type === "vendor"
                ? "Vendor"
                : adminQuery?.data?.role || "Admin"}{" "}
              Details
            </h1>
          </div>
        </div>
      </header>

      <div className="container px-6 py-8 mx-auto">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* -------------- main info card -------------- */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-20 h-20">
                      <AvatarImage
                        src={
                          type === "vendor"
                            ? data.avatar || data.businessLogo
                            : data.avatar
                        }
                        alt={getDisplayName()}
                      />
                      <AvatarFallback className="text-lg">
                        {getDisplayName()
                          ?.split(" ")
                          .map((n: any) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <h2 className="text-2xl font-bold">{getDisplayName()}</h2>
                      <p className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        {data.email}
                      </p>
                      {(data.phoneNumber || data.storePhone) && (
                        <p className="flex items-center gap-2 mt-1 text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          {data.phoneNumber || data.storePhone}
                        </p>
                      )}
                    </div>
                  </div>

                  <Badge
                    variant={statusInfo.variant as any}
                    className="text-sm"
                  >
                    {isBlockedStatus ? "Blocked" : statusInfo.label}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* ---- basic info ---- */}
                <div>
                  <h3 className="mb-4 text-lg font-semibold">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {type === "admin" ? (
                      <>
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Role
                            </p>
                            <p className="font-medium">
                              {data.role || "Admin"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Shield className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Admin ID
                            </p>
                            <p className="font-medium">{data._id || "N/A"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Version
                            </p>
                            <p className="font-medium">v{data.__v || 0}</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          {type === "user" ? (
                            <User className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <Building2 className="w-5 h-5 text-muted-foreground" />
                          )}
                          <div>
                            <p className="text-sm text-muted-foreground">
                              {type === "user" ? "Role" : "Store Type"}
                            </p>
                            <p className="font-medium">
                              {type === "user"
                                ? "User"
                                : data.storeType || "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Join Date
                            </p>
                            <p className="font-medium">
                              {new Date(
                                data.createdAt || data.joinDate
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {type === "vendor" && data.kycStatus && (
                          <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">
                                KYC Status
                              </p>
                              <Badge
                                variant={getStatusBadgeVariant(data.kycStatus)}
                              >
                                {data.kycStatus}
                              </Badge>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* ---- statistics ---- */}
                <div>
                  <h3 className="mb-4 text-lg font-semibold">Statistics</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {type === "user" ? (
                      <>
                        <div className="p-4 text-center rounded-lg bg-muted/50">
                          <p className="text-2xl font-bold text-primary">
                            {data.orders?.length || 0}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Total Orders
                          </p>
                        </div>
                      </>
                    ) : type === "vendor" ? (
                      <>
                        <div className="p-4 text-center rounded-lg bg-muted/50">
                          <p className="text-2xl font-bold text-primary">
                            {data.products?.length}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Total Products
                          </p>
                        </div>
                        <div className="p-4 text-center rounded-lg bg-muted/50">
                          <p className="text-2xl font-bold text-primary">
                            $
                            {(data.payments || []).reduce(
                              (sum: number, p: any) => sum + (p.amount || 0),
                              0
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Total Sales
                          </p>
                        </div>
                        <div className="p-4 text-center rounded-lg bg-muted/50">
                          <p className="text-2xl font-bold text-primary">
                            {data.orders?.length || 0}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Total Orders
                          </p>
                        </div>
                      </>
                    ) : (
                      // Admin statistics
                      <>
                        <div className="p-4 text-center rounded-lg bg-muted/50">
                          <p className="text-2xl font-bold text-primary">
                            {data.requests?.length || 0}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Total Requests
                          </p>
                        </div>
                        <div className="p-4 text-center rounded-lg bg-muted/50">
                          <p className="text-2xl font-bold text-primary">
                            {data.orders?.length || 0}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Total Orders
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* ---- admin requests section ---- */}
                {type === "admin" &&
                  data.requests &&
                  data.requests.length > 0 && (
                    <div>
                      <h3 className="mb-4 text-lg font-semibold">
                        Admin Requests
                      </h3>
                      <div className="space-y-4">
                        {data.requests.map((request: any, index: number) => (
                          <Card key={request._id || index}>
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <div>
                                  <CardTitle className="text-base">
                                    {request.storeName || request.name}
                                  </CardTitle>
                                  <p className="text-sm text-muted-foreground">
                                    {request.email}
                                  </p>
                                </div>
                                <Badge
                                  variant={getStatusBadgeVariant(
                                    request.verificationStatus
                                  )}
                                  className="text-sm"
                                >
                                  {request.verificationStatus || "Pending"}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Building2 className="w-4 h-4" />
                                  <span>
                                    Store Type: {request.storeType || "N/A"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Phone className="w-4 h-4" />
                                  <span>{request.storePhone || "N/A"}</span>
                                </div>
                                {request.subscription && (
                                  <>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Shield className="w-4 h-4" />
                                      <span>
                                        Plan:{" "}
                                        {request.subscription.currentPlan ||
                                          "N/A"}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Calendar className="w-4 h-4" />
                                      <span>
                                        Billing:{" "}
                                        {request.subscription.billingCycle ||
                                          "N/A"}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Shield className="w-4 h-4" />
                                      <span>
                                        Status:{" "}
                                        {request.subscription.status || "N/A"}
                                      </span>
                                    </div>
                                  </>
                                )}
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Calendar className="w-4 h-4" />
                                  <span>
                                    Created:{" "}
                                    {new Date(
                                      request.createdAt
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                {/* ---- admin orders section ---- */}
                {type === "admin" && data.orders && data.orders.length > 0 && (
                  <div>
                    <h3 className="mb-4 text-lg font-semibold">Admin Orders</h3>
                    <div className="space-y-4">
                      {data.orders.map((order: any, index: number) => (
                        <Card key={order._id || index}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="text-base">
                                  Order #{order.orderId || index + 1}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                  {order.customerName || "Unknown Customer"}
                                </p>
                              </div>
                              <Badge
                                variant={getStatusBadgeVariant(order.status)}
                                className="text-sm"
                              >
                                {order.status || "Pending"}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  Order Date:{" "}
                                  {new Date(
                                    order.createdAt || order.orderDate
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <CreditCard className="w-4 h-4" />
                                <span>
                                  Amount: $
                                  {order.totalAmount || order.amount || "0.00"}
                                </span>
                              </div>
                              {order.paymentMethod && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <CreditCard className="w-4 h-4" />
                                  <span>Payment: {order.paymentMethod}</span>
                                </div>
                              )}
                              {order.products && order.products.length > 0 && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Building2 className="w-4 h-4" />
                                  <span>Products: {order.products.length}</span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {type === "vendor" && data.bankAccount && (
                  <div>
                    <h3 className="mb-4 text-lg font-semibold">Bank Account</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Bank Name
                          </p>
                          <p className="font-medium">
                            {data.bankAccount.bankName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Account Name
                          </p>
                          <p className="font-medium">
                            {data.bankAccount.account_name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Account Number
                          </p>
                          <p className="font-medium">
                            {data.bankAccount.account_number}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* -------------- actions sidebar -------------- */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!isSuperAdmin && (
                  <>
                    <Button
                      variant={isBlockedStatus ? "default" : "destructive"}
                      className="flex items-center w-full gap-2"
                      onClick={handleBlockToggle}
                      disabled={blockUnblockDeleteMutation.isPending}
                    >
                      {blockUnblockDeleteMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {isBlockedStatus ? "Unblocking..." : "Blocking..."}
                        </>
                      ) : isBlockedStatus ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Unblock{" "}
                         {type === "user"
                ? "User"
                : type === "vendor"
                ? "Vendor"
                : adminQuery?.data?.role || "Admin"}{" "}
                        </>
                      ) : (
                        <>
                          <Ban className="w-4 h-4" />
                          Block{" "}
                          {type === "user"
                ? "User"
                : type === "vendor"
                ? "Vendor"
                : adminQuery?.data?.role || "Admin"}{" "}
                        </>
                      )}
                    </Button>

                    {!shouldHidePrivateMessages && (
                      <Button
                        variant="outline"
                        className="flex items-center w-full gap-2 bg-transparent"
                        onClick={() => setShowMessageModal(true)}
                        disabled={blockUnblockDeleteMutation.isPending}
                      >
                        <Mail className="w-4 h-4" />
                        Send Private Message
                      </Button>
                    )}

                    <Button
                      variant="destructive"
                      className="flex items-center w-full gap-2"
                      onClick={handleDelete}
                      disabled={blockUnblockDeleteMutation.isPending}
                    >
                      {blockUnblockDeleteMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          Delete{" "}
                         {type === "user"
                ? "User"
                : type === "vendor"
                ? "Vendor"
                : adminQuery?.data?.role || "Admin"}{" "}
                        </>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* ---- admin notes ---- */}
            <Card>
              <CardHeader>
                <CardTitle>Admin Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="existing-notes">Existing Notes</Label>
                  <div className="p-3 mt-2 rounded-md bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                      {data.notes || "No existing notes."}
                    </p>
                  </div>
                </div>
                <div>
                  <Label htmlFor="admin-notes">Add New Note</Label>
                  <Textarea
                    id="admin-notes"
                    placeholder="Add administrative notes..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handleSaveNote}
                  disabled={blockUnblockDeleteMutation.isPending}
                >
                  {blockUnblockDeleteMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Note"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* -------------- message modal -------------- */}
      {showMessageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md p-6 mx-4 border rounded-lg bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Send Message</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMessageModal(false)}
                className="w-8 h-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="message-title">Message Title</Label>
                <Textarea
                  id="message-title"
                  placeholder="Enter message title..."
                  value={messageTitle}
                  onChange={(e) => setMessageTitle(e.target.value)}
                  className="mt-2 min-h-[40px]"
                />
              </div>
              <div>
                <Label htmlFor="message">Message to {getDisplayName()}</Label>
                <Textarea
                  id="message"
                  placeholder="Type your message here..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="mt-2 min-h-[100px]"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowMessageModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={sendMessage}
                  disabled={
                    !messageText.trim() ||
                    !messageTitle.trim() ||
                    blockUnblockDeleteMutation.isPending ||
                    sendPrivateMessageMutation.isPending
                  }
                  className="flex items-center gap-2"
                >
                  {sendPrivateMessageMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------- block modal -------------- */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md p-6 mx-4 border rounded-lg bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {isBlockedStatus ? "Unblock" : "Block"}{" "}
                {type === "user"
                  ? "User"
                  : type === "vendor"
                  ? "Vendor"
                  : "Admin"}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBlockModal(false)}
                className="w-8 h-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Are you sure you want to {isBlockedStatus ? "unblock" : "block"}{" "}
                <strong>{getDisplayName()}</strong>?
                {!isBlockedStatus &&
                  " This will prevent them from accessing their account."}
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowBlockModal(false)}
                  disabled={blockUnblockDeleteMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  variant={isBlockedStatus ? "default" : "destructive"}
                  onClick={confirmBlock}
                  className="flex items-center gap-2"
                  disabled={blockUnblockDeleteMutation.isPending}
                >
                  {blockUnblockDeleteMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {isBlockedStatus ? "Unblocking..." : "Blocking..."}
                    </>
                  ) : isBlockedStatus ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Unblock
                    </>
                  ) : (
                    <>
                      <Ban className="w-4 h-4" />
                      Block
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Toast Container for notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}
