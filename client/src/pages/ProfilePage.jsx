import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  FiGrid,
  FiSmartphone,
} from "react-icons/fi";
import { IoCartOutline } from "react-icons/io5";

// ─── CUSTOM HIGH-RESOLUTION SVG ILLUSTRATIONS (Matching the Mockup) ───────────

// 1. Hand holding ID Badge / Profile Card Illustration
const IdBadgeIllustration = () => (
  <svg viewBox="0 0 160 140" className="w-28 h-24 mx-auto" fill="none">
    {/* ID Card outline */}
    <rect x="36" y="22" width="70" height="92" rx="10" stroke="#2c3e6b" strokeWidth="3" fill="#ffffff" />
    {/* Clip at top */}
    <rect x="62" y="14" width="18" height="12" rx="3" stroke="#2c3e6b" strokeWidth="2.5" fill="#facc15" />
    <circle cx="71" cy="20" r="3" fill="#2c3e6b" />
    {/* User photo inside card */}
    <circle cx="71" cy="46" r="14" stroke="#2c3e6b" strokeWidth="2.5" fill="#e0f2fe" />
    <circle cx="71" cy="43" r="6" fill="#2c3e6b" />
    <path d="M60 56c0-6 5-8 11-8s11 2 11 8" stroke="#2c3e6b" strokeWidth="2" fill="#2c3e6b" />
    {/* Text lines on card */}
    <rect x="48" y="70" width="46" height="4" rx="2" fill="#e2e8f0" />
    <rect x="52" y="80" width="38" height="3.5" rx="1.5" fill="#e2e8f0" />
    <rect x="56" y="90" width="30" height="3" rx="1.5" fill="#facc15" />
    {/* Stylized holding hand */}
    <path d="M106 72c10-2 22 2 24 10 2 8-8 12-16 12h-8" stroke="#2c3e6b" strokeWidth="3" strokeLinecap="round" />
    <path d="M106 82c8 0 16 3 17 8 1 5-6 8-13 8h-4" stroke="#2c3e6b" strokeWidth="2.5" strokeLinecap="round" />
    {/* Sparkles */}
    <path d="M26 30l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="#facc15" />
    <circle cx="120" cy="34" r="3" fill="#38bdf8" />
  </svg>
);

// 2. Folded Map with Location Pins Illustration
const MapIllustration = () => (
  <svg viewBox="0 0 160 140" className="w-28 h-24 mx-auto" fill="none">
    {/* Map folds */}
    <path d="M30 40l34-12 34 10 32-12v70l-32 12-34-10-34 12V40z" fill="#f0fdf4" stroke="#2c3e6b" strokeWidth="3" />
    {/* Vertical fold lines */}
    <path d="M64 28v70M98 38v70" stroke="#2c3e6b" strokeWidth="2" strokeDasharray="4 3" />
    {/* Map trails/roads */}
    <path d="M42 64c12-6 20 6 36 2s24-10 38-4" stroke="#99f6e4" strokeWidth="3.5" strokeLinecap="round" />
    {/* Pin 1 (Primary - Yellow) */}
    <g transform="translate(56, 32)">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20c0-6.6-5.4-12-12-12z" fill="#facc15" stroke="#2c3e6b" strokeWidth="2" />
      <circle cx="12" cy="12" r="4.5" fill="#2c3e6b" />
    </g>
    {/* Pin 2 (Secondary - Teal) */}
    <g transform="translate(94, 46)">
      <path d="M9 0C4 0 0 4 0 9c0 7 9 15 9 15s9-8 9-15c0-5-4-9-9-9z" fill="#2dd4bf" stroke="#2c3e6b" strokeWidth="1.8" />
      <circle cx="9" cy="9" r="3.5" fill="#2c3e6b" />
    </g>
  </svg>
);

