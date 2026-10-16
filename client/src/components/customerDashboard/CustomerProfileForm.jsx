import React, { useState, useEffect } from "react";
import api from "../../config/ApiConfig";
import toast from "react-hot-toast";
import runningLoader from "../../assets/runningLoader.gif";
import { MdOutlineAddAPhoto } from "react-icons/md";
import { FaUser, FaEnvelope, FaPhoneAlt, FaCalendarAlt, FaMapMarkerAlt, FaCity, FaMap, FaHashtag } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

const CustomerProfileForm = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    addresses: [{ address: "", city: "", state: "", pincode: "", isDefault: true }],
    photo: null,
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
        photo: null,
      });
      if (user.photo?.url) {
        setPhotoPreview(user.photo.url);
      }
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, photo: file }));
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "photo" && formData[key]) {
          payload.append("displayPic", formData[key]); // Backend expects displayPic
        } else if (key === "addresses") {
          const cleanedAddresses = (formData.addresses || [])
            .filter((a) => a && (a.address?.trim() || a.city?.trim() || a.pincode?.trim()))
            .map((a) => ({
              ...a,
              country: a.country || "India",
              city: a.city || "Bhopal",
              state: a.state || "Madhya Pradesh",
            }));
          payload.append("addresses", JSON.stringify(cleanedAddresses));
        } else if (key !== "photo" && formData[key] !== null && formData[key] !== "") {
          payload.append(key, formData[key]);
        }
      });
      
      const response = await api.put("/common/edit-profile", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(response.data.message || "Profile updated successfully!");
      if (response.data.data?.photo?.url) {
        setPhotoPreview(response.data.data.photo.url);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-4 px-4 sm:px-8">
      <form onSubmit={handleUpdateProfile} className="bg-white dark:bg-gray-800 shadow-2xl rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700 relative">
        
        {/* Banner Image */}
        <div className="h-32 sm:h-48 w-full bg-gradient-to-r from-orange-400 via-rose-500 to-purple-600 relative overflow-hidden">
          {/* Decorative Pattern overlay */}
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>

        {/* Profile Header section (Avatar overlapping banner) */}
        <div className="px-6 sm:px-12 relative pb-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 sm:items-end -mt-12 sm:-mt-16 relative z-10 mb-4">
            
            {/* Avatar */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white dark:bg-gray-800 p-1.5 shadow-2xl shrink-0 group">
              <div className="w-full h-full rounded-full bg-gray-100 overflow-hidden relative">
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <FaUser size={40} className="opacity-30" />
                  </div>
                )}
                <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white backdrop-blur-sm rounded-full">
                  <MdOutlineAddAPhoto className="text-3xl mb-1" />
                  <span className="text-sm font-bold">Update</span>
                  <input type="file" accept="image/*" onChange={handleProfilePicChange} className="hidden" />
                </label>
              </div>
            </div>

            {/* Title / Intro */}
            <div className="flex-1 pb-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {formData.fullName || "Your Profile"}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium text-sm">Manage your personal settings and delivery preferences.</p>
            </div>

            {/* Top Save Button (Desktop only) */}
            <div className="hidden sm:block pb-2">
              <button type="submit" disabled={isLoading} className="bg-gradient-to-r from-(--color-primary) to-orange-500 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transform hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:transform-none flex items-center gap-2">
                {isLoading ? <img src={runningLoader} alt="Loading..." className="w-5 h-5 object-contain" /> : null}
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-8 space-y-8">
          
          {/* Basic Details Section */}
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
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <FaUser />
                </div>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleProfileChange} required placeholder="Full Name" className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-(--color-primary) focus:border-transparent outline-none transition-all font-medium text-gray-800 dark:text-gray-100 shadow-inner" />
              </div>

              {/* Email */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <FaEnvelope />
                </div>
                <input type="email" name="email" value={formData.email} onChange={handleProfileChange} required placeholder="Email Address" className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-(--color-primary) focus:border-transparent outline-none transition-all font-medium text-gray-800 dark:text-gray-100 shadow-inner" />
              </div>

              {/* Phone */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <FaPhoneAlt />
                </div>
                <input type="tel" name="phone" value={formData.phone} onChange={handleProfileChange} required placeholder="Phone Number" className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-(--color-primary) focus:border-transparent outline-none transition-all font-medium text-gray-800 dark:text-gray-100 shadow-inner" />
              </div>

              {/* DOB */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <FaCalendarAlt />
                </div>
                <input type="date" name="dob" value={formData.dob} onChange={handleProfileChange} className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-(--color-primary) focus:border-transparent outline-none transition-all font-medium text-gray-500 focus:text-gray-800 dark:text-gray-400 shadow-inner" />
              </div>

              {/* Gender */}
              <div className="md:col-span-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-inner flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                <span className="text-sm font-bold text-gray-500">Gender</span>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" name="gender" value="male" checked={formData.gender === "male"} onChange={handleProfileChange} className="text-(--color-primary) focus:ring-(--color-primary) w-4 h-4 cursor-pointer" />
                    <span className="text-gray-700 dark:text-gray-300 font-bold group-hover:text-(--color-primary) transition-colors">Male</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" name="gender" value="female" checked={formData.gender === "female"} onChange={handleProfileChange} className="text-(--color-primary) focus:ring-(--color-primary) w-4 h-4 cursor-pointer" />
                    <span className="text-gray-700 dark:text-gray-300 font-bold group-hover:text-(--color-primary) transition-colors">Female</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" name="gender" value="other" checked={formData.gender === "other"} onChange={handleProfileChange} className="text-(--color-primary) focus:ring-(--color-primary) w-4 h-4 cursor-pointer" />
                    <span className="text-gray-700 dark:text-gray-300 font-bold group-hover:text-(--color-primary) transition-colors">Other</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Addresses Section */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-(--color-primary) flex items-center justify-center">
                  <FaMapMarkerAlt size={14} />
                </span>
                Delivery Addresses
              </h3>
              <button 
                type="button" 
                onClick={handleAddAddress}
                className="text-sm bg-orange-50 dark:bg-orange-900/20 text-(--color-primary) border border-orange-200 dark:border-orange-800 px-4 py-2 rounded-xl font-bold hover:bg-orange-100 transition-colors shadow-sm"
              >
                + Add Address
              </button>
            </div>

            <div className="space-y-6">
              {formData.addresses.map((addr, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative group">
                  
                  {formData.addresses.length > 1 && (
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Address Line */}
                    <div className="md:col-span-2 relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                        <FaMap />
                      </div>
                      <input type="text" value={addr.address} onChange={(e) => handleAddressChange(index, "address", e.target.value)} required placeholder="Street Address / Apartment / Area" className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white focus:ring-2 focus:ring-(--color-primary) outline-none transition-all font-medium shadow-inner" />
                    </div>

                    {/* City */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                        <FaCity />
                      </div>
                      <input type="text" value={addr.city} onChange={(e) => handleAddressChange(index, "city", e.target.value)} required placeholder="City" className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white focus:ring-2 focus:ring-(--color-primary) outline-none transition-all font-medium shadow-inner" />
                    </div>

                    {/* State */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                        <FaMapMarkerAlt />
                      </div>
                      <input type="text" value={addr.state} onChange={(e) => handleAddressChange(index, "state", e.target.value)} required placeholder="State" className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white focus:ring-2 focus:ring-(--color-primary) outline-none transition-all font-medium shadow-inner" />
                    </div>

                    {/* Pincode */}
                    <div className="relative md:col-span-2 sm:w-1/2">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                        <FaHashtag />
                      </div>
                      <input type="text" value={addr.pincode} onChange={(e) => handleAddressChange(index, "pincode", e.target.value)} required placeholder="Pincode" className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white focus:ring-2 focus:ring-(--color-primary) outline-none transition-all font-medium shadow-inner" />
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* Bottom Save Button (Mobile) */}
          <div className="sm:hidden pt-4">
            <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-(--color-primary) to-orange-500 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transform hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:transform-none flex justify-center items-center gap-2">
              {isLoading ? <img src={runningLoader} alt="Loading..." className="w-5 h-5 object-contain" /> : null}
              {isLoading ? "Saving Profile..." : "Save Changes"}
            </button>
          </div>

        </div>
      </form>
    </div>
  );
};

export default CustomerProfileForm;
