import React from "react";
import DashboardSidebar from "./DashboardSidebar";
import VendorHeader from "./VendorHeader";
import { Outlet } from "react-router-dom";
import { useDarkMode } from "../context/DarkModeContext";
// Import dark mode context

const VendorLayout: React.FC = () => {
  const { darkMode } = useDarkMode(); // Use context instead of local state

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="flex h-screen">
        <DashboardSidebar darkMode={darkMode} />
        <div className="flex-1 flex flex-col">
          <VendorHeader />
          <main className="flex-1 overflow-y-auto p-4">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default VendorLayout;