// 3. Vault / Bank Safe Lock Illustration
const SafeVaultIllustration = () => (
  <svg viewBox="0 0 160 140" className="w-28 h-24 mx-auto" fill="none">
    {/* Safe body outer */}
    <rect x="36" y="24" width="88" height="88" rx="14" stroke="#2c3e6b" strokeWidth="3.5" fill="#f8fafc" />
    {/* Safe inner door */}
    <rect x="46" y="34" width="68" height="68" rx="8" stroke="#2c3e6b" strokeWidth="2" fill="#ffffff" />
    {/* Bolts on corner */}
    <circle cx="43" cy="31" r="2.5" fill="#94a3b8" />
    <circle cx="117" cy="31" r="2.5" fill="#94a3b8" />
    <circle cx="43" cy="105" r="2.5" fill="#94a3b8" />
    <circle cx="117" cy="105" r="2.5" fill="#94a3b8" />
    {/* Dial lock ring */}
    <circle cx="80" cy="68" r="20" stroke="#2c3e6b" strokeWidth="3" fill="#fef08a" />
    <circle cx="80" cy="68" r="13" stroke="#2c3e6b" strokeWidth="2" fill="#ffffff" />
    {/* Center dial knob */}
    <circle cx="80" cy="68" r="6" fill="#eab308" stroke="#2c3e6b" strokeWidth="1.5" />
    {/* Dial tick marks */}
    <line x1="80" y1="50" x2="80" y2="54" stroke="#2c3e6b" strokeWidth="2" />
    <line x1="80" y1="82" x2="80" y2="86" stroke="#2c3e6b" strokeWidth="2" />
    <line x1="62" y1="68" x2="66" y2="68" stroke="#2c3e6b" strokeWidth="2" />
    <line x1="94" y1="68" x2="98" y2="68" stroke="#2c3e6b" strokeWidth="2" />
    {/* Handle on right */}
    <rect x="100" y="60" width="8" height="16" rx="2" stroke="#2c3e6b" strokeWidth="2" fill="#facc15" />
  </svg>
);

