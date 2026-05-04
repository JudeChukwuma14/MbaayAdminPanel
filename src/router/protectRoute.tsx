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
  // Check Jwt Session Expiry
  try {
    const token = jwtDecode(admin?.token as string) as { exp: number };
    const expirationDate = new Date(token.exp * 1000);
    
    if (expirationDate <= new Date()) {
      // If access token is expired, check if we have a valid refresh token
      if (!admin?.refreshToken) {
        return <Navigate to="/login-admin" replace />;
      }
      
      try {
        const refreshTokenDecoded = jwtDecode(admin.refreshToken) as { exp: number };
        const refreshExpirationDate = new Date(refreshTokenDecoded.exp * 1000);
        
        // If the refresh token is ALSO expired, force logout
        if (refreshExpirationDate <= new Date()) {
          return <Navigate to="/login-admin" replace />;
        }
        
        // If we reach here, the refresh token is valid! 
        // We let the component render so that the Axios interceptor can automatically refresh the access token on the first API call.
      } catch (err) {
        return <Navigate to="/login-admin" replace />;
      }
    }
  } catch (error) {
    // Invalid token, redirect to login-admin
    return <Navigate to="/login-admin" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
