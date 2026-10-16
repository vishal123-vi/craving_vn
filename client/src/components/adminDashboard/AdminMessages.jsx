import React, { useState, useEffect } from "react";
import { 
  FiMail, 
  FiSearch, 
  FiClock, 
  FiCheckCircle, 
  FiUser, 
  FiPhone, 
  FiAlertCircle, 
  FiChevronLeft, 
  FiChevronRight, 
  FiRefreshCw, 
  FiX 
} from "react-icons/fi";
import api from "../../config/ApiConfig";

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Debounce search input by 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/admin/messages", {
        params: {
          page,
          limit: 10,
          search: debouncedSearch || undefined,
        },
      });

      if (res.data?.success) {
        setMessages(res.data.data || []);
        setTotal(res.data.pagination?.total || 0);
        setTotalPages(res.data.pagination?.totalPages || 1);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error("Admin fetch messages error:", err);
      setError(err.response?.data?.message || "Failed to load messages. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [page, debouncedSearch]);

  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Messages & Inquiries
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Customer support, partner queries, and platform communications
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchMessages()}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Refresh messages"
          >
            <FiRefreshCw className={`text-sm ${loading ? "animate-spin" : ""}`} />
          </button>
          <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
            {total} Total Inquiries
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by sender, email, subject, phone, or message..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
            >
              <FiX />
            </button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between text-xs text-red-700">
          <div className="flex items-center gap-2">
            <FiAlertCircle className="text-base shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchMessages()}
            className="px-3 py-1 bg-red-100 hover:bg-red-200 rounded-lg font-bold transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Content Area */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs divide-y divide-slate-100 p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
          <p className="text-xs font-medium text-slate-500">Loading messages from server...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-12 text-center space-y-3">
          <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto text-2xl">
            <FiMail />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No contact messages found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">
            {debouncedSearch
              ? `No messages matched "${debouncedSearch}". Try clearing your search filter.`
              : "No customer contact inquiries have been submitted yet."}
          </p>
          {debouncedSearch && (
            <button
              onClick={() => setSearchTerm("")}
              className="mt-2 px-4 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {messages.map((m) => (
            <div
              key={m._id}
              onClick={() => setSelectedMessage(m)}
              className="p-5 flex items-start justify-between gap-4 hover:bg-slate-50/80 transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0 bg-blue-50 text-blue-600 border border-blue-100">
                  <FiMail />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900 truncate">
                      {m.fullName}
                    </h4>
                    <span className="text-xs text-slate-400 truncate">
                      ({m.email})
                    </span>
                    {m.phone && (
                      <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {m.phone}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-800 mt-1">
                    {m.subject}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 font-normal">
                    {m.message}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs text-slate-400 font-medium block">
                  {formatDate(m.createdAt)}
                </span>
                <span className="text-[11px] text-blue-600 font-semibold mt-1 inline-block">
                  View Details →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-slate-100 shadow-xs text-xs font-medium text-slate-600">
          <div>
            Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, total)} of {total} messages
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`p-2 rounded-xl border border-slate-200 transition-colors ${
                page === 1
                  ? "opacity-40 cursor-not-allowed bg-slate-50"
                  : "hover:bg-slate-100 text-slate-800 cursor-pointer"
              }`}
            >
              <FiChevronLeft />
            </button>
            <span className="font-bold text-slate-900 px-2">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className={`p-2 rounded-xl border border-slate-200 transition-colors ${
                page >= totalPages
                  ? "opacity-40 cursor-not-allowed bg-slate-50"
                  : "hover:bg-slate-100 text-slate-800 cursor-pointer"
              }`}
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      )}

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div
          onClick={() => setSelectedMessage(null)}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-base">
                  <FiMail />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Contact Message Details
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Received on {formatDate(selectedMessage.createdAt)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-slate-400 hover:text-slate-700 text-base font-bold p-1 cursor-pointer"
              >
                <FiX />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl">
                <div>
                  <span className="text-slate-400 block text-[11px] font-semibold">Sender</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                    <FiUser className="text-slate-400" /> {selectedMessage.fullName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-semibold">Phone</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                    <FiPhone className="text-slate-400" />
                    <a href={`tel:${selectedMessage.phone}`} className="hover:underline">
                      {selectedMessage.phone}
                    </a>
                  </span>
                </div>
                <div className="col-span-2 pt-1 border-t border-slate-100">
                  <span className="text-slate-400 block text-[11px] font-semibold">Email</span>
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                    className="font-bold text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                  >
                    <FiMail className="text-blue-500" /> {selectedMessage.email}
                  </a>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] font-semibold uppercase tracking-wider mb-1">
                  Subject
                </span>
                <p className="font-bold text-slate-900 text-sm bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                  {selectedMessage.subject}
                </p>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] font-semibold uppercase tracking-wider mb-1">
                  Message Content
                </span>
                <div className="bg-slate-50 p-4 rounded-2xl text-slate-700 leading-relaxed whitespace-pre-wrap border border-slate-100 font-medium">
                  {selectedMessage.message}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <a
                href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                Reply via Email
              </a>
              <button
                onClick={() => setSelectedMessage(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMessages;
