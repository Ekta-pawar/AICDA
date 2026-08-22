import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Eye, Handshake, RefreshCw, Search, Tag, Users, X } from "lucide-react";
import { toast } from "sonner";
import { getMembers, renewMember, updateMember } from "@/lib/member-api";
import { getPartners, renewPartner, updatePartner } from "@/lib/partner-api";
import {
  buildMemberSlug,
  buildPartnerSlug,
  daysRemaining,
  DesignationCombobox,
  expiryLabel,
  inputClass,
  isExpired,
  isExpiringSoon,
  isTodayOrPast,
  StatusBadge,
} from "./directory-shared";
import { DirectoryTableSkeleton } from "./DirectoryManagement";

const PAGE_SIZE = 10;
const LARGE_BATCH = 1000;
const SEARCH_DEBOUNCE_MS = 400;

const TABS = [
  { value: "members", label: "Members", icon: Users },
  { value: "partners", label: "Partners", icon: Handshake },
];

// Same record shape for both tabs (id, displayId, name, designation,
// companyName, mobile, validityTo, isActive) — these just pick the right
// key for whichever tab is active instead of duplicating the whole page.
function displayIdOf(tab, record) {
  return tab === "members" ? record.memberId : record.partnerId;
}
function nameOf(tab, record) {
  return tab === "members" ? record.memberName : record.partnerName;
}
function detailsRouteOf(tab) {
  return tab === "members" ? "/admin/directory/$slug/details" : "/admin/directory/partner/$slug/details";
}
function slugOf(tab, record) {
  return tab === "members" ? buildMemberSlug(record) : buildPartnerSlug(record);
}

