import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  Phone,
  Mail,
  Clock,
  ArrowLeft,
  Loader2,
  AlertCircle,
  MapPin,
  Package,
  User,
  Calendar,
  XCircle,
  Clock as ClockIcon,
  RotateCcw,
  Truck,
  PackageCheck,
  PackageX,
  Package2,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getOneOrderForAdmin } from "../../../services/adminApi";
import { RootState } from "@/components/redux/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type OrderStatus =
  | "Pending"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled"
  | "Cancellation Requested"
  | "Postponement Requested"
  | "Return Requested";

declare global {
  interface Window {
    google?: any;
    __googleMapsCallback__?: () => void;
  }
}

const loadGoogleMapsScript = (apiKey?: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) { resolve(); return; }
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src^="https://maps.googleapis.com/maps/api/js"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Google Maps failed to load")));
      return;
    }
    if (!apiKey) { reject(new Error("Missing Google Maps API key")); return; }
    const script = document.createElement("script");
    const cbName = "__googleMapsCallback__";
    (window as any)[cbName] = () => resolve();
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=${cbName}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error("Google Maps failed to load"));
    document.head.appendChild(script);
  });
};

interface LocationCoordinates { lat: number; lng: number; }

/* ------------------------------------------------------------------ */
/* Info row helper                                                     */
/* ------------------------------------------------------------------ */
const InfoRow = ({ label, value }: { label: string; value?: string | React.ReactNode }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</span>
    <span className="text-sm text-gray-700">{value || "—"}</span>
  </div>
);

/* ------------------------------------------------------------------ */
/* Status helpers                                                      */
/* ------------------------------------------------------------------ */
const getStatusClasses = (status: OrderStatus) => {
  switch (status) {
    case "Processing": return "bg-yellow-100 text-yellow-700 border border-yellow-200";
    case "Delivered": return "bg-green-100 text-green-700 border border-green-200";
    case "Cancelled":
    case "Cancellation Requested": return "bg-red-100 text-red-600 border border-red-200";
    case "Pending": return "bg-orange-100 text-orange-600 border border-orange-200";
    case "Shipped": return "bg-blue-100 text-blue-600 border border-blue-200";
    case "Postponement Requested": return "bg-purple-100 text-purple-600 border border-purple-200";
    case "Return Requested": return "bg-pink-100 text-pink-600 border border-pink-200";
    default: return "bg-gray-100 text-gray-600 border border-gray-200";
  }
};

const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case "Processing": return <Loader2 className="w-4 h-4 animate-spin" />;
    case "Delivered": return <PackageCheck className="w-4 h-4" />;
    case "Cancelled": return <XCircle className="w-4 h-4" />;
    case "Cancellation Requested": return <PackageX className="w-4 h-4" />;
    case "Pending": return <ClockIcon className="w-4 h-4" />;
    case "Shipped": return <Truck className="w-4 h-4" />;
    case "Postponement Requested": return <Calendar className="w-4 h-4" />;
    case "Return Requested": return <RotateCcw className="w-4 h-4" />;
    default: return <Package2 className="w-4 h-4" />;
  }
};

