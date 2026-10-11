import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import api from "../../config/ApiConfig";
import toast from "react-hot-toast";
import CustomerOrders from "../../components/customerDashboard/CustomerOrders";
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
  FiSmartphone,
  FiGrid,
  FiLayout,
} from "react-icons/fi";
import { IoCartOutline } from "react-icons/io5";

// ─── SVG VECTOR ILLUSTRATIONS (Pixel-Perfect Match to Mockup) ────────────────

const IdBadgeIllustration = () => (
  <svg viewBox="0 0 160 140" className="w-28 h-24 mx-auto" fill="none">
    <rect x="36" y="22" width="70" height="92" rx="10" stroke="#2c3e6b" strokeWidth="3" fill="#ffffff" />
    <rect x="62" y="14" width="18" height="12" rx="3" stroke="#2c3e6b" strokeWidth="2.5" fill="#facc15" />
    <circle cx="71" cy="20" r="3" fill="#2c3e6b" />
    <circle cx="71" cy="46" r="14" stroke="#2c3e6b" strokeWidth="2.5" fill="#e0f2fe" />
    <circle cx="71" cy="43" r="6" fill="#2c3e6b" />
    <path d="M60 56c0-6 5-8 11-8s11 2 11 8" stroke="#2c3e6b" strokeWidth="2" fill="#2c3e6b" />
    <rect x="48" y="70" width="46" height="4" rx="2" fill="#e2e8f0" />
    <rect x="52" y="80" width="38" height="3.5" rx="1.5" fill="#e2e8f0" />
    <rect x="56" y="90" width="30" height="3" rx="1.5" fill="#facc15" />
    <path d="M106 72c10-2 22 2 24 10 2 8-8 12-16 12h-8" stroke="#2c3e6b" strokeWidth="3" strokeLinecap="round" />
    <path d="M106 82c8 0 16 3 17 8 1 5-6 8-13 8h-4" stroke="#2c3e6b" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M26 30l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="#facc15" />
    <circle cx="120" cy="34" r="3" fill="#38bdf8" />
  </svg>
);

const MapIllustration = () => (
  <svg viewBox="0 0 160 140" className="w-28 h-24 mx-auto" fill="none">
    <path d="M30 40l34-12 34 10 32-12v70l-32 12-34-10-34 12V40z" fill="#f0fdf4" stroke="#2c3e6b" strokeWidth="3" />
    <path d="M64 28v70M98 38v70" stroke="#2c3e6b" strokeWidth="2" strokeDasharray="4 3" />
    <path d="M42 64c12-6 20 6 36 2s24-10 38-4" stroke="#99f6e4" strokeWidth="3.5" strokeLinecap="round" />
    <g transform="translate(56, 32)">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20c0-6.6-5.4-12-12-12z" fill="#facc15" stroke="#2c3e6b" strokeWidth="2" />
      <circle cx="12" cy="12" r="4.5" fill="#2c3e6b" />
    </g>
    <g transform="translate(94, 46)">
      <path d="M9 0C4 0 0 4 0 9c0 7 9 15 9 15s9-8 9-15c0-5-4-9-9-9z" fill="#2dd4bf" stroke="#2c3e6b" strokeWidth="1.8" />
      <circle cx="9" cy="9" r="3.5" fill="#2c3e6b" />
    </g>
  </svg>
);

const SafeVaultIllustration = () => (
  <svg viewBox="0 0 160 140" className="w-28 h-24 mx-auto" fill="none">
    <rect x="36" y="24" width="88" height="88" rx="14" stroke="#2c3e6b" strokeWidth="3.5" fill="#f8fafc" />
    <rect x="46" y="34" width="68" height="68" rx="8" stroke="#2c3e6b" strokeWidth="2" fill="#ffffff" />
    <circle cx="43" cy="31" r="2.5" fill="#94a3b8" />
    <circle cx="117" cy="31" r="2.5" fill="#94a3b8" />
    <circle cx="43" cy="105" r="2.5" fill="#94a3b8" />
    <circle cx="117" cy="105" r="2.5" fill="#94a3b8" />
    <circle cx="80" cy="68" r="20" stroke="#2c3e6b" strokeWidth="3" fill="#fef08a" />
    <circle cx="80" cy="68" r="13" stroke="#2c3e6b" strokeWidth="2" fill="#ffffff" />
    <circle cx="80" cy="68" r="6" fill="#eab308" stroke="#2c3e6b" strokeWidth="1.5" />
    <line x1="80" y1="50" x2="80" y2="54" stroke="#2c3e6b" strokeWidth="2" />
    <line x1="80" y1="82" x2="80" y2="86" stroke="#2c3e6b" strokeWidth="2" />
    <line x1="62" y1="68" x2="66" y2="68" stroke="#2c3e6b" strokeWidth="2" />
    <line x1="94" y1="68" x2="98" y2="68" stroke="#2c3e6b" strokeWidth="2" />
    <rect x="100" y="60" width="8" height="16" rx="2" stroke="#2c3e6b" strokeWidth="2" fill="#facc15" />
  </svg>
);

