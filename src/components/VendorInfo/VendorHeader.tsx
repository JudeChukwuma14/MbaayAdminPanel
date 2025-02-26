import React, { useState } from "react";
import { Sun, Moon, Bell, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { useDarkMode } from "../context/DarkModeContext";



const VendorHeader: React.FC = () => {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [showNotifications, setShowNotifications] = useState(false);

  const user = useSelector((state:any)=> state.admin)

  const notifications= [
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
        Good Morning, <span className="text-orange-500">{user.admin.name.charAt(0).toUpperCase() + user.admin.name.slice("1")}</span>
      </h1>
      <div className="flex items-center gap-4">
        {/* Search Box */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className={`p-2 pr-10 rounded border outline-orange-500 ${
              darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-orange-500 text-gray-900"
            }`}
          />
          <Search className="absolute right-2 top-2 text-orange-500" />
        </div>

        {/* Light/Dark Mode Button */}
        <button onClick={toggleDarkMode} aria-label="Toggle Dark Mode">
          {darkMode ? (
            <Sun className="text-yellow-400" />
          ) : (
            <Moon className="text-gray-500" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
          >
            <Bell className="text-gray-500" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
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
                <div className="p-4 border-b flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Notifications</h2>
                  <button
                    onClick={() => setShowNotifications(false)}
                    aria-label="Close Notifications"
                  >
                    <X className="text-gray-500" />
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start gap-3 p-4 border-b ${
                        darkMode ? "border-gray-700 hover:bg-gray-700" : "hover:bg-gray-100"
                      }`}
                    >
                      {notification.avatar ? (
                        <img
                          src={notification.avatar}
                          alt="Avatar"
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
                          {notification.message[0]}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{notification.message}</p>
                        {notification.detail && (
                          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                            {notification.detail}
                          </p>
                        )}
                        <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                          {notification.time} - {notification.date}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 flex justify-between items-center">
                  <button className="text-orange-500">Mark as read</button>
                  <button className="bg-orange-500 text-white px-4 py-2 rounded">
                    View All Notifications
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex justify-center flex-col items-center">
        <img
          src="/vendor-avatar.png"
          alt="Vendor"
          className="w-10 h-10 rounded-full"
        />
        <h3>Super Admin</h3>
        </div>
      </div>
    </header>
  );
};

export default VendorHeader;
