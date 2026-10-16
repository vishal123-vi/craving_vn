import React, { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import { 
  FiStar, 
  FiSearch, 
  FiFilter, 
  FiRefreshCw, 
  FiAlertCircle, 
  FiChevronLeft, 
  FiChevronRight, 
  FiMessageSquare, 
  FiX, 
  FiUser, 
  FiMail 
} from "react-icons/fi";
import api from "../../config/ApiConfig";

const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [averageRating, setAverageRating] = useState(5.0);
  const [ratingFilter, setRatingFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input by 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/admin/feedback", {
        params: {
          page,
          limit: 10,
          rating: ratingFilter !== "all" ? ratingFilter : undefined,
          category: categoryFilter !== "all" ? categoryFilter : undefined,
          search: debouncedSearch || undefined,
        },
      });

      if (res.data?.success) {
        setFeedbacks(res.data.data || []);
        setTotal(res.data.pagination?.total || 0);
        setTotalPages(res.data.pagination?.totalPages || 1);
        if (typeof res.data.averageRating === "number") {
          setAverageRating(res.data.averageRating);
        }
      } else {
        setFeedbacks([]);
      }
    } catch (err) {
      console.error("Admin fetch feedback error:", err);
      setError(err.response?.data?.message || "Failed to load feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [page, ratingFilter, categoryFilter, debouncedSearch]);

  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const categories = [
    "all",
    "Food Quality",
    "Delivery",
    "App Experience",
    "Platform Quality",
    "Customer Support",
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Customer Feedback & Reviews
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Monitor restaurant ratings, customer comments, and platform satisfaction
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchFeedback()}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Refresh feedback"
          >
            <FiRefreshCw className={`text-sm ${loading ? "animate-spin" : ""}`} />
          </button>
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-50 text-amber-800 rounded-full text-xs font-bold border border-amber-200 shadow-2xs">
            <FaStar className="text-amber-500 text-sm" />
            <span>{averageRating.toFixed(1)} Platform Rating</span>
            <span className="text-amber-600/70 font-medium ml-1">({total})</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs space-y-3">
        {/* Rating Filter Tabs */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
              <FiFilter className="text-xs" /> Rating:
            </span>
            {[
              { id: "all", label: "All" },
              { id: "5", label: "5 ★" },
              { id: "4", label: "4 ★" },
              { id: "3", label: "3 ★" },
              { id: "2", label: "2 ★" },
              { id: "1", label: "1 ★" },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  setRatingFilter(r.id);
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  ratingFilter === r.id
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search user, email, comment..."
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
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
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between text-xs text-red-700">
          <div className="flex items-center gap-2">
            <FiAlertCircle className="text-base shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchFeedback()}
            className="px-3 py-1 bg-red-100 hover:bg-red-200 rounded-lg font-bold transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Feedback Grid */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mb-3"></div>
          <p className="text-xs font-medium text-slate-500">Loading customer feedback from database...</p>
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-12 text-center space-y-3">
          <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto text-2xl">
            <FiMessageSquare />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No customer feedback found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">
            {ratingFilter !== "all" || debouncedSearch
              ? "No feedback matched your active filters. Try adjusting rating or search terms."
              : "No customer feedback entries have been recorded yet."}
          </p>
          {(ratingFilter !== "all" || debouncedSearch) && (
            <button
              onClick={() => {
                setRatingFilter("all");
                setSearchTerm("");
              }}
              className="mt-2 px-4 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {feedbacks.map((f) => (
            <div
              key={f._id}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-3 hover:border-slate-200 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      {f.fullName}
                    </h4>
                    <span className="text-xs text-slate-400 font-medium">
                      {f.email}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-amber-400 text-xs shrink-0">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        className={star <= (f.rating || 5) ? "text-amber-400" : "text-slate-200"}
                      />
                    ))}
                  </div>
                </div>

                {f.category && (
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
                    {f.category}
                  </span>
                )}

                <p className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50/70 p-3 rounded-2xl border border-slate-100/80">
                  "{f.message}"
                </p>
              </div>

              <span className="text-[11px] text-slate-400 block pt-2 border-t border-slate-50">
                Submitted on {formatDate(f.createdAt)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-slate-100 shadow-xs text-xs font-medium text-slate-600">
          <div>
            Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, total)} of {total} reviews
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
    </div>
  );
};

export default AdminFeedback;
