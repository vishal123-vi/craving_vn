import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { IoSearch, IoStar } from "react-icons/io5";
import {
  MdRestaurant,
  MdLocalDining,
  MdFastfood,
  MdCake,
  MdLunchDining,
} from "react-icons/md";
import CarouselComponent from "../components/CarouselComponent";
import CravingFeed from "../components/CravingFeed";
import { useAuth } from "../context/AuthContext";
import api from "../config/ApiConfig";

import HeroSection from "../components/home/HeroSection";
import RestaurantsGrid from "../components/home/RestaurantsGrid";
import StatisticsSection from "../components/home/StatisticsSection";
import CustomerFeedbackSection from "../components/home/CustomerFeedbackSection";
import CTASection from "../components/home/CTASection";

const Home = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const handleNavigateToDashboard = () => {
    if (role === "restaurant") {
      navigate("/restaurant-dashboard", { state: { activeTab: "overview" } });
    } else if (role === "rider") {
      navigate("/rider-dashboard", { state: { activeTab: "overview" } });
    } else if (role === "admin") {
      navigate("/admin-dashboard", { state: { activeTab: "overview" } });
    } else {
      navigate("/customer-dashboard", { state: { activeTab: "overview" } });
    }
  };

  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const selectedCategory = searchParams.get("category") || "all";

  const setSearchQuery = (value) => {
    setSearchParams((prev) => {
      if (value) prev.set("search", value);
      else prev.delete("search");
      return prev;
    });
  };

  const setSelectedCategory = (value) => {
    setSearchParams((prev) => {
      if (value && value !== "all") prev.set("category", value);
      else prev.delete("category");
      return prev;
    });
  };

  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("restaurants"); // 'feed' or 'restaurants'

  const categories = [
    { id: "all", label: "All", icon: MdRestaurant },
    { id: "veg", label: "Vegetarian", icon: MdLocalDining },
    { id: "nonveg", label: "Non-Veg", icon: MdFastfood },
    { id: "dessert", label: "Desserts", icon: MdCake },
    { id: "others", label: "Others", icon: MdLunchDining },
  ];

  // Load restaurants from API
  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        setLoading(true);
        const response = await api.get("/public/restaurants");

        // Map API response to match component's expected format
        const formattedRestaurants = response.data.data.map((restaurant) => ({
          id: restaurant._id,
          name: restaurant.restaurantName,
          description:
            restaurant.description ||
            `${restaurant.cuisineType} cuisine in ${restaurant.city}`,
          rating: restaurant.averageRating || 0,
          numReviews: restaurant.numReviews || 0,
          image:
            restaurant.coverImage?.url || restaurant.restaurantImage?.[0]?.url ||
            "https://placehold.co/300x200?text=Restaurant",
          cuisines: restaurant.cuisineTypes ? restaurant.cuisineTypes.join(", ") : "",
          geolocation: restaurant.geolocation,
          city: restaurant.city,
          address: restaurant.address,
          openingHours: restaurant.openingHours,
          closingHours: restaurant.closingHours,
        }));

        setRestaurants(formattedRestaurants);
        setFilteredRestaurants(formattedRestaurants);
      } catch (error) {
        console.error("Error loading restaurants:", error);
        // Fallback to empty state on error
        setRestaurants([]);
        setFilteredRestaurants([]);
      } finally {
        setLoading(false);
      }
    };

    loadRestaurants();
  }, []);

  // Filter restaurants based on search and category
  useEffect(() => {
    let filtered = restaurants;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.cuisines.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.city.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Filter by category (map to cuisine types)
    if (selectedCategory !== "all") {
      const categoryMap = {
        veg: "vegetarian",
        nonveg: "non-vegetarian",
        dessert: "desserts",
        others: "other",
      };

      const selectedCuisine = categoryMap[selectedCategory];
      if (selectedCuisine) {
        filtered = filtered.filter((r) =>
          r.cuisines.toLowerCase().includes(selectedCuisine),
        );
      }
    }

    setFilteredRestaurants(filtered);
  }, [searchQuery, selectedCategory, restaurants]);

  return (
    <div className="min-h-screen">
      <HeroSection
        user={user}
        navigate={navigate}
        setViewMode={setViewMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleNavigateToDashboard={handleNavigateToDashboard}
      />

      <RestaurantsGrid
        viewMode={viewMode}
        setViewMode={setViewMode}
        loading={loading}
        filteredRestaurants={filteredRestaurants}
        navigate={navigate}
        selectedCategory={selectedCategory}
        categories={categories}
        setSearchQuery={setSearchQuery}
        setSelectedCategory={setSelectedCategory}
      />

      <StatisticsSection />

      <CustomerFeedbackSection />

      <CTASection navigate={navigate} user={user} handleNavigateToDashboard={handleNavigateToDashboard} />
    </div>
  );
};

export default Home;
