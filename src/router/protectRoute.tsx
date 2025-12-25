import { RootState } from "@/components/redux/store";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute: React.FC = () => {
  const admin = useSelector((state: RootState) => state.admin);
  const role = admin?.role as "Customer care" | "Admin" | "Super Admin";
  if (
    !admin?.token ||
    (role !== "Admin" && role !== "Super Admin" && role !== "Customer care")
  ) {
    return <Navigate to="/login-admin" replace />;
  }
  //   Check Jwt Session Expiry
  try {
    const token = jwtDecode(admin?.token as string) as { exp: number };
    const expirationDate = new Date(token.exp * 1000);
    console.log("Exp", expirationDate);
    if (expirationDate <= new Date()) {
      return <Navigate to="/login-admin" replace />;
    }
  } catch (error) {
    // Invalid token, redirect to login-admin
    return <Navigate to="/login-admin" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
