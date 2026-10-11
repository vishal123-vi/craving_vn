import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../config/ApiConfig";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import NoDataFound from "../components/NoDataFound";
import NoDataFoundGif from "../assets/NoDataFound.gif";
import { IoArrowBack, IoStar, IoLocationOutline, IoTimeOutline, IoCartOutline, IoSearch } from "react-icons/io5";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const RestaurantDetailsPage = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [restaurantDetails, setRestaurantDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [menuSearch, setMenuSearch] = useState("");
  const [dietFilter, setDietFilter] = useState("all"); // 'all', 'veg', 'nonveg'
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { cart, getCartQuantity, handleAddToCart, handleRemoveFromCart, totalItems, totalAmount } = useCart();

  const fetchRestaurantDetails = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/public/restaurant-detail/${restaurantId}`);
      setRestaurantDetails(response.data.data);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unknown error occurred during fetching restaurant details. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurantDetails();
  }, [restaurantId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F6F4EB]">
        <img src={NoDataFoundGif} alt="Loading..." className="w-40 h-40 object-contain drop-shadow-md" />
        <h2 className="mt-4 text-2xl font-extrabold text-[#c2410c] animate-pulse">Loading Menu...</h2>
      </div>
    );
  }

  if (!restaurantDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <NoDataFound height="auto" width="100%" text="Restaurant Not Found" />
        <button 
          onClick={() => navigate("/order-now")} 
          className="mt-6 bg-[#c2410c] text-white px-6 py-2 rounded-lg shadow font-bold"
        >
          Back to Restaurants
        </button>
      </div>
    );
  }

  const restaurant = restaurantDetails.restaurantId;
  const rawMenuItems = restaurantDetails.menuItems || [];

  // Extract unique categories from menu items
  const menuCategories = ["all", ...new Set(rawMenuItems.map((item) => item.category).filter(Boolean))];

  // Filter items based on in-menu search, diet filter, and category
  const filteredMenuItems = rawMenuItems.filter((item) => {
    const matchesSearch = item.itemName.toLowerCase().includes(menuSearch.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(menuSearch.toLowerCase()));

    const isVeg = item.type?.toLowerCase() === "vegetarian" || item.type?.toLowerCase() === "veg";
    const matchesDiet = dietFilter === "all" ? true : dietFilter === "veg" ? isVeg : !isVeg;

    const matchesCategory = selectedCategory === "all" ? true : item.category === selectedCategory;

    return matchesSearch && matchesDiet && matchesCategory;
  });
  
  const defaultRestaurantImage = "https://placehold.co/800x400?text=Restaurant";
  const restaurantImage = restaurant?.coverImage?.url || restaurant?.restaurantImage?.[0]?.url || defaultRestaurantImage;

  return (
    <div className="min-h-screen bg-[#F6F4EB] pb-24 font-sans relative">
      {/* Header section with restaurant details and offer pill */}
      <div className="bg-[#FAF7F2] shadow-md relative z-10">
        <div className="max-w-5xl mx-auto px-4 py-6 md:py-8">
          {/* Back button */}
          <button 
            onClick={() => navigate("/order-now")} 
            className="flex items-center text-[#c2410c] font-bold mb-6 hover:opacity-80 transition"
          >
            <IoArrowBack className="mr-2" size={20} />
            Back to Restaurants
          </button>

          {/* Restaurant Info Card */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-full md:w-72 h-48 rounded-xl overflow-hidden shadow-sm shrink-0 border border-gray-100">
              <img 
                src={restaurantImage} 
                alt={restaurant?.restaurantName} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col flex-1 pt-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-3xl font-extrabold text-gray-900">
                  {restaurant?.restaurantName}
                </h1>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Open
                </span>
              </div>
              <div className="flex items-center gap-1 mb-2">
                <IoStar className="text-yellow-500" />
                <span className="font-bold text-gray-800">{restaurant?.rating?.toFixed(1) || "4.5"}</span>
                <span className="text-gray-600 text-sm ml-1 font-medium">
                  ({restaurant?.numReviews || 12} reviews)
                </span>
                <span className="mx-2 text-gray-300">•</span>
                <span className="text-orange-600 font-bold text-xs">⏱️ 25-35 mins</span>
              </div>
              <p className="text-gray-600 mb-3 capitalize font-medium text-sm">
                {restaurant?.cuisineTypes?.join(", ") || "Various Cuisines"}
              </p>
              
              <div className="flex items-start gap-2 text-gray-600 mb-1 text-sm font-medium">
                <IoLocationOutline className="mt-0.5 shrink-0 text-orange-500" size={16} />
                <span>{restaurant?.address}, {restaurant?.city}</span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
                <IoTimeOutline size={16} className="text-orange-500" />
                <span>
                  {restaurant?.servingHours?.openingTime || "10:00"} - {restaurant?.servingHours?.closingTime || "23:00"}
                </span>
              </div>
            </div>
          </div>

          {/* Offer Banner */}
          <div className="mt-6 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-3.5 text-white shadow-md flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🏷️</span>
              <div>
                <span className="font-black text-sm block">Special Offer Available!</span>
                <span className="text-xs text-white/90">Get free delivery on orders above ₹300 automatically applied at checkout</span>
              </div>
            </div>
            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-mono font-bold tracking-wider uppercase shrink-0">
              CRAVINGSFREE
            </span>
          </div>
        </div>
      </div>

      {/* Menu Filter and Search Bar */}
      <div className="sticky top-16 z-20 bg-[#F6F4EB]/95 backdrop-blur-md py-4 border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search in menu..."
              value={menuSearch}
              onChange={(e) => setMenuSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-white border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-orange-500 shadow-xs"
            />
          </div>

          {/* Veg / Non-Veg Toggle Filter */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-gray-200 self-stretch sm:self-auto justify-center">
            <button
              onClick={() => setDietFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                dietFilter === "all" ? "bg-orange-500 text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setDietFilter("veg")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                dietFilter === "veg" ? "bg-green-600 text-white shadow-sm" : "text-green-700 hover:text-green-800"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-green-500 border border-white"></span>
              Veg Only
            </button>
            <button
              onClick={() => setDietFilter("nonveg")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                dietFilter === "nonveg" ? "bg-red-600 text-white shadow-sm" : "text-red-700 hover:text-red-800"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-500 border border-white"></span>
              Non-Veg
            </button>
          </div>
        </div>

        {/* Category Tabs if present */}
        {menuCategories.length > 2 && (
          <div className="max-w-5xl mx-auto px-4 mt-3 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {menuCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1 rounded-full text-xs font-bold capitalize whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? "bg-[#c2410c] text-white shadow-xs"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Menu Section */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Menu ({filteredMenuItems.length} dishes)
          </h2>
          {(menuSearch || dietFilter !== "all" || selectedCategory !== "all") && (
            <button
              onClick={() => {
                setMenuSearch("");
                setDietFilter("all");
                setSelectedCategory("all");
              }}
              className="text-xs font-bold text-orange-600 hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
        
        {filteredMenuItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-8">
            <p className="text-gray-500 font-bold mb-2">No menu items match your search or filters.</p>
            <button
              onClick={() => {
                setMenuSearch("");
                setDietFilter("all");
                setSelectedCategory("all");
              }}
              className="mt-2 text-xs font-bold bg-orange-500 text-white px-4 py-2 rounded-xl shadow"
            >
              Show All Dishes
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredMenuItems.map((item) => {
              const qty = getCartQuantity(item._id);
              const isVeg = item.type?.toLowerCase() === "vegetarian" || item.type?.toLowerCase() === "veg";
              const itemImage = item.image?.url || "https://placehold.co/150x150?text=Food";

              return (
                <div key={item._id} className="bg-white rounded-xl p-3 sm:p-4 shadow-md flex gap-3 sm:gap-4 transition-transform hover:-translate-y-0.5 hover:shadow-lg">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                    <img 
                      src={itemImage} 
                      alt={item.itemName}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                    <div>
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
                        <h3 className="font-bold text-base sm:text-lg text-gray-900 truncate max-w-full">{item.itemName}</h3>
                        <span className={`text-[9px] sm:text-[10px] uppercase font-bold px-1.5 sm:px-2 py-0.5 rounded-full shrink-0 ${
                          isVeg ? 'bg-green-600 text-white' : 'bg-red-500 text-white'
                        }`}>
                          {isVeg ? 'veg' : 'non-veg'}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 md:line-clamp-3 font-medium pr-2 sm:pr-4">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col justify-between items-end min-w-17.5 sm:min-w-20 py-1 shrink-0">
                    <span className="font-bold text-base sm:text-lg text-[#c2410c]">₹{item.price}</span>
                    
                    {qty === 0 ? (
                      <button 
                        onClick={() => handleAddToCart({...item, restaurantId: restaurant._id})}
                        className="bg-[#c2410c] text-white px-3 sm:px-5 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-bold shadow hover:bg-[#a3360a] transition flex items-center justify-center min-w-15 sm:min-w-18"
                      >
                        + Add
                      </button>
                    ) : (
                      <div className="flex items-center bg-[#F6F4EB] rounded-md border border-gray-200 overflow-hidden shadow-sm h-7 sm:h-8">
                        <button 
                          onClick={() => handleRemoveFromCart({...item, restaurantId: restaurant._id}, false)}
                          className="px-2 sm:px-3 py-1 text-[#c2410c] hover:bg-gray-200 transition font-bold flex items-center justify-center h-full"
                        >
                          −
                        </button>
                        <span className="px-1 sm:px-2 font-bold text-gray-800 min-w-5 text-center text-xs sm:text-sm">
                          {qty}
                        </span>
                        <button 
                          onClick={() => handleAddToCart({...item, restaurantId: restaurant._id})}
                          className="px-2 sm:px-3 py-1 text-[#c2410c] hover:bg-gray-200 transition font-bold flex items-center justify-center h-full"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sticky Cart Footer is removed because Navbar has global cart */}
    </div>
  );
};

export default RestaurantDetailsPage;
