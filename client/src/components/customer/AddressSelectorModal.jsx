import React, { useState, useEffect } from "react";
import api from "../../config/ApiConfig";
import toast from "react-hot-toast";
import {
  IoCloseOutline,
  IoLocationOutline,
  IoAddOutline,
  IoHomeOutline,
  IoBriefcaseOutline,
  IoNavigateOutline,
  IoCheckmarkCircle,
  IoRadioButtonOn,
  IoRadioButtonOff,
} from "react-icons/io5";

const AddressSelectorModal = ({ isOpen, onClose, selectedAddress, onSelectAddress }) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state for adding new address
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "Bhopal",
    state: "Madhya Pradesh",
    pinCode: "462001",
    country: "India",
    addressType: "home",
    isDefault: false,
    geoLocation: { lat: "23.2599", lon: "77.4126" },
  });

  useEffect(() => {
    if (isOpen) {
      fetchAddresses();
    }
  }, [isOpen]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await api.get("/customer/profile");
      if (res.data?.success && res.data.data?.addressBook) {
        const list = res.data.data.addressBook;
        setAddresses(list);
        // If no address is currently selected, pick default or first
        if (!selectedAddress && list.length > 0) {
          const defaultAddr = list.find((a) => a.isDefault) || list[0];
          onSelectAddress(defaultAddr);
        }
      }
    } catch (err) {
      console.error("Fetch addresses error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setFormData((prev) => ({
          ...prev,
          geoLocation: {
            lat: latitude.toString(),
            lon: longitude.toString(),
          },
          address: prev.address || `GPS Pin: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        }));
        setDetectingGps(false);
        toast.success("GPS location detected successfully! 📍");
      },
      (err) => {
        setDetectingGps(false);
        toast.error("Unable to retrieve GPS location. Please enter manually.");
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleSaveNewAddress = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.address || !formData.city || !formData.pinCode) {
      toast.error("Please fill all required address fields");
      return;
    }

    try {
      const res = await api.post("/customer/address", formData);
      if (res.data?.success) {
        toast.success("New address saved! 🏡");
        const updatedList = res.data.data || [];
        setAddresses(updatedList);
        const newlyAdded = updatedList[updatedList.length - 1];
        if (newlyAdded) {
          onSelectAddress(newlyAdded);
        }
        setShowAddForm(false);
        setFormData({
          name: "",
          address: "",
          city: "Bhopal",
          state: "Madhya Pradesh",
          pinCode: "462001",
          country: "India",
          addressType: "home",
          isDefault: false,
          geoLocation: { lat: "23.2599", lon: "77.4126" },
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save address");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className="bg-white dark:bg-gray-900 rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
              <IoLocationOutline size={22} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">Select Delivery Address</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Choose where to deliver your hot food</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-full transition"
          >
            <IoCloseOutline size={24} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">

          {/* Quick GPS auto-detect banner */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20 p-4 rounded-2xl border border-orange-200/60 dark:border-orange-800/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/20">
                <IoNavigateOutline size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">Use Live GPS Location</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">Accurate delivery to your current spot</p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowAddForm(true);
                handleDetectGps();
              }}
              disabled={detectingGps}
              className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              {detectingGps ? "Detecting..." : "Detect"}
            </button>
          </div>

          {/* Saved Addresses List */}
          {!showAddForm && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Saved Addresses ({addresses.length})
                </span>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="text-xs font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1 hover:underline"
                >
                  <IoAddOutline size={16} />
                  <span>Add New Address</span>
                </button>
              </div>

              {loading ? (
                <div className="py-8 text-center">
                  <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              ) : addresses.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-sm">
                  <p>No saved addresses found.</p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="mt-3 bg-orange-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow"
                  >
                    Add Your First Address
                  </button>
                </div>
              ) : (
                addresses.map((addr) => {
                  const isSelected = selectedAddress?._id === addr._id || selectedAddress?.address === addr.address;
                  return (
                    <div
                      key={addr._id || addr.address}
                      onClick={() => onSelectAddress(addr)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? "bg-orange-50/60 dark:bg-orange-950/20 border-orange-500 shadow-md ring-2 ring-orange-400/20"
                          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-orange-300"
                      }`}
                    >
                      <div className="mt-1 text-orange-600 shrink-0">
                        {isSelected ? <IoRadioButtonOn size={20} /> : <IoRadioButtonOff size={20} className="text-gray-400" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-900 dark:text-white text-sm truncate">
                            {addr.name || "Customer"}
                          </span>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                            {addr.addressType || "Home"}
                          </span>
                          {addr.isDefault && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                          {addr.address}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {addr.city}, {addr.state} - {addr.pinCode}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Add New Address Form */}
          {showAddForm && (
            <form onSubmit={handleSaveNewAddress} className="space-y-3 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
                <h4 className="font-bold text-gray-900 dark:text-white text-sm">Add New Delivery Address</h4>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs font-bold text-gray-500 hover:text-gray-800 dark:hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Receiver Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Doe / Room 204"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white focus:outline-orange-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Complete Address</label>
                <textarea
                  required
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="House/Flat No., Building, Street, Landmark"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white focus:outline-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white focus:outline-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Pincode</label>
                  <input
                    type="text"
                    required
                    value={formData.pinCode}
                    onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white focus:outline-orange-500"
                  />
                </div>
              </div>

              {/* Address Type Selector */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Tag As</label>
                <div className="grid grid-cols-3 gap-2">
                  {["home", "work", "hostel"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, addressType: type })}
                      className={`py-1.5 rounded-xl text-xs font-bold capitalize border transition ${
                        formData.addressType === type
                          ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="makeDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="rounded text-orange-500 focus:ring-orange-400"
                />
                <label htmlFor="makeDefault" className="text-xs text-gray-600 dark:text-gray-300 cursor-pointer">
                  Set as default delivery address
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-orange-500/20"
              >
                Save Address & Select
              </button>
            </form>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-850 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition shadow-md shadow-orange-500/20"
          >
            Confirm Address
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddressSelectorModal;
