import { useEffect, useState } from "react";
import { RootState } from "@/components/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import Spinner from "@/components/common/Spinner";
import { logout } from "@/components/redux/slices/adminSlice";
import { isAccessTokenExpired, isAdminRole, refreshAdminSession } from "@/services/authSession";

const ProtectedRoute: React.FC = () => {
  const dispatch = useDispatch();
  const admin = useSelector((state: RootState) => state.admin);
  const [refreshError, setRefreshError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const needsRefresh = isAccessTokenExpired(admin.token);

  useEffect(() => {
    if (!admin.token || !isAdminRole(admin.role) || !needsRefresh) return;
    if (!admin.refreshToken) {
      dispatch(logout());
      return;
    }

    let active = true;
    setRefreshError(false);
    refreshAdminSession().catch(() => {
      if (active) setRefreshError(true);
    });
    return () => { active = false; };
  }, [admin.token, admin.refreshToken, admin.role, needsRefresh, attempt, dispatch]);

  if (!admin.token || !isAdminRole(admin.role) || (needsRefresh && !admin.refreshToken)) {
    return <Navigate to="/login-admin" replace />;
  }

  if (needsRefresh) {
    if (refreshError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4 text-center">
          <p>Unable to restore your session. Check your connection and try again.</p>
          <button
            type="button"
            className="px-4 py-2 text-white bg-orange-500 rounded-md"
            onClick={() => setAttempt((value) => value + 1)}
          >
            Try again
          </button>
          <button type="button" onClick={() => dispatch(logout())}>Log out</button>
        </div>
      );
    }
    return <Spinner />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
