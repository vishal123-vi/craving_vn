import React, { useState } from "react";
import { FiStar } from "react-icons/fi";
import { FaStar } from "react-icons/fa";

const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([
    { id: 1, user: "Priya Singh", restaurant: "Pizza Palace", rating: 5, comment: "Amazing hot pizza delivered in 20 minutes! Super fast delivery by the rider.", time: "1 hour ago" },
    { id: 2, user: "Rahul Sharma", restaurant: "Burger Hub", rating: 4, comment: "Burgers were fresh and crispy. Packaging was top-notch.", time: "3 hours ago" },
    { id: 3, user: "Aman Verma", restaurant: "Spice Junction", rating: 5, comment: "Authentic Indian cuisine flavors. Very satisfying dinner.", time: "Yesterday" },
    { id: 4, user: "Neha Gupta", restaurant: "Healthy Bites", rating: 5, comment: "Fresh salad bowl with organic ingredients. Will order again!", time: "2 days ago" },
  ]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Customer Feedback & Reviews
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Monitor restaurant ratings and customer satisfaction scores
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
          <FaStar className="text-amber-500" />
          <span>4.8 Platform Rating</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {feedbacks.map((f) => (
          <div key={f.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-900">{f.user}</h4>
                <p className="text-xs text-slate-400 font-medium">Ordered from: {f.restaurant}</p>
              </div>
              <div className="flex items-center gap-1 text-amber-500 text-sm">
                {[...Array(f.rating)].map((_, i) => (
                  <FaStar key={i} />
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              "{f.comment}"
            </p>
            <span className="text-[11px] text-slate-400 block pt-2 border-t border-slate-50">
              {f.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminFeedback;
