import { lazy, Suspense } from "react";
import Spinner from "../components/common/Spinner";
import { createBrowserRouter, RouteObject } from "react-router-dom";
import VendorLayout from "../components/VendorInfo/VendorLayout";
import { useSelector } from "react-redux";
import ProtectedRoute from "./protectRoute";

const SignupAdmin = lazy(() => import("../components/auth/SignupAdmin"));
const LoginAdmin = lazy(() => import("../components/auth/LoginAdmin"));

const Dashboard = lazy(() => import("../components/VendorInfo/Dashboard"));
const AllOrder = lazy(() => import("../components/VendorInfo/Orders/AllOrder"));
const OrderDetails = lazy(
  () => import("../components/VendorInfo/Orders/OrderDetails")
);
const AllProduct = lazy(
  () => import("../components/VendorInfo/Products/AllProduct")
);
const NewProduct = lazy(
  () => import("../components/VendorInfo/Products/NewProduct")
);
const Customer = lazy(
  () => import("../components/VendorInfo/Customers/Customer")
);
const Payments = lazy(
  () => import("../components/VendorInfo/Payments/Payments")
);
const PreviewInvoice = lazy(
  () => import("../components/VendorInfo/Payments/PreviewInvoice")
);
const EditVendorProfile = lazy(
  () => import("../components/VendorInfo/Setting/EditVendorProfile")
);
const Inbox = lazy(() => import("../components/VendorInfo/Inbox"));
const AllPost = lazy(
  () => import("../components/VendorInfo/Community&Res/AllPost")
);
const MbaayCommunity = lazy(
  () => import("../components/VendorInfo/Community&Res/MbaayCommunity")
);
const Requests = lazy(
  () => import("../components/VendorInfo/Verification/Requests")
);

const RequestDetail = lazy(
  () => import("../components/VendorInfo/Verification/RequestDetail")
);

const Review = lazy(() => import("../components/VendorInfo/Review/Review"));

const GeneralSetting = lazy(
  () => import("../components/VendorInfo/Setting/GeneralSetting")
);

const Kyc = lazy(() => import("../components/VendorInfo/Verification/Kyc"));

const AllUsers = lazy(() => import("../components/VendorInfo/AllUsers"));

const Profile = lazy(
  () => import("../components/VendorInfo/Community&Res/Profile")
);

const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<Spinner />}>
    <Component />
  </Suspense>
);
const Role = () => {
  const user = useSelector((state: any) => state.admin);
  const role = user?.role;

  return (
    <div>
      {role === "Customer care" ? withSuspense(Inbox) : withSuspense(Dashboard)}
    </div>
  );
};
const routesConfig: RouteObject[] = [
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        element: <VendorLayout />,
        children: [
          {
            index: true,
            element: <Role />,
          },
          { path: "orders", element: withSuspense(AllOrder) },
          { path: "order-details", element: withSuspense(OrderDetails) },
          { path: "all-products", element: withSuspense(AllProduct) },
          { path: "new-product", element: withSuspense(NewProduct) },
          { path: "customers", element: withSuspense(Customer) },
          { path: "Payments", element: withSuspense(Payments) },
          { path: "preview-invoice", element: withSuspense(PreviewInvoice) },
          {
            path: "edit-vendor-profile",
            element: withSuspense(EditVendorProfile),
          },
          {
            path: "kyc",
            element: withSuspense(() => <Kyc />),
          },
          { path: "inbox", element: withSuspense(Inbox) },
          { path: "all-post", element: withSuspense(AllPost) },
          { path: "mbaay-community", element: withSuspense(MbaayCommunity) },
          { path: "requests", element: withSuspense(Requests) },
          {
            path: "requests/request-detail/:id",
            element: withSuspense(RequestDetail),
          },
          { path: "reviews", element: withSuspense(Review) },
          { path: "general-setting", element: withSuspense(GeneralSetting) },
          { path: "user-management", element: withSuspense(AllUsers) },
          { path: "profile", element: withSuspense(Profile) },
        ],
      },
    ],
  },
  { path: "/signup-admin", element: withSuspense(SignupAdmin) },
  { path: "/login-admin", element: withSuspense(LoginAdmin) },
];

export const mainRouter = createBrowserRouter(routesConfig);
