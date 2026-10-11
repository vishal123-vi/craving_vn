import React from "react";
import { IoSearch } from "react-icons/io5";
import CarouselComponent from "../CarouselComponent";

const HeroSection = ({ user, navigate, setViewMode, searchQuery, setSearchQuery, handleNavigateToDashboard }) => {
  return (
    <section className="relative text-(--color-primary-content) py-16 md:py-40 overflow-hidden">
      {/* Carousel Background */}
      <div className="absolute inset-0 z-0">
        <CarouselComponent />
      </div>

      {/* Dark Overlay for better text visibility */}
      <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none"></div>

      {/* Hero Content */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pointer-events-none">
        {/* Delivery Location Pill & Promotional Highlights */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6 pointer-events-auto">
          <div className="inline-flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold border border-white/20 text-white shadow-lg">
            <span className="text-orange-400">📍 Delivering to:</span>
            <span>Bhopal, Madhya Pradesh</span>
          </div>
          <div className="inline-flex items-center gap-1.5 bg-orange-500/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-black text-white shadow-lg shadow-orange-500/20 uppercase tracking-wider">
            <span>⚡ Free Delivery over ₹300</span>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight drop-shadow-md">
            Your Favorite Food,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
              Delivered Superfast 🛵
            </span>
          </h1>
          <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto drop-shadow-sm font-medium">
            Explore authentic cuisines, top-rated restaurants, and craving-satisfying meals delivered hot to your doorstep.
          </p>
          <div className="flex gap-4 justify-center pointer-events-auto">
            {!user ? (
              <button
                onClick={() => navigate("/register/customer")}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3.5 rounded-2xl font-bold shadow-xl shadow-orange-500/30 transition transform hover:-translate-y-0.5"
              >
                Sign Up Now
              </button>
            ) : (
              <button
                onClick={handleNavigateToDashboard}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3.5 rounded-2xl font-bold shadow-xl shadow-orange-500/30 transition transform hover:-translate-y-0.5"
              >
                Customer Dashboard
              </button>
            )}
            <button
              onClick={() => {
                setViewMode("restaurants");
                document.getElementById("restaurants-section")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="bg-white/95 text-gray-900 px-8 py-3.5 rounded-2xl font-bold hover:bg-white shadow-xl transition transform hover:-translate-y-0.5"
            >
              Explore Restaurants
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-2xl px-5 py-4 max-w-3xl mx-auto pointer-events-auto shadow-2xl border border-white/40 dark:border-gray-700">
          <IoSearch className="text-orange-500 text-2xl mr-3 shrink-0" />
          <input
            type="text"
            placeholder="Search by restaurant name, cuisine (Biryani, Pizza, Rolls), or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent w-full outline-none text-gray-900 dark:text-white placeholder-gray-400 font-medium text-base"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs font-bold text-gray-400 hover:text-gray-700 ml-2"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