const PayStatusBadge = ({ status }: { status?: string }) => {
  const s = status?.toLowerCase();
  let cls = "inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ";
  if (s === "successful") cls += "bg-green-100 text-green-700";
  else if (s === "pending") cls += "bg-orange-100 text-orange-600";
  else if (s === "failed") cls += "bg-red-100 text-red-600";
  else cls += "bg-gray-100 text-gray-600";
  return <span className={cls}>{status || "—"}</span>;
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
const OrderDetailsPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const admin = useSelector((state: RootState) => state.admin);

  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const [coordinates, setCoordinates] = useState<LocationCoordinates | null>(null);
  const [isGeocodingLoading, setIsGeocodingLoading] = useState(false);
  const [geocodingError, setGeocodingError] = useState<string | null>(null);
  const [mapsReady, setMapsReady] = useState(false);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);

  const { data: order, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["order-details", orderId],
    queryFn: () => getOneOrderForAdmin(admin.token, orderId ?? ""),
    enabled: Boolean(admin.token && orderId),
    retry: 1,
  });

  const geocodeAddress = async (address: string) => {
    if (!address) return;
    setIsGeocodingLoading(true);
    setGeocodingError(null);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      if (!response.ok) throw new Error("Failed to fetch location data");
      const data = await response.json();
      if (data && data.length > 0) {
        setCoordinates({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
      } else {
        setGeocodingError("Location not found");
        setCoordinates({ lat: 6.5244, lng: 3.3792 });
      }
    } catch {
      setGeocodingError("Failed to load location");
      setCoordinates({ lat: 6.5244, lng: 3.3792 });
    } finally {
      setIsGeocodingLoading(false);
    }
  };

  useEffect(() => {
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
    loadGoogleMapsScript(key)
      .then(() => setMapsReady(true))
      .catch(() => setGeocodingError("Google Maps failed to load"));
  }, []);

  useEffect(() => {
    if (!order?.buyerInfo?.address) return;
    geocodeAddress(order.buyerInfo.address);
  }, [order?.buyerInfo?.address]);

  useEffect(() => {
    if (!mapsReady || !coordinates || !mapRef.current) return;
    if (!window.google || !window.google.maps) return;
    const center = { lat: coordinates.lat, lng: coordinates.lng };
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center, zoom: 13, mapTypeControl: false, streetViewControl: false, fullscreenControl: true,
      });
    } else {
      mapInstanceRef.current.setCenter(center);
    }
    if (!markerRef.current) {
      markerRef.current = new window.google.maps.Marker({
        position: center, map: mapInstanceRef.current, title: "Delivery Location",
      });
    } else {
      markerRef.current.setPosition(center);
    }
  }, [mapsReady, coordinates]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(amount);

  const formatDate = (dateString?: string) =>
    dateString
      ? new Date(dateString).toLocaleDateString("en-US", {
          year: "numeric", month: "long", day: "numeric",
          hour: "2-digit", minute: "2-digit",
        })
      : "—";

  const handleCancellationAction = async (
    orderIdValue: string,
    action: "accept" | "reject",
    comments: string = ""
  ) => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/orders/handle-cancellation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderIdValue, actorId: "vendor-id-here", actorType: "vendor", action, comments }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to process request");
      toast.success(`Cancellation request ${action === "accept" ? "approved" : "rejected"} successfully`);
      if (refetch) await refetch();
      return data;
    } catch (err: any) {
      toast.error(err.message || "Failed to process request");
      throw err;
    } finally {
      setIsProcessing(false);
      setShowRejectModal(null);
      setRejectNote("");
    }
  };

  /* -------------------------------------------------------------- */
  /* States                                                         */
  /* -------------------------------------------------------------- */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F8FA] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        <span className="ml-3 text-gray-500">Loading order details…</span>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="min-h-screen bg-[#F5F8FA] flex flex-col items-center justify-center gap-4">
        <AlertCircle className="w-14 h-14 text-red-400" />
        <h3 className="text-xl font-semibold text-gray-700">Failed to load order details</h3>
        <p className="text-gray-500">
          {error instanceof Error ? error.message : "Order not found or an unexpected error occurred"}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => refetch()}
            className="px-5 py-2 text-white bg-[#F87645] rounded-lg hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-5 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  const itemsTotal = order.items?.reduce((sum: number, item: any) => sum + (item.total || 0), 0) || 0;
  const tax = itemsTotal * 0.1;
  const subtotal = itemsTotal - tax;
  const total = order.totalPrice || 0;

  return (
    <div className="min-h-screen bg-[#F5F8FA]">
      {/* Page header ----------------------------------------------- */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container px-6 py-4 mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.history.back()}
              className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Order Details</h1>
              <p className="text-sm text-gray-400 break-all">
                Order #{order._id}
              </p>
            </div>
            <div className="ml-auto">
              <span className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full ${getStatusClasses(order.status)}`}>
                {getStatusIcon(order.status)}
                {order.status}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container px-6 py-8 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {/* Delivery map card ------------------------------------- */}
          <Card className="border-gray-200 shadow-sm bg-white lg:col-span-2">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <MapPin className="w-5 h-5 text-orange-500" />
                Delivery Location
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="relative h-56 overflow-hidden bg-gray-100 rounded-lg">
                {isGeocodingLoading ? (
                  <div className="flex items-center justify-center h-full gap-2">
                    <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                    <span className="text-gray-500 text-sm">Loading map…</span>
                  </div>
                ) : coordinates ? (
                  <div ref={mapRef} className="w-full h-full rounded-lg" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <MapPin className="w-10 h-10 mb-2 text-gray-300" />
                    <p className="text-sm text-gray-400">{geocodingError || "Unable to load map"}</p>
                    {order.buyerInfo?.address && (
                      <button
                        onClick={() => geocodeAddress(order.buyerInfo.address)}
                        className="mt-2 px-3 py-1 text-xs text-white bg-[#F87645] rounded hover:bg-orange-600 transition-colors"
                      >
                        Retry
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-4 p-3 bg-[#F5F8FA] rounded-lg">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Delivery Address</p>
                <p className="text-sm text-gray-700">{order?.buyerInfo?.address || "—"}</p>
                {coordinates && (
                  <p className="mt-1 text-xs text-gray-400">
                    {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Customer card ----------------------------------------- */}
          <Card className="border-gray-200 shadow-sm bg-white">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <User className="w-5 h-5 text-orange-500" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 flex flex-col items-center">
              <div className="w-24 h-24 mb-4 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 text-center">
                {order?.buyerInfo?.first_name} {order?.buyerInfo?.last_name}
              </h3>
              <p className="text-sm text-gray-400 mb-5">Customer</p>

              {/* Contact actions */}
              <div className="flex gap-3 mb-5">
                <motion.a
                  href={`tel:${order?.buyerInfo?.phone || ""}`}
                  whileHover={{ scale: 1.1 }}
                  className="p-2.5 text-white bg-[#F87645] rounded-full hover:bg-orange-600 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                </motion.a>
                <motion.a
                  href={`https://wa.me/${(order?.buyerInfo?.phone || "").replace(/\D/g, "")}`}
                  target="_blank" rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  className="p-2.5 text-white bg-green-500 rounded-full hover:bg-green-600 transition-colors"
                >
                  <FaWhatsapp className="w-4 h-4" />
                </motion.a>
                <motion.a
                  href={`mailto:${order?.buyerInfo?.email || ""}`}
                  whileHover={{ scale: 1.1 }}
                  className="p-2.5 text-white bg-blue-500 rounded-full hover:bg-blue-600 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                </motion.a>
              </div>

              <div className="w-full space-y-3">
                <InfoRow label="Phone" value={order?.buyerInfo?.phone || "N/A"} />
                <InfoRow label="Email" value={order?.buyerInfo?.email || "N/A"} />
                <InfoRow label="City" value={`${order?.buyerInfo?.city || ""}, ${order?.buyerInfo?.region || ""}`} />
                <InfoRow label="Country" value={order?.buyerInfo?.country} />
              </div>
            </CardContent>
          </Card>

          {/* Order items ------------------------------------------- */}
          <Card className="border-gray-200 shadow-sm bg-white lg:col-span-2">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Package className="w-5 h-5 text-orange-500" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {order.items?.map((item: any) => (
                  <div
                    key={item._id || item.product?._id || Math.random()}
                    className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 overflow-hidden bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.product?.images?.[0] ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product?.name || "Product"}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <Package className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 text-sm">
                          {item.product?.name || "Unknown Product"}
                        </h4>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Qty: {item.quantity || 0}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-800">
                        {formatCurrency(item.price || 0)}
                      </p>
                      <p className="text-xs text-gray-400">
                        Total: {formatCurrency(item.total || 0)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order summary */}
              <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax (10%)</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-gray-800 pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-orange-500">{formatCurrency(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order info card --------------------------------------- */}
          <Card className="border-gray-200 shadow-sm bg-white">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Clock className="w-5 h-5 text-orange-500" />
                Order Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <InfoRow label="Order Date" value={formatDate(order.createdAt)} />
              <InfoRow label="Last Updated" value={formatDate(order.updatedAt)} />
              <InfoRow label="Payment Option" value={order.paymentOption} />
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                  Payment Status
                </p>
                <PayStatusBadge status={order.payStatus} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                  Order Status
                </p>
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${getStatusClasses(order.status)}`}>
                  {getStatusIcon(order.status)}
                  {order.status}
                </span>
              </div>
              {order.deliveryDate && (
                <InfoRow label="Delivery Date" value={formatDate(order.deliveryDate)} />
              )}
            </CardContent>
          </Card>

          {/* Cancellation request section -------------------------- */}
          {order.status === "Cancellation Requested" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-3"
            >
              <Card className="border-red-200 shadow-sm bg-white">
                <CardHeader className="border-b border-red-100">
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <XCircle className="w-5 h-5" />
                    Cancellation Request
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-3 mb-5">
                    <InfoRow label="Cancelled Items" value={`${order.cancelledQuantity || 1} item(s)`} />
                    <InfoRow label="Requested On" value={formatDate(order.updatedAt)} />
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Action Required</p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      disabled={isProcessing}
                      onClick={async () => { try { await handleCancellationAction(order._id, "accept"); } catch {} }}
                      className={`px-5 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors ${isProcessing ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      {isProcessing ? "Processing…" : "Approve Cancellation"}
                    </button>
                    <button
                      disabled={isProcessing}
                      onClick={() => setShowRejectModal("cancellation")}
                      className={`px-5 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors ${isProcessing ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      Reject Cancellation
                    </button>
                  </div>
                  {showRejectModal === "cancellation" && (
                    <div className="mt-4 p-4 bg-[#F5F8FA] rounded-lg border border-gray-200">
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Reason for rejection
                      </label>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <input
                          type="text"
                          value={rejectNote}
                          onChange={(e) => setRejectNote(e.target.value)}
                          placeholder="Please specify the reason for rejection"
                          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
                          disabled={isProcessing}
                        />
                        <button
                          onClick={async () => {
                            if (!rejectNote.trim()) return;
                            try { await handleCancellationAction(order._id, "reject", rejectNote); } catch {}
                          }}
                          disabled={!rejectNote.trim() || isProcessing}
                          className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${!rejectNote.trim() || isProcessing ? "bg-gray-300 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}`}
                        >
                          {isProcessing ? "Submitting…" : "Submit Rejection"}
                        </button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Postponement request section -------------------------- */}
          {order.status === "Postponement Requested" && order.postponementDates && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-3"
            >
              <Card className="border-purple-200 shadow-sm bg-white">
                <CardHeader className="border-b border-purple-100">
                  <CardTitle className="flex items-center gap-2 text-purple-600">
                    <Calendar className="w-5 h-5" />
                    Postponement Request
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    <InfoRow label="Postponed Items" value={`${order.postponedQuantity || 1} item(s)`} />
                    <InfoRow
                      label="New Delivery Window"
                      value={`${formatDate(order.postponementDates.from)} – ${formatDate(order.postponementDates.to)}`}
                    />
                    <InfoRow label="Requested On" value={formatDate(order.updatedAt)} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Return request section -------------------------------- */}
          {order.status === "Return Requested" && order.returnDetails && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-3"
            >
              <Card className="border-red-200 shadow-sm bg-white">
                <CardHeader className="border-b border-red-100">
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="w-5 h-5" />
                    Return Request Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    <InfoRow label="Reason for Return" value={order.returnDetails.reason} />
                    <InfoRow label="Item Condition" value={order.returnDetails.condition} />
                    <InfoRow label="Return Method" value={order.returnDetails.method} />
                    {order.returnDetails.comments && (
                      <div className="md:col-span-2">
                        <InfoRow label="Additional Comments" value={order.returnDetails.comments} />
                      </div>
                    )}
                    <InfoRow
                      label="Requested On"
                      value={formatDate(order.returnDetails.requestedAt)}
                    />
                  </div>

                  {order.returnDetails.returnedProducts?.length > 0 && (
                    <div className="mt-6">
                      <p className="text-sm font-medium text-gray-700 mb-3">Returned Products</p>
                      <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-100">
                          <thead className="bg-[#F5F8FA]">
                            <tr>
                              {["Product", "Quantity", "Reason", "Condition"].map((h) => (
                                <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide text-left">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-100">
                            {order.returnDetails.returnedProducts.map((product: any, index: number) => (
                              <tr key={index} className="hover:bg-orange-50 transition-colors">
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-3">
                                    {product.image && (
                                      <img className="w-8 h-8 rounded-full object-cover" src={product.image} alt={product.name} />
                                    )}
                                    <div>
                                      <div className="text-sm font-medium text-gray-800">{product.name || "Product"}</div>
                                      <div className="text-xs text-gray-400">#{product._id || "N/A"}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700">{product.quantity || 1}</td>
                                <td className="px-4 py-3 text-sm text-gray-700">{product.reason || "N/A"}</td>
                                <td className="px-4 py-3">
                                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                                    product.condition === "New"
                                      ? "bg-green-100 text-green-700"
                                      : product.condition === "Used"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-red-100 text-red-600"
                                  }`}>
                                    {product.condition || "N/A"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
