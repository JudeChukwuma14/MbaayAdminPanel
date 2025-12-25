import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Home,
  Box,
  ShoppingCart,
  Users,
  DollarSign,
  Settings,
  Inbox,
  LogOutIcon,
  ChevronDown,
  GroupIcon,
  Verified,
  ShieldCheck,
} from "lucide-react";
import { MdOutlineReviews } from "react-icons/md";
import { FaUsers } from "react-icons/fa";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/components/redux/slices/adminSlice";

/* ----------  RE-USABLE NavItem (unchanged)  ---------- */
const NavItem = ({
  title,
  to,
  subItems,
  Icon,
  end,
}: {
  title: string;
  to?: string;
  subItems?: string[];
  Icon?: React.ComponentType<{ className?: string }>;
  end?: boolean;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      {to && !subItems ? (
        <NavLink
          to={to}
          end={end}
          className={({ isActive }) =>
            `p-2 flex items-center justify-between gap-3 cursor-pointer hover:bg-orange-400 rounded ${
              isActive ? "bg-[#F87645] text-white" : ""
            }`
          }
        >
          <div className="flex items-center gap-3 ">
            {Icon && <Icon className="w-5 h-5" />}
            <span>{title}</span>
          </div>
        </NavLink>
      ) : (
        <div
          className={`p-2 flex items-center justify-between gap-3 cursor-pointer hover:bg-orange-400 rounded ${
            open ? "bg-[#F87645] text-white" : ""
          }`}
          onClick={() => (subItems ? setOpen(!open) : null)}
        >
          <div className="flex items-center gap-3 ">
            {Icon && <Icon className="w-5 h-5" />}
            <span>{title}</span>
          </div>
          {subItems && (
            <ChevronDown className={`w-5 h-5 ${open && "rotate-180"}`} />
          )}
        </div>
      )}
      {subItems && (
        <motion.div
          className="pl-8 overflow-hidden"
          initial={false}
          animate={{ height: open ? "auto" : 0 }}
          transition={{ duration: 0.3 }}
        >
          {subItems.map((item) => (
            <NavLink
              key={item}
              to={item.toLowerCase().replace(/ /g, "-")}
              className={({ isActive }) =>
                `block py-1  ${
                  isActive
                    ? "text-orange-500 font-semibold"
                    : "hover:text-gray-600 dark:hover:text-gray-300"
                }`
              }
            >
              {item}
            </NavLink>
          ))}
        </motion.div>
      )}
    </div>
  );
};

