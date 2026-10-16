import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/Sidebar";
import RestaurantOverview from "../../components/restaurantDashboard/RestaurantOverview";
import RestaurantMenu from "../../components/restaurantDashboard/RestaurantMenu";
import RestaurantSetting from "../../components/restaurantDashboard/RestaurantSetting";
import RestaurantOrders from "../../components/restaurantDashboard/RestaurantOrders";
import { MdDashboard, MdRestaurantMenu } from "react-icons/md";
import { FaShoppingCart } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";
import { FiMenu, FiX } from "react-icons/fi";
import api from "../../config/ApiConfig";

const RestaurantDashboard = () => {
  const { isLogin, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const active = location.state?.activeTab;
  const [activeTab, setActiveTab] = useState(active || "overview");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  const [restaurants, setRestaurants] = useState([]);
  const [activeRestaurantId, setActiveRestaurantId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  const fetchRestaurants = async () => {
    try {
      const response = await api.get("/restaurant/get-profile");
      if (response.data?.data && Array.isArray(response.data.data)) {
        setRestaurants(response.data.data);
        if (response.data.data.length > 0 && !activeRestaurantId) {
          setActiveRestaurantId(response.data.data[0]._id);
        }
      }
    } catch (error) {
      console.error("Error fetching restaurants", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLogin && role === "restaurant") {
      fetchRestaurants();
    }
  }, [isLogin, role]);

  const mainTabs = [
    { name: "Overview", value: "overview", icon: <MdDashboard size={20} /> },
    { name: "Menu", value: "menu", icon: <MdRestaurantMenu size={20} /> },
    { name: "Orders", value: "orders", icon: <FaShoppingCart size={20} /> },
  ];
  const settingsTab = { name: "Settings", value: "settings", icon: <IoMdSettings size={20} /> };

  const dropdownOptions = restaurants.map(r => ({ label: r.restaurantName, value: r._id }));

  if (!isLogin || role !== "restaurant") {
    return (
      <div className="h-[92vh] bg-[url('/foodTable.webp')]  bg-cover bg-center">
        <div className="h-full backdrop-blur-lg flex flex-col items-center justify-center ">
          <h1 className="text-2xl font-bold text-(--color-neutral-content)">
            Access Denied. Please log in as a Restaurant Manager to view this
            page.
          </h1>
          <button
            className="mt-4 px-4 py-2 bg-(--color-primary) text-white rounded-md"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div className="h-[calc(100vh-64px)] flex items-center justify-center">Loading dashboard...</div>;
  }

  const activeRestaurant = restaurants.find(r => r._id === activeRestaurantId) || restaurants[0];

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col lg:flex-row overflow-hidden relative">
      {/* Mobile Header for Hamburger */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-40 shrink-0 shadow-sm">
        <span className="font-bold text-xl text-gray-800 dark:text-white">Restaurant Dashboard</span>
        <button 
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-(--color-primary) hover:bg-gray-200 transition-colors"
        >
          {isMobileSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Sidebar Wrapper */}
      <div className={`
        fixed lg:relative top-[64px] lg:top-0 left-0 h-[calc(100vh-64px)] lg:h-full shrink-0 z-50
        transition-transform duration-300 ease-in-out
        ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => { setActiveTab(tab); setIsMobileSidebarOpen(false); }}
          mainTabs={mainTabs}
          settingsTab={settingsTab}
          subtitle="Restaurant"
          dropdownOptions={dropdownOptions}
          selectedDropdownValue={activeRestaurantId}
          onDropdownChange={setActiveRestaurantId}
        />
      </div>

      {/* Overlay for mobile */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden top-[64px]"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 bg-(--color-base-100) p-4 rounded-2xl shadow-xl h-full overflow-y-auto w-full">
        {/* Admin Approval & Status Notice Banner */}
        {activeRestaurant && activeRestaurant.status === "inactive" && (
          <div className="mb-4 p-3.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm shadow-sm animate-in fade-in duration-300">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 bg-amber-100 rounded-lg text-amber-700 text-base">⏳</span>
              <div>
                <p className="font-bold text-amber-900">Awaiting Admin Approval</p>
                <p className="text-xs text-amber-700">Your restaurant is currently under review by our Admin team. You can configure your profile and menu, but you cannot open the store for live orders until approved.</p>
              </div>
            </div>
            <span className="shrink-0 px-2.5 py-1 text-xs font-bold rounded-full bg-amber-200 text-amber-800 uppercase tracking-wider">Pending Review</span>
          </div>
        )}

        {activeRestaurant && activeRestaurant.status === "blocked" && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm shadow-sm animate-in fade-in duration-300">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 bg-red-100 rounded-lg text-red-700 text-base">⛔</span>
              <div>
                <p className="font-bold text-red-900">Account Suspended</p>
                <p className="text-xs text-red-700">This restaurant has been suspended by Admin. Store opening and menu modifications are locked. Please contact support.</p>
              </div>
            </div>
            <span className="shrink-0 px-2.5 py-1 text-xs font-bold rounded-full bg-red-200 text-red-800 uppercase tracking-wider">Suspended</span>
          </div>
        )}

        {!activeRestaurant && restaurants.length === 0 && (
          <div className="mb-4 p-4 bg-orange-50 border border-orange-200 text-orange-900 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm shadow-sm">
            <div>
              <p className="font-bold text-orange-950">No Restaurant Profile Created Yet</p>
              <p className="text-xs text-orange-700">Complete your restaurant profile, legal documents, and financial details in Settings to submit for Admin approval.</p>
            </div>
            <button 
              onClick={() => setActiveTab("settings")}
              className="px-4 py-2 bg-(--color-primary) text-white font-semibold rounded-lg text-xs hover:opacity-90 transition-opacity"
            >
              Setup Restaurant
            </button>
          </div>
        )}

        {activeTab === "overview" && <RestaurantOverview activeRestaurantId={activeRestaurantId} restaurants={restaurants} refreshRestaurants={fetchRestaurants} />}
        {activeTab === "menu" && <RestaurantMenu activeRestaurantId={activeRestaurantId} />}
        {activeTab === "orders" && <RestaurantOrders activeRestaurantId={activeRestaurantId} />}
        {activeTab === "settings" && <RestaurantSetting activeRestaurantId={activeRestaurantId} refreshRestaurants={fetchRestaurants} restaurants={restaurants} />}
      </div>
    </div>
  );
};

export default RestaurantDashboard;
