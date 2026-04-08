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
    if (window.google && window.google.maps) {
      resolve();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src^="https://maps.googleapis.com/maps/api/js"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Google Maps failed to load")),
      );
      return;
    }
    if (!apiKey) {
      reject(new Error("Missing Google Maps API key (VITE_GOOGLE_MAPS_API_KEY)"));
      return;
    }
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

interface LocationCoordinates {
  lat: number;
  lng: number;
}

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

  const {
    data: order,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
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
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address,
        )}&limit=1`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch location data");
      }

      const data = await response.json();

      if (data && data.length > 0) {
        const location = data[0];
        setCoordinates({
          lat: Number.parseFloat(location.lat),
          lng: Number.parseFloat(location.lon),
        });
      } else {
        setGeocodingError("Location not found");
        setCoordinates({ lat: 6.5244, lng: 3.3792 });
      }
    } catch (err) {
      console.error("Geocoding error:", err);
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
      .catch((err) => {
        console.error(err);
        setGeocodingError("Google Maps failed to load");
      });
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
        center,
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });
    } else {
      mapInstanceRef.current.setCenter(center);
    }

    if (!markerRef.current) {
      markerRef.current = new window.google.maps.Marker({
        position: center,
        map: mapInstanceRef.current,
        title: "Delivery Location",
      });
    } else {
      markerRef.current.setPosition(center);
    }
  }, [mapsReady, coordinates]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "Processing":
        return "bg-yellow-400 text-white";
      case "Delivered":
        return "bg-green-500 text-white";
      case "Cancelled":
      case "Cancellation Requested":
        return "bg-red-500 text-white";
      case "Pending":
        return "bg-blue-500 text-white";
      case "Shipped":
        return "bg-indigo-500 text-white";
      case "Postponement Requested":
        return "bg-purple-500 text-white";
      case "Return Requested":
        return "bg-pink-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "Processing":
        return <Loader2 className="w-5 h-5 animate-spin" />;
      case "Delivered":
        return <PackageCheck className="w-5 h-5" />;
      case "Cancelled":
        return <XCircle className="w-5 h-5" />;
      case "Cancellation Requested":
        return <PackageX className="w-5 h-5" />;
      case "Pending":
        return <ClockIcon className="w-5 h-5" />;
      case "Shipped":
        return <Truck className="w-5 h-5" />;
      case "Postponement Requested":
        return <Calendar className="w-5 h-5" />;
      case "Return Requested":
        return <RotateCcw className="w-5 h-5" />;
      default:
        return <Package2 className="w-5 h-5" />;
    }
  };

  const handleCancellationAction = async (
    orderIdValue: string,
    action: "accept" | "reject",
    comments: string = "",
  ) => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/orders/handle-cancellation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: orderIdValue,
          actorId: "vendor-id-here",
          actorType: "vendor",
          action,
          comments,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to process request");
      }

      toast.success(
        `Cancellation request ${
          action === "accept" ? "approved" : "rejected"
        } successfully`,
      );
      if (refetch) await refetch();
      return data;
    } catch (err: any) {
      console.error("Error processing cancellation action:", err);
      toast.error(err.message || "Failed to process request");
      throw err;
    } finally {
      setIsProcessing(false);
      setShowRejectModal(null);
      setRejectNote("");
    }
  };

  if (isLoading) {
    return (
      <main className="max-w-full min-h-screen p-4 overflow-x-hidden bg-gray-100 sm:p-5">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            <span className="text-lg text-gray-600">Loading order details...</span>
          </div>
        </div>
      </main>
    );
  }

  if (isError || !order) {
    return (
      <main className="max-w-full min-h-screen p-4 overflow-x-hidden bg-gray-100 sm:p-5">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <AlertCircle className="w-16 h-16 text-red-500" />
          <div className="text-center">
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              Failed to load order details
            </h3>
            <p className="mb-4 text-gray-600">
              {error instanceof Error
                ? error.message
                : "Order not found or an unexpected error occurred"}
            </p>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => refetch()}
                className="px-4 py-2 text-white transition-colors bg-orange-500 rounded-lg hover:bg-orange-600"
              >
                Try Again
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.history.back()}
                className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-gray-500 rounded-lg hover:bg-gray-600"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </motion.button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const itemsTotal = order.items?.reduce((sum: number, item: any) => sum + (item.total || 0), 0) || 0;
  const tax = itemsTotal * 0.1;
  const subtotal = itemsTotal - tax;
  const total = order.totalPrice || 0;

  return (
    <main className="max-w-full min-h-screen p-4 overflow-x-hidden bg-gray-100 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.history.back()}
            className="p-2 transition-shadow bg-white rounded-lg shadow hover:shadow-md"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
            <p className="text-gray-600 break-all">Order #{order._id}</p>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        <div className="relative p-5 bg-white rounded-lg shadow lg:col-span-2">
          <h2 className="flex items-center gap-2 mb-4 text-lg font-bold">
            <MapPin className="w-5 h-5 text-orange-500" /> Delivery Status
          </h2>
          <div
            className={`absolute top-5 right-5 px-4 py-2 rounded-full flex items-center gap-2 ${getStatusColor(order.status)}`}
          >
            {getStatusIcon(order.status)}
            <span>{order.status}</span>
          </div>

          <div className="relative h-64 overflow-hidden bg-gray-200 rounded">
            {isGeocodingLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                  <span className="text-gray-600">Loading map...</span>
                </div>
              </div>
            ) : coordinates ? (
              <div ref={mapRef} className="w-full h-full rounded" />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-600">{geocodingError || "Unable to load map"}</p>
                  {order.buyerInfo?.address && (
                    <button
                      onClick={() => geocodeAddress(order.buyerInfo.address)}
                      className="px-3 py-1 mt-2 text-sm text-white bg-orange-500 rounded hover:bg-orange-600"
                    >
                      Retry
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="p-3 mt-4 rounded-lg bg-gray-50">
            <h4 className="mb-2 font-semibold text-gray-800">Delivery Address</h4>
            <p className="text-gray-600">{order?.buyerInfo?.address}</p>
            {coordinates && (
              <p className="mt-1 text-sm text-gray-500">
                Coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
              </p>
            )}
          </div>
        </div>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex flex-col items-center p-5 bg-white rounded-lg shadow"
        >
          <div className="w-[220px] h-[200px] mb-3 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
            <User className="w-20 h-20 text-white" />
          </div>
          <h3 className="text-lg font-bold text-center">{order?.buyerInfo?.first_name || "Unknown"}</h3>
          <p className="mb-4 text-gray-600">Customer</p>
          <div className="flex space-x-3">
            <motion.a
              href={`tel:${order?.buyerInfo?.phone || ""}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 text-white transition-colors bg-orange-500 rounded-full hover:bg-orange-600"
            >
              <Phone className="w-5 h-5" />
            </motion.a>
            <motion.a
              href={`https://wa.me/${(order?.buyerInfo?.phone || "").replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 text-white transition-colors bg-green-500 rounded-full hover:bg-green-600"
            >
              <FaWhatsapp className="w-5 h-5" />
            </motion.a>
            <motion.a
              href={`mailto:${order?.buyerInfo?.email || ""}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 text-white transition-colors bg-blue-500 rounded-full hover:bg-blue-600"
            >
              <Mail className="w-5 h-5" />
            </motion.a>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">Phone: {order?.buyerInfo?.phone || "N/A"}</p>
            <p className="text-sm text-gray-600">Email: {order?.buyerInfo?.email || "N/A"}</p>
          </div>
        </motion.div>

        <div className="p-5 bg-white rounded-lg shadow lg:col-span-2">
          <h2 className="flex items-center gap-2 mb-4 text-lg font-bold">
            <Package className="w-5 h-5 text-orange-500" /> Order Items
          </h2>
          <div className="space-y-4">
            {order.items?.map((item: any) => (
              <div key={item._id || item.product?._id || Math.random()} className="flex items-center justify-between pb-4 border-b last:border-b-0">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 overflow-hidden bg-gray-200 rounded-lg">
                    {item.product?.poster ? (
                      <img
                        src={item.product?.images?.[0] || "https://via.placeholder.com/150"}
                        alt={item.product?.name || "Product"}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">{item.product?.name || "Unknown Product"}</h4>
                    <p className="text-sm text-gray-500 break-all">Product ID: {item.product?._id || "N/A"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Quantity: {item.quantity || 0}</p>
                  <p className="font-bold">{formatCurrency(item.price || 0)}</p>
                  <p className="text-sm text-gray-600">Total: {formatCurrency(item.total || 0)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 mt-6 border-t">
            <div className="space-y-2 text-right">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (10%):</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between pt-2 text-lg font-bold border-t">
                <span>Total:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 bg-white rounded-lg shadow">
          <h2 className="flex items-center gap-2 mb-4 text-lg font-bold">
            <Clock className="w-5 h-5 text-orange-500" /> Order Information
          </h2>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-800">Order Date</h4>
              <p className="text-gray-600">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">Payment Status</h4>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${order.payStatus === "Successful" ? "bg-green-600 text-green-100" : order.payStatus === "Pending" ? "bg-blue-500 text-white" : "bg-red-100 text-green-800"}`}>
                {order.payStatus || "Unknown"}
              </span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">Order Status</h4>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">Last Updated</h4>
              <p className="text-gray-600">{formatDate(order.updatedAt)}</p>
            </div>
          </div>
        </div>

        {order.status === "Cancellation Requested" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-5 bg-white rounded-lg shadow lg:col-span-3"
          >
            <h2 className="flex items-center gap-2 mb-4 text-lg font-bold text-red-600">
              <XCircle className="w-5 h-5" /> Cancellation Request
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <h4 className="font-semibold text-gray-800">Cancelled Items</h4>
                <p className="text-gray-600">{order.cancelledQuantity || 1} item(s)</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Requested On</h4>
                <p className="text-gray-600">{formatDate(order.updatedAt)}</p>
              </div>
              <div className="md:col-span-3">
                <h4 className="mb-2 font-semibold text-gray-800">Action Required</h4>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isProcessing}
                    className={`px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${isProcessing ? "opacity-70 cursor-not-allowed" : ""}`}
                    onClick={async () => {
                      try {
                        await handleCancellationAction(order._id, "accept");
                      } catch (err) {
                        // ignored
                      }
                    }}
                  >
                    {isProcessing ? "Processing..." : "Approve Cancellation"}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isProcessing}
                    className={`px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${isProcessing ? "opacity-70 cursor-not-allowed" : ""}`}
                    onClick={() => setShowRejectModal("cancellation")}
                  >
                    Reject Cancellation
                  </motion.button>
                </div>
                {showRejectModal === "cancellation" && (
                  <div className="p-4 mt-4 rounded-lg bg-gray-50">
                    <label htmlFor="rejectReason" className="block mb-2 text-sm font-medium text-gray-700">
                      Reason for rejection
                    </label>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input
                        type="text"
                        id="rejectReason"
                        value={rejectNote}
                        onChange={(e) => setRejectNote(e.target.value)}
                        placeholder="Please specify the reason for rejection"
                        className="flex-1 block w-full min-w-0 px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                        disabled={isProcessing}
                      />
                      <button
                        onClick={async () => {
                          if (!rejectNote.trim()) return;
                          try {
                            await handleCancellationAction(order._id, "reject", rejectNote);
                          } catch (err) {
                            // ignored
                          }
                        }}
                        disabled={!rejectNote.trim() || isProcessing}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-md ${!rejectNote.trim() || isProcessing ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}`}
                      >
                        {isProcessing ? "Submitting..." : "Submit Rejection"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {order.status === "Postponement Requested" && order.postponementDates && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-5 bg-white rounded-lg shadow lg:col-span-3"
          >
            <h2 className="flex items-center gap-2 mb-4 text-lg font-bold text-purple-600">
              <Calendar className="w-5 h-5" /> Postponement Request
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <h4 className="font-semibold text-gray-800">Postponed Items</h4>
                <p className="text-gray-600">{order.postponedQuantity || 1} item(s)</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">New Delivery Window</h4>
                <p className="text-gray-600">{formatDate(order.postponementDates.from)} - {formatDate(order.postponementDates.to)}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Requested On</h4>
                <p className="text-gray-600">{formatDate(order.updatedAt)}</p>
              </div>
            </div>
          </motion.div>
        )}

        {order.status === "Return Requested" && order.returnDetails && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-5 bg-white rounded-lg shadow lg:col-span-3"
          >
            <h2 className="flex items-center gap-2 mb-4 text-lg font-bold text-red-600">
              <AlertCircle className="w-5 h-5" /> Return Request Details
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <h4 className="font-semibold text-gray-800">Reason for Return</h4>
                <p className="text-gray-600">{order.returnDetails.reason}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Item Condition</h4>
                <p className="text-gray-600">{order.returnDetails.condition}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Return Method</h4>
                <p className="text-gray-600">{order.returnDetails.method}</p>
              </div>
              {order.returnDetails.comments && (
                <div className="md:col-span-2">
                  <h4 className="font-semibold text-gray-800">Additional Comments</h4>
                  <p className="text-gray-600">{order.returnDetails.comments}</p>
                </div>
              )}
              <div>
                <h4 className="font-semibold text-gray-800">Requested On</h4>
                <p className="text-gray-600">{new Date(order.returnDetails.requestedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}</p>
              </div>
              {order.returnDetails.returnedProducts?.length > 0 && (
                <div className="md:col-span-3">
                  <h4 className="mb-2 font-semibold text-gray-800">Returned Products</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Product</th>
                          <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Quantity</th>
                          <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Reason</th>
                          <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Condition</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {order.returnDetails.returnedProducts.map((product: any, index: number) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {product.image && (
                                  <div className="flex-shrink-0 w-10 h-10">
                                    <img className="w-10 h-10 rounded-full" src={product.image} alt={product.name} />
                                  </div>
                                )}
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{product.name || "Product"}</div>
                                  <div className="text-sm text-gray-500">#{product._id || "N/A"}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{product.quantity || 1}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{product.reason || "N/A"}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                                product.condition === "New"
                                  ? "bg-green-100 text-green-800"
                                  : product.condition === "Used"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
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
            </div>
          </motion.div>
        )}
      </motion.div>
    </main>
  );
};

export default OrderDetailsPage;