interface DashboardSidebarProps {
  darkMode: boolean;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ darkMode }) => {
  const user = useSelector((state: any) => state.admin);
  const dispatch = useDispatch();
  const role = user?.role; // "customer-care" | "admin" | "super-admin"
  console.log("Role ", role);
  const navigate = useNavigate();

  /* ----------  ROLE-BASED LINKS  ---------- */
  const renderNavLinks = () => {
    // Customer-care sees ONLY inbox
    if (role === "Customer care") {
      return <NavItem title="Inbox" to="/app" Icon={Inbox} />;
    }

    // Admin & super-admin see everything EXCEPT inbox
    const adminLinks = (
      <>
        <NavItem title="Dashboard" to="/app" Icon={Home} end={true} />
        <NavItem title="Orders" to="orders" Icon={ShoppingCart} />
        <NavItem
          title="Products"
          subItems={["All Products", "New Product"]}
          Icon={Box}
        />
        <NavItem title="Customers" to="customers" Icon={Users} />
        {role === "Super Admin" ? (
          <NavItem title="Kyc Requests" to="kyc" Icon={ShieldCheck} />
        ) : (
          <NavItem
            title="Verifications"
            subItems={[role === "Super Admin" ? "" : "Requests", "KYC"]}
            Icon={Verified}
          />
        )}
        {/* <NavItem
          title="Verifications"
          subItems={[role === "Super Admin" ? "" : "Requests", "KYC"]}
          Icon={Verified}
        /> */}
        <NavItem title="User Management" to="user-management" Icon={FaUsers} />
        <NavItem title="Reviews" to="reviews" Icon={MdOutlineReviews} />
        <NavItem
          title="Payment"
          subItems={["Payments", "Preview Invoice"]}
          Icon={DollarSign}
        />
        <NavItem
          title="Settings"
          subItems={["Edit Vendor Profile", "General Setting"]}
          Icon={Settings}
        />
        <NavItem
          title="Community"
          subItems={["All Post", "Profile", "Mbaay Community"]}
          Icon={GroupIcon}
        />
      </>
    );

    return adminLinks;
  };

  const handleLogout = () => {
    // Clear Redux store
    dispatch(logout());
    navigate("/login-admin");
  };

  return (
    <aside
      className={`w-64 p-5 h-screen flex flex-col justify-between overflow-y-auto transition-colors ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-[#F5F8FA] text-gray-900"
      }`}
    >
      <div>
        <div className="mb-3 text-2xl font-bold text-orange-500">
          Mbaay Admin
        </div>
        <nav className="flex flex-col gap-1">
          {renderNavLinks()}
          <div
            className="flex items-center justify-between gap-3 p-2 rounded cursor-pointer hover:bg-orange-400"
            onClick={handleLogout}
          >
            <div className="flex items-center gap-3">
              <LogOutIcon className="w-5 h-5" />
              <span>Logout</span>
            </div>
          </div>
        </nav>
      </div>

      {/* ----------  USER FOOTER  ---------- */}
      <div className="flex items-center gap-3 p-3 mt-4 bg-gray-200 rounded-lg dark:bg-gray-700">
        <span className="flex items-center justify-center w-12 h-12 font-bold bg-orange-500 rounded-full text-[20px] text-white">
          {user?.admin?.name?.charAt(0)?.toUpperCase()}
        </span>
        <div>
          <p className="text-sm font-semibold">
            {user?.admin?.name?.charAt(0)?.toUpperCase() +
              user?.admin?.name?.slice(1)}
          </p>
          <div className="flex items-center justify-center mt-2">
            <div className="w-[12px] h-[12px] bg-green-500 rounded-full "></div>
            <span className="text-green-500 text-xs rounded ml-[3px]">
              Online
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;

// import { NavLink } from "react-router-dom";
// import { useState } from "react";
// import {
//   Home,
//   Box,
//   ShoppingCart,
//   Users,
//   DollarSign,
//   Settings,
//   MessageSquare,
//   LogOutIcon,
//   ChevronDown,
//   GroupIcon,
//   Verified,
// } from "lucide-react";
// import { MdOutlineReviews } from "react-icons/md";
// import { FaUsers } from "react-icons/fa";
// import { motion } from "framer-motion";
// import { useSelector } from "react-redux";
// // import { useDarkMode } from "../Context/DarkModeContext";

// interface DashboardSidebarProps {
//   darkMode: boolean;
// }

// const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ darkMode }) => {
//   const user = useSelector((state: any) => state.admin);
//   console.log(user);
//   return (
//     <aside
//       className={`w-64 p-5 h-screen flex flex-col justify-between overflow-y-auto transition-colors ${
//         darkMode ? "bg-gray-900 text-gray-100" : "bg-[#F5F8FA] text-gray-900"
//       }`}
//     >
//       <div>
//         <div className="mb-5 text-2xl font-bold text-orange-500">mbaay</div>
//         <nav>
//           <NavItem title="Dashboard" to="/app" Icon={Home} />
//           <NavItem title="Orders" to="orders" Icon={ShoppingCart} />
//           <NavItem
//             title="Products"
//             subItems={["All Products", "New Product"]}
//             Icon={Box}
//           />
//           <NavItem title="Customers" to="customers" Icon={Users} />
//           <NavItem title="Inbox" to="inbox" Icon={MessageSquare} />
//           <NavItem
//             title="Verifications"
//             subItems={["Requests", "KYC"]}
//             Icon={Verified}
//           />
//           {/* <NavItem title="Request" to="requests" Icon={IoGitPullRequest} /> */}
//           <NavItem
//             title="User Management"
//             to="user-management"
//             Icon={FaUsers}
//           />
//           <NavItem title="Reviews" to="reviews" Icon={MdOutlineReviews} />

//           <NavItem
//             title="Payment"
//             subItems={["Payments", "Preview Invoice"]}
//             Icon={DollarSign}
//           />
//           <NavItem
//             title="Settings"
//             subItems={["Edit Vendor Profile", "General Setting"]}
//             Icon={Settings}
//           />
//           <NavItem
//             title="Community"
//             subItems={["All Post", "Profile"]}
//             Icon={GroupIcon}
//           />
//           <NavItem title="LogOut" to="logout" Icon={LogOutIcon} />
//         </nav>
//       </div>
//       <div className="flex items-center gap-3 p-3 bg-gray-200 rounded-lg dark:bg-gray-700">
//         <span className="flex items-center justify-center w-12 h-12 font-bold bg-orange-500 rounded-full text-[20px] text-white">
//           {user?.admin?.name?.charAt(0)?.toUpperCase()}
//         </span>
//         <div>
//           <p className="text-sm font-semibold">
//             {user?.admin?.name?.charAt(0)?.toUpperCase() +
//               user?.admin?.name?.slice("1")}
//           </p>
//           <div className="flex items-center justify-center mt-2">
//             <div className="w-[12px] h-[12px] bg-green-500 rounded-full "></div>
//             <span className="text-green-500 text-xs rounded ml-[3px]">
//               Online
//             </span>
//           </div>
//         </div>
//       </div>
//     </aside>
//   );
// };

// const NavItem = ({
//   title,
//   to,
//   subItems,
//   Icon,
// }: {
//   title: string;
//   to?: string;
//   subItems?: string[];
//   Icon?: React.ComponentType<{ className?: string }>;
// }) => {
//   const [open, setOpen] = useState(false);

//   //   const handleClick = () => {
//   //   if (onClick) {
//   //     onClick();
//   //   } else if (subItems) {
//   //     setOpen(!open);
//   //   }
//   // };

//   return (
//     <div>
//       <div
//         className={`p-2 flex items-center justify-between gap-3 cursor-pointer hover:bg-orange-400 rounded ${
//           open ? "bg-orange-400 text-white" : ""
//         }`}
//         onClick={() => (subItems ? setOpen(!open) : null)}
//       >
//         <div className="flex items-center gap-3">
//           {Icon && <Icon className="w-5 h-5" />}
//           {to && !subItems ? (
//             <NavLink
//               to={to}
//               className={({ isActive }) =>
//                 isActive
//                   ? "font-semibold text-orange-500"
//                   : "text-black dark:text-gray-300"
//               }
//             >
//               {title}
//             </NavLink>
//           ) : (
//             <span>{title}</span>
//           )}
//         </div>
//         {subItems && (
//           <ChevronDown className={`w-5 h-5 ${open && "rotate-180"}`} />
//         )}
//       </div>
//       {subItems && (
//         <motion.div
//           className="pl-8 overflow-hidden"
//           initial={false}
//           animate={{ height: open ? "auto" : 0 }}
//           transition={{ duration: 0.3 }}
//         >
//           {subItems.map((item) => (
//             <NavLink
//               key={item}
//               to={item.toLowerCase().replace(/ /g, "-")}
//               className={({ isActive }) =>
//                 `block py-1 ${
//                   isActive
//                     ? "text-orange-500 font-semibold"
//                     : "hover:text-gray-600 dark:hover:text-gray-300"
//                 }`
//               }
//             >
//               {item}
//             </NavLink>
//           ))}
//         </motion.div>
//       )}
//     </div>
//   );
// };

// export default DashboardSidebar;
