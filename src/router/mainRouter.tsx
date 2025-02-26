import { lazy, Suspense } from "react";
import Spinner from "../components/common/Spinner";
import { createBrowserRouter, RouteObject } from "react-router-dom";
import VendorLayout from "../components/VendorInfo/VendorLayout";

const SignupAdmin = lazy(()=>import("../components/auth/SignupAdmin"))
const LoginAdmin = lazy(()=>import("../components/auth/LoginAdmin"))


const Dashboard = lazy(() => import("../components/VendorInfo/Dashboard"));
const AllOrder = lazy(() => import("../components/VendorInfo/Orders/AllOrder"));
const OrderDetails = lazy(
  () => import("../components/VendorInfo/Orders/OrderDetails")
);
const AllProduct = lazy(() => import("../components/VendorInfo/Products/AllProduct"));
const NewProduct = lazy(() => import("../components/VendorInfo/Products/NewProduct"));
const Customer = lazy(() => import("../components/VendorInfo/Customers/Customer"));
const Payments = lazy(() => import("../components/VendorInfo/Payments/Payments"));
const PreviewInvoice = lazy(() => import("../components/VendorInfo/Payments/PreviewInvoice"));
const EditVendorProfile = lazy(() => import("../components/VendorInfo/Setting/EditVendorProfile"));
const KycVerification = lazy(() => import("../components/VendorInfo/Setting/KycVerification"));
const Inbox = lazy(() => import("../components/VendorInfo/Inbox"));
const AllPost = lazy(() => import("../components/VendorInfo/Community&Res/AllPost"));
const Requests = lazy(() => import("../components/VendorInfo/Request/Requests")
);

const RequestDetail = lazy(
  () => import("../components/VendorInfo/Request/RequestDetail")
);

const Review = lazy(() => import("../components/VendorInfo/Review/Review"));

const GeneralSetting = lazy(
  () => import("../components/VendorInfo/Setting/GeneralSetting")
);

const AllUsers = lazy(() => import("../components/VendorInfo/AllUsers"));

const AllVendors = lazy(() => import("../components/VendorInfo/AllVendors"));

const Profile = lazy(
  () => import("../components/VendorInfo/Community&Res/Profile")
)

const withSuspense = (Component:React.ComponentType)=>(
    <Suspense fallback={<Spinner/>}>
        <Component/>
    </Suspense>
)

const routesConfig:RouteObject[]=[
    {path:"/", element:withSuspense(SignupAdmin)},
    {path:"/login-admin", element:withSuspense(LoginAdmin)},

    {
        path: "/app",
        element: <VendorLayout />,
        children: [
          { index: true, element: withSuspense(Dashboard) },
          { path: "orders", element: withSuspense(AllOrder) },
          { path: "order-details", element: withSuspense(OrderDetails) },
          { path: "all-products", element: withSuspense(AllProduct) },
          { path: "new-product", element: withSuspense(NewProduct) },
          { path: "customers", element: withSuspense(Customer) },
          { path: "Payments", element: withSuspense(Payments) },
          { path: "preview-invoice", element: withSuspense(PreviewInvoice) },
          { path: "edit-vendor-profile", element: withSuspense(EditVendorProfile) },
          { path: "kyc-verification", element: withSuspense(KycVerification) },
          { path: "inbox", element: withSuspense(Inbox) },
          { path: "all-post", element: withSuspense(AllPost) },
          { path: "requests", element: withSuspense(Requests) },
          { path: "requests/request-detail/:id", element: withSuspense(RequestDetail) },
          { path: "reviews", element: withSuspense(Review) },
          { path: "general-setting", element: withSuspense(GeneralSetting) },
          { path: "all-users", element: withSuspense(AllUsers) },
          { path: "all-vendors", element: withSuspense(AllVendors) },
          { path: "profile", element: withSuspense(Profile) },
        ],
      },

]

export const mainRouter= createBrowserRouter(routesConfig)