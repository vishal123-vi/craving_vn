import React from "react";
import { Toaster } from "react-hot-toast";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Register from "./pages/Register";
import Login from "./pages/Login";
import CustomerDashboard from "./pages/dashboard/CustomerDashboard";
import Contact from "./pages/Contact";
import Feedback from "./pages/Feedback";
import HelpCenter from "./pages/HelpCenter";
import RestaurantDashboard from "./pages/dashboard/RestaurantDashboard";
import RiderDashboard from "./pages/dashboard/RiderDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import Test from "./pages/Test";
import OrderNow from "./pages/OrderNow";
import RestaurantDetailsPage from "./pages/RestaurantDetailsPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import SiteMap from "./pages/SiteMap";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderTracking from "./pages/OrderTracking";


const App = () => {
  const location = useLocation();
  
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const hideFooterRoutes = [
    "/customer-dashboard",
    "/restaurant-dashboard",
    "/rider-dashboard",
    "/admin-dashboard"
  ];
  const shouldShowFooter = !hideFooterRoutes.includes(location.pathname);

  return (
    <>
      <Toaster />
      <Navbar />
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
        <Route path="/restaurant-dashboard" element={<RestaurantDashboard />} />
        <Route path="/rider-dashboard" element={<RiderDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/test" element={<Test/>}/>
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

      {shouldShowFooter && <Footer />}
    </>
  );
};

export default App;