// ─── PHONE BEZEL FRAME COMPONENT ─────────────────────────────────────────────
const PhoneFrame = ({ children, statusTime = "9:41 AM" }) => (
  <div className="relative w-full max-w-[340px] h-[690px] bg-white rounded-[44px] shadow-2xl border-[9px] border-[#18181b] overflow-hidden flex flex-col shrink-0 select-none">
    {/* Dynamic Island / Notch */}
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
const BottomNavBar = ({ activeKey = "overview", onSelect }) => (
  <div className="border-t border-gray-100 bg-white px-5 py-2.5 flex items-center justify-between text-gray-400 shrink-0">
    {[
      { key: "discover", label: "Discover", icon: <FiCompass size={17} /> },
      { key: "delivery", label: "Delivery", icon: <FiMapPin size={17} /> },
      { key: "account", label: "Account", icon: <FiUser size={17} /> },
      { key: "notifications", label: "Notifications", icon: <FiClock size={17} /> },
      { key: "cart", label: "Cart", icon: <IoCartOutline size={19} /> },
    ].map((item) => {
      const isActive =
        item.key === activeKey ||
        (item.key === "account" &&
          ["overview", "addresses", "add_address", "personal_info", "change_password"].includes(activeKey));
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

// ─── MAIN DASHBOARD COMPONENT ─────────────────────────────────────────────────
const CustomerDashboard = () => {
  const { user, isLogin, role, setUser, setIsLogin, setRole } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  // Mode View: 'dashboard' (Full responsive desktop dashboard) | 'phone' (Interactive iPhone) | 'showcase' (All 6 phones mockup from image)
  const [viewMode, setViewMode] = useState("dashboard");

  // Active Tab / Sub-screen: 'overview' | 'addresses' | 'add_address' | 'personal_info' | 'change_password' | 'orders' | 'drawer'
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || "overview");
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Address State (Includes fallback sample addresses matching the mockup image)
  const defaultSampleAddresses = [
    {
      _id: "addr-mock-1",
      address: "71, Charter str., App. 5r.",
      city: "Boston, MA",
      pinCode: "02113",
      isDefault: true,
      addressType: "Home",
    },
    {
      _id: "addr-mock-2",
      address: "37, Brandenburg str., App. 14b",
      city: "Boston, MA",
      pinCode: "21324",
      isDefault: false,
      addressType: "Office",
    },
  ];

  const [addressBook, setAddressBook] = useState(defaultSampleAddresses);
  const [selectedAddressId, setSelectedAddressId] = useState("addr-mock-1");
  const [newAddressText, setNewAddressText] = useState("");

  // Personal Info State
  const [personalInfo, setPersonalInfo] = useState({
    fullName: "Sabrina Lorenshtein",
    email: "sabrina.lorenshtein@example.com",
    phone: "+1 912 345 6789",
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=240&h=240&fit=crop&crop=faces",
    personalId: "US-8923-4412",
  });

  // Password State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  // Sync profile & address with authenticated user
  useEffect(() => {
    if (user) {
      setPersonalInfo({
        fullName: user.fullName || "Customer",
        email: user.email || "",
        phone: user.phone || "+1 912 345 6789",
        photoUrl:
          user.photo?.url ||
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=240&h=240&fit=crop&crop=faces",
        personalId: "US-8923-4412",
      });
    }

    if (isLogin) {
      api
        .get("/customer/profile")
        .then((res) => {
          if (res.data?.success && res.data.data?.addressBook?.length > 0) {
            const list = res.data.data.addressBook;
            setAddressBook(list);
            const def = list.find((a) => a.isDefault) || list[0];
            if (def) setSelectedAddressId(def._id);
          }
        })
        .catch(() => {});
    }
  }, [user, isLogin]);

  const handleLogout = async () => {
    try {
      await api.get("/auth/logout");
    } catch (ignore) {}
    sessionStorage.removeItem("cravingUser");
    setUser(null);
    setIsLogin(false);
    setRole(null);
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleSaveAsPrimary = async (addressId) => {
    setSelectedAddressId(addressId);
    setAddressBook((prev) =>
      prev.map((a) => ({ ...a, isDefault: a._id === addressId }))
    );
    if (isLogin) {
      try {
        await api.patch(`/customer/address/${addressId}/default`);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to update default address");
        return;
      }
    }
    toast.success("Primary address updated! 📍");
  };

  const handleSaveNewAddress = async () => {
    if (!newAddressText.trim()) {
      toast.error("Please enter your delivery address");
      return;
    }

    const localNew = {
      _id: `addr-local-${Date.now()}`,
      address: newAddressText.trim(),
      city: "Boston, MA",
      pinCode: "02113",
      isDefault: addressBook.length === 0,
      addressType: "Home",
    };

    setAddressBook((prev) => [...prev, localNew]);
    setSelectedAddressId(localNew._id);
    setNewAddressText("");
    setActiveTab("addresses");

    if (isLogin) {
      try {
        setLoading(true);
        const res = await api.post("/customer/address", {
          name: personalInfo.fullName,
          address: localNew.address,
          city: "Boston",
          state: "MA",
          pinCode: "02113",
          addressType: "Home",
        });
        if (res.data?.success) {
          setAddressBook(res.data.data);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to save address to server");
      } finally {
        setLoading(false);
      }
    }
    toast.success("New address saved! 🏠");
  };

  const handleSavePersonalInfo = async () => {
    if (!personalInfo.fullName.trim()) {
      toast.error("Full name cannot be empty");
      return;
    }
    if (isLogin) {
      try {
        setLoading(true);
        const res = await api.put("/customer/profile", {
          fullName: personalInfo.fullName,
          phone: personalInfo.phone,
          photoUrl: personalInfo.photoUrl,
        });
        if (res.data?.success && setUser) {
          setUser((prev) => ({
            ...prev,
            fullName: personalInfo.fullName,
            phone: personalInfo.phone,
          }));
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to update profile");
        return;
      } finally {
        setLoading(false);
      }
    }
    toast.success("Personal information updated! ✨");
    setActiveTab("overview");
  };

  const handleSavePassword = async () => {
    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (isLogin) {
      try {
        setLoading(true);
        const res = await api.post("/customer/change-password", {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        });
        if (!res.data?.success) {
          toast.error(res.data?.message || "Failed to change password");
          return;
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to change password");
        return;
      } finally {
        setLoading(false);
      }
    }
    toast.success("Password changed successfully! 🔐");
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setActiveTab("overview");
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // SCREEN 1: SLIDE-OUT DRAWER MENU (Screen 1 from Mockup)
  // ═══════════════════════════════════════════════════════════════════════════
  const renderScreen1Drawer = (isMobileOrPhone = false, onClose = null) => (
    <div className="h-full bg-[#f8b803] text-[#1c1917] flex flex-col justify-between p-6 relative overflow-hidden">
      {/* Background overlapping white card preview (matching image) */}
      <div className="absolute -right-28 top-20 w-44 h-72 bg-white rounded-3xl shadow-xl p-3 border border-gray-100 opacity-90 pointer-events-none">
        <span className="text-[10px] font-black text-gray-800 block">Discover Food</span>
        <div className="w-full h-12 bg-amber-50 rounded-xl mt-2 flex items-center justify-center text-xs">🍔 Meals</div>
        <div className="w-full h-12 bg-amber-50 rounded-xl mt-2 flex items-center justify-center text-xs">☕ Drinks</div>
      </div>

      <div>
        {/* Profile Card Header */}
        <div className="flex justify-between items-start">
          <div className="relative">
            <img
              src={personalInfo.photoUrl}
              alt={personalInfo.fullName}
              className="w-16 h-16 rounded-full border-2 border-white object-cover shadow-md"
            />
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center gap-1 text-xs font-black text-gray-900 bg-white/30 hover:bg-white/50 px-2.5 py-1 rounded-full transition"
            >
              <FiX size={14} />
              <span>Close</span>
            </button>
          )}
        </div>

        <div className="mt-4">
          <span className="text-[11px] font-semibold text-gray-800/80 uppercase tracking-wider block">Welcome</span>
          <h2 className="text-xl font-black text-gray-900 leading-tight truncate">{personalInfo.fullName}</h2>
          <p className="text-xs text-gray-800 font-medium mt-0.5 truncate">{personalInfo.phone}</p>
        </div>

        {/* Menu Navigation Items matching mockup */}
        <div className="mt-7 space-y-1.5 relative z-10">
          {[
            { id: "discover", label: "Discover", icon: <FiCompass size={16} />, click: () => navigate("/") },
            { id: "overview", label: "Profile", icon: <FiUser size={16} />, click: () => { setActiveTab("overview"); onClose && onClose(); } },
            { id: "promocodes", label: "Promocodes", icon: <FiTag size={16} />, click: () => toast("Promocode 'CRAVINGS50' active! 🏷️") },
            { id: "orders", label: "Order History", icon: <FiClock size={16} />, click: () => { setActiveTab("orders"); onClose && onClose(); } },
            { id: "payment", label: "Payment Methods", icon: <FiCreditCard size={16} />, click: () => toast("UPI QR & Cards active at checkout") },
            { id: "share", label: "Share & Earn", icon: <FiShare2 size={16} />, click: () => toast.success("Referral link copied! 🎁") },
            { id: "settings", label: "Settings", icon: <FiSettings size={16} />, click: () => { setActiveTab("personal_info"); onClose && onClose(); } },
            { id: "support", label: "Support", icon: <FiHelpCircle size={16} />, click: () => navigate("/help-center") },
          ].map((item) => {
            const isActive = activeTab === item.id || (item.id === "payment" && activeTab === "payment");
            return (
              <button
                key={item.id}
                onClick={item.click}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-left transition-all ${
                  isActive
                    ? "bg-[#e89c02] text-white shadow-xs font-black"
                    : "text-gray-900 hover:bg-black/10"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Logout Button */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 text-xs font-extrabold text-gray-900 hover:text-black pt-4 border-t border-black/10 relative z-10"
      >
        <FiLogOut size={16} />
        <span>Logout</span>
      </button>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // SCREEN 2: PROFILE INFORMATION HUB (Screen 2 from Mockup)
  // ═══════════════════════════════════════════════════════════════════════════
  const renderScreen2Hub = (isPhone = false) => (
    <div className="h-full flex flex-col justify-between bg-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <button
          onClick={() => (isPhone ? setActiveTab("drawer") : navigate("/"))}
          className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-full"
        >
          <FiArrowLeft size={18} />
        </button>
        <h3 className="text-sm font-extrabold text-gray-800">Profile</h3>
        <button
          onClick={() => (isPhone ? setActiveTab("drawer") : setIsMobileDrawerOpen(true))}
          className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-full"
        >
          <FiMenu size={18} />
        </button>
      </div>

      <div className="px-6 py-4 flex-1 flex flex-col items-center justify-center text-center space-y-5">
        <IdBadgeIllustration />

        <div>
          <h2 className="text-lg font-black text-gray-900">Profile Information</h2>
          <p className="text-[11px] text-gray-400 max-w-[260px] mt-1 mx-auto leading-relaxed">
            Manage your personal details, delivery addresses, and account security.
          </p>
        </div>

        {/* 3 Action Cards matching the mockup */}
        <div className="w-full space-y-3 pt-2">
          <button
            onClick={() => setActiveTab("addresses")}
            className="w-full flex items-center justify-between p-3.5 bg-gray-50 hover:bg-amber-50/50 rounded-2xl border border-gray-100 transition group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
                <FiMapPin size={17} />
              </div>
              <span className="text-xs font-bold text-gray-800">Add Address</span>
            </div>
            <FiChevronRight className="text-gray-400 group-hover:text-amber-500 transition-transform group-hover:translate-x-0.5" size={17} />
          </button>

          <button
            onClick={() => setActiveTab("personal_info")}
            className="w-full flex items-center justify-between p-3.5 bg-gray-50 hover:bg-amber-50/50 rounded-2xl border border-gray-100 transition group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
                <FiUser size={17} />
              </div>
              <span className="text-xs font-bold text-gray-800">Personal Information</span>
            </div>
            <FiChevronRight className="text-gray-400 group-hover:text-amber-500 transition-transform group-hover:translate-x-0.5" size={17} />
          </button>

          <button
            onClick={() => setActiveTab("change_password")}
            className="w-full flex items-center justify-between p-3.5 bg-gray-50 hover:bg-amber-50/50 rounded-2xl border border-gray-100 transition group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
                <FiLock size={17} />
              </div>
              <span className="text-xs font-bold text-gray-800">Change Password</span>
            </div>
            <FiChevronRight className="text-gray-400 group-hover:text-amber-500 transition-transform group-hover:translate-x-0.5" size={17} />
          </button>
        </div>
      </div>

      <BottomNavBar activeKey="overview" onSelect={(key) => (key === "account" ? setActiveTab("overview") : navigate("/"))} />
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // SCREEN 3: ADDRESS SETTING (Screen 3 from Mockup)
  // ═══════════════════════════════════════════════════════════════════════════
  const renderScreen3AddressSetting = (isPhone = false) => (
    <div className="h-full flex flex-col justify-between bg-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <button onClick={() => setActiveTab("overview")} className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-full">
          <FiArrowLeft size={18} />
        </button>
        <h3 className="text-sm font-extrabold text-gray-800">Address Setting</h3>
        <button
          onClick={() => (isPhone ? setActiveTab("drawer") : setIsMobileDrawerOpen(true))}
          className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-full"
        >
          <FiMenu size={18} />
        </button>
      </div>

      <div className="px-6 py-3 flex-1 flex flex-col justify-between overflow-y-auto">
        <div>
          <MapIllustration />

          <div className="text-center mt-2">
            <h2 className="text-base font-black text-gray-900">Add Address</h2>
            <p className="text-[11px] text-gray-400 max-w-[260px] mt-1 mx-auto leading-relaxed">
              Select a primary address for instant food checkout.
            </p>
          </div>

          {/* Radio Address List matching mockup */}
          <div className="mt-5 space-y-2.5">
            {addressBook.map((addr) => {
              const isSelected = selectedAddressId === addr._id;
              return (
                <div
                  key={addr._id}
                  onClick={() => setSelectedAddressId(addr._id)}
                  className={`p-3 rounded-2xl border cursor-pointer transition flex items-start gap-2.5 ${
                    isSelected
                      ? "bg-amber-50/60 border-amber-500 shadow-xs"
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="mt-0.5">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? "border-[#f59e0b]" : "border-gray-300"
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-[#f59e0b]" />}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black uppercase text-gray-800">
                        {addr.addressType || "Delivery Address"}
                      </span>
                      {addr.isDefault && (
                        <span className="text-[9px] bg-amber-500 text-white font-black px-1.5 py-0.2 rounded-full uppercase">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-600 mt-0.5 line-clamp-2">
                      {addr.address}, {addr.city} ({addr.pinCode})
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Buttons: ADD NEW ADDRESS (Golden) & SAVE AS PRIMARY (Navy Blue) */}
        <div className="space-y-2 pt-4">
          <button
            onClick={() => setActiveTab("add_address")}
            className="w-full py-2.5 bg-[#f59e0b] hover:bg-[#d97706] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-md shadow-amber-400/25 flex items-center justify-center gap-1.5"
          >
            <span>ADD NEW ADDRESS</span>
            <FiPlus size={15} />
          </button>

          <button
            onClick={() => selectedAddressId && handleSaveAsPrimary(selectedAddressId)}
            disabled={!selectedAddressId}
            className="w-full py-2.5 bg-[#2b3d68] hover:bg-[#202e50] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-md disabled:opacity-50"
          >
            SAVE AS PRIMARY
          </button>
        </div>
      </div>

      <BottomNavBar activeKey="overview" onSelect={(key) => (key === "account" ? setActiveTab("overview") : navigate("/"))} />
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // SCREEN 4: ADD ADDRESS (Screen 4 from Mockup)
  // ═══════════════════════════════════════════════════════════════════════════
  const renderScreen4AddAddress = (isPhone = false) => (
    <div className="h-full flex flex-col justify-between bg-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <button onClick={() => setActiveTab("addresses")} className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-full">
          <FiArrowLeft size={18} />
        </button>
        <h3 className="text-sm font-extrabold text-gray-800">Add Address</h3>
        <button
          onClick={() => (isPhone ? setActiveTab("drawer") : setIsMobileDrawerOpen(true))}
          className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-full"
        >
          <FiMenu size={18} />
        </button>
      </div>

      <div className="px-6 py-3 flex-1 flex flex-col justify-between overflow-y-auto">
        <div>
          <MapIllustration />

          <div className="text-center mt-2">
            <h2 className="text-base font-black text-gray-900">Add Address</h2>
            <p className="text-[11px] text-gray-400 max-w-[260px] mt-1 mx-auto leading-relaxed">
              Enter your street and apartment details.
            </p>
          </div>

          {/* Existing Address List preview (matching Screen 4 in mockup image) */}
          <div className="mt-4 space-y-2">
            {addressBook.slice(0, 2).map((addr) => {
              const isSelected = selectedAddressId === addr._id;
              return (
                <div
                  key={addr._id}
                  onClick={() => setSelectedAddressId(addr._id)}
                  className={`p-2.5 rounded-2xl border cursor-pointer transition flex items-start gap-2 ${
                    isSelected
                      ? "bg-amber-50/60 border-amber-500 shadow-xs"
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="mt-0.5">
                    <div
                      className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? "border-[#f59e0b]" : "border-gray-300"
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-gray-700 line-clamp-1">
                      {addr.address}, {addr.city} ({addr.pinCode})
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Address Input Field */}
          <div className="mt-4 text-left">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Delivery Address
            </label>
            <div className="rounded-2xl border border-gray-300 p-2.5 focus-within:border-amber-500 transition bg-gray-50/50">
              <input
                type="text"
                placeholder="Add a New Delivery Address (e.g. 71, Charter St.)"
                value={newAddressText}
                onChange={(e) => setNewAddressText(e.target.value)}
                className="w-full text-xs text-gray-800 placeholder-gray-400 bg-transparent focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save New Address Button with X on right */}
        <div className="pt-4 space-y-2">
          <button
            onClick={handleSaveNewAddress}
            disabled={loading}
            className="w-full py-2.5 bg-[#f59e0b] hover:bg-[#d97706] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-md shadow-amber-400/25 flex items-center justify-between px-5"
          >
            <span>SAVE NEW ADDRESS</span>
            <span onClick={(e) => { e.stopPropagation(); setActiveTab("addresses"); }}>
              <FiX size={15} />
            </span>
          </button>
        </div>
      </div>

      <BottomNavBar activeKey="overview" onSelect={(key) => (key === "account" ? setActiveTab("overview") : navigate("/"))} />
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // SCREEN 5: PERSONAL INFORMATION (Screen 5 from Mockup)
  // ═══════════════════════════════════════════════════════════════════════════
  const renderScreen5PersonalInfo = (isPhone = false) => (
    <div className="h-full flex flex-col justify-between bg-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <button onClick={() => setActiveTab("overview")} className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-full">
          <FiArrowLeft size={18} />
        </button>
        <h3 className="text-sm font-extrabold text-gray-800">Personal Information</h3>
        <button
          onClick={() => (isPhone ? setActiveTab("drawer") : setIsMobileDrawerOpen(true))}
          className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-full"
        >
          <FiMenu size={18} />
        </button>
      </div>

      <div className="px-6 py-3 flex-1 flex flex-col justify-between overflow-y-auto">
        <div>
          {/* Avatar with edit circle */}
          <div className="text-center">
            <div className="relative w-18 h-18 mx-auto">
              <img
                src={personalInfo.photoUrl}
                alt="Avatar"
                className="w-18 h-18 rounded-full object-cover border-2 border-gray-200 shadow-sm"
              />
              <button
                type="button"
                onClick={() => {
                  const url = prompt("Enter new profile photo URL:", personalInfo.photoUrl);
                  if (url) setPersonalInfo({ ...personalInfo, photoUrl: url });
                }}
                className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-amber-400 text-gray-900 flex items-center justify-center shadow-xs text-xs font-bold"
                title="Edit Photo"
              >
                ✎
              </button>
            </div>

            <h2 className="text-sm font-black text-gray-900 mt-2">Name, Last name</h2>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Enter your personal info and then click on the 'Save' button below.
            </p>
          </div>

          {/* Form Fields matching mockup */}
          <div className="mt-4 space-y-2.5 text-left">
            {/* Phone with Country Flag */}
            <div className="flex items-center px-4 py-2 rounded-2xl border border-gray-200 bg-gray-50/50 gap-2.5">
              <span className="text-sm">🇺🇸</span>
              <input
                type="tel"
                value={personalInfo.phone}
                onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                placeholder="+1 (912) 397-8483"
                className="w-full text-xs text-gray-800 bg-transparent focus:outline-none"
              />
            </div>

            {/* Name */}
            <div className="flex items-center px-4 py-2 rounded-2xl border border-gray-200 bg-gray-50/50 gap-2.5">
              <FiUser className="text-gray-400" size={15} />
              <input
                type="text"
                value={personalInfo.fullName}
                onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                placeholder="Name, Last name"
                className="w-full text-xs text-gray-800 bg-transparent focus:outline-none"
              />
            </div>

            {/* Email */}
            <div className="flex items-center px-4 py-2 rounded-2xl border border-gray-200 bg-gray-50/50 gap-2.5 opacity-80">
              <FiMail className="text-gray-400" size={15} />
              <input
                type="email"
                disabled
                value={personalInfo.email}
                placeholder="Email address"
                className="w-full text-xs text-gray-500 bg-transparent cursor-not-allowed focus:outline-none"
              />
            </div>

            {/* Personal ID */}
            <div className="flex items-center px-4 py-2 rounded-2xl border border-gray-200 bg-gray-50/50 gap-2.5">
              <FiTag className="text-gray-400" size={15} />
              <input
                type="text"
                value={personalInfo.personalId}
                onChange={(e) => setPersonalInfo({ ...personalInfo, personalId: e.target.value })}
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
            disabled={loading}
            className="w-full py-2.5 bg-[#f59e0b] hover:bg-[#d97706] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-md shadow-amber-400/25"
          >
            SAVE
          </button>
        </div>
      </div>

      <BottomNavBar activeKey="overview" onSelect={(key) => (key === "account" ? setActiveTab("overview") : navigate("/"))} />
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // SCREEN 6: CHANGE PASSWORD (Screen 6 from Mockup)
  // ═══════════════════════════════════════════════════════════════════════════
  const renderScreen6ChangePassword = (isPhone = false) => (
    <div className="h-full flex flex-col justify-between bg-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <button onClick={() => setActiveTab("overview")} className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-full">
          <FiArrowLeft size={18} />
        </button>
        <h3 className="text-sm font-extrabold text-gray-800">Change Password</h3>
        <button
          onClick={() => (isPhone ? setActiveTab("drawer") : setIsMobileDrawerOpen(true))}
          className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-full"
        >
          <FiMenu size={18} />
        </button>
      </div>

      <div className="px-6 py-3 flex-1 flex flex-col justify-between overflow-y-auto">
        <div>
          <SafeVaultIllustration />

          <div className="text-center mt-2">
            <h2 className="text-base font-black text-gray-900">Change Password</h2>
            <p className="text-[11px] text-gray-400 max-w-[240px] mt-1 mx-auto leading-relaxed">
              Enter your new password and then click on the 'Save' button below.
            </p>
          </div>

          {/* Password Inputs */}
          <div className="mt-4 space-y-2.5 text-left">
            <div className="flex items-center px-4 py-2 rounded-2xl border border-gray-200 bg-gray-50/50 gap-2.5">
              <FiLock className="text-gray-400" size={15} />
              <input
                type={showNewPass ? "text" : "password"}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                placeholder="Password"
                className="w-full text-xs text-gray-800 bg-transparent focus:outline-none"
              />
              <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="text-gray-400 hover:text-gray-600">
                {showNewPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
              </button>
            </div>

            <div className="flex items-center px-4 py-2 rounded-2xl border border-gray-200 bg-gray-50/50 gap-2.5">
              <FiLock className="text-gray-400" size={15} />
              <input
                type={showConfirmPass ? "text" : "password"}
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
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
            disabled={loading}
            className="w-full py-2.5 bg-[#f59e0b] hover:bg-[#d97706] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-md shadow-amber-400/25 flex items-center justify-center gap-1.5"
          >
            <span>SAVE</span>
            <FiLock size={14} />
          </button>
        </div>
      </div>

      <BottomNavBar activeKey="overview" onSelect={(key) => (key === "account" ? setActiveTab("overview") : navigate("/"))} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 py-6 px-3 sm:px-6 flex flex-col items-center">
      {/* ───────────────────────────────────────────────────────────────────────
          TOP MODE SWITCHER BAR:
          1. 🖥️ Full Dashboard
          2. 📱 Phone Simulator
          3. 🖼️ 6-Screen Mockup (Matches uploaded image 100%)
      ──────────────────────────────────────────────────────────────────────── */}
      <div className="w-full max-w-6xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-gray-900 p-3 sm:p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-xs bg-amber-500 text-white font-black px-2 py-0.5 rounded-full uppercase">
            Profile
          </span>
          <h1 className="text-sm sm:text-base font-black tracking-tight text-gray-900 dark:text-white uppercase">
            Customer Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("dashboard")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition ${
              viewMode === "dashboard"
                ? "bg-[#f59e0b] text-white shadow-xs"
                : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            <FiLayout size={14} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setViewMode("phone")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition ${
              viewMode === "phone"
                ? "bg-[#f59e0b] text-white shadow-xs"
                : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            <FiSmartphone size={14} />
            <span>Phone Simulator</span>
          </button>

          <button
            onClick={() => setViewMode("showcase")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition ${
              viewMode === "showcase"
                ? "bg-[#f59e0b] text-white shadow-xs"
                : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            <FiGrid size={14} />
            <span>6-Screen Mockup</span>
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────
          VIEW MODE 1: FULL RESPONSIVE DESKTOP/TABLET DASHBOARD
      ──────────────────────────────────────────────────────────────────────── */}
      {viewMode === "dashboard" && (
        <div className="w-full max-w-6xl flex gap-6 items-start">
          {/* Permanent Golden Drawer Menu on Desktop (Screen 1) */}
          <div className="hidden lg:block sticky top-20 w-72 lg:w-80 rounded-3xl overflow-hidden shadow-xl shrink-0 h-[690px]">
            {renderScreen1Drawer(false, null)}
          </div>

          {/* Mobile Slide-Over Drawer on Small Screens */}
          {isMobileDrawerOpen && (
            <div
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex lg:hidden"
              onClick={() => setIsMobileDrawerOpen(false)}
            >
              <div onClick={(e) => e.stopPropagation()} className="w-4/5 max-w-[300px] h-full shadow-2xl">
                {renderScreen1Drawer(true, () => setIsMobileDrawerOpen(false))}
              </div>
            </div>
          )}

          {/* Main Dashboard Canvas Screen */}
          <div className="flex-1 w-full bg-white dark:bg-gray-900 rounded-[36px] shadow-xl border border-gray-200/80 dark:border-gray-800 overflow-hidden flex flex-col min-h-[690px]">
            {activeTab === "overview" && renderScreen2Hub(false)}
            {activeTab === "addresses" && renderScreen3AddressSetting(false)}
            {activeTab === "add_address" && renderScreen4AddAddress(false)}
            {activeTab === "personal_info" && renderScreen5PersonalInfo(false)}
            {activeTab === "change_password" && renderScreen6ChangePassword(false)}
            {activeTab === "orders" && (
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                  <button onClick={() => setActiveTab("overview")} className="p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 rounded-full">
                    <FiArrowLeft size={18} />
                  </button>
                  <h2 className="text-base font-extrabold text-gray-900 dark:text-white">Order History</h2>
                  <div className="w-8" />
                </div>
                <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
                  <CustomerOrders />
                </div>
                <BottomNavBar activeKey="notifications" onSelect={(key) => (key === "account" ? setActiveTab("overview") : navigate("/"))} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────
          VIEW MODE 2: INTERACTIVE PHONE SIMULATOR
      ──────────────────────────────────────────────────────────────────────── */}
      {viewMode === "phone" && (
        <div className="flex flex-col items-center gap-4">
          {/* Fast Screen Switcher Pills */}
          <div className="flex flex-wrap justify-center gap-1.5 max-w-md">
            {[
              { id: "drawer", label: "1. Drawer Menu" },
              { id: "overview", label: "2. Profile Hub" },
              { id: "addresses", label: "3. Address List" },
              { id: "add_address", label: "4. Add Address" },
              { id: "personal_info", label: "5. Personal Info" },
              { id: "change_password", label: "6. Password" },
              { id: "orders", label: "📦 Orders" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                  activeTab === tab.id
                    ? "bg-[#f59e0b] text-white shadow-xs"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <PhoneFrame>
            {activeTab === "drawer" && renderScreen1Drawer(true, () => setActiveTab("overview"))}
            {activeTab === "overview" && renderScreen2Hub(true)}
            {activeTab === "addresses" && renderScreen3AddressSetting(true)}
            {activeTab === "add_address" && renderScreen4AddAddress(true)}
            {activeTab === "personal_info" && renderScreen5PersonalInfo(true)}
            {activeTab === "change_password" && renderScreen6ChangePassword(true)}
            {activeTab === "orders" && (
              <div className="h-full flex flex-col justify-between bg-white overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                  <button onClick={() => setActiveTab("overview")} className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-full">
                    <FiArrowLeft size={18} />
                  </button>
                  <h3 className="text-sm font-extrabold text-gray-800">Order History</h3>
                  <div className="w-6" />
                </div>
                <div className="flex-1 p-3 overflow-y-auto">
                  <CustomerOrders />
                </div>
                <BottomNavBar activeKey="notifications" onSelect={(key) => (key === "account" ? setActiveTab("overview") : navigate("/"))} />
              </div>
            )}
          </PhoneFrame>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────
          VIEW MODE 3: ALL 6 PHONES MOCKUP SHOWCASE (Exact Match of the Uploaded Image)
      ──────────────────────────────────────────────────────────────────────── */}
      {viewMode === "showcase" && (
        <div className="w-full max-w-6xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black uppercase tracking-widest text-gray-800 dark:text-gray-100">
              PROFILE
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Exact 6-Screen Architecture corresponding to your design mockup
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
            {/* Phone 1: Drawer */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-black text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wider">
                1. Slide Menu Drawer
              </span>
              <PhoneFrame>{renderScreen1Drawer(true, () => toast("Close clicked"))}</PhoneFrame>
            </div>

            {/* Phone 2: Hub */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-black text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wider">
                2. Profile Information
              </span>
              <PhoneFrame>{renderScreen2Hub(true)}</PhoneFrame>
            </div>

            {/* Phone 3: Address Setting */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-black text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wider">
                3. Address Setting
              </span>
              <PhoneFrame>{renderScreen3AddressSetting(true)}</PhoneFrame>
            </div>

            {/* Phone 4: Add Address Form */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-black text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wider">
                4. Add New Address
              </span>
              <PhoneFrame>{renderScreen4AddAddress(true)}</PhoneFrame>
            </div>

            {/* Phone 5: Personal Info */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-black text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wider">
                5. Personal Information
              </span>
              <PhoneFrame>{renderScreen5PersonalInfo(true)}</PhoneFrame>
            </div>

            {/* Phone 6: Change Password */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-black text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wider">
                6. Change Password
              </span>
              <PhoneFrame>{renderScreen6ChangePassword(true)}</PhoneFrame>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
