import React, { useState, useEffect } from "react";
import api from "../../config/ApiConfig";
import toast from "react-hot-toast";
import {
  IoLocationOutline,
  IoAddOutline,
  IoTrashOutline,
  IoCheckmarkCircle,
  IoHomeOutline,
  IoBriefcaseOutline,
  IoBusinessOutline,
  IoNavigateOutline,
} from "react-icons/io5";

const CustomerAddresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);

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

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await api.get("/customer/profile");
      if (res.data?.success && res.data.data?.addressBook) {
        setAddresses(res.data.data.addressBook);
      }
    } catch (err) {
      console.error("Fetch addresses error:", err);
      toast.error("Failed to load address book.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleSetDefault = async (addressId) => {
    try {
      const res = await api.patch(`/customer/address/${addressId}/default`);
      if (res.data?.success) {
        toast.success("Default address updated! ⭐");
        setAddresses(res.data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update default address");
    }
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      const res = await api.delete(`/customer/address/${addressId}`);
      if (res.data?.success) {
        toast.success("Address removed.");
        setAddresses(res.data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete address");
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
        toast.success("GPS Location auto-filled! 📍");
      },
      () => {
        setDetectingGps(false);
        toast.error("GPS detection failed. Please enter address manually.");
      },
      { timeout: 8000 }
    );
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/customer/address", formData);
      if (res.data?.success) {
        toast.success("New address saved! 🏡");
        setAddresses(res.data.data);
        setShowModal(false);
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
      toast.error(err.response?.data?.message || "Failed to add address");
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case "work":
        return <IoBriefcaseOutline size={20} />;
      case "hostel":
        return <IoBusinessOutline size={20} />;
      default:
        return <IoHomeOutline size={20} />;
    }
  };

  return (
    <div className="h-full overflow-y-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Saved Addresses</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your delivery addresses and set your default location.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-orange-500/20 transition"
        >
          <IoAddOutline size={20} />
          <span>Add Address</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-8 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-4">
            <IoLocationOutline size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">No Saved Addresses Yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
            Save your home, hostel, or campus address for lightning-fast checkout.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl shadow"
          >
            Add New Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr._id}
              className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                addr.isDefault
                  ? "bg-white dark:bg-gray-900 border-orange-500 shadow-md ring-2 ring-orange-500/20"
                  : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-orange-300"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 rounded-xl">
                      {getIconForType(addr.addressType)}
                    </div>
                    <span className="font-black text-gray-900 dark:text-white capitalize text-base">
                      {addr.addressType || "Address"}
                    </span>
                  </div>

                  {addr.isDefault ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300 border border-green-200">
                      <IoCheckmarkCircle size={14} />
                      Default
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSetDefault(addr._id)}
                      className="text-xs font-bold text-gray-400 hover:text-orange-600 transition"
                    >
                      Make Default
                    </button>
                  )}
                </div>

                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  <p className="font-bold text-gray-900 dark:text-white">{addr.name}</p>
                  <p className="line-clamp-2">{addr.address}</p>
                  <p className="text-xs text-gray-400">
                    {addr.city}, {addr.state} - {addr.pinCode}
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                <button
                  onClick={() => handleDelete(addr._id)}
                  className="text-gray-400 hover:text-red-500 transition p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-1 text-xs font-bold"
                  title="Delete address"
                >
                  <IoTrashOutline size={16} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Address Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div
            className="bg-white dark:bg-gray-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 mb-4">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Add New Address</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-800 dark:hover:text-white text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-3">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleDetectGps}
                  disabled={detectingGps}
                  className="flex items-center gap-1.5 text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/60 px-3 py-1.5 rounded-xl border border-orange-200 dark:border-orange-800"
                >
                  <IoNavigateOutline size={16} className={detectingGps ? "animate-spin" : ""} />
                  <span>{detectingGps ? "Locating..." : "Use Live GPS"}</span>
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Receiver Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 rounded-xl text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white focus:outline-orange-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Complete Address</label>
                <textarea
                  required
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Flat/House, Building, Street, Landmark"
                  className="w-full px-3 py-2 rounded-xl text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white focus:outline-orange-500"
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
                    className="w-full px-3 py-2 rounded-xl text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white focus:outline-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Pincode</label>
                  <input
                    type="text"
                    required
                    value={formData.pinCode}
                    onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white focus:outline-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Address Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {["home", "work", "hostel"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, addressType: type })}
                      className={`py-2 rounded-xl text-xs font-bold capitalize border transition ${
                        formData.addressType === type
                          ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                          : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="dashMakeDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="rounded text-orange-500 focus:ring-orange-400"
                />
                <label htmlFor="dashMakeDefault" className="text-xs text-gray-600 dark:text-gray-300 cursor-pointer">
                  Set as default delivery address
                </label>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-500/20"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerAddresses;
