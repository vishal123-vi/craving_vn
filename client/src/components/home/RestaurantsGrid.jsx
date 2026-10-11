import React from "react";
import { IoStar } from "react-icons/io5";
import CravingFeed from "../../components/CravingFeed";

const RestaurantsGrid = ({ 
  viewMode, 
  setViewMode, 
  loading, 
  filteredRestaurants, 
  navigate, 
  selectedCategory, 
  categories, 
  setSearchQuery, 
  setSelectedCategory 
}) => {
  return (
    <section id="restaurants-section" className="py-4 md:py-8 bg-linear-to-b from-(--color-primary) to-(--color-primary-content)">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* View Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl inline-flex shadow-inner">
            <button
              onClick={() => setViewMode("feed")}
              className={`px-6 py-2 rounded-lg font-bold transition-all ${
                viewMode === "feed" 
                  ? "bg-(--color-primary) text-white shadow-md" 
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              🔥 Craving Feed
            </button>
            <button
              onClick={() => setViewMode("restaurants")}
              className={`px-6 py-2 rounded-lg font-bold transition-all ${
                viewMode === "restaurants" 
                  ? "bg-(--color-primary) text-white shadow-md" 
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              🏢 Restaurants
            </button>
          </div>
        </div>

        {viewMode === "feed" ? (
          <div className="mb-16">
            <CravingFeed />
          </div>
        ) : (
          <div className="mb-12">
            {/* Results Header */}
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-(--color-primary-content) mb-2">
                {selectedCategory === "all"
                  ? "Featured Restaurants"
                  : `${categories.find((c) => c.id === selectedCategory)?.label} Options`}
              </h2>
              <p className="text-(--color-primary-content)/70">
                {filteredRestaurants.length} restaurant
                {filteredRestaurants.length !== 1 ? "s" : ""} available
              </p>
            </div>

            {/* Restaurants Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-(--color-primary)"></div>
                <p className="mt-4 text-(--color-base-content)">
                  Loading restaurants...
                </p>
              </div>
            ) : filteredRestaurants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRestaurants.map((restaurant) => (
                  <div
                    key={restaurant.id}
                    onClick={() => navigate(`/restaurant-details/${restaurant.id}`)}
                    className="flex flex-col bg-(--color-base-100) rounded-xl overflow-hidden shadow-md hover:shadow-xl transition cursor-pointer transform hover:scale-105"
                  >
                    {/* Restaurant Image */}
                    <div className="relative h-56 overflow-hidden bg-(--color-base-200) group">
                      <img
                        src={restaurant.image}
                        alt={restaurant.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      {/* Gradient overlay for better text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                      
                      {/* Available Now Badge */}
                      <div className="absolute top-3 left-3 bg-emerald-500 text-white px-3 py-1 rounded-full flex items-center gap-1.5 font-bold text-xs shadow-lg border border-emerald-400 z-10 uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                        Open Now
                      </div>

                      {/* Offers Badge */}
                      <div className="absolute top-3 right-3 bg-orange-600/90 backdrop-blur-md text-white px-2.5 py-1 rounded-full font-black text-xs shadow-lg z-10 flex items-center gap-1">
                        <span>🏷️ 20% OFF</span>
                      </div>

                      {/* City & Rating & ETA */}
                      <div className="absolute bottom-3 left-4 right-4 text-white z-10 flex justify-between items-end">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-xl leading-tight text-white drop-shadow-md">{restaurant.name}</span>
                          <span className="opacity-90 text-xs mt-0.5 text-gray-200">📍 {restaurant.city}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-white/95 text-gray-900 px-2.5 py-1 rounded-xl font-black text-xs shadow-md">
                          <IoStar className="text-amber-500" size={14} />
                          <span>{restaurant.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Restaurant Info */}
                    <div className="flex flex-col flex-1 p-5 bg-white dark:bg-gray-900 justify-between">
                      <div>
                        {/* Delivery ETA & Free Delivery pill */}
                        <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 pb-2 border-b border-gray-100 dark:border-gray-800">
                          <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                            <span>⏱️</span> 25-35 mins
                          </span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                            🚚 Free delivery &gt; ₹300
                          </span>
                        </div>

                        <p className="text-gray-600 dark:text-gray-300 text-xs mb-3 line-clamp-2 min-h-8">
                          {restaurant.description}
                        </p>

                        {/* Cuisines */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {restaurant.cuisines.split(",").map((cuisine, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-md capitalize font-bold"
                            >
                              {cuisine.trim()}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Footer Info */}
                      <div className="pt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/restaurant-details/${restaurant.id}`);
                          }}
                          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-orange-500/20 transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                        >
                          <span>Explore Menu</span>
                          <span>→</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-(--color-base-content) text-lg">
                  No restaurants found matching your criteria.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  className="mt-4 bg-(--color-primary) text-(--color-primary-content) px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default RestaurantsGrid;
