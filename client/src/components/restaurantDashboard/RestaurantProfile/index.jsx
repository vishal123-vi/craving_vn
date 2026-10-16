import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { MdRestaurantMenu, MdAddCircleOutline } from "react-icons/md";
import api from "../../../config/ApiConfig";
import RestaurantInformation from "./RestaurantInformation";
import RestaurantPhotos from "./RestaurantPhotos";
import FinancialDetails from "./FinancialDetails";
import RestaurantDocuments from "./RestaurantDocuments";
import ContactAndHours from "./ContactAndHours";
import CreateRestaurantProfile from "./CreateRestaurantProfile";

const RestaurantProfileContainer = ({ activeRestaurantId, refreshRestaurants, restaurants }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  const profileData = activeRestaurantId 
    ? restaurants?.find(r => r._id === activeRestaurantId) 
    : restaurants?.[0];
  const isProfileCreated = !!profileData;

  const handleToggleStatus = async () => {
    if (!profileData) return;
    try {
      const response = await api.patch("/restaurant/toggle-status", { restaurantId: profileData._id });
      if (response.data?.data) {
        refreshRestaurants();
        toast.success(response.data.message || "Status updated!");
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleSuccess = async () => {
    await refreshRestaurants();
    setShowCreateForm(false);
  };

  return (
    <div className="space-y-6 pb-10">
      {showCreateForm ? (
        <CreateRestaurantProfile
          onSuccess={handleSuccess}
          onCancel={() => setShowCreateForm(false)}
        />
      ) : isProfileCreated ? (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4 sm:gap-0">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-gray-800">{profileData?.restaurantName || "Restaurant Profile"}</h2>
                {profileData?.status === "active" ? (
                  <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-green-100 text-green-700 border border-green-200">
                    Approved
                  </span>
                ) : profileData?.status === "blocked" ? (
                  <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-red-100 text-red-700 border border-red-200">
                    Suspended
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                    Pending Admin Approval
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">Manage your restaurant details, documents, and settings</p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-lg font-semibold text-sm transition-all"
              >
                <MdAddCircleOutline className="text-lg" /> Add Another Restaurant
              </button>
              
              <div className="hidden sm:block h-8 w-px bg-gray-300"></div>

              <div className="flex items-center gap-2">
                <span className={`font-semibold text-sm ${profileData?.isOpen ? "text-green-600" : "text-red-500"}`}>
                  {profileData?.isOpen ? "Currently Open" : "Currently Closed"}
                </span>
                <label 
                  className={`relative inline-flex items-center ${profileData?.status !== "active" && !profileData?.isOpen ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                  title={profileData?.status !== "active" && !profileData?.isOpen ? "Approval required before opening online" : "Toggle store open/closed"}
                >
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={profileData?.isOpen || false} 
                    disabled={profileData?.status !== "active" && !profileData?.isOpen}
                    onChange={handleToggleStatus} 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-4 border-b border-(--color-base-300) pb-2 overflow-x-auto whitespace-nowrap">
            <button
              className={`font-semibold pb-2 border-b-2 transition-colors ${activeTab === "basic" ? "border-(--color-primary) text-(--color-primary)" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              onClick={() => setActiveTab("basic")}
            >
              Basic Details & Location
            </button>
            <button
              className={`font-semibold pb-2 border-b-2 transition-colors ${activeTab === "photos" ? "border-(--color-primary) text-(--color-primary)" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              onClick={() => setActiveTab("photos")}
            >
              Restaurant Photos
            </button>
            <button
              className={`font-semibold pb-2 border-b-2 transition-colors ${activeTab === "documents" ? "border-(--color-primary) text-(--color-primary)" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              onClick={() => setActiveTab("documents")}
            >
              Documents & Legal
            </button>
            <button
              className={`font-semibold pb-2 border-b-2 transition-colors ${activeTab === "financial" ? "border-(--color-primary) text-(--color-primary)" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              onClick={() => setActiveTab("financial")}
            >
              Financial Details
            </button>
            <button
              className={`font-semibold pb-2 border-b-2 transition-colors ${activeTab === "contact" ? "border-(--color-primary) text-(--color-primary)" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              onClick={() => setActiveTab("contact")}
            >
              Contact & Social Media
            </button>
          </div>

          <div className="animate-fade-in mt-4">
            {activeTab === "basic" && (
              <RestaurantInformation
                initialData={profileData}
                onSuccess={refreshRestaurants}
                isProfileCreated={isProfileCreated}
                activeRestaurantId={activeRestaurantId}
              />
            )}
            {activeTab === "photos" && (
              <RestaurantPhotos
                initialData={profileData}
                onSuccess={refreshRestaurants}
                activeRestaurantId={activeRestaurantId}
              />
            )}
            {activeTab === "documents" && (
              <RestaurantDocuments
                initialData={profileData}
                onSuccess={refreshRestaurants}
                activeRestaurantId={activeRestaurantId}
              />
            )}
            {activeTab === "financial" && (
              <FinancialDetails
                initialData={profileData}
                onSuccess={refreshRestaurants}
                activeRestaurantId={activeRestaurantId}
              />
            )}
            {activeTab === "contact" && (
              <ContactAndHours
                initialData={profileData}
                onSuccess={refreshRestaurants}
                activeRestaurantId={activeRestaurantId}
              />
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-4 bg-white rounded-3xl shadow-xl border border-gray-100 text-center">
          <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6">
            <MdRestaurantMenu className="text-5xl text-(--color-primary)" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            Welcome to Cravings!
          </h2>
          <p className="text-gray-500 max-w-lg mb-8 text-lg">
            It looks like you haven't set up your restaurant profile yet. Add
            your restaurant details to get started and start receiving orders.
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-3 bg-(--color-primary) text-(--color-primary-content) px-8 py-4 rounded-2xl text-lg font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <MdAddCircleOutline className="text-2xl" /> Add Restaurant
          </button>
        </div>
      )}
    </div>
  );
};

export default RestaurantProfileContainer;
