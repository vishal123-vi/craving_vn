import React, { useState } from "react";
import { FiMail, FiSearch, FiClock, FiCheckCircle } from "react-icons/fi";

const AdminMessages = () => {
  const [messages, setMessages] = useState([
    { id: 1, sender: "Tasty Bites Cafe", email: "tasty@bites.com", subject: "Request for cuisine category update", time: "10 mins ago", unread: true },
    { id: 2, sender: "Rohit Kumar", email: "rohit.kumar@example.com", subject: "Refund inquiry on order #CRV12338", time: "30 mins ago", unread: true },
    { id: 3, sender: "Vishal Tiwari (Rider)", email: "vishaltiwary78@gmail.com", subject: "Vehicle registration documents updated", time: "2 hours ago", unread: false },
    { id: 4, sender: "Pizza Palace", email: "support@pizzapalace.com", subject: "Holiday hours update confirmation", time: "1 day ago", unread: false },
  ]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Messages & Inquiries
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Customer support, partner queries, and platform communications
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
          {messages.filter(m => m.unread).length} Unread
        </span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {messages.map((m) => (
          <div key={m.id} className={`p-5 flex items-start justify-between gap-4 hover:bg-slate-50/80 transition-colors cursor-pointer ${m.unread ? "bg-blue-50/20" : ""}`}>
            <div className="flex items-start gap-3.5">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0 ${m.unread ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                <FiMail />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-900">{m.sender}</h4>
                  <span className="text-xs text-slate-400">({m.email})</span>
                  {m.unread && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                </div>
                <p className="text-xs text-slate-600 mt-1 font-medium">{m.subject}</p>
              </div>
            </div>
            <span className="text-xs text-slate-400 font-medium shrink-0">{m.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminMessages;