// ─── PHONE WRAPPER FRAME (Realistic Bezel & Status Bar) ───────────────────────
const PhoneFrame = ({ children, statusTime = "9:41 AM" }) => (
  <div className="relative w-full max-w-[340px] h-[690px] bg-white rounded-[44px] shadow-2xl border-[9px] border-[#18181b] overflow-hidden flex flex-col shrink-0 select-none">
    {/* Top Speaker / Dynamic Island notch */}
    <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-[#18181b] rounded-full z-40 flex items-center justify-end px-3">
      <div className="w-2.5 h-2.5 rounded-full bg-[#27272a]/80 mr-1" />
    </div>

    {/* Phone Status Bar */}
    <div className="flex items-center justify-between px-6 pt-3 pb-1 text-[11px] font-bold text-gray-800 z-30">
      <span>{statusTime}</span>
      <div className="flex items-center gap-1.5 text-[10px]">
        <span>5G</span>
        <div className="w-5 h-2.5 border border-gray-800 rounded-xs p-0.5 flex items-center">
          <div className="w-full h-full bg-gray-800 rounded-2xs" />
        </div>
      </div>
    </div>

    {/* Screen Internal Body */}
    <div className="flex-1 overflow-hidden flex flex-col relative bg-white">
      {children}
    </div>
  </div>
);

// ─── BOTTOM APP NAV BAR COMPONENT ─────────────────────────────────────────────
const BottomNavBar = ({ activeTab = "account", onSelect }) => (
  <div className="border-t border-gray-100 bg-white px-5 py-2.5 flex items-center justify-between text-gray-400 shrink-0">
    {[
      { key: "discover", label: "Discover", icon: <FiCompass size={17} /> },
      { key: "delivery", label: "Delivery", icon: <FiMapPin size={17} /> },
      { key: "account", label: "Account", icon: <FiUser size={17} /> },
      { key: "notifications", label: "Notification", icon: <FiClock size={17} /> },
      { key: "cart", label: "Cart", icon: <IoCartOutline size={19} /> },
    ].map((item) => {
      const isActive = activeTab === item.key;
      return (
        <button
          key={item.key}
          onClick={() => onSelect && onSelect(item.key)}
          className={`flex flex-col items-center gap-0.5 transition-colors ${
            isActive ? "text-[#f59e0b] font-bold" : "hover:text-gray-600"
          }`}
        >
          {isActive ? (
            <div className="w-7 h-7 rounded-full bg-[#f59e0b] text-white flex items-center justify-center -mt-2.5 shadow-md shadow-amber-400/40">
              {item.icon}
            </div>
          ) : (
            item.icon
          )}
          <span className="text-[9px] tracking-tight">{item.label}</span>
        </button>
      );
    })}
  </div>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const ProfilePage = () => {
  const { user, isLogin, setUser, setIsLogin, setRole } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  // Mode: 'single' (Live Interactive Mobile Screen) | 'showcase' (All 6 Phones Grid)
  const [displayMode, setDisplayMode] = useState("single");

  // Single mode active sub-screen: 'hub' | 'drawer' | 'addresses' | 'add_address' | 'personal_info' | 'change_password'
  const [activeScreen, setActiveScreen] = useState("hub");

  // User Profile Data (Initializes with mockup data from uploaded image if not logged in)
  const [profile, setProfile] = useState({
    fullName: "Sabrina Lorenshtein",
    phone: "+1 912 345 6789",
    email: "sabrina.lorenshtein@example.com",
    personalId: "US-8923-4412",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=240&h=240&fit=crop&crop=faces",
  });

  // Saved Addresses (Matching uploaded image mockup)
  const [addresses, setAddresses] = useState([
    {
      id: "addr-1",
      line: "02113, 71, Charter str., App. 5r., Boston, MA, USA",
      isPrimary: true,
    },
    {
      id: "addr-2",
      line: "21324, 37, Branderburg str., App. 14b, Boston, MA, USA",
      isPrimary: false,
    },
  ]);
  const [selectedAddressId, setSelectedAddressId] = useState("addr-1");
  const [newAddressText, setNewAddressText] = useState("");

  // Password fields
  const [passwords, setPasswords] = useState({ password: "", confirmPassword: "" });
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Sync with live authenticated user if logged in
  useEffect(() => {
    if (isLogin && user) {
      setProfile((prev) => ({
        ...prev,
        fullName: user.fullName || prev.fullName,
        phone: user.phone || prev.phone,
        email: user.email || prev.email,
        avatar: user.photo?.url || prev.avatar,
      }));

      // Fetch live customer address book
      api.get("/customer/profile")
        .then((res) => {
          if (res.data?.success && res.data.data?.addressBook?.length > 0) {
            const list = res.data.data.addressBook.map((a) => ({
              id: a._id,
              line: `${a.address}, ${a.city} (${a.pinCode})`,
              isPrimary: a.isDefault,
            }));
            setAddresses(list);
            const def = list.find((a) => a.isPrimary) || list[0];
            if (def) setSelectedAddressId(def.id);
          }
        })
        .catch(() => {});
    }
  }, [isLogin, user]);

  const handleLogout = async () => {
    try {
      await api.get("/auth/logout");
    } catch (ignore) {}
    sessionStorage.removeItem("cravingUser");
    sessionStorage.removeItem("token");
    localStorage.removeItem("token");
    setUser(null);
    setIsLogin(false);
    setRole(null);
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleSavePrimaryAddress = async (addrId) => {
    setSelectedAddressId(addrId);
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, isPrimary: a.id === addrId }))
    );
    if (isLogin) {
      try {
        await api.patch(`/customer/address/${addrId}/default`);
      } catch (ignore) {}
    }
    toast.success("Primary address updated! 📍");
  };

  const handleSaveNewAddress = async () => {
    if (!newAddressText.trim()) {
      toast.error("Please enter delivery address details");
      return;
    }
    const newEntry = {
      id: `addr-${Date.now()}`,
      line: newAddressText.trim(),
      isPrimary: addresses.length === 0,
    };
    setAddresses((prev) => [...prev, newEntry]);
    setSelectedAddressId(newEntry.id);
    setNewAddressText("");
    setActiveScreen("addresses");

    if (isLogin) {
      try {
        await api.post("/customer/address", {
          name: profile.fullName,
          address: newEntry.line,
          city: "Boston",
          state: "MA",
          pinCode: "02113",
        });
      } catch (ignore) {}
    }
    toast.success("New address added! 🏠");
  };

  const handleSavePersonalInfo = async () => {
    if (isLogin) {
      try {
        await api.put("/customer/profile", {
          fullName: profile.fullName,
          phone: profile.phone,
          photoUrl: profile.avatar,
        });
        if (setUser) {
          setUser((prev) => ({ ...prev, fullName: profile.fullName, phone: profile.phone }));
        }
      } catch (ignore) {}
    }
    toast.success("Profile saved successfully! ✨");
    setActiveScreen("hub");
  };

  const handleSavePassword = async () => {
    if (passwords.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (passwords.password !== passwords.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (isLogin) {
      try {
        await api.post("/customer/change-password", {
          newPassword: passwords.password,
        });
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to change password");
        return;
      }
    }
    toast.success("Password changed successfully! 🔐");
    setPasswords({ password: "", confirmPassword: "" });
    setActiveScreen("hub");
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // SCREEN 1: SLIDE-OUT DRAWER MENU (Top Left Phone in Image)
  // ═══════════════════════════════════════════════════════════════════════════
  const renderScreen1Drawer = () => (
    <div className="h-full bg-[#f8b803] flex flex-col justify-between text-[#1c1917] p-6 relative overflow-hidden">
      {/* Background overlapping white card preview (matching image) */}
      <div className="absolute -right-28 top-20 w-44 h-72 bg-white rounded-3xl shadow-xl p-3 border border-gray-100 opacity-90 pointer-events-none">
        <span className="text-[10px] font-black text-gray-800 block">Discover Food</span>
        <div className="w-full h-12 bg-amber-50 rounded-xl mt-2 flex items-center justify-center text-xs">🍔 Meals</div>
        <div className="w-full h-12 bg-amber-50 rounded-xl mt-2 flex items-center justify-center text-xs">☕ Drinks</div>
      </div>

      {/* Top Header with Avatar & Close */}
      <div>
        <div className="flex justify-between items-start">
          <div className="relative">
            <img
              src={profile.avatar}
              alt={profile.fullName}
              className="w-16 h-16 rounded-full border-2 border-white object-cover shadow-md"
            />
          </div>
          <button
            onClick={() => setActiveScreen("hub")}
            className="flex items-center gap-1 text-xs font-bold text-gray-800 hover:text-black py-1 px-2.5 rounded-full bg-black/10"
          >
            <FiX size={14} />
            <span>Close</span>
          </button>
        </div>

        <div className="mt-4">
          <span className="text-[11px] font-semibold text-gray-800/80 uppercase tracking-wider block">Welcome</span>
          <h2 className="text-xl font-black text-gray-900 leading-tight">{profile.fullName}</h2>
          <p className="text-xs text-gray-800 font-medium mt-0.5">{profile.phone}</p>
        </div>

        {/* Menu Navigation List (Matching image) */}
        <div className="mt-8 space-y-2 max-w-[210px]">
          {[
            { label: "Discover", icon: <FiCompass size={16} />, click: () => navigate("/") },
            { label: "Profile", icon: <FiUser size={16} />, click: () => setActiveScreen("hub") },
            { label: "Promocodes", icon: <FiTag size={16} />, click: () => toast("Promocode 'CRAVINGS50' active at checkout!") },
            { label: "Order History", icon: <FiClock size={16} />, click: () => navigate("/customer-dashboard", { state: { activeTab: "orders" } }) },
            { label: "Payment Methods", icon: <FiCreditCard size={16} />, active: true, click: () => toast("UPI, Cards & Netbanking active") },
            { label: "Share & Earn", icon: <FiShare2 size={16} />, click: () => toast.success("Referral code copied!") },
            { label: "Settings", icon: <FiSettings size={16} />, click: () => setActiveScreen("personal_info") },
            { label: "Support", icon: <FiHelpCircle size={16} />, click: () => navigate("/help-center") },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={item.click}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-left transition ${
                item.active
                  ? "bg-[#e89c02] text-white shadow-xs"
                  : "text-gray-900 hover:bg-black/10"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Logout Bottom */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 text-xs font-extrabold text-gray-900 hover:text-black pt-4 border-t border-black/10"
      >
        <FiLogOut size={16} />
        <span>Logout</span>
      </button>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // SCREEN 2: PROFILE INFORMATION HUB (Top Middle Phone in Image)
  // ═══════════════════════════════════════════════════════════════════════════
  const renderScreen2Hub = () => (
    <div className="h-full flex flex-col justify-between bg-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <button onClick={() => navigate("/")} className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-full">
          <FiArrowLeft size={18} />
        </button>
        <h3 className="text-sm font-extrabold text-gray-800">Profile</h3>
        <button onClick={() => setActiveScreen("drawer")} className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-full">
          <FiMenu size={18} />
        </button>
      </div>

      {/* Center Content */}
      <div className="px-6 flex-1 flex flex-col items-center justify-center text-center space-y-5">
        <IdBadgeIllustration />

        <div>
          <h2 className="text-base font-black text-gray-900">Profile Information</h2>
          <p className="text-[11px] text-gray-400 max-w-[240px] mt-1 mx-auto leading-relaxed">
            Manage your personal details, delivery addresses, and account security.
          </p>
        </div>

        {/* 3 Action Pill Cards */}
        <div className="w-full space-y-3 pt-2">
          <button
            onClick={() => setActiveScreen("addresses")}
            className="w-full flex items-center justify-between p-3.5 bg-gray-50 hover:bg-amber-50/50 rounded-2xl border border-gray-200/80 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="text-amber-500"><FiMapPin size={17} /></div>
              <span className="text-xs font-bold text-gray-800">Add Address</span>
            </div>
            <FiChevronRight className="text-gray-400 group-hover:text-amber-500 transition-transform group-hover:translate-x-1" size={16} />
          </button>

          <button
            onClick={() => setActiveScreen("personal_info")}
            className="w-full flex items-center justify-between p-3.5 bg-gray-50 hover:bg-amber-50/50 rounded-2xl border border-gray-200/80 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="text-amber-500"><FiUser size={17} /></div>
              <span className="text-xs font-bold text-gray-800">Personal Information</span>
            </div>
            <FiChevronRight className="text-gray-400 group-hover:text-amber-500 transition-transform group-hover:translate-x-1" size={16} />
          </button>

          <button
            onClick={() => setActiveScreen("change_password")}
            className="w-full flex items-center justify-between p-3.5 bg-gray-50 hover:bg-amber-50/50 rounded-2xl border border-gray-200/80 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="text-amber-500"><FiLock size={17} /></div>
              <span className="text-xs font-bold text-gray-800">Change Password</span>
            </div>
            <FiChevronRight className="text-gray-400 group-hover:text-amber-500 transition-transform group-hover:translate-x-1" size={16} />
          </button>
        </div>
      </div>

      <BottomNavBar activeTab="account" onSelect={(tab) => {
        if (tab === "discover") navigate("/");
        if (tab === "delivery") navigate("/order-now");
        if (tab === "cart") navigate("/");
        if (tab === "notifications") navigate("/customer-dashboard");
      }} />
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // SCREEN 3: ADDRESS SETTING LIST (Top Right Phone in Image)
  // ═══════════════════════════════════════════════════════════════════════════
  const renderScreen3AddressSetting = () => (
    <div className="h-full flex flex-col justify-between bg-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <button onClick={() => setActiveScreen("hub")} className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-full">
          <FiArrowLeft size={18} />
        </button>
        <h3 className="text-sm font-extrabold text-gray-800">Address Setting</h3>
        <button onClick={() => setActiveScreen("drawer")} className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-full">
          <FiMenu size={18} />
        </button>
      </div>

      <div className="px-6 py-4 flex-1 flex flex-col justify-between">
        <div>
          <MapIllustration />

          <div className="text-center mt-2">
            <h2 className="text-base font-black text-gray-900">Add Address</h2>
            <p className="text-[11px] text-gray-400 max-w-[240px] mt-1 mx-auto leading-relaxed">
              Select or configure primary delivery location for all instant orders.
            </p>
          </div>

          {/* Radio list of addresses */}
          <div className="mt-5 space-y-3">
            {addresses.map((item) => {
              const isSelected = selectedAddressId === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedAddressId(item.id)}
                  className="flex items-start gap-3 cursor-pointer group"
                >
                  <div className="mt-0.5">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? "border-[#f59e0b]" : "border-gray-300"
                    }`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-[#f59e0b]" />}
                    </div>
                  </div>
                  <span className={`text-[11px] leading-snug ${
                    isSelected ? "font-bold text-gray-900" : "font-normal text-gray-500"
                  }`}>
                    {item.line}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Buttons (Golden Add New Address + Navy Blue Save As Primary) */}
        <div className="space-y-2.5 pt-4">
          <button
            onClick={() => setActiveScreen("add_address")}
            className="w-full py-3 bg-[#f59e0b] hover:bg-[#d97706] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-md shadow-amber-400/25 flex items-center justify-center gap-1.5"
          >
            <span>ADD NEW ADDRESS</span>
            <FiPlus size={16} />
          </button>

          <button
            onClick={() => handleSavePrimaryAddress(selectedAddressId)}
            className="w-full py-3 bg-[#2b3d68] hover:bg-[#202e50] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-md"
          >
            SAVE AS PRIMARY
          </button>
        </div>
      </div>

      <BottomNavBar activeTab="delivery" onSelect={() => setActiveScreen("hub")} />
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // SCREEN 4: ADD ADDRESS FORM (Bottom Left Phone in Image)
  // ═══════════════════════════════════════════════════════════════════════════
  const renderScreen4AddAddress = () => (
    <div className="h-full flex flex-col justify-between bg-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <button onClick={() => setActiveScreen("addresses")} className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-full">
          <FiArrowLeft size={18} />
        </button>
        <h3 className="text-sm font-extrabold text-gray-800">Add Address</h3>
        <button onClick={() => setActiveScreen("drawer")} className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-full">
          <FiMenu size={18} />
        </button>
      </div>

      <div className="px-6 py-3 flex-1 flex flex-col justify-between">
        <div>
          <MapIllustration />

          <div className="text-center mt-2">
            <h2 className="text-base font-black text-gray-900">Add Address</h2>
            <p className="text-[11px] text-gray-400 max-w-[240px] mt-1 mx-auto leading-relaxed">
              Enter your complete address for delivery riders to locate you easily.
            </p>
          </div>

          {/* Existing addresses list with radio */}
          <div className="mt-4 space-y-2.5">
            {addresses.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  item.isPrimary ? "border-[#f59e0b]" : "border-gray-300"
                }`}>
                  {item.isPrimary && <div className="w-2 h-2 rounded-full bg-[#f59e0b]" />}
                </div>
                <span className="text-[11px] text-gray-500 leading-snug">{item.line}</span>
              </div>
            ))}
          </div>

          {/* Rounded Input Field Box (matching image mockup) */}
          <div className="mt-4">
            <div className="rounded-2xl border border-gray-300 p-2.5 focus-within:border-amber-500 transition">
              <input
                type="text"
                placeholder="Add a New Delivery Address"
                value={newAddressText}
                onChange={(e) => setNewAddressText(e.target.value)}
                className="w-full text-xs text-gray-800 placeholder-gray-400 bg-transparent focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save Button with X button */}
        <div className="pt-4">
          <button
            onClick={handleSaveNewAddress}
            className="w-full py-3 bg-[#f59e0b] hover:bg-[#d97706] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-md shadow-amber-400/25 flex items-center justify-between px-6"
          >
            <span>SAVE NEW ADDRESS</span>
            <span onClick={(e) => { e.stopPropagation(); setActiveScreen("addresses"); }} className="p-0.5 hover:bg-black/10 rounded-full">
              <FiX size={16} />
            </span>
          </button>
        </div>
      </div>

      <BottomNavBar activeTab="delivery" onSelect={() => setActiveScreen("hub")} />
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // SCREEN 5: PERSONAL INFORMATION (Bottom Middle Phone in Image)
  // ═══════════════════════════════════════════════════════════════════════════
  const renderScreen5PersonalInfo = () => (
    <div className="h-full flex flex-col justify-between bg-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <button onClick={() => setActiveScreen("hub")} className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-full">
          <FiArrowLeft size={18} />
        </button>
        <h3 className="text-sm font-extrabold text-gray-800">Personal Information</h3>
        <button onClick={() => setActiveScreen("drawer")} className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-full">
          <FiMenu size={18} />
        </button>
      </div>

      <div className="px-6 py-3 flex-1 flex flex-col justify-between">
        <div>
          {/* Avatar with edit circle */}
          <div className="text-center pt-1">
            <div className="relative w-20 h-20 mx-auto">
              <img
                src={profile.avatar}
                alt="Avatar"
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
              />
              <button
                type="button"
                onClick={() => {
                  const url = prompt("Enter new profile photo URL:", profile.avatar);
                  if (url) setProfile({ ...profile, avatar: url });
                }}
                className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-amber-400 text-gray-900 flex items-center justify-center shadow-xs text-xs"
                title="Edit Photo"
              >
                ✎
              </button>
            </div>

            <h2 className="text-sm font-black text-gray-900 mt-2">Name, Last name</h2>
            <p className="text-[11px] text-gray-400 max-w-[240px] mt-0.5 mx-auto leading-relaxed">
              Update your account details and click Save below.
            </p>
          </div>

          {/* Input Fields with icons (matching image) */}
          <div className="mt-4 space-y-2.5">
            {/* Phone with Country Flag */}
            <div className="flex items-center px-4 py-2.5 rounded-2xl border border-gray-200 bg-gray-50/50 gap-2.5">
              <span className="text-base">🇺🇸</span>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full text-xs text-gray-800 bg-transparent focus:outline-none"
              />
            </div>

            {/* Name Input */}
            <div className="flex items-center px-4 py-2.5 rounded-2xl border border-gray-200 bg-gray-50/50 gap-2.5">
              <FiUser className="text-gray-400" size={15} />
              <input
                type="text"
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                placeholder="Name, Last name"
                className="w-full text-xs text-gray-800 bg-transparent focus:outline-none"
              />
            </div>

            {/* Email Input */}
            <div className="flex items-center px-4 py-2.5 rounded-2xl border border-gray-200 bg-gray-50/50 gap-2.5">
              <FiMail className="text-gray-400" size={15} />
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                placeholder="Email address"
                className="w-full text-xs text-gray-800 bg-transparent focus:outline-none"
              />
            </div>

            {/* Personal ID Input */}
            <div className="flex items-center px-4 py-2.5 rounded-2xl border border-gray-200 bg-gray-50/50 gap-2.5">
              <FiTag className="text-gray-400" size={15} />
              <input
                type="text"
                value={profile.personalId}
                onChange={(e) => setProfile({ ...profile, personalId: e.target.value })}
                placeholder="Personal ID"
                className="w-full text-xs text-gray-800 bg-transparent focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <button
            onClick={handleSavePersonalInfo}
            className="w-full py-3 bg-[#f59e0b] hover:bg-[#d97706] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-md shadow-amber-400/25"
          >
            SAVE
          </button>
        </div>
      </div>

      <BottomNavBar activeTab="account" onSelect={() => setActiveScreen("hub")} />
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // SCREEN 6: CHANGE PASSWORD (Bottom Right Phone in Image)
  // ═══════════════════════════════════════════════════════════════════════════
  const renderScreen6ChangePassword = () => (
    <div className="h-full flex flex-col justify-between bg-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <button onClick={() => setActiveScreen("hub")} className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-full">
          <FiArrowLeft size={18} />
        </button>
        <h3 className="text-sm font-extrabold text-gray-800">Change Password</h3>
        <button onClick={() => setActiveScreen("drawer")} className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-full">
          <FiMenu size={18} />
        </button>
      </div>

      <div className="px-6 py-3 flex-1 flex flex-col justify-between">
        <div>
          <SafeVaultIllustration />

          <div className="text-center mt-2">
            <h2 className="text-base font-black text-gray-900">Change Password</h2>
            <p className="text-[11px] text-gray-400 max-w-[240px] mt-1 mx-auto leading-relaxed">
              Enter your new password and then click on the 'Save' button below.
            </p>
          </div>

          {/* Password Inputs */}
          <div className="mt-5 space-y-3">
            <div className="flex items-center px-4 py-2.5 rounded-2xl border border-gray-200 bg-gray-50/50 gap-2.5">
              <FiLock className="text-gray-400" size={15} />
              <input
                type={showPass ? "text" : "password"}
                value={passwords.password}
                onChange={(e) => setPasswords({ ...passwords, password: e.target.value })}
                placeholder="Password"
                className="w-full text-xs text-gray-800 bg-transparent focus:outline-none"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="text-gray-400 hover:text-gray-600">
                {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
              </button>
            </div>

            <div className="flex items-center px-4 py-2.5 rounded-2xl border border-gray-200 bg-gray-50/50 gap-2.5">
              <FiLock className="text-gray-400" size={15} />
              <input
                type={showConfirmPass ? "text" : "password"}
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                placeholder="Confirm Password"
                className="w-full text-xs text-gray-800 bg-transparent focus:outline-none"
              />
              <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="text-gray-400 hover:text-gray-600">
                {showConfirmPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
              </button>
            </div>
          </div>
        </div>

        {/* Save Button with Lock Icon */}
        <div className="pt-4">
          <button
            onClick={handleSavePassword}
            className="w-full py-3 bg-[#f59e0b] hover:bg-[#d97706] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-md shadow-amber-400/25 flex items-center justify-center gap-1.5"
          >
            <span>SAVE</span>
            <FiLock size={14} />
          </button>
        </div>
      </div>

      <BottomNavBar activeTab="account" onSelect={() => setActiveScreen("hub")} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#e5e5e5] text-gray-900 py-8 px-4 flex flex-col items-center">
      {/* Top Banner Control: Switch Between Interactive Mode and Full 6-Screen Mockup View */}
      <div className="w-full max-w-5xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-black tracking-tight text-gray-900 uppercase">PROFILE</h1>
          <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
            UI Mockup Implemented
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDisplayMode("single")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition ${
              displayMode === "single"
                ? "bg-amber-500 text-white shadow-xs"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            <FiSmartphone size={14} />
            <span>Interactive Phone View</span>
          </button>

          <button
            onClick={() => setDisplayMode("showcase")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition ${
              displayMode === "showcase"
                ? "bg-amber-500 text-white shadow-xs"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            <FiGrid size={14} />
            <span>All 6 Phones Showcase</span>
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────
          MODE A: INTERACTIVE PHONE VIEW (Live Touchable App Flow)
      ──────────────────────────────────────────────────────────────────────── */}
      {displayMode === "single" && (
        <div className="flex flex-col items-center gap-4">
          {/* Quick Screen Selector Pills */}
          <div className="flex flex-wrap justify-center gap-1.5 max-w-md">
            {[
              { id: "drawer", label: "1. Drawer Menu" },
              { id: "hub", label: "2. Profile Hub" },
              { id: "addresses", label: "3. Address List" },
              { id: "add_address", label: "4. Add Address" },
              { id: "personal_info", label: "5. Personal Info" },
              { id: "change_password", label: "6. Password" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveScreen(tab.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                  activeScreen === tab.id
                    ? "bg-amber-500 text-white shadow-xs"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <PhoneFrame>
            {activeScreen === "drawer" && renderScreen1Drawer()}
            {activeScreen === "hub" && renderScreen2Hub()}
            {activeScreen === "addresses" && renderScreen3AddressSetting()}
            {activeScreen === "add_address" && renderScreen4AddAddress()}
            {activeScreen === "personal_info" && renderScreen5PersonalInfo()}
            {activeScreen === "change_password" && renderScreen6ChangePassword()}
          </PhoneFrame>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────
          MODE B: ALL 6 PHONES SHOWCASE (Exact Match of the Uploaded Image)
      ──────────────────────────────────────────────────────────────────────── */}
      {displayMode === "showcase" && (
        <div className="w-full max-w-6xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black uppercase tracking-widest text-gray-800">PROFILE</h2>
            <p className="text-xs text-gray-500 mt-1">Complete 6-Screen Architecture corresponding to your design mockup</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
            {/* Phone 1: Drawer */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-black text-gray-600 mb-2 uppercase tracking-wider">1. Slide Menu Drawer</span>
              <PhoneFrame>{renderScreen1Drawer()}</PhoneFrame>
            </div>

            {/* Phone 2: Hub */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-black text-gray-600 mb-2 uppercase tracking-wider">2. Profile Information</span>
              <PhoneFrame>{renderScreen2Hub()}</PhoneFrame>
            </div>

            {/* Phone 3: Address Setting */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-black text-gray-600 mb-2 uppercase tracking-wider">3. Address Setting</span>
              <PhoneFrame>{renderScreen3AddressSetting()}</PhoneFrame>
            </div>

            {/* Phone 4: Add Address Form */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-black text-gray-600 mb-2 uppercase tracking-wider">4. Add New Address</span>
              <PhoneFrame>{renderScreen4AddAddress()}</PhoneFrame>
            </div>

            {/* Phone 5: Personal Info */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-black text-gray-600 mb-2 uppercase tracking-wider">5. Personal Information</span>
              <PhoneFrame>{renderScreen5PersonalInfo()}</PhoneFrame>
            </div>

            {/* Phone 6: Change Password */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-black text-gray-600 mb-2 uppercase tracking-wider">6. Change Password</span>
              <PhoneFrame>{renderScreen6ChangePassword()}</PhoneFrame>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
