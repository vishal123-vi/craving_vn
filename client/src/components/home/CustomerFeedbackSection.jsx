import React from "react";
import { IoStar } from "react-icons/io5";

const CustomerFeedbackSection = () => {
  return (
    <section className="bg-white py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-(--color-content) mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-(--color-base-content)">
            Real feedback from real food lovers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Review Card 1 */}
          <div className="bg-(--color-base-100) rounded-lg p-8 shadow-md hover:shadow-lg transition">
            <div className="flex items-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <IoStar key={i} size={20} className="text-yellow-400" />
              ))}
            </div>
            <h3 className="text-lg font-semibold text-(--color-content) mb-2">
              Amazing Service!
            </h3>
            <p className="text-(--color-base-content) mb-4">
              "The food arrived hot and fresh. The delivery was incredibly
              fast. Highly impressed with Cravings' service!"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-(--color-primary) flex items-center justify-center text-white font-bold">
                AJ
              </div>
              <div>
                <p className="font-semibold text-(--color-content)">
                  Arun J.
                </p>
                <p className="text-sm text-(--color-base-content)">
                  Verified Buyer
                </p>
              </div>
            </div>
          </div>

          {/* Review Card 2 */}
          <div className="bg-(--color-base-100) rounded-lg p-8 shadow-md hover:shadow-lg transition">
            <div className="flex items-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <IoStar key={i} size={20} className="text-yellow-400" />
              ))}
            </div>
            <h3 className="text-lg font-semibold text-(--color-content) mb-2">
              Best App Ever!
            </h3>
            <p className="text-(--color-base-content) mb-4">
              "Easy to use interface, wide variety of restaurants, and quick
              delivery. I order from Cravings every week!"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-(--color-accent) flex items-center justify-center text-white font-bold">
                SP
              </div>
              <div>
                <p className="font-semibold text-(--color-content)">
                  Sneha P.
                </p>
                <p className="text-sm text-(--color-base-content)">
                  Verified Buyer
                </p>
              </div>
            </div>
          </div>

          {/* Review Card 3 */}
          <div className="bg-(--color-base-100) rounded-lg p-8 shadow-md hover:shadow-lg transition">
            <div className="flex items-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <IoStar key={i} size={20} className="text-yellow-400" />
              ))}
            </div>
            <h3 className="text-lg font-semibold text-(--color-content) mb-2">
              Excellent Choices
            </h3>
            <p className="text-(--color-base-content) mb-4">
              "Love the variety of restaurants available. Found my new
              favorite spot through Cravings. Definitely worth it!"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-(--color-primary) flex items-center justify-center text-white font-bold">
                RS
              </div>
              <div>
                <p className="font-semibold text-(--color-content)">
                  Rahul Sharma
                </p>
                <p className="text-sm text-(--color-base-content)">
                  Verified Buyer
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerFeedbackSection;