export function ResetDirectory() {
  const [tab, setTab] = useState("members");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [renewTarget, setRenewTarget] = useState(null);
  const [renewDate, setRenewDate] = useState("");
  const [renewAmount, setRenewAmount] = useState("");
  const [renewing, setRenewing] = useState(false);
  const [renewError, setRenewError] = useState("");

  const [designationTarget, setDesignationTarget] = useState(null);
  const [designationValue, setDesignationValue] = useState("");
  const [savingDesignation, setSavingDesignation] = useState(false);
  const [designationError, setDesignationError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [tab, search]);

  const load = async () => {
    setLoading(true);
    setListError("");
    try {
      if (tab === "members") {
        const result = await getMembers({ search, limit: LARGE_BATCH });
        setRecords(result.members);
      } else {
        const result = await getPartners({ search, limit: LARGE_BATCH });
        setRecords(result);
      }
    } catch (requestError) {
      setListError(requestError.message || `Could not load ${tab}.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, search]);

  const totalPages = Math.max(1, Math.ceil(records.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = records.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const switchTab = (value) => {
    setTab(value);
    setSearchInput("");
    setSearch("");
  };

  const openRenew = (record) => {
    setRenewTarget(record);
    setRenewDate(record.validityTo ? record.validityTo.slice(0, 10) : "");
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
      const payload = {
        validityTo: renewDate,
        amount: renewAmount ? Number(renewAmount) : undefined,
      };
      if (tab === "members") await renewMember(renewTarget.id, payload);
      else await renewPartner(renewTarget.id, payload);
      await load();
      toast.success(
        `${nameOf(tab, renewTarget) || "Record"} renewed through ${renewDate}${
          renewAmount ? ` for ₹${renewAmount}` : ""
        }.`,
      );
      closeRenew();
    } catch (requestError) {
      const message = requestError.message || "Could not renew.";
      setRenewError(message);
      toast.error(message);
    } finally {
      setRenewing(false);
    }
  };

  const openDesignation = (record) => {
    setDesignationTarget(record);
    setDesignationValue(record.designation || "");
    setDesignationError("");
  };
  const closeDesignation = () => {
    setDesignationTarget(null);
    setDesignationValue("");
    setDesignationError("");
  };

  const confirmDesignation = async (event) => {
    event.preventDefault();
    if (!designationValue.trim()) {
      setDesignationError("Choose or enter a designation.");
      return;
    }
    setSavingDesignation(true);
    setDesignationError("");
    try {
      const payload = { ...designationTarget, designation: designationValue.trim() };
      if (tab === "members") await updateMember(designationTarget.id, payload);
      else await updatePartner(designationTarget.id, payload);
      await load();
      toast.success(
        `${nameOf(tab, designationTarget) || "Record"}'s designation updated to ${designationValue.trim()}.`,
      );
      closeDesignation();
    } catch (requestError) {
      const message = requestError.message || "Could not update designation.";
      setDesignationError(message);
      toast.error(message);
    } finally {
      setSavingDesignation(false);
    }
  };

  return (
    <section className="space-y-2">
      <div className="rounded-[3px] border border-slate-300 bg-white px-3 py-2">
        <h2 className="text-lg font-bold">Reset Directory</h2>
        <p className="text-[13px] text-slate-500">
          Quickly renew a member or partner's validity, or update their designation.
        </p>
      </div>

      <div className="rounded-[3px] border border-slate-300 bg-white p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            className="flex gap-2 rounded-[3px] border border-slate-300 bg-slate-50 p-1"
            role="tablist"
          >
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.value}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.value}
                  onClick={() => switchTab(t.value)}
                  className={`inline-flex h-8 items-center gap-1.5 rounded-[3px] px-3 text-[13px] font-semibold transition-colors ${
                    tab === t.value
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" /> {t.label}
                </button>
              );
            })}
          </div>

          <label className="flex items-center gap-2 text-[13px] text-slate-600">
            Search:
            <span className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={
                  tab === "members" ? "Member ID, name, or mobile…" : "Partner ID, name, or mobile…"
                }
                aria-label={`Search ${tab}`}
                className="h-8 w-full rounded-[3px] border border-slate-300 py-1 pl-7 pr-2 text-[13px] sm:w-72"
              />
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
                <div key={index} className="h-24 animate-pulse rounded-[3px] bg-slate-100" />
              ))}
            </div>
            <DirectoryTableSkeleton columns={7} />
          </>
        ) : pageRows.length === 0 ? (
          <div className="mt-3 flex min-h-48 flex-col items-center justify-center rounded-[3px] border border-dashed border-slate-300">
            <Users className="h-9 w-9 text-slate-300" />
            <p className="mt-3 text-[13px] font-semibold text-slate-500">
              {search ? `No ${tab} match your search` : `No ${tab} found`}
            </p>
          </div>
        ) : (
          <>
            <div className="mt-3 space-y-2 md:hidden">
              {pageRows.map((record) => {
                const isEffectivelyActive = record.isActive && !isExpired(record);
                return (
                  <div key={record.id} className="rounded-[3px] border border-slate-300 p-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        to={detailsRouteOf(tab)}
                        params={{ slug: slugOf(tab, record) }}
                        className="min-w-0 transition-colors hover:underline"
                      >
                        <p className="truncate text-[13px] font-semibold">{nameOf(tab, record)}</p>
                        <p className="text-xs text-slate-500">ID: {displayIdOf(tab, record)}</p>
                      </Link>
                      <StatusBadge active={isEffectivelyActive} />
                    </div>
                    <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                      <div>
                        <dt className="text-slate-400">Designation</dt>
                        <dd className="truncate text-slate-600">{record.designation || "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-400">Mobile</dt>
                        <dd className="truncate text-slate-600">{record.mobile || "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-400">Days Remaining</dt>
                        <dd
                          className={`truncate font-semibold ${isExpired(record) ? "text-red-600" : isExpiringSoon(record) ? "text-amber-600" : "text-slate-600"}`}
                        >
                          {expiryLabel(daysRemaining(record))}
                        </dd>
                      </div>
                    </dl>
                    <div className="mt-2 flex flex-wrap justify-end gap-4 border-t border-slate-100 pt-2">
                      <Link
                        to={detailsRouteOf(tab)}
                        params={{ slug: slugOf(tab, record) }}
                        className="inline-flex items-center gap-1 text-[13px] font-semibold text-slate-600 hover:text-sky-700"
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </Link>
                      <button
                        onClick={() => openRenew(record)}
                        className="inline-flex items-center gap-1 text-[13px] font-semibold text-emerald-700 hover:text-emerald-800"
                      >
                        <RefreshCw className="h-3.5 w-3.5" /> Renew
                      </button>
                      <button
                        onClick={() => openDesignation(record)}
                        className="inline-flex items-center gap-1 text-[13px] font-semibold text-slate-600 hover:text-sky-700"
                      >
                        <Tag className="h-3.5 w-3.5" /> Designation
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 hidden overflow-x-auto scrollbar-hide rounded-[3px] border border-slate-300 md:block">
              <table className="w-full min-w-175 text-left text-[13px]">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-2.5 py-2">
                      {tab === "members" ? "Member ID" : "Partner ID"}
                    </th>
                    <th className="px-2.5 py-2">Name</th>
                    <th className="px-2.5 py-2">Designation</th>
                    <th className="px-2.5 py-2">Mobile</th>
                    <th className="px-2.5 py-2">Status</th>
                    <th className="px-2.5 py-2">Days Remaining</th>
                    <th className="px-2.5 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((record, index) => {
                    const isEffectivelyActive = record.isActive && !isExpired(record);
                    return (
                      <tr
                        key={record.id}
                        className={`border-t border-slate-200 ${index % 2 === 0 ? "bg-rose-50/70" : "bg-white"}`}
                      >
                        <td className="px-2.5 py-2 font-medium">{displayIdOf(tab, record)}</td>
                        <td className="px-2.5 py-2">
                          <Link
                            to={detailsRouteOf(tab)}
                            params={{ slug: slugOf(tab, record) }}
                            className="transition-colors hover:text-sky-700 hover:underline"
                          >
                            {nameOf(tab, record)}
                          </Link>
                        </td>
                        <td className="px-2.5 py-2 text-slate-600">{record.designation || "—"}</td>
                        <td className="px-2.5 py-2 text-slate-600">{record.mobile || "—"}</td>
                        <td className="px-2.5 py-2">
                          <StatusBadge active={isEffectivelyActive} />
                        </td>
                        <td
                          className={`px-2.5 py-2 font-semibold ${isExpired(record) ? "text-red-600" : isExpiringSoon(record) ? "text-amber-600" : "text-slate-600"}`}
                        >
                          {expiryLabel(daysRemaining(record))}
                        </td>
                        <td className="px-2.5 py-2">
                          <div className="flex justify-end gap-3">
                            <Link
                              to={detailsRouteOf(tab)}
                              params={{ slug: slugOf(tab, record) }}
                              className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-sky-700"
                            >
                              <Eye className="h-3.5 w-3.5" /> View
                            </Link>
                            <button
                              onClick={() => openRenew(record)}
                              className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-800"
                            >
                              <RefreshCw className="h-3.5 w-3.5" /> Renew
                            </button>
                            <button
                              onClick={() => openDesignation(record)}
                              className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-sky-700"
                            >
                              <Tag className="h-3.5 w-3.5" /> Designation
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

        {records.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[13px] text-slate-500">
            <p>
              Showing {(safePage - 1) * PAGE_SIZE + 1}–
              {Math.min(safePage * PAGE_SIZE, records.length)} of {records.length}
            </p>
            <div className="flex gap-2">
              <button
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-[3px] border border-slate-300 px-2.5 py-1 font-semibold transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
              >
                Previous
              </button>
              <button
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-[3px] border border-slate-300 px-2.5 py-1 font-semibold transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {renewTarget && (
        <div
          className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-slate-950/45 p-4 fade-in-0 duration-150"
          role="dialog"
          aria-modal="true"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeRenew();
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") closeRenew();
          }}
        >
          <form
            onSubmit={confirmRenew}
            className="w-full max-w-sm animate-in rounded-[3px] bg-white p-5 shadow-2xl zoom-in-95 duration-150"
          >
            <h3 className="text-lg font-bold text-slate-800">
              Renew {tab === "members" ? "membership" : "partnership"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {nameOf(tab, renewTarget) || "This record"} — set the new validity date.
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
                {renewing ? "Renewing…" : "Renew"}
              </button>
            </div>
          </form>
        </div>
      )}

      {designationTarget && (
        <div
          className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-slate-950/45 p-4 fade-in-0 duration-150"
          role="dialog"
          aria-modal="true"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeDesignation();
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") closeDesignation();
          }}
        >
          <form
            onSubmit={confirmDesignation}
            className="w-full max-w-sm animate-in rounded-[3px] bg-white p-5 shadow-2xl zoom-in-95 duration-150"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Change designation</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {nameOf(tab, designationTarget) || "This record"} — update their designation.
                </p>
              </div>
              <button
                type="button"
                onClick={closeDesignation}
                aria-label="Close"
                className="rounded-[3px] p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <label className="mt-4 block text-[13px] font-semibold text-slate-700">
              Designation
              <div className="mt-1">
                <DesignationCombobox value={designationValue} onChange={setDesignationValue} />
              </div>
            </label>
            {designationError && (
              <p role="alert" className="mt-2 text-[13px] text-red-600">
                {designationError}
              </p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeDesignation}
                className="h-9 rounded-[3px] bg-slate-100 px-4 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingDesignation}
                className="h-9 rounded-[3px] bg-blue-600 px-4 text-[13px] font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
              >
                {savingDesignation ? "Saving…" : "Save Designation"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
