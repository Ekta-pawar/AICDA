import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Calendar,
  Eye,
  Inbox,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { deleteEnquiry, getEnquiries } from "@/lib/enquiry-api";
import { DirectoryTableSkeleton } from "./DirectoryManagement";
import { Skeleton } from "@/components/ui/skeleton";

const isMembership = (value) => value === "MEMBERSHIP" || !value;
const requestTypeLabel = (value) => (isMembership(value) ? "Membership" : "General Enquiry");

function TypeBadge({ value }) {
  const membership = isMembership(value);
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        membership ? "bg-emerald-100 text-emerald-700" : "bg-sky-100 text-sky-700"
      }`}
    >
      {requestTypeLabel(value)}
    </span>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 rounded-[3px] border border-slate-200 bg-slate-50 p-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[3px] bg-sky-50 text-sky-700">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="truncate text-[13px] font-medium text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function EnquiryCardSkeleton() {
  return (
    <div className="rounded-[3px] border border-slate-300 p-2.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-5 w-20 shrink-0 rounded-full" />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-1">
            <Skeleton className="h-2.5 w-14" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

const PAGE_SIZE = 10;

export function EnquiryManagement() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState(null);

  const loadEnquiries = async ({ silent } = {}) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const result = await getEnquiries();
      setEnquiries(result.enquiries);
    } catch (requestError) {
      setError(requestError.message || "Could not load enquiries.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadEnquiries();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return enquiries.filter((entry) => {
      const matchesQuery =
        !query ||
        [entry.fullName, entry.mobile, entry.email, entry.companyName, entry.city, entry.state]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesType =
        typeFilter === "all" ||
        (typeFilter === "membership" && isMembership(entry.requestType)) ||
        (typeFilter === "general" && !isMembership(entry.requestType));

      return matchesQuery && matchesType;
    });
  }, [enquiries, search, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, typeFilter]);

  const performDelete = async (entry) => {
    const id = entry.id || entry._id;
    try {
      await deleteEnquiry(id);
      setEnquiries((prev) => prev.filter((item) => (item.id || item._id) !== id));
      toast.success(`Enquiry from ${entry.fullName || "this contact"} deleted.`);
    } catch (requestError) {
      const message = requestError.message || "Could not delete this enquiry.";
      setError(message);
      toast.error(message);
    }
  };

  const confirmDelete = (entry) => {
    toast(`Delete enquiry from ${entry.fullName || "this contact"}?`, {
      description: "This action cannot be undone.",
      action: {
        label: "Delete",
        onClick: () => performDelete(entry),
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  return (
    <section className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[3px] border border-slate-300 bg-white px-3 py-2">
        <div>
          <h2 className="text-lg font-bold">Enquiries</h2>
          <p className="text-[13px] text-slate-500">
            Membership requests and general enquiries submitted from the website.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-[3px] border border-sky-200 bg-sky-50 px-3 py-1.5 text-[13px] font-semibold text-sky-700">
            Total: {filtered.length}
          </span>
          <button
            type="button"
            onClick={() => loadEnquiries({ silent: true })}
            disabled={refreshing}
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-[3px] border border-slate-300 px-3 text-[13px] font-semibold text-slate-600 transition-colors hover:border-sky-300 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      <div className="rounded-[3px] border border-slate-300 bg-white p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-2 text-[13px] text-slate-600">
            Type:
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="h-8 rounded-[3px] border border-slate-300 px-2 text-[13px] outline-none transition-colors hover:border-slate-400 focus:border-sky-500"
            >
              <option value="all">All</option>
              <option value="membership">Membership</option>
              <option value="general">General Enquiry</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-[13px] text-slate-600">
            Search:
            <span className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Name, mobile, email, company…"
                className="h-8 w-full rounded-[3px] border border-slate-300 py-1 pl-7 pr-2 text-[13px] outline-none transition-colors hover:border-slate-400 focus:border-sky-500 sm:w-64"
              />
            </span>
          </label>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-3 rounded-[3px] bg-red-50 px-3 py-2 text-[13px] text-red-700"
          >
            {error}
          </p>
        )}

        {loading ? (
          <>
            <div className="mt-3 space-y-2 md:hidden">
              {Array.from({ length: 5 }).map((_, index) => (
                <EnquiryCardSkeleton key={index} />
              ))}
            </div>
            <DirectoryTableSkeleton columns={6} />
          </>
        ) : pageRows.length === 0 ? (
          <div className="mt-3 flex min-h-48 flex-col items-center justify-center rounded-[3px] border border-dashed border-slate-300">
            <Inbox className="h-9 w-9 text-slate-300" />
            <p className="mt-3 text-[13px] font-semibold text-slate-500">No enquiries found</p>
          </div>
        ) : (
          <>
            <div className="mt-3 space-y-2 md:hidden">
              {pageRows.map((entry) => {
                const id = entry.id || entry._id;
                return (
                  <div key={id} className="rounded-[3px] border border-slate-300 p-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold">
                          {entry.fullName || "—"}
                        </p>
                        <p className="text-xs text-slate-500">{entry.mobile || "—"}</p>
                      </div>
                      <TypeBadge value={entry.requestType} />
                    </div>
                    <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                      <div>
                        <dt className="text-slate-400">Company</dt>
                        <dd className="truncate text-slate-600">{entry.companyName || "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-400">Date</dt>
                        <dd className="truncate text-slate-600">
                          {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : "—"}
                        </dd>
                      </div>
                    </dl>
                    <div className="mt-2 flex flex-wrap justify-end gap-4 border-t border-slate-100 pt-2">
                      <button
                        onClick={() => setViewing(entry)}
                        className="inline-flex items-center gap-1 text-[13px] font-semibold text-slate-600 transition-colors hover:text-sky-700"
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </button>
                      <button
                        onClick={() => confirmDelete(entry)}
                        className="inline-flex items-center gap-1 text-[13px] font-semibold text-red-600 transition-colors hover:text-red-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 hidden overflow-x-auto scrollbar-hide rounded-[3px] border border-slate-300 md:block">
              <table className="w-full min-w-180 text-left text-[13px]">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-2.5 py-2">Name</th>
                    <th className="px-2.5 py-2">Mobile</th>
                    <th className="px-2.5 py-2">Company</th>
                    <th className="px-2.5 py-2">Type</th>
                    <th className="px-2.5 py-2">Date</th>
                    <th className="px-2.5 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((entry, index) => {
                    const id = entry.id || entry._id;
                    return (
                      <tr
                        key={id}
                        className={`border-t border-slate-200 transition-colors hover:bg-sky-50/50 ${
                          index % 2 === 0 ? "bg-rose-50/70" : "bg-white"
                        }`}
                      >
                        <td className="px-2.5 py-2 font-medium">{entry.fullName || "—"}</td>
                        <td className="px-2.5 py-2 text-slate-600">{entry.mobile || "—"}</td>
                        <td className="px-2.5 py-2 text-slate-600">{entry.companyName || "—"}</td>
                        <td className="px-2.5 py-2">
                          <TypeBadge value={entry.requestType} />
                        </td>
                        <td className="px-2.5 py-2 text-slate-600">
                          {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-2.5 py-2">
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={() => setViewing(entry)}
                              className="inline-flex items-center gap-1 font-semibold text-slate-600 transition-colors hover:text-sky-700"
                            >
                              <Eye className="h-3.5 w-3.5" /> View
                            </button>
                            <button
                              onClick={() => confirmDelete(entry)}
                              className="inline-flex items-center gap-1 font-semibold text-red-600 transition-colors hover:text-red-700"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {filtered.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[13px] text-slate-500">
            <p>
              Showing {(currentPage - 1) * PAGE_SIZE + 1}–
              {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="rounded-[3px] border border-slate-300 px-2.5 py-1 font-semibold transition-colors hover:border-sky-300 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-slate-300 disabled:hover:text-slate-500"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="rounded-[3px] border border-slate-300 px-2.5 py-1 font-semibold transition-colors hover:border-sky-300 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-slate-300 disabled:hover:text-slate-500"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {viewing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setViewing(null)}
        >
          <div
            className="w-full max-w-lg animate-in rounded-[3px] bg-white shadow-2xl fade-in-0 zoom-in-95 duration-150"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 bg-slate-50 px-5 py-3">
              <div className="min-w-0">
                {/* <p className="text-[13px] font-bold uppercase tracking-wide text-slate-500">
                  Enquiry Details
                </p> */}
                <p className="mt-0.5 truncate text-lg font-bold text-slate-900">
                  {viewing.fullName || "—"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <TypeBadge value={viewing.requestType} />
                <button
                  onClick={() => setViewing(null)}
                  className="rounded-[3px] p-1 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <InfoItem icon={Phone} label="Mobile" value={viewing.mobile} />
                <InfoItem icon={Mail} label="Email" value={viewing.email} />
                <InfoItem icon={Building2} label="Company" value={viewing.companyName} />
                <InfoItem
                  icon={MapPin}
                  label="Location"
                  value={[viewing.city, viewing.state].filter(Boolean).join(", ")}
                />
                <InfoItem
                  icon={Calendar}
                  label="Submitted"
                  value={
                    viewing.createdAt ? new Date(viewing.createdAt).toLocaleString() : undefined
                  }
                />
              </div>
              {viewing.message && (
                <div className="mt-2.5 rounded-[3px] border border-slate-200 bg-slate-50 p-3">
                  <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    <MessageSquare className="h-3.5 w-3.5" /> Message
                  </p>
                  <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-slate-700">
                    {viewing.message}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-3">
              <button
                onClick={() => {
                  confirmDelete(viewing);
                  setViewing(null);
                }}
                className="inline-flex h-9 items-center gap-1.5 rounded-[3px] px-3 text-[13px] font-semibold text-red-600 transition-colors hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
              <button
                onClick={() => setViewing(null)}
                className="h-9 rounded-[3px] bg-slate-100 px-4 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
