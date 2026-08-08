import { useCallback, useEffect, useState } from "react";
import { Eye, Inbox, LoaderCircle, Search, Trash2, X } from "lucide-react";
import { deleteEnquiry, getEnquiries } from "@/lib/enquiry-api";

const requestTypeLabel = (value) =>
  value === "MEMBERSHIP" || !value ? "Membership" : "General Enquiry";

function Modal({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg rounded-2xl bg-white p-7 shadow-2xl sm:p-10">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <p className="py-1.5 text-sm">
      <span className="font-semibold text-slate-500">{label}:</span>{" "}
      <span className="text-slate-800">{value}</span>
    </p>
  );
}

const PAGE_SIZE = 10;

export function EnquiryManagement() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [working, setWorking] = useState(false);

  const loadEnquiries = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getEnquiries();
      setEnquiries(result.enquiries);
    } catch (requestError) {
      setError(requestError.message || "Could not load enquiries.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEnquiries();
  }, [loadEnquiries]);

  const visibleEnquiries = enquiries.filter((entry) =>
    [entry.fullName, entry.mobile, entry.email, entry.companyName, entry.city, entry.state]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );
  const totalPages = Math.max(1, Math.ceil(visibleEnquiries.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = visibleEnquiries.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const removeEnquiry = async () => {
    setWorking(true);
    try {
      await deleteEnquiry(deleting.id || deleting._id);
      setDeleting(null);
      await loadEnquiries();
    } catch (requestError) {
      setError(requestError.message || "Could not delete this enquiry.");
    } finally {
      setWorking(false);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-bold text-primary">
          Total Enquiries : <span className="text-slate-700">{visibleEnquiries.length}</span>
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Enquiries</h2>
            <p className="mt-1 text-sm text-slate-500">
              Membership requests and general enquiries submitted from the website.
            </p>
          </div>
          <label className="relative sm:ml-auto">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search enquiries"
              className="h-10 w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm sm:w-64"
            />
          </label>
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {loading ? (
          <div className="flex min-h-60 items-center justify-center gap-2 text-sm text-slate-500">
            <LoaderCircle className="h-5 w-5 animate-spin" /> Loading enquiries…
          </div>
        ) : visibleEnquiries.length === 0 ? (
          <div className="mt-4 flex min-h-60 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300">
            <Inbox className="h-9 w-9 text-slate-300" />
            <p className="mt-3 text-sm font-semibold">No enquiries found</p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto scrollbar-hide rounded-xl border border-slate-200">
            <table className="w-full min-w-180 text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-3 py-2.5">Name</th>
                  <th className="px-3 py-2.5">Mobile</th>
                  <th className="px-3 py-2.5">Company</th>
                  <th className="px-3 py-2.5">Type</th>
                  <th className="px-3 py-2.5">Date</th>
                  <th className="px-3 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((entry) => {
                  const id = entry.id || entry._id;
                  return (
                    <tr key={id} className="border-t border-slate-100">
                      <td className="px-3 py-2.5 font-medium">{entry.fullName || "—"}</td>
                      <td className="px-3 py-2.5 text-slate-600">{entry.mobile || "—"}</td>
                      <td className="px-3 py-2.5 text-slate-600">{entry.companyName || "—"}</td>
                      <td className="px-3 py-2.5">
                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                          {requestTypeLabel(entry.requestType)}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-slate-500">
                        {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => setViewing(entry)}
                            className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-primary"
                          >
                            <Eye className="h-4 w-4" /> View
                          </button>
                          <button
                            onClick={() => setDeleting(entry)}
                            className="inline-flex items-center gap-1 font-semibold text-red-600"
                          >
                            <Trash2 className="h-4 w-4" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {visibleEnquiries.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm font-semibold">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="rounded-lg border border-slate-200 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Prev
            </button>
            <span className="rounded-lg border border-slate-200 px-4 py-2 text-slate-600">
              Page : {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="rounded-lg border border-slate-200 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {viewing && (
        <Modal title="Enquiry details" onClose={() => setViewing(null)}>
          <div className="divide-y divide-slate-100">
            <DetailRow label="Type" value={requestTypeLabel(viewing.requestType)} />
            <DetailRow label="Name" value={viewing.fullName} />
            <DetailRow label="Mobile" value={viewing.mobile} />
            <DetailRow label="Email" value={viewing.email} />
            <DetailRow label="Company" value={viewing.companyName} />
            <DetailRow
              label="Location"
              value={[viewing.city, viewing.state].filter(Boolean).join(", ")}
            />
            <DetailRow
              label="Submitted"
              value={viewing.createdAt ? new Date(viewing.createdAt).toLocaleString() : undefined}
            />
          </div>
          {viewing.message && (
            <div className="mt-4 rounded-lg bg-slate-50 p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Message
              </p>
              <p className="text-sm text-slate-700">{viewing.message}</p>
            </div>
          )}
        </Modal>
      )}

      {deleting && (
        <Modal title="Delete this enquiry?" onClose={() => setDeleting(null)}>
          <p className="text-sm text-slate-600">This cannot be undone.</p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setDeleting(null)}
              className="h-10 rounded-lg bg-slate-100 px-4 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={removeEnquiry}
              disabled={working}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white disabled:opacity-60"
            >
              {working && <LoaderCircle className="h-4 w-4 animate-spin" />}Delete
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}
