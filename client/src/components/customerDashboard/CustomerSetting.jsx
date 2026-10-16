import React, { useState, useEffect } from "react";
import { MdEdit, MdOutlineLockReset, MdOutlineAddAPhoto } from "react-icons/md";
import { FaUser, FaEnvelope, FaPhoneAlt, FaCalendarAlt, FaMapMarkerAlt, FaCity, FaMap, FaHashtag } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import api from "../../config/ApiConfig";
import toast from "react-hot-toast";
import PasswordChangeModal from "../commonModals/PasswordChangeModal";
import runningLoader from "../../assets/runningLoader.gif";

const CustomerSetting = () => {
  const { user, setUser } = useAuth();
  const [editingProfile, setEditingProfile] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isPasswordChangeModalOpen, setIsPasswordChangeModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("personal");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    addresses: [],
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        dob: user.dob ? user.dob.split("T")[0] : "",
        gender: user.gender || "",
        addresses: user.addresses && user.addresses.length > 0 
          ? user.addresses 
          : [{ address: "", city: "", state: "", pincode: "", isDefault: true }],
      });
      if (user.photo?.url) {
        setProfilePicPreview(user.photo.url);
      }
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddressChange = (index, field, value) => {
    const newAddresses = [...formData.addresses];
    newAddresses[index][field] = value;
    setFormData({ ...formData, addresses: newAddresses });
  };

  const handleAddAddress = () => {
    setFormData({
      ...formData,
      addresses: [...formData.addresses, { address: "", city: "", state: "", pincode: "", isDefault: false }]
    });
  };

  const handleRemoveAddress = (index) => {
    const newAddresses = formData.addresses.filter((_, i) => i !== index);
    setFormData({ ...formData, addresses: newAddresses });
  };

  const handleDetectLocation = async (index) => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsDetectingLocation(true);
    const toastId = toast.loading("Detecting your location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Reverse geocoding using Nominatim (OpenStreetMap)
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
          const data = await res.json();
          
          if (data && data.address) {
            const newAddresses = [...formData.addresses];
            newAddresses[index] = {
              ...newAddresses[index],
              address: data.display_name || "",
              city: data.address.city || data.address.town || data.address.village || "",
              state: data.address.state || "",
              pincode: data.address.postcode || "",
            };
            setFormData({ ...formData, addresses: newAddresses });
            toast.success("Location detected successfully!", { id: toastId });
          } else {
            toast.error("Could not fetch address details", { id: toastId });
          }
        } catch (err) {
          console.error(err);
          toast.error("Failed to detect location", { id: toastId });
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        setIsDetectingLocation(false);
        toast.error("Please allow location access to use this feature", { id: toastId });
      },
      { timeout: 10000 }
    );
  };

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      const payload = new FormData();
      payload.append("fullName", formData.fullName);
      payload.append("email", formData.email.toLowerCase());
      payload.append("phone", formData.phone);
      if (formData.dob) payload.append("dob", formData.dob);
      if (formData.gender) payload.append("gender", formData.gender);
      
      const cleanedAddresses = (formData.addresses || [])
        .filter((a) => a && (a.address?.trim() || a.city?.trim() || a.pincode?.trim()))
        .map((a) => ({
          ...a,
          country: a.country || "India",
          city: a.city || "Bhopal",
          state: a.state || "Madhya Pradesh",
        }));
      payload.append("addresses", JSON.stringify(cleanedAddresses));

      if (profilePic) payload.append("displayPic", profilePic);

      const response = await api.put(`/common/edit-profile`, payload);

      setUser(response.data.data);
      sessionStorage.setItem("cravingUser", JSON.stringify(response.data.data));

      setEditingProfile(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelProfile = () => {
    setFormData({
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      dob: user?.dob ? user.dob.split("T")[0] : "",
      gender: user?.gender || "",
      addresses: user?.addresses && user.addresses.length > 0 
        ? user.addresses 
        : [{ address: "", city: "", state: "", pincode: "", isDefault: true }],
    });
    setProfilePicPreview(user?.photo?.url || null);
    setProfilePic(null);
    setEditingProfile(false);
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicPreview(URL.createObjectURL(file));
      setProfilePic(file);
    }
  };

  return (
    <>
      <div className="w-full max-w-5xl mx-auto py-4 px-4 sm:px-8 mb-20">
        <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-3xl border border-gray-100 dark:border-gray-700 relative">
          
          {/* Banner Image */}
          <div className="h-32 sm:h-48 w-full bg-gradient-to-r from-orange-400 via-rose-500 to-purple-600 relative overflow-hidden rounded-t-3xl">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            
            {/* Top Right Actions */}
            <div className="absolute top-4 right-4 z-20 flex flex-wrap gap-2">
              {!editingProfile ? (
                <>
                  <button
                    onClick={() => setEditingProfile(true)}
                    className="flex items-center gap-2 bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-xl text-sm font-bold shadow-lg transition-all"
                  >
                    <MdEdit className="text-lg text-(--color-primary)" /> Edit Profile
                  </button>
                  <button
                    onClick={() => setIsPasswordChangeModalOpen(true)}
                    className="flex items-center gap-2 bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-xl text-sm font-bold shadow-lg transition-all"
                  >
                    <MdOutlineLockReset className="text-lg text-(--color-primary)" /> Change Password
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleCancelProfile}
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm font-bold transition-all"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center gap-2 bg-white text-(--color-primary) px-6 py-2 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-70"
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Profile Header section */}
          <div className="px-6 sm:px-12 relative pb-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 sm:items-end -mt-12 sm:-mt-16 relative z-10 mb-4">
              
              {/* Avatar */}
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white dark:bg-gray-800 p-1.5 shadow-2xl shrink-0 group">
                <div className="w-full h-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden relative">
                  {profilePicPreview ? (
                    <img src={profilePicPreview} alt="Profile" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <FaUser size={40} className="opacity-30" />
                    </div>
                  )}
                  {editingProfile && (
                    <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white backdrop-blur-sm rounded-full">
                      <MdOutlineAddAPhoto className="text-3xl mb-1" />
                      <span className="text-sm font-bold">Update</span>
                      <input type="file" accept="image/*" onChange={handleProfilePicChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              {/* Title / Intro */}
              <div className="flex-1 pb-1 text-center sm:text-left">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  {user?.fullName || "Customer Profile"}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium text-sm">Manage your personal information and settings</p>
              </div>
            </div>
            
            {/* Tabs Navigation */}
            <div className="flex gap-4 mt-4 border-t border-gray-100 dark:border-gray-700 pt-4 overflow-x-auto pb-2 scrollbar-hide">
              <button
                type="button"
                onClick={() => setActiveSection("personal")}
                className={`flex-shrink-0 px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300 flex items-center gap-2 ${
                  activeSection === "personal" 
                    ? "bg-(--color-primary) text-white shadow-md shadow-orange-500/30" 
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                <FaUser size={14} /> Personal Info
              </button>
              <button
                type="button"
                onClick={() => setActiveSection("addresses")}
                className={`flex-shrink-0 px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300 flex items-center gap-2 ${
                  activeSection === "addresses" 
                    ? "bg-(--color-primary) text-white shadow-md shadow-orange-500/30" 
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                <FaMapMarkerAlt size={14} /> Delivery Addresses
                {formData.addresses.length > 0 && (
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${activeSection === "addresses" ? "bg-white/20" : "bg-gray-200 dark:bg-gray-700"}`}>
                    {formData.addresses.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-4 sm:p-8 space-y-8 pb-10">
            {activeSection === "personal" && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-(--color-primary) flex items-center justify-center">
                    <FaUser size={14} />
                  </span>
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="relative">
                    <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${editingProfile ? "text-(--color-primary)" : "text-gray-400"}`}>
                      <FaUser />
                    </div>
                    <input 
                      type="text" 
                      name="fullName" 
                      value={formData.fullName} 
                      onChange={handleProfileChange} 
                      disabled={!editingProfile}
                      placeholder="Full Name" 
                      className={`w-full pl-12 pr-4 py-3.5 rounded-xl outline-none transition-all font-bold shadow-sm border
                        ${editingProfile 
                          ? "bg-white dark:bg-gray-800 border-orange-200 dark:border-gray-600 focus:ring-2 focus:ring-(--color-primary) text-gray-800 dark:text-gray-100" 
                          : "bg-gray-50 dark:bg-gray-900 border-transparent text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        }
                      `} 
                    />
                  </div>

                  {/* Email */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <FaEnvelope />
                    </div>
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleProfileChange} 
                      disabled 
                      placeholder="Email Address" 
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900 border border-transparent rounded-xl outline-none font-bold text-gray-500 dark:text-gray-400 shadow-sm cursor-not-allowed" 
                    />
                  </div>

                  {/* Phone */}
                  <div className="relative">
                    <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${editingProfile ? "text-(--color-primary)" : "text-gray-400"}`}>
                      <FaPhoneAlt />
                    </div>
                    <input 
                      type="tel" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleProfileChange} 
                      disabled={!editingProfile}
                      placeholder="Phone Number" 
                      className={`w-full pl-12 pr-4 py-3.5 rounded-xl outline-none transition-all font-bold shadow-sm border
                        ${editingProfile 
                          ? "bg-white dark:bg-gray-800 border-orange-200 dark:border-gray-600 focus:ring-2 focus:ring-(--color-primary) text-gray-800 dark:text-gray-100" 
                          : "bg-gray-50 dark:bg-gray-900 border-transparent text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        }
                      `} 
                    />
                  </div>

                  {/* DOB */}
                  <div className="relative">
                    <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${editingProfile ? "text-(--color-primary)" : "text-gray-400"}`}>
                      <FaCalendarAlt />
                    </div>
                    <input 
                      type="date" 
                      name="dob" 
                      value={formData.dob} 
                      onChange={handleProfileChange} 
                      disabled={!editingProfile}
                      className={`w-full pl-12 pr-4 py-3.5 rounded-xl outline-none transition-all font-bold shadow-sm border
                        ${editingProfile 
                          ? "bg-white dark:bg-gray-800 border-orange-200 dark:border-gray-600 focus:ring-2 focus:ring-(--color-primary) text-gray-800 dark:text-gray-100" 
                          : "bg-gray-50 dark:bg-gray-900 border-transparent text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        }
                      `} 
                    />
                  </div>

                  {/* Gender */}
                  <div className={`md:col-span-2 rounded-xl p-4 shadow-sm border ${editingProfile ? "bg-white dark:bg-gray-800 border-orange-200 dark:border-gray-600" : "bg-gray-50 dark:bg-gray-900 border-transparent"} flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8`}>
                    <span className={`text-sm font-bold ${editingProfile ? "text-(--color-primary)" : "text-gray-500"}`}>Gender</span>
                    <div className="flex gap-6">
                      <label className={`flex items-center gap-2 ${editingProfile ? "cursor-pointer" : "cursor-not-allowed"}`}>
                        <input type="radio" name="gender" value="male" checked={formData.gender === "male"} onChange={handleProfileChange} disabled={!editingProfile} className="text-(--color-primary) focus:ring-(--color-primary) w-4 h-4" />
                        <span className={`font-bold ${editingProfile ? "text-gray-700 dark:text-gray-300" : "text-gray-500"}`}>Male</span>
                      </label>
                      <label className={`flex items-center gap-2 ${editingProfile ? "cursor-pointer" : "cursor-not-allowed"}`}>
                        <input type="radio" name="gender" value="female" checked={formData.gender === "female"} onChange={handleProfileChange} disabled={!editingProfile} className="text-(--color-primary) focus:ring-(--color-primary) w-4 h-4" />
                        <span className={`font-bold ${editingProfile ? "text-gray-700 dark:text-gray-300" : "text-gray-500"}`}>Female</span>
                      </label>
                      <label className={`flex items-center gap-2 ${editingProfile ? "cursor-pointer" : "cursor-not-allowed"}`}>
                        <input type="radio" name="gender" value="other" checked={formData.gender === "other"} onChange={handleProfileChange} disabled={!editingProfile} className="text-(--color-primary) focus:ring-(--color-primary) w-4 h-4" />
                        <span className={`font-bold ${editingProfile ? "text-gray-700 dark:text-gray-300" : "text-gray-500"}`}>Other</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Addresses Section */}
            {activeSection === "addresses" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-(--color-primary) flex items-center justify-center">
                      <FaMapMarkerAlt size={14} />
                    </span>
                    Delivery Addresses
                  </h3>
                  {editingProfile && (
                    <button 
                      type="button" 
                      onClick={handleAddAddress}
                      className="text-sm bg-orange-50 dark:bg-orange-900/20 text-(--color-primary) border border-orange-200 dark:border-orange-800 px-4 py-2 rounded-xl font-bold hover:bg-orange-100 transition-colors shadow-sm"
                    >
                      + Add Address
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  {formData.addresses.map((addr, index) => (
                    <div key={index} className={`bg-white dark:bg-gray-800 border ${editingProfile ? "border-orange-200 dark:border-gray-600" : "border-gray-200 dark:border-gray-700"} p-6 rounded-2xl shadow-sm relative group`}>
                      
                      {editingProfile && formData.addresses.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => handleRemoveAddress(index)}
                          className="absolute top-6 right-6 text-red-400 hover:text-red-600 font-bold text-sm px-3 py-1 bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Remove
                        </button>
                      )}
                      
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 font-bold text-sm">
                          {index + 1}
                        </div>
                        <h4 className="font-extrabold text-gray-700 dark:text-gray-200">
                          Location {addr.isDefault ? <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-wider">Default</span> : ""}
                        </h4>
                        {editingProfile && (
                          <button
                            type="button"
                            onClick={() => handleDetectLocation(index)}
                            disabled={isDetectingLocation}
                            className="ml-auto flex items-center gap-1.5 text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 hover:bg-orange-100 dark:hover:bg-orange-500/20 px-3 py-1.5 rounded-lg border border-orange-200 dark:border-orange-500/20 transition-colors"
                          >
                            <FaMapMarkerAlt />
                            {isDetectingLocation ? "Detecting..." : "Detect Location"}
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Address Line */}
                        <div className="md:col-span-2 relative">
                          <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${editingProfile ? "text-(--color-primary)" : "text-gray-400"}`}>
                            <FaMap />
                          </div>
                          <input 
                            type="text" 
                            value={addr.address} 
                            onChange={(e) => handleAddressChange(index, "address", e.target.value)} 
                            disabled={!editingProfile}
                            required 
                            placeholder="Street Address / Apartment / Area" 
                            className={`w-full pl-12 pr-4 py-3 rounded-xl outline-none transition-all font-bold shadow-sm border
                              ${editingProfile 
                                ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-(--color-primary) text-gray-800 dark:text-gray-100" 
                                : "bg-gray-50 dark:bg-gray-900 border-transparent text-gray-500 dark:text-gray-400 cursor-not-allowed"
                              }
                            `} 
                          />
                        </div>

                        {/* City */}
                        <div className="relative">
                          <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${editingProfile ? "text-(--color-primary)" : "text-gray-400"}`}>
                            <FaCity />
                          </div>
                          <input 
                            type="text" 
                            value={addr.city} 
                            onChange={(e) => handleAddressChange(index, "city", e.target.value)} 
                            disabled={!editingProfile}
                            required 
                            placeholder="City" 
                            className={`w-full pl-12 pr-4 py-3 rounded-xl outline-none transition-all font-bold shadow-sm border
                              ${editingProfile 
                                ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-(--color-primary) text-gray-800 dark:text-gray-100" 
                                : "bg-gray-50 dark:bg-gray-900 border-transparent text-gray-500 dark:text-gray-400 cursor-not-allowed"
                              }
                            `} 
                          />
                        </div>

                        {/* State */}
                        <div className="relative">
                          <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${editingProfile ? "text-(--color-primary)" : "text-gray-400"}`}>
                            <FaMapMarkerAlt />
                          </div>
                          <input 
                            type="text" 
                            value={addr.state} 
                            onChange={(e) => handleAddressChange(index, "state", e.target.value)} 
                            disabled={!editingProfile}
                            required 
                            placeholder="State" 
                            className={`w-full pl-12 pr-4 py-3 rounded-xl outline-none transition-all font-bold shadow-sm border
                              ${editingProfile 
                                ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-(--color-primary) text-gray-800 dark:text-gray-100" 
                                : "bg-gray-50 dark:bg-gray-900 border-transparent text-gray-500 dark:text-gray-400 cursor-not-allowed"
                              }
                            `} 
                          />
                        </div>

                        {/* Pincode */}
                        <div className="relative md:col-span-2 sm:w-1/2">
                          <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${editingProfile ? "text-(--color-primary)" : "text-gray-400"}`}>
                            <FaHashtag />
                          </div>
                          <input 
                            type="text" 
                            value={addr.pincode} 
                            onChange={(e) => handleAddressChange(index, "pincode", e.target.value)} 
                            disabled={!editingProfile}
                            required 
                            placeholder="Pincode" 
                            className={`w-full pl-12 pr-4 py-3 rounded-xl outline-none transition-all font-bold shadow-sm border
                              ${editingProfile 
                                ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-(--color-primary) text-gray-800 dark:text-gray-100" 
                                : "bg-gray-50 dark:bg-gray-900 border-transparent text-gray-500 dark:text-gray-400 cursor-not-allowed"
                              }
                            `} 
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Mobile Actions */}
            {editingProfile && (
              <div className="sm:hidden pt-4 pb-8">
                <button 
                  onClick={handleSaveProfile} 
                  disabled={isLoading} 
                  className="w-full bg-gradient-to-r from-(--color-primary) to-orange-500 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transform hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:transform-none flex justify-center items-center gap-2"
                >
                  {isLoading ? <img src={runningLoader} alt="Loading..." className="w-5 h-5 object-contain" /> : null}
                  {isLoading ? "Saving Profile..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isPasswordChangeModalOpen && (
        <PasswordChangeModal
          open={isPasswordChangeModalOpen}
          onClose={() => setIsPasswordChangeModalOpen(false)}
        />
      )}
    </>
  );
};

export default CustomerSetting;
