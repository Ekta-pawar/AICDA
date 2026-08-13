import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Download,
  Eye,
  FileDown,
  Image as ImageIcon,
  LoaderCircle,
  Pencil,
  Plus,
  Users,
  X,
} from "lucide-react";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { getMemberDetails } from "@/lib/member-api";
import { buildPartnerSlug, isExpired, parseMemberSlug } from "./directory-shared";
import { MemberPrintableForm } from "./MemberPrintableForm";
import { PartnerForm } from "./PartnerForm";

function InfoRow({ label, value }) {
  return (
    <p className="text-[13px]">
      <span className="font-semibold text-slate-700">{label}:</span>{" "}
      <span className="text-slate-600">{value || "—"}</span>
    </p>
  );
}

function StatusBadge({ active }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function formatDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

// "(19 days left)" / "(Expired 5 days ago)" next to a validity date, so the
// admin doesn't have to do the date math themselves.
function daysUntil(value) {
  if (!value) return null;
  const target = new Date(value);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const days = Math.round((target - today) / 86400000);
  if (days > 0) return `${days} day${days === 1 ? "" : "s"} left`;
  if (days === 0) return "expires today";
  return `expired ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} ago`;
}

function toCsvCell(value) {
  const text = value == null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function downloadRenewalsCsv(member) {
  const currentRenewalId = member.renewals?.[0]?.id;
  const rows = [
    ["Payment Date", "Amount (₹)", "Validity From", "Validity To", "Note", "Current"],
    ...member.renewals.map((renewal) => [
      formatDate(renewal.paymentDate) || "",
      renewal.amount ?? "",
      formatDate(renewal.validityFrom) || "",
      formatDate(renewal.validityTo) || "",
      renewal.note || "",
      renewal.id === currentRenewalId ? "Yes" : "No",
    ]),
  ];
  const csv = rows.map((row) => row.map(toCsvCell).join(",")).join("\r\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${(member.memberName || "member").trim().replace(/\s+/g, "_")}_payment_history.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

async function downloadMemberFormImage(node, fileName) {
  const dataUrl = await toPng(node, {
    pixelRatio: 2,
    backgroundColor: "#ffffff",
    cacheBust: true,
  });
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function DetailsSkeleton() {
  return (
    <div className="grid gap-3 lg:grid-cols-[16rem_1fr]">
      <div className="rounded-[3px] border border-slate-300 bg-white p-4">
        <Skeleton className="mx-auto h-40 w-40 rounded-[3px]" />
        <Skeleton className="mx-auto mt-3 h-4 w-32" />
        <Skeleton className="mx-auto mt-2 h-3 w-24" />
        <Skeleton className="mx-auto mt-3 h-5 w-16 rounded-full" />
      </div>

      <div className="space-y-3">
        <div className="rounded-[3px] border border-slate-300 bg-white p-4">
          <div className="grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-3.5 w-3/4" />
            ))}
          </div>
        </div>

        <div className="rounded-[3px] border border-slate-300 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-7 w-24 rounded-[3px]" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-8 w-full rounded-[3px]" />
            ))}
          </div>
        </div>

        <div className="rounded-[3px] border border-slate-300 bg-white p-4">
          <Skeleton className="mb-3 h-3.5 w-40" />
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full rounded-[3px]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MemberDetails({ slug }) {
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showPartnerForm, setShowPartnerForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [downloadingForm, setDownloadingForm] = useState(false);
  const printableFormRef = useRef(null);

  const loadMember = () => {
    setLoading(true);
    setError("");
    return getMemberDetails(parseMemberSlug(slug))
      .then(setMember)
      .catch((requestError) => {
        setError(requestError.message || "Could not load this member.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    getMemberDetails(parseMemberSlug(slug))
      .then((data) => mounted && setMember(data))
      .catch((requestError) => {
        if (mounted) setError(requestError.message || "Could not load this member.");
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [slug]);

  const isEffectivelyActive = member ? member.isActive && !isExpired(member) : false;

  const openNewPartnerForm = () => {
    setEditingPartner(null);
    setShowPartnerForm(true);
  };

  const openEditPartnerForm = (partner) => {
    setEditingPartner(partner);
    setShowPartnerForm(true);
  };

  const closePartnerForm = () => {
    setEditingPartner(null);
    setShowPartnerForm(false);
  };

  const handlePartnerSaved = async () => {
    closePartnerForm();
    await loadMember();
  };

  const handleDownloadForm = async () => {
    if (!printableFormRef.current || downloadingForm) return;
    setDownloadingForm(true);
    try {
      const baseName = (member.memberName || "member").trim().replace(/\s+/g, "_");
      await downloadMemberFormImage(printableFormRef.current, `${baseName}_member_form.png`);
    } catch {
      toast.error("Couldn't generate the form. Please try again.");
    } finally {
      setDownloadingForm(false);
    }
  };

  const validityHint = member ? daysUntil(member.validityTo) : null;
  const currentRenewalId = member?.renewals?.[0]?.id;

  return (
    <section className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-[3px] bg-white px-3 py-2">
        <Link
          to="/admin/directory"
          className="inline-flex items-center gap-1 rounded-[3px] px-2 py-1 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-sky-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Directory
        </Link>
        {member && (
          <button
            type="button"
            onClick={handleDownloadForm}
            disabled={downloadingForm}
            className="inline-flex h-8 items-center gap-1.5 rounded-[3px] border border-slate-300 px-3 text-[13px] font-semibold text-slate-600 transition-colors hover:border-sky-300 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {downloadingForm ? (
              <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FileDown className="h-3.5 w-3.5" />
            )}
            Download form
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="rounded-[3px] bg-red-50 px-3 py-2 text-[13px] text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <DetailsSkeleton />
      ) : !member ? (
        !error && (
          <p className="rounded-[3px] border border-dashed border-slate-300 bg-white p-8 text-center text-[13px] text-slate-500">
            Member not found.
          </p>
        )
      ) : (
        <div className="grid lg:grid-cols-[16rem_1fr]">
          <div className="rounded-[3px]  bg-white  transition-shadow ">
            {member.photo ? (
              <img
                src={member.photo}
                alt={member.memberName}
                className="mx-auto h-40 w-50 rounded-[3px] border border-slate-300 object-cover"
              />
            ) : (
              <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-[3px] border border-dashed border-slate-300 text-slate-300">
                <ImageIcon className="h-10 w-10" />
              </div>
            )}
            <h2 className="mt-3 text-center text-lg font-bold text-slate-800">
              {member.memberName}
            </h2>
            <p className="text-center text-[13px] text-slate-500">Member ID: {member.memberId}</p>
            <div className="mt-2 flex justify-center">
              <StatusBadge active={isEffectivelyActive} />
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-[3px] border border-slate-300 bg-white p-4 transition-shadow hover:shadow-sm">
              <h3 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-slate-500"></h3>
              <div className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
                <InfoRow label="Father's Name" value={member.fatherName} />
                <InfoRow label="Mobile" value={member.mobile} />
                <InfoRow label="Residential Telephone" value={member.residentialTelephone} />
                <InfoRow label="Company" value={member.companyName} />
                <InfoRow
                  label="State / City"
                  value={[member.city?.cityName, member.state?.stateName]
                    .filter(Boolean)
                    .join(", ")}
                />
                <InfoRow label="Designation" value={member.designation} />
                <InfoRow label="Joining Date" value={formatDate(member.dateOfJoining)} />
                <InfoRow
                  label="Valid Until"
                  value={
                    formatDate(member.validityTo) &&
                    `${formatDate(member.validityTo)}${validityHint ? ` (${validityHint})` : ""}`
                  }
                />
              </div>
            </div>

            <div className="rounded-[3px] border border-slate-300 bg-white p-4 transition-shadow hover:shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-wide text-slate-500">
                  <Users className="h-3.5 w-3.5" /> Partners ({member.partners?.length || 0})
                </h3>
                <button
                  type="button"
                  onClick={openNewPartnerForm}
                  className="inline-flex h-7 items-center gap-1 rounded-[3px] bg-blue-600 px-2.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Partner
                </button>
              </div>

              {!member.partners || member.partners.length === 0 ? (
                <p className="text-[13px] text-slate-500">No partners linked to this member.</p>
              ) : (
                <>
                  <div className="space-y-2 md:hidden">
                    {member.partners.map((partner) => (
                      <div key={partner.id} className="rounded-[3px] border border-slate-200 p-2.5">
                        <div className="flex items-start justify-between gap-3">
                          <Link
                            to="/admin/directory/partner/$slug/details"
                            params={{ slug: buildPartnerSlug(partner) }}
                            className="min-w-0 transition-colors hover:underline"
                          >
                            <p className="truncate text-[13px] font-semibold">
                              {partner.partnerName}
                            </p>
                            <p className="text-xs text-slate-500">ID: {partner.partnerId}</p>
                          </Link>
                          <StatusBadge active={partner.isActive && !isExpired(partner)} />
                        </div>
                        <p className="mt-1.5 text-xs text-slate-500">
                          Mobile: <span className="text-slate-600">{partner.mobile || "—"}</span>
                        </p>
                        <div className="mt-2 flex flex-wrap justify-end gap-4 border-t border-slate-100 pt-2">
                          <Link
                            to="/admin/directory/partner/$slug/details"
                            params={{ slug: buildPartnerSlug(partner) }}
                            className="inline-flex items-center gap-1 text-[13px] font-semibold text-slate-600 transition-colors hover:text-sky-700"
                          >
                            <Eye className="h-3.5 w-3.5" /> View
                          </Link>
                          <button
                            type="button"
                            onClick={() => openEditPartnerForm(partner)}
                            className="inline-flex items-center gap-1 text-[13px] font-semibold text-slate-600 transition-colors hover:text-sky-700"
                          >
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="hidden overflow-x-auto scrollbar-hide md:block">
                    <table className="w-full min-w-125 text-left text-[13px]">
                      <thead className="text-slate-500">
                        <tr>
                          <th className="py-1.5 pr-3">Partner ID</th>
                          <th className="py-1.5 pr-3">Name</th>
                          <th className="py-1.5 pr-3">Mobile</th>
                          <th className="py-1.5 pr-3">Status</th>
                          <th className="py-1.5 pr-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {member.partners.map((partner) => (
                          <tr
                            key={partner.id}
                            className="border-t border-slate-100 transition-colors hover:bg-slate-50"
                          >
                            <td className="py-1.5 pr-3 font-medium">{partner.partnerId}</td>
                            <td className="py-1.5 pr-3">
                              <Link
                                to="/admin/directory/partner/$slug/details"
                                params={{ slug: buildPartnerSlug(partner) }}
                                className="transition-colors hover:text-sky-700 hover:underline"
                              >
                                {partner.partnerName}
                              </Link>
                            </td>
                            <td className="py-1.5 pr-3 text-slate-600">{partner.mobile || "—"}</td>
                            <td className="py-1.5 pr-3">
                              <StatusBadge active={partner.isActive && !isExpired(partner)} />
                            </td>
                            <td className="py-1.5 pr-3 text-right">
                              <div className="flex justify-end gap-3">
                                <Link
                                  to="/admin/directory/partner/$slug/details"
                                  params={{ slug: buildPartnerSlug(partner) }}
                                  className="inline-flex items-center gap-1 font-semibold text-slate-600 transition-colors hover:text-sky-700"
                                >
                                  <Eye className="h-3.5 w-3.5" /> View
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => openEditPartnerForm(partner)}
                                  className="inline-flex items-center gap-1 font-semibold text-slate-600 transition-colors hover:text-sky-700"
                                >
                                  <Pencil className="h-3.5 w-3.5" /> Edit
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            <div className="rounded-[3px] border border-slate-300 bg-white p-4 transition-shadow hover:shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="text-[13px] font-bold uppercase tracking-wide text-slate-500">
                  Payment &amp; Renewal History
                </h3>
                {member.renewals && member.renewals.length > 0 && (
                  <button
                    type="button"
                    onClick={() => downloadRenewalsCsv(member)}
                    className="inline-flex h-7 shrink-0 items-center gap-1 rounded-[3px] border border-slate-300 px-2.5 text-xs font-semibold text-slate-600 transition-colors hover:border-sky-300 hover:text-sky-700"
                  >
                    <Download className="h-3.5 w-3.5" /> Download report
                  </button>
                )}
              </div>
              {!member.renewals || member.renewals.length === 0 ? (
                <p className="text-[13px] text-slate-500">No payment records yet.</p>
              ) : (
                <ol className="space-y-2">
                  {member.renewals.map((renewal) => (
                    <li
                      key={renewal.id}
                      className={`rounded-[3px] border px-3 py-2 text-[13px] transition-colors ${
                        renewal.id === currentRenewalId
                          ? "border-emerald-200 bg-emerald-50"
                          : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold text-slate-700">
                          Paid {formatDate(renewal.paymentDate)}
                          {renewal.amount ? ` — ₹${renewal.amount}` : ""}
                          {renewal.id === currentRenewalId && (
                            <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                              Current
                            </span>
                          )}
                        </span>
                        <span className="text-slate-500">
                          Valid {formatDate(renewal.validityFrom)} →{" "}
                          {formatDate(renewal.validityTo)}
                        </span>
                      </div>
                      {renewal.note && <p className="mt-1 text-slate-500">{renewal.note}</p>}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </div>
      )}

      {member && (
        <div aria-hidden="true" style={{ position: "fixed", top: 0, left: "-9999px", zIndex: -1 }}>
          <MemberPrintableForm member={member} formRef={printableFormRef} />
        </div>
      )}

      {showPartnerForm && member && (
        <div
          className="fixed inset-0 z-50 flex animate-in items-start justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm fade-in-0 duration-150 sm:items-center"
          role="dialog"
          aria-modal="true"
          onClick={(event) => {
            if (event.target === event.currentTarget) closePartnerForm();
          }}
        >
          <div className="my-8 flex max-h-[85vh] w-full max-w-2xl animate-in flex-col rounded-[3px] bg-white shadow-2xl zoom-in-95 duration-150 sm:my-0">
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3">
              <h3 className="text-[13px] font-bold uppercase tracking-wide text-slate-500">
                {editingPartner ? "Edit Partner" : "Add Partner"}
              </h3>
              <button
                type="button"
                onClick={closePartnerForm}
                aria-label="Close"
                className="rounded-[3px] p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="overflow-y-auto p-4">
              <PartnerForm
                partner={editingPartner}
                members={[member]}
                lockedMember={member}
                onCancel={closePartnerForm}
                onSaved={handlePartnerSaved}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
