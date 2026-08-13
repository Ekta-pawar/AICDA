import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Eye, Pencil, Plus, RefreshCw, Search, Trash2, Users, X } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  deleteMember as deleteMemberRequest,
  getMembers,
  renewMember,
  toggleMemberStatus,
} from "@/lib/member-api";
import {
  buildMemberSlug,
  inputClass,
  isExpired,
  isTodayOrPast,
  MemberStatsCards,
} from "./directory-shared";
import { MemberForm } from "./MemberForm";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;

function DirectoryCardSkeleton() {
  return (
    <div className="rounded-[3px] border border-slate-300 p-2.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-5 w-14 shrink-0 rounded-full" />
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

export function DirectoryTableSkeleton({ columns = 6, rows = 5 }) {
  return (
    <div className="mt-3 hidden overflow-x-auto scrollbar-hide rounded-[3px] border border-slate-300 md:block">
      <table className="w-full min-w-175 text-left text-[13px]">
        <tbody>
          {Array.from({ length: rows }).map((_, index) => (
            <tr
              key={index}
              className={`border-t border-slate-200 first:border-t-0 ${index % 2 === 0 ? "bg-rose-50/70" : "bg-white"}`}
            >
              {Array.from({ length: columns }).map((__, colIndex) => (
                <td key={colIndex} className="px-2.5 py-2">
                  <Skeleton className="h-4 w-20" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DirectoryManagement() {
  const [members, setMembers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [listError, setListError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [renewTarget, setRenewTarget] = useState(null);
  const [renewDate, setRenewDate] = useState("");
  const [renewAmount, setRenewAmount] = useState("");
  const [renewing, setRenewing] = useState(false);
  const [renewError, setRenewError] = useState("");

  // Debounce the search box so we don't hit the API on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadMembers = async () => {
    setLoading(true);
    setListError("");
    try {
      const result = await getMembers({ search, status: statusFilter, page, limit: PAGE_SIZE });
      setMembers(result.members);
      setPagination(result.pagination);
      if (result.stats) setStats(result.stats);
    } catch (requestError) {
      setListError(requestError.message || "Could not load members.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, page]);

  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const editMember = (member) => {
    setEditingMember(member);
    setShowForm(true);
  };

  const closeForm = () => {
    setEditingMember(null);
    setShowForm(false);
  };

  const handleSaved = async () => {
    closeForm();
    await loadMembers();
  };

  const performDelete = async (member) => {
    try {
      await deleteMemberRequest(member.id);
      await loadMembers();
      toast.success(`${member.memberName || "Member"} removed from the directory.`);
    } catch (requestError) {
      const message = requestError.message || "Could not delete member.";
      setListError(message);
      toast.error(message);
    }
  };

  const deleteMember = (member) => {
    toast(`Remove ${member.memberName || "this member"} from the directory?`, {
      description: "This action cannot be undone.",
      action: {
        label: "Delete",
        onClick: () => performDelete(member),
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  const toggleStatus = async (member) => {
    try {
      await toggleMemberStatus(member.id);
      await loadMembers();
    } catch (requestError) {
      setListError(requestError.message || "Could not update member status.");
    }
  };

  const openRenew = (member) => {
    setRenewTarget(member);
    setRenewDate(member.validityTo ? member.validityTo.slice(0, 10) : "");
    setRenewAmount("");
    setRenewError("");
  };

  const closeRenew = () => {
    setRenewTarget(null);
    setRenewDate("");
    setRenewAmount("");
    setRenewError("");
  };

  const confirmRenew = async (event) => {
    event.preventDefault();
    if (!renewDate) {
      setRenewError("Choose the new validity date.");
      return;
    }
    if (isTodayOrPast(renewDate)) {
      setRenewError("Validity date must be after today.");
      return;
    }
    if (renewAmount && Number(renewAmount) < 0) {
      setRenewError("Amount cannot be negative.");
      return;
    }
    setRenewing(true);
    setRenewError("");
    try {
      await renewMember(renewTarget.id, {
        validityTo: renewDate,
        amount: renewAmount ? Number(renewAmount) : undefined,
      });
      await loadMembers();
      toast.success(
        `${renewTarget.memberName || "Member"} renewed through ${renewDate}${
          renewAmount ? ` for ₹${renewAmount}` : ""
        }.`,
      );
      closeRenew();
    } catch (requestError) {
      const message = requestError.message || "Could not renew member.";
      setRenewError(message);
      toast.error(message);
    } finally {
      setRenewing(false);
    }
  };

  return (
    <section className="space-y-2">
      <MemberStatsCards stats={stats} />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[3px] border border-slate-300 bg-white px-3 py-2">
        <h2 className="text-lg font-bold">Manage Directory</h2>
        {!showForm && (
          <Link
            to="/admin/directory/create"
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-[3px] bg-blue-600 px-3 text-[13px] font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> Add Member
          </Link>
        )}
      </div>

      {showForm && (
        <div className="rounded-[3px] border border-slate-300 bg-white p-3">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={closeForm}
              className="inline-flex items-center gap-1 rounded-[3px] px-2 py-1 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-sky-700"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            {editingMember && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 whitespace-nowrap">
                Editing {editingMember.memberName || editingMember.memberId}
              </span>
            )}
          </div>
          <MemberForm member={editingMember} onCancel={closeForm} onSaved={handleSaved} />
        </div>
      )}

      {!showForm && (
        <div className="rounded-[3px] border border-slate-300 bg-white p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-2 text-[13px] text-slate-600">
              Status:
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="h-8 rounded-[3px] border border-slate-300 px-2 text-[13px] outline-none transition-colors hover:border-slate-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-200"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-[13px] text-slate-600">
              Search:
              <span className="relative">
                <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="ID, name, company, mobile…"
                  className="h-8 w-full rounded-[3px] border border-slate-300 py-1 pl-7 pr-7 text-[13px] outline-none transition-colors hover:border-slate-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-200 sm:w-64"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    aria-label="Clear search"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </span>
            </label>
          </div>

          {listError && (
            <p
              role="alert"
              className="mt-3 rounded-[3px] bg-red-50 px-3 py-2 text-[13px] text-red-700"
            >
              {listError}
            </p>
          )}

          {loading ? (
            <>
              <div className="mt-3 space-y-2 md:hidden">
                {Array.from({ length: 5 }).map((_, index) => (
                  <DirectoryCardSkeleton key={index} />
                ))}
              </div>
              <DirectoryTableSkeleton columns={7} />
            </>
          ) : members.length === 0 ? (
            <div className="mt-3 flex min-h-48 flex-col items-center justify-center rounded-[3px] border border-dashed border-slate-300">
              <Users className="h-9 w-9 text-slate-300" />
              <p className="mt-3 text-[13px] font-semibold text-slate-500">
                {search ? "No members match your search" : "No members found"}
              </p>
            </div>
          ) : (
            <>
              <div className="mt-3 space-y-2 md:hidden">
                {members.map((member, index) => {
                  const isEffectivelyActive = member.isActive && !isExpired(member);
                  const serialNo = (pagination.page - 1) * pagination.limit + index + 1;
                  return (
                    <div
                      key={member.id}
                      className="rounded-[3px] border border-slate-300 p-2.5 transition-shadow hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <Link
                          to="/admin/directory/$slug/details"
                          params={{ slug: buildMemberSlug(member) }}
                          className="min-w-0 transition-colors hover:underline"
                        >
                          <p className="truncate text-[13px] font-semibold">
                            {serialNo}. {member.memberName}
                          </p>
                          <p className="text-xs text-slate-500">ID: {member.memberId}</p>
                        </Link>
                        <button
                          onClick={() => toggleStatus(member)}
                          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-opacity hover:opacity-80 ${isEffectivelyActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}
                        >
                          {isEffectivelyActive ? "Active" : "Inactive"}
                        </button>
                      </div>
                      <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                        <div>
                          <dt className="text-slate-400">Company</dt>
                          <dd className="truncate text-slate-600">{member.companyName || "—"}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-400">Mobile</dt>
                          <dd className="truncate text-slate-600">{member.mobile || "—"}</dd>
                        </div>
                      </dl>
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2">
                        <Link
                          to="/admin/directory/$slug/details"
                          params={{ slug: buildMemberSlug(member) }}
                          className="inline-flex items-center gap-1 text-[13px] font-semibold text-slate-600 transition-colors hover:text-sky-700"
                        >
                          <Users className="h-3.5 w-3.5" /> Partners ({member._count?.partners ?? 0}
                          )
                        </Link>
                        <div className="flex flex-wrap justify-end gap-4">
                          <Link
                            to="/admin/directory/$slug/details"
                            params={{ slug: buildMemberSlug(member) }}
                            className="inline-flex items-center gap-1 text-[13px] font-semibold text-slate-600 transition-colors hover:text-sky-700"
                          >
                            <Eye className="h-3.5 w-3.5" /> View
                          </Link>
                          <button
                            onClick={() => openRenew(member)}
                            className="inline-flex items-center gap-1 text-[13px] font-semibold text-emerald-700 transition-colors hover:text-emerald-800"
                          >
                            <RefreshCw className="h-3.5 w-3.5" /> Renew
                          </button>
                          <button
                            onClick={() => editMember(member)}
                            className="inline-flex items-center gap-1 text-[13px] font-semibold text-slate-600 transition-colors hover:text-sky-700"
                          >
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => deleteMember(member)}
                            className="inline-flex items-center gap-1 text-[13px] font-semibold text-red-600 transition-colors hover:text-red-700"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 hidden overflow-x-auto scrollbar-hide rounded-[3px] border border-slate-300 md:block">
                <table className="w-full min-w-175 text-left text-[13px]">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-2.5 py-2">No</th>
                      <th className="px-2.5 py-2">Member ID</th>
                      <th className="px-2.5 py-2">Name</th>
                      <th className="px-2.5 py-2">Company</th>
                      <th className="px-2.5 py-2">Mobile</th>
                      <th className="px-2.5 py-2">Status</th>
                      <th className="px-2.5 py-2">Partners</th>
                      <th className="px-2.5 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member, index) => {
                      const isEffectivelyActive = member.isActive && !isExpired(member);
                      const serialNo = (pagination.page - 1) * pagination.limit + index + 1;
                      return (
                        <tr
                          key={member.id}
                          className={`border-t border-slate-200 transition-colors hover:bg-sky-50/60 ${index % 2 === 0 ? "bg-rose-50/70" : "bg-white"}`}
                        >
                          <td className="px-2.5 py-2 text-slate-500">{serialNo}</td>
                          <td className="px-2.5 py-2 font-medium">{member.memberId}</td>
                          <td className="px-2.5 py-2">
                            <Link
                              to="/admin/directory/$slug/details"
                              params={{ slug: buildMemberSlug(member) }}
                              className="transition-colors hover:text-sky-700 hover:underline"
                            >
                              {member.memberName}
                            </Link>
                          </td>
                          <td className="px-2.5 py-2 text-slate-600">
                            {member.companyName || "—"}
                          </td>
                          <td className="px-2.5 py-2 text-slate-600">{member.mobile || "—"}</td>
                          <td className="px-2.5 py-2">
                            <button
                              onClick={() => toggleStatus(member)}
                              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold transition-opacity hover:opacity-80 ${isEffectivelyActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}
                            >
                              {isEffectivelyActive ? "Active" : "Inactive"}
                            </button>
                          </td>
                          <td className="px-2.5 py-2">
                            <Link
                              to="/admin/directory/$slug/details"
                              params={{ slug: buildMemberSlug(member) }}
                              className="inline-flex items-center gap-1 font-semibold text-slate-600 transition-colors hover:text-sky-700"
                            >
                              <Users className="h-3.5 w-3.5" /> {member._count?.partners ?? 0}
                            </Link>
                          </td>
                          <td className="px-2.5 py-2">
                            <div className="flex justify-end gap-3">
                              <Link
                                to="/admin/directory/$slug/details"
                                params={{ slug: buildMemberSlug(member) }}
                                className="inline-flex items-center gap-1 font-semibold text-slate-600 transition-colors hover:text-sky-700"
                              >
                                <Eye className="h-3.5 w-3.5" /> View
                              </Link>
                              <button
                                onClick={() => openRenew(member)}
                                className="inline-flex items-center gap-1 font-semibold text-emerald-700 transition-colors hover:text-emerald-800"
                              >
                                <RefreshCw className="h-3.5 w-3.5" /> Renew
                              </button>
                              <button
                                onClick={() => editMember(member)}
                                className="inline-flex items-center gap-1 font-semibold text-slate-600 transition-colors hover:text-sky-700"
                              >
                                <Pencil className="h-3.5 w-3.5" /> Edit
                              </button>
                              <button
                                onClick={() => deleteMember(member)}
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

          {pagination.total > 0 && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[13px] text-slate-500">
              <p>
                Showing {(pagination.page - 1) * pagination.limit + 1}–
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                {pagination.total}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-[3px] border border-slate-300 px-2.5 py-1 font-semibold transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  Previous
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  className="rounded-[3px] border border-slate-300 px-2.5 py-1 font-semibold transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {renewTarget && (
        <div
          className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-slate-950/45 p-4 fade-in-0 duration-150"
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={confirmRenew}
            className="w-full max-w-sm animate-in rounded-[3px] bg-white p-5 shadow-2xl zoom-in-95 duration-150"
          >
            <h3 className="text-lg font-bold text-slate-800">Renew membership</h3>
            <p className="mt-1 text-sm text-slate-500">
              {renewTarget.memberName || "This member"} — set the new validity date.
            </p>
            <label className="mt-4 block text-[13px] font-semibold text-slate-700">
              New Validity To
              <input
                type="date"
                required
                value={renewDate}
                onChange={(e) => setRenewDate(e.target.value)}
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className="mt-3 block text-[13px] font-semibold text-slate-700">
              Amount Paid (₹)
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 5000"
                value={renewAmount}
                onChange={(e) => setRenewAmount(e.target.value)}
                className={`${inputClass} mt-1`}
              />
            </label>
            {renewError && (
              <p role="alert" className="mt-2 text-[13px] text-red-600">
                {renewError}
              </p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeRenew}
                className="h-9 rounded-[3px] bg-slate-100 px-4 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={renewing}
                className="h-9 rounded-[3px] bg-emerald-600 px-4 text-[13px] font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
              >
                {renewing ? "Renewing…" : "Renew Member"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
