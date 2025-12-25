import React, { useState } from "react";
import {
  // Sun,
  // Moon,
  Bell,
  // Search,
  X,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { useDarkMode } from "../context/DarkModeContext";
import { useMutation } from "@tanstack/react-query";
import { broadcastMessage } from "@/services/adminApi";
import { toast } from "react-toastify";

const VendorHeader: React.FC = () => {
  const { darkMode } = useDarkMode();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastBody, setBroadcastBody] = useState("");
  const [broadcastTarget, setBroadcastTarget] = useState<
    "all" | "users" | "vendors" | "admins"
  >("all");

  const mutation = useMutation({
    mutationFn: ({
      title,
      message,
      target,
    }: {
      title: string;
      message: string;
      target: string;
    }) => broadcastMessage(title, message, target as any, user?.token),
    onSuccess: () => {
      toast.success("Message broadcast successful", { position: "top-right" });
      setShowBroadcast(false);
      setBroadcastTitle("");
      setBroadcastBody("");
      setBroadcastTarget("all");
    },
    onError: (err: any) => {
      console.error("Broadcast error:", err);
      toast.error("Failed to broadcast message", { position: "top-right" });
    },
  });

  const handleBroadcast = () => {
    if (!broadcastTitle.trim() || !broadcastBody.trim()) return;
    mutation.mutate({
      title: broadcastTitle,
      message: broadcastBody,
      target: broadcastTarget,
    });
  };

  const user = useSelector((state: any) => state.admin);

  const notifications = [
    {
      id: 1,
      message: "Giovanni Kamper commented on your post",
      detail: "This Looks great!! Let's get started on it.",
      date: "Sep 20, 2024",
      time: "2:20pm",
      avatar: "/path-to-avatar1.png",
    },
    {
      id: 2,
      message: "Kessler Vester started following you",
      date: "Sep 20, 2024",
      time: "2:20pm",
      avatar: "/path-to-avatar2.png",
    },
    {
      id: 3,
      message: "OKonkwo Hilary added your product on wishlist",
      date: "Sep 20, 2024",
      time: "2:20pm",
    },
    {
      id: 3,
      message: "OKonkwo Hilary added your product on wishlist",
      date: "Sep 20, 2024",
      time: "2:20pm",
    },
    {
      id: 3,
      message: "OKonkwo Hilary added your product on wishlist",
      date: "Sep 20, 2024",
      time: "2:20pm",
    },
    {
      id: 3,
      message: "OKonkwo Hilary added your product on wishlist",
      date: "Sep 20, 2024",
      time: "2:20pm",
    },
    {
      id: 1,
      message: "Giovanni Kamper commented on your post",
      detail: "This Looks great!! Let's get started on it.",
      date: "Sep 20, 2024",
      time: "2:20pm",
      avatar: "/path-to-avatar1.png",
    },
  ];

  return (
    <header
      className={`p-4 flex justify-between items-center shadow-md transition-colors ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      <h1 className="text-xl font-semibold">
        {/* Good Morning, <span className="text-orange-500">{user.user.name.charAt(0).toUpperCase() + user.user.name.slice("1")}</span> */}
        Good Morning,{" "}
        <span className="text-orange-500">
          {user.admin.name.charAt(0).toUpperCase() + user.admin.name.slice("1")}
        </span>
      </h1>
      <div className="flex items-center gap-4">
        {/* Light/Dark Mode Button */}
        {/* <button
          onClick={toggleDarkMode}
          aria-label="Toggle Dark Mode"
          className="mb-2"
        >
          {darkMode ? (
            <Sun className="text-yellow-400 text-[30px]" />
          ) : (
            <Moon className="text-gray-500 text-[30px]" />
          )}
        </button> */}

        {/* Broadcast button */}
        <div>
          <button
            onClick={() => setShowBroadcast(true)}
            className="flex items-center gap-2 px-3 py-2 bg-orange-500 text-white rounded"
          >
            <MessageSquare className="w-4 h-4" />
            Broadcast
          </button>

          <AnimatePresence>
            {showBroadcast && (
              <motion.div
                className={`fixed inset-0 z-50 flex items-center justify-center`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div
                  className="absolute inset-0 bg-black/40 z-40"
                  onClick={() => setShowBroadcast(false)}
                />
                <motion.div
                  className={`w-full max-w-lg p-6 z-50 bg-white rounded-lg shadow-lg`}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Broadcast Message</h3>
                    <button onClick={() => setShowBroadcast(false)}>
                      <X />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm">Title</label>
                    <input
                      value={broadcastTitle}
                      onChange={(e) => setBroadcastTitle(e.target.value)}
                      className="w-full border p-2 rounded"
                      placeholder="Enter title"
                    />

                    <label className="block text-sm">Message</label>
                    <textarea
                      value={broadcastBody}
                      onChange={(e) => setBroadcastBody(e.target.value)}
                      className="w-full border p-2 rounded min-h-[100px]"
                      placeholder="Type message to broadcast"
                    />

                    <label className="block text-sm">Target</label>
                    <select
                      value={broadcastTarget}
                      onChange={(e) =>
                        setBroadcastTarget(e.target.value as any)
                      }
                      className="w-full border p-2 rounded"
                    >
                      <option value="all">All</option>
                      <option value="users">Users</option>
                      <option value="vendors">Vendors</option>
                      <option value="admins">Admins</option>
                    </select>

                    <div className="flex justify-end gap-2 mt-4">
                      <button
                        className="px-4 py-2 rounded border"
                        onClick={() => setShowBroadcast(false)}
                        disabled={mutation.isPending}
                      >
                        Cancel
                      </button>
                      <button
                        className="px-4 py-2 rounded bg-orange-500 text-white flex items-center gap-2"
                        onClick={() => handleBroadcast()}
                        disabled={
                          mutation.isPending ||
                          !broadcastTitle.trim() ||
                          !broadcastBody.trim()
                        }
                      >
                        {mutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Send"
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
          >
            <Bell className="text-gray-500" />
            {notifications.length > 0 && (
              <span className="absolute flex items-center justify-center w-5 h-5 text-xs text-white bg-red-500 rounded-full -top-1 -right-1">
                {notifications.length}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                className={`absolute right-0 mt-2 w-80 shadow-lg rounded-lg overflow-hidden ${
                  darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
                }`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="text-lg font-semibold">Notifications</h2>
                  <button
                    onClick={() => setShowNotifications(false)}
                    aria-label="Close Notifications"
                  >
                    <X className="text-gray-500" />
                  </button>
                </div>
                <div className="overflow-y-auto max-h-64">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start gap-3 p-4 border-b ${
                        darkMode
                          ? "border-gray-700 hover:bg-gray-700"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {notification.avatar ? (
                        <img
                          src={notification.avatar}
                          alt="Avatar"
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-10 h-10 font-bold text-white bg-orange-500 rounded-full">
                          {notification.message[0]}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{notification.message}</p>
                        {notification.detail && (
                          <p
                            className={`text-sm ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {notification.detail}
                          </p>
                        )}
                        <span
                          className={`text-xs ${
                            darkMode ? "text-gray-500" : "text-gray-400"
                          }`}
                        >
                          {notification.time} - {notification.date}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between p-4">
                  <button className="text-orange-500">Mark as read</button>
                  <button className="px-4 py-2 text-white bg-orange-500 rounded">
                    View All Notifications
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col items-center justify-center">
          <span className="flex items-center justify-center w-12 h-12 font-bold bg-orange-500 rounded-full text-[20px] text-white">
            {user?.admin?.name?.charAt(0)?.toUpperCase()}
          </span>
          <h3>{user?.role}</h3>
        </div>
      </div>
    </header>
  );
};

export default VendorHeader;
