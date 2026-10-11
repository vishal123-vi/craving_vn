import React, { Suspense, lazy } from "react";
import { Toaster } from "react-hot-toast";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import ErrorBoundary from "./components/common/ErrorBoundary";

// Lazy-loaded routes for production performance and code-splitting
const About = lazy(() => import("./pages/About"));
const Register = lazy(() => import("./pages/Register"));
const Login = lazy(() => import("./pages/Login"));
const Contact = lazy(() => import("./pages/Contact"));
const Feedback = lazy(() => import("./pages/Feedback"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));
const OrderNow = lazy(() => import("./pages/OrderNow"));
const RestaurantDetailsPage = lazy(() => import("./pages/RestaurantDetailsPage"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const SiteMap = lazy(() => import("./pages/SiteMap"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation"));
const OrderTracking = lazy(() => import("./pages/OrderTracking"));

// Heavy dashboard bundles
const CustomerDashboard = lazy(() => import("./pages/dashboard/CustomerDashboard"));
const RestaurantDashboard = lazy(() => import("./pages/dashboard/RestaurantDashboard"));
const RiderDashboard = lazy(() => import("./pages/dashboard/RiderDashboard"));
const AdminDashboard = lazy(() => import("./pages/dashboard/AdminDashboard"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const Test = lazy(() => import("./pages/Test"));

// Branded loading fallback
const RouteFallbackLoader = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
    <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Cravings...</span>
  </div>
);

const App = () => {
  const location = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const hideFooterRoutes = [
    "/customer-dashboard",
    "/profile",
    "/restaurant-dashboard",
    "/rider-dashboard",
    "/admin-dashboard",
  ];
  const shouldShowFooter = !hideFooterRoutes.includes(location.pathname);

  return (
    <ErrorBoundary>
      <Toaster />
      <Navbar />
      <Suspense fallback={<RouteFallbackLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/help-center" element={<HelpCenter />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/:userType" element={<Register />} />
          <Route path="/customer-dashboard" element={<CustomerDashboard />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/restaurant-dashboard" element={<RestaurantDashboard />} />
          <Route path="/rider-dashboard" element={<RiderDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/test" element={<Test />} />
          <Route path="/order-now" element={<OrderNow />} />
          <Route
            path="/restaurant-details/:restaurantId"
            element={<RestaurantDetailsPage />}
          />
          <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
          <Route path="/order-track/:orderId" element={<OrderTracking />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/site-map" element={<SiteMap />} />
        </Routes>
      </Suspense>

      {shouldShowFooter && <Footer />}
    </ErrorBoundary>
  );
};

export default App;
