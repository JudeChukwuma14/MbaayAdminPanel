"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Shield,
  Mail,
  Calendar,
  Building2,
  User,
  Phone,
  MessageSquare,
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
import { useQuery } from "@tanstack/react-query";
import { getUserById, getVendorById } from "@/services/user_vendorApi";

interface UserVendorDetailProps {
  type: "user" | "vendor";
  id: string | null;
  onBack: () => void;
}

export function AllUserDetailed({ type, id, onBack }: UserVendorDetailProps) {
  /* ---------------------------------------------------------- */
  /* local state                                                */
  /* ---------------------------------------------------------- */
  const [adminNotes, setAdminNotes] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [messageText, setMessageText] = useState("");

  /* ---------------------------------------------------------- */
  /* single query – endpoint returns user OR vendor object      */
  /* ---------------------------------------------------------- */
  const userQuery = useQuery({
    queryKey: ["user", id],
    queryFn: () => getUserById(id!),
    enabled: type === "user" && !!id,
    staleTime: 1000 * 60 * 5,
  });

  const vendorQuery = useQuery({
    queryKey: ["vendor", id],
    queryFn: () => getVendorById(id),
    enabled: type === "vendor" && !!id,
    staleTime: 1000 * 60 * 5,
  });
  const data = type === "user" ? userQuery.data : vendorQuery.data;
  const isLoading =
    type === "user" ? userQuery.isLoading : vendorQuery.isLoading;
  const error = type === "user" ? userQuery.error : vendorQuery.error;
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
    setIsBlocked((b) => !b);
    setShowBlockModal(false);
  };
  const handleDelete = () => {
    console.log(`Deleting ${type} with ID: ${id}`);
    onBack();
  };
  const sendMessage = () => {
    if (!messageText.trim()) return;
    console.log(`Message to ${type} ${id}: ${messageText}`);
    setMessageText("");
    setShowMessageModal(false);
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
              Back to {type === "user" ? "Users" : "Vendors"}
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <h1 className="text-2xl font-bold text-foreground">
              {type === "user" ? "User" : "Vendor"} Details
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
                          .split(" ")
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
                    {isBlocked ? "Blocked" : statusInfo.label}
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
                          {type === "user" ? "User" : data.storeType || "N/A"}
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
                    ) : (
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
                    )}
                  </div>
                </div>

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
                <Button
                  variant={isBlocked ? "default" : "destructive"}
                  className="flex items-center w-full gap-2"
                  onClick={handleBlockToggle}
                >
                  {isBlocked ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Unblock {type === "user" ? "User" : "Vendor"}
                    </>
                  ) : (
                    <>
                      <Ban className="w-4 h-4" />
                      Block {type === "user" ? "User" : "Vendor"}
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="flex items-center w-full gap-2 bg-transparent"
                  onClick={() => setShowMessageModal(true)}
                >
                  <Mail className="w-4 h-4" />
                  Send Message
                </Button>

                <Button
                  variant="outline"
                  className="flex items-center w-full gap-2 bg-transparent"
                >
                  <MessageSquare className="w-4 h-4" />
                  View Messages
                </Button>

                <Button
                  variant="destructive"
                  className="flex items-center w-full gap-2"
                  onClick={handleDelete}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete {type === "user" ? "User" : "Vendor"}
                </Button>
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
                <Button className="w-full">Save Note</Button>
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
                  disabled={!messageText.trim()}
                  className="flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send
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
                {isBlocked ? "Unblock" : "Block"}{" "}
                {type === "user" ? "User" : "Vendor"}
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
                Are you sure you want to {isBlocked ? "unblock" : "block"}{" "}
                <strong>{getDisplayName()}</strong>?
                {!isBlocked &&
                  " This will prevent them from accessing their account."}
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowBlockModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant={isBlocked ? "default" : "destructive"}
                  onClick={confirmBlock}
                  className="flex items-center gap-2"
                >
                  {isBlocked ? (
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
    </div>
  );
}
