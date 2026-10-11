import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import api from "../config/ApiConfig";
import toast from "react-hot-toast";
import {
  FiArrowLeft,
  FiMenu,
  FiX,
  FiChevronRight,
  FiPlus,
  FiCheck,
  FiEye,
  FiEyeOff,
  FiLock,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiLogOut,
  FiCompass,
  FiTag,
  FiClock,
  FiCreditCard,
  FiShare2,
  FiSettings,
  FiHelpCircle,
  FiCamera,
  FiCheckCircle,
} from "react-icons/fi";
import { IoCartOutline } from "react-icons/io5";

const ProfilePage = () => {
  const { user, isLogin, setUser, setIsLogin, setRole } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  // Active view: 'hub' | 'addresses' | 'add_address' | 'personal_info' | 'change_password'
  const [activeView, setActiveView] = useState("hub");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Profile data state
  const [addressBook, setAddressBook] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  // Personal Info Form State
  const [personalInfo, setPersonalInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    photoUrl: "",
  });

  // New Address Form State
  const [newAddress, setNewAddress] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
    addressType: "Home",
    isDefault: false,
  });

  // Change Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Load Profile & Addresses
  useEffect(() => {
    if (!isLogin) {
      navigate("/login");
      return;
    }

    if (user) {
      setPersonalInfo({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        photoUrl: user.photo?.url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
      });
    }

    fetchCustomerProfile();
  }, [isLogin, user]);

  const fetchCustomerProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/customer/profile");
      if (res.data?.success && res.data.data) {
        const addresses = res.data.data.addressBook || [];
        setAddressBook(addresses);
        const def = addresses.find((a) => a.isDefault) || addresses[0];
        if (def) setSelectedAddressId(def._id);
      }
    } catch (err) {
      console.error("Failed to load customer profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.get("/auth/logout");
      toast.success("Logged out successfully");
      sessionStorage.removeItem("cravingUser");
      setUser(null);
      setIsLogin(false);
      setRole(null);
      navigate("/");
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  // ── Address Actions ──────────────────────────────────────────────────────────
  const handleSaveAsPrimary = async () => {
    if (!selectedAddressId) {
      toast.error("Please select an address first");
      return;
    }
    try {
      setLoading(true);
      const res = await api.patch(`/customer/address/${selectedAddressId}/default`);
      if (res.data?.success) {
        setAddressBook(res.data.data);
        toast.success("Primary address updated! 📍");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to set primary address");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.address || !newAddress.city || !newAddress.pinCode) {
      toast.error("Please fill in Street Address, City, and Pincode");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/customer/address", {
        name: newAddress.name || personalInfo.fullName || "Delivery Address",
        address: newAddress.address,
        city: newAddress.city,
        state: newAddress.state || "State",
        pinCode: newAddress.pinCode,
        addressType: newAddress.addressType,
        isDefault: newAddress.isDefault,
      });

      if (res.data?.success) {
        toast.success("Address saved successfully! 🏠");
        setAddressBook(res.data.data);
        setNewAddress({
          name: "",
          address: "",
          city: "",
          state: "",
          pinCode: "",
          addressType: "Home",
          isDefault: false,
        });
        setActiveView("addresses");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  // ── Personal Info Action ───────────────────────────────────────────────────
  const handleSavePersonalInfo = async (e) => {
    e.preventDefault();
    if (!personalInfo.fullName.trim()) {
      toast.error("Full name cannot be empty");
      return;
    }

    try {
      setLoading(true);
      const res = await api.put("/customer/profile", {
        fullName: personalInfo.fullName,
        phone: personalInfo.phone,
        photoUrl: personalInfo.photoUrl,
      });

      if (res.data?.success) {
        toast.success("Profile updated successfully! ✨");
        if (setUser) {
          setUser((prev) => ({
            ...prev,
            fullName: personalInfo.fullName,
            phone: personalInfo.phone,
            photo: { url: personalInfo.photoUrl },
          }));
        }
        setActiveView("hub");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // ── Change Password Action ─────────────────────────────────────────────────
  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/customer/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      if (res.data?.success) {
        toast.success("Password changed successfully! 🔐");
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setActiveView("hub");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  // ── Sub-Screen Headers ─────────────────────────────────────────────────────
  const getHeaderTitle = () => {
    switch (activeView) {
      case "addresses":
        return "Address Setting";
      case "add_address":
        return "Add Address";
      case "personal_info":
        return "Personal Information";
      case "change_password":
        return "Change Password";
      default:
        return "Profile";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center py-6 px-3 sm:px-6">
      {/* Mobile Device Mockup / Adaptive Container */}
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-[40px] shadow-2xl border-4 border-gray-200 dark:border-gray-800 overflow-hidden min-h-[780px] flex flex-col">
        
        {/* Top App Status Bar Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 bg-white dark:bg-gray-900 z-20 border-b border-gray-100 dark:border-gray-800">
          <button
            onClick={() => {
              if (activeView === "hub") {
                navigate("/");
              } else if (activeView === "add_address") {
                setActiveView("addresses");
              } else {
                setActiveView("hub");
              }
            }}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition"
            title="Back"
          >
            <FiArrowLeft size={20} />
          </button>

          <h2 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight">
            {getHeaderTitle()}
          </h2>

          <button
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition"
            title="Menu"
          >
            <FiMenu size={20} />
          </button>
        </div>

        {/* ─── SLIDE-OUT NAVIGATION DRAWER (Screen 1 in image) ────────────── */}
        {isDrawerOpen && (
          <div
            className="absolute inset-0 z-50 bg-black/50 backdrop-blur-xs flex"
            onClick={() => setIsDrawerOpen(false)}
          >
            <div
              className="w-4/5 max-w-[300px] h-full bg-linear-to-b from-amber-400 via-amber-500 to-amber-600 dark:from-amber-600 dark:to-orange-700 text-white flex flex-col shadow-2xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer User Info Header */}
              <div className="p-6 relative border-b border-white/20">
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="absolute top-4 right-4 text-white/80 hover:text-white"
                >
                  <FiX size={22} />
                </button>

                <div className="flex items-center gap-3 mt-2">
                  <img
                    src={personalInfo.photoUrl}
                    alt={personalInfo.fullName}
                    className="w-14 h-14 rounded-full border-2 border-white object-cover shadow-md"
                  />
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-white/80 block">Welcome,</span>
                    <h3 className="font-extrabold text-base leading-tight truncate max-w-[160px]">
                      {personalInfo.fullName || "Customer"}
                    </h3>
                    <p className="text-xs text-white/90 truncate">{personalInfo.phone || "+91 98765 43210"}</p>
                  </div>
                </div>
              </div>

              {/* Drawer Menu Items List */}
              <div className="flex-1 py-4 px-3 space-y-1">
                {[
                  { label: "Discover", icon: <FiCompass size={18} />, action: () => navigate("/") },
                  { label: "Profile", icon: <FiUser size={18} />, action: () => { setActiveView("hub"); setIsDrawerOpen(false); } },
                  { label: "Promocodes", icon: <FiTag size={18} />, action: () => { toast("Promo discounts active at checkout! 🏷️"); setIsDrawerOpen(false); } },
                  { label: "Order History", icon: <FiClock size={18} />, action: () => navigate("/customer-dashboard", { state: { activeTab: "orders" } }) },
                  { label: "Payment Methods", icon: <FiCreditCard size={18} />, action: () => { setActiveView("hub"); setIsDrawerOpen(false); toast("Manage UPI and cards at checkout"); } },
                  { label: "Share & Earn", icon: <FiShare2 size={18} />, action: () => { toast.success("Invite link copied to clipboard! 🎁"); setIsDrawerOpen(false); } },
                  { label: "Settings", icon: <FiSettings size={18} />, action: () => { setActiveView("personal_info"); setIsDrawerOpen(false); } },
                  { label: "Support", icon: <FiHelpCircle size={18} />, action: () => navigate("/help-center") },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={item.action}
                    className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-sm font-bold text-white hover:bg-white/15 transition-all text-left"
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Drawer Bottom Logout */}
              <div className="p-4 border-t border-white/20">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-black text-white hover:bg-black/20 transition text-left"
                >
                  <FiLogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── MAIN CONTENT VIEW SWITCHER ─────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col">

          {/* ══════════════════════════════════════════════════════════════════
              VIEW 1: PROFILE HUB (Screen 2 in image)
          ══════════════════════════════════════════════════════════════════ */}
          {activeView === "hub" && (
            <div className="flex-1 flex flex-col items-center justify-between text-center space-y-6">
              <div className="w-full space-y-5 pt-2">
                {/* Profile Card ID Badge Illustration */}
                <div className="w-24 h-24 mx-auto rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-500 text-4xl shadow-sm">
                  <FiUser />
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">Profile Information</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">
                    Manage your delivery addresses, personal details, and account security.
                  </p>
                </div>

                {/* Action Cards (matching image layout) */}
                <div className="w-full space-y-3 pt-2">
                  <button
                    onClick={() => setActiveView("addresses")}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/30 border border-gray-200/80 dark:border-gray-700 rounded-2xl transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
                        <FiMapPin size={18} />
                      </div>
                      <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                        Address Settings
                      </span>
                    </div>
                    <FiChevronRight className="text-gray-400 group-hover:text-amber-500 transition-transform group-hover:translate-x-1" size={18} />
                  </button>

                  <button
                    onClick={() => setActiveView("personal_info")}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/30 border border-gray-200/80 dark:border-gray-700 rounded-2xl transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
                        <FiUser size={18} />
                      </div>
                      <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                        Personal Information
                      </span>
                    </div>
                    <FiChevronRight className="text-gray-400 group-hover:text-amber-500 transition-transform group-hover:translate-x-1" size={18} />
                  </button>

                  <button
                    onClick={() => setActiveView("change_password")}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/30 border border-gray-200/80 dark:border-gray-700 rounded-2xl transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
                        <FiLock size={18} />
                      </div>
                      <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                        Change Password
                      </span>
                    </div>
                    <FiChevronRight className="text-gray-400 group-hover:text-amber-500 transition-transform group-hover:translate-x-1" size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              VIEW 2: ADDRESS SETTING (Screen 3 in image)
          ══════════════════════════════════════════════════════════════════ */}
          {activeView === "addresses" && (
            <div className="flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-4 text-center">
                {/* Map Illustration Header */}
                <div className="w-24 h-24 mx-auto rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-500 text-4xl shadow-sm">
                  <FiMapPin />
                </div>

                <div>
                  <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">Delivery Addresses</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Select a primary address for instant food checkout.
                  </p>
                </div>

                {/* Saved Address Radio List */}
                <div className="space-y-2.5 text-left pt-2">
                  {addressBook.length === 0 ? (
                    <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl text-center text-gray-400 text-xs">
                      No addresses saved yet. Click below to add one!
                    </div>
                  ) : (
                    addressBook.map((addr) => {
                      const isSelected = selectedAddressId === addr._id;
                      return (
                        <div
                          key={addr._id}
                          onClick={() => setSelectedAddressId(addr._id)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                            isSelected
                              ? "bg-amber-50/60 dark:bg-amber-950/30 border-amber-500 shadow-xs"
                              : "bg-white dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 hover:border-gray-300"
                          }`}
                        >
                          <div className="mt-1">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? "border-amber-500" : "border-gray-400"
                            }`}>
                              {isSelected && <div className="w-2 h-2 rounded-full bg-amber-500" />}
                            </div>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black uppercase text-gray-800 dark:text-gray-200">
                                {addr.addressType || "Address"}
                              </span>
                              {addr.isDefault && (
                                <span className="text-[10px] bg-amber-500 text-white font-black px-1.5 py-0.2 rounded-full uppercase">
                                  Primary
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-300 font-medium line-clamp-2 mt-0.5">
                              {addr.name ? `${addr.name} - ` : ""}{addr.address}, {addr.city} ({addr.pinCode})
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Action Buttons: Add New & Save Primary */}
              <div className="space-y-2.5 pt-4">
                <button
                  onClick={() => setActiveView("add_address")}
                  className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-gray-900 font-extrabold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-400/20"
                >
                  <FiPlus size={16} />
                  <span>Add New Address</span>
                </button>

                <button
                  onClick={handleSaveAsPrimary}
                  disabled={loading || !selectedAddressId}
                  className="w-full py-3 bg-[#2b3d68] hover:bg-[#202e50] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-md disabled:opacity-50"
                >
                  <span>Save as Primary</span>
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              VIEW 3: ADD NEW ADDRESS (Screen 4 in image)
          ══════════════════════════════════════════════════════════════════ */}
          {activeView === "add_address" && (
            <div className="flex-1 flex flex-col justify-between">
              <form onSubmit={handleAddNewAddress} className="space-y-4">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-500 text-3xl shadow-sm mb-3">
                    <FiMapPin />
                  </div>
                  <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">Add Delivery Address</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Enter your street and area for delivery riders.
                  </p>
                </div>

                <div className="space-y-2.5 pt-1 text-left">
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                      Recipient / Label Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Home, Office, or Your Name"
                      value={newAddress.name}
                      onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                      Street Address & Apartment
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 71, Charter St., App. 5r"
                      value={newAddress.address}
                      onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                        City
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Bhopal"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                        Pin Code
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 462001"
                        value={newAddress.pinCode}
                        onChange={(e) => setNewAddress({ ...newAddress, pinCode: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Address Type Pill Selector */}
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                      Tag Type
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {["Home", "Work", "Other"].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setNewAddress({ ...newAddress, addressType: tag })}
                          className={`py-2 rounded-xl text-xs font-bold border transition ${
                            newAddress.addressType === tag
                              ? "bg-amber-500 text-white border-amber-500"
                              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 space-y-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-gray-900 font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-md"
                  >
                    Save New Address
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveView("addresses")}
                    className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-xs rounded-xl transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              VIEW 4: PERSONAL INFORMATION (Screen 5 in image)
          ══════════════════════════════════════════════════════════════════ */}
          {activeView === "personal_info" && (
            <div className="flex-1 flex flex-col justify-between">
              <form onSubmit={handleSavePersonalInfo} className="space-y-4">
                <div className="text-center">
                  {/* Avatar with Camera/Edit Badge */}
                  <div className="relative w-24 h-24 mx-auto mb-3">
                    <img
                      src={personalInfo.photoUrl}
                      alt="Avatar"
                      className="w-24 h-24 rounded-full object-cover border-4 border-amber-400 shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newUrl = prompt("Enter new profile image URL:", personalInfo.photoUrl);
                        if (newUrl) setPersonalInfo({ ...personalInfo, photoUrl: newUrl });
                      }}
                      className="absolute bottom-0 right-0 p-2 rounded-full bg-amber-500 text-white shadow-md hover:bg-amber-600 transition"
                      title="Change Photo"
                    >
                      <FiCamera size={14} />
                    </button>
                  </div>

                  <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
                    {personalInfo.fullName || "Name, Last name"}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Update your account contact and identity details.
                  </p>
                </div>

                <div className="space-y-3 pt-2 text-left">
                  {/* Phone with Country Code Badge */}
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">
                      Phone Number
                    </label>
                    <div className="flex items-center rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-hidden">
                      <div className="px-3 py-2.5 bg-gray-100 dark:bg-gray-700 text-xs font-bold flex items-center gap-1 text-gray-700 dark:text-gray-300">
                        <span>🇮🇳</span>
                        <span>+91</span>
                      </div>
                      <input
                        type="tel"
                        value={personalInfo.phone}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                        placeholder="98765 43210"
                        className="flex-1 px-3 py-2.5 text-xs text-gray-900 dark:text-white bg-transparent focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Name Input */}
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">
                      Full Name
                    </label>
                    <div className="flex items-center px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 gap-2">
                      <FiUser className="text-gray-400" size={16} />
                      <input
                        type="text"
                        required
                        value={personalInfo.fullName}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                        placeholder="Enter full name"
                        className="flex-1 text-xs text-gray-900 dark:text-white bg-transparent focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">
                      Email Address
                    </label>
                    <div className="flex items-center px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 gap-2 opacity-80">
                      <FiMail className="text-gray-400" size={16} />
                      <input
                        type="email"
                        disabled
                        value={personalInfo.email}
                        placeholder="customer@example.com"
                        className="flex-1 text-xs text-gray-500 bg-transparent cursor-not-allowed focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-gray-900 font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-md shadow-amber-400/20"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              VIEW 5: CHANGE PASSWORD (Screen 6 in image)
          ══════════════════════════════════════════════════════════════════ */}
          {activeView === "change_password" && (
            <div className="flex-1 flex flex-col justify-between">
              <form onSubmit={handleSavePassword} className="space-y-4">
                <div className="text-center">
                  {/* Vault / Safe Lock Graphic */}
                  <div className="w-24 h-24 mx-auto rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-500 text-4xl shadow-sm mb-3">
                    <FiLock />
                  </div>

                  <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">Change Password</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Enter your current and new password then click Save below.
                  </p>
                </div>

                <div className="space-y-3 pt-2 text-left">
                  {/* Current Password */}
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">
                      Current Password
                    </label>
                    <div className="flex items-center px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 gap-2">
                      <FiLock className="text-gray-400" size={16} />
                      <input
                        type={showCurrentPass ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        placeholder="Current password"
                        className="flex-1 text-xs text-gray-900 dark:text-white bg-transparent focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {showCurrentPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">
                      New Password
                    </label>
                    <div className="flex items-center px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 gap-2">
                      <FiLock className="text-gray-400" size={16} />
                      <input
                        type={showNewPass ? "text" : "password"}
                        required
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        placeholder="At least 6 characters"
                        className="flex-1 text-xs text-gray-900 dark:text-white bg-transparent focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {showNewPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">
                      Confirm Password
                    </label>
                    <div className="flex items-center px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 gap-2">
                      <FiLock className="text-gray-400" size={16} />
                      <input
                        type={showConfirmPass ? "text" : "password"}
                        required
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        placeholder="Re-enter new password"
                        className="flex-1 text-xs text-gray-900 dark:text-white bg-transparent focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-gray-900 font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-md shadow-amber-400/20"
                  >
                    Save Password
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* ─── BOTTOM APP NAVIGATION BAR (matching image) ────────────────── */}
        <div className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-3 flex items-center justify-between text-gray-400 z-10">
          <button
            onClick={() => navigate("/")}
            className="flex flex-col items-center gap-1 hover:text-amber-500 transition"
          >
            <FiCompass size={20} />
            <span className="text-[10px] font-bold">Discover</span>
          </button>

          <button
            onClick={() => navigate("/order-now")}
            className="flex flex-col items-center gap-1 hover:text-amber-500 transition"
          >
            <FiMapPin size={20} />
            <span className="text-[10px] font-bold">Delivery</span>
          </button>

          <button
            onClick={() => setActiveView("hub")}
            className="flex flex-col items-center gap-1 text-amber-500 font-black"
          >
            <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center -mt-3 shadow-md shadow-amber-500/30">
              <FiUser size={16} />
            </div>
            <span className="text-[10px] font-bold">Account</span>
          </button>

          <button
            onClick={() => navigate("/customer-dashboard", { state: { activeTab: "orders" } })}
            className="flex flex-col items-center gap-1 hover:text-amber-500 transition"
          >
            <FiClock size={20} />
            <span className="text-[10px] font-bold">Orders</span>
          </button>

          <button
            onClick={() => navigate("/")}
            className="flex flex-col items-center gap-1 hover:text-amber-500 transition relative"
          >
            <IoCartOutline size={22} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                {totalItems}
              </span>
            )}
            <span className="text-[10px] font-bold">Cart</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
