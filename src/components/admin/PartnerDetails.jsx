import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Download,
  FileDown,
  Image as ImageIcon,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { getPartnerDetails, renewPartner } from "@/lib/partner-api";
import {
  buildMemberSlug,
  daysRemaining,
  expiryLabel,
  inputClass,
  isExpired,
  isTodayOrPast,
  parsePartnerSlug,
  StatusBadge,
} from "./directory-shared";
import { PartnerPrintableForm } from "./PartnerPrintableForm";

function InfoRow({ label, value }) {
  return (
    <p className="text-[13px]">
      <span className="font-semibold text-slate-700">{label}:</span>{" "}
      <span className="text-slate-600">{value || "—"}</span>
    </p>
  );
}

function formatDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function toCsvCell(value) {
  const text = value == null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function downloadRenewalsCsv(partner) {
  const currentRenewalId = partner.renewals?.[0]?.id;
  const rows = [
    ["Payment Date", "Amount (₹)", "Validity From", "Validity To", "Note", "Current"],
    ...partner.renewals.map((renewal) => [
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
  link.download = `${(partner.partnerName || "partner").trim().replace(/\s+/g, "_")}_payment_history.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

async function downloadPartnerFormImage(node, fileName) {
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
      <Skeleton className="h-64 w-full rounded-[3px]" />
      <div className="space-y-3">
        <Skeleton className="h-32 w-full rounded-[3px]" />
        <Skeleton className="h-32 w-full rounded-[3px]" />
      </div>
    </div>
  );
}

export function PartnerDetails({ slug }) {
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showRenew, setShowRenew] = useState(false);
  const [renewDate, setRenewDate] = useState("");
  const [renewAmount, setRenewAmount] = useState("");
  const [renewing, setRenewing] = useState(false);
  const [renewError, setRenewError] = useState("");

  const [downloadingForm, setDownloadingForm] = useState(false);
  const printableFormRef = useRef(null);

  const loadPartner = () => {
    setLoading(true);
    setError("");
    return getPartnerDetails(parsePartnerSlug(slug))
      .then(setPartner)
      .catch((requestError) => {
        setError(requestError.message || "Could not load this partner.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    getPartnerDetails(parsePartnerSlug(slug))
      .then((data) => mounted && setPartner(data))
      .catch((requestError) => {
        if (mounted) setError(requestError.message || "Could not load this partner.");
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [slug]);

  const isEffectivelyActive = partner ? partner.isActive && !isExpired(partner) : false;
  const validityHint = partner ? expiryLabel(daysRemaining(partner)) : null;
  const currentRenewalId = partner?.renewals?.[0]?.id;

  const handleDownloadForm = async () => {
    if (!printableFormRef.current || downloadingForm) return;
    setDownloadingForm(true);
    try {
      const baseName = (partner.partnerName || "partner").trim().replace(/\s+/g, "_");
      await downloadPartnerFormImage(printableFormRef.current, `${baseName}_partner_form.png`);
    } catch {
      toast.error("Couldn't generate the form. Please try again.");
    } finally {
      setDownloadingForm(false);
    }
  };

  const openRenew = () => {
    setRenewDate(partner.validityTo ? partner.validityTo.slice(0, 10) : "");
    setRenewAmount("");
    setRenewError("");
    setShowRenew(true);
  };

  const closeRenew = () => {
    setShowRenew(false);
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
      await renewPartner(partner.id, {
        validityTo: renewDate,
        amount: renewAmount ? Number(renewAmount) : undefined,
      });
      await loadPartner();
      toast.success(
        `${partner.partnerName || "Partner"} renewed through ${renewDate}. Status: ${partner.isActive ? "Active" : "Inactive"}.`,
      );
      closeRenew();
    } catch (requestError) {
      const message = requestError.message || "Could not renew partner.";
      setRenewError(message);
      toast.error(message);
    } finally {
      setRenewing(false);
    }
  };

  return (
    <section className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {partner?.member ? (
          <Link
            to="/admin/directory/$slug/details"
            params={{ slug: buildMemberSlug(partner.member) }}
            className="inline-flex items-center gap-1 rounded-[3px] px-2 py-1 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-sky-700"
          >
            <ArrowLeft className="h-4 w-4" /> Back to {partner.member.memberName}
          </Link>
        ) : (
          <Link
            to="/admin/directory"
            className="inline-flex items-center gap-1 rounded-[3px] px-2 py-1 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-sky-700"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Directory
          </Link>
        )}
        {partner && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={openRenew}
              className="inline-flex h-8 items-center gap-1.5 rounded-[3px] bg-emerald-600 px-3 text-[13px] font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Renew
            </button>
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
          </div>
        )}
      </div>

      {error && (
        <p role="alert" className="rounded-[3px] bg-red-50 px-3 py-2 text-[13px] text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <DetailsSkeleton />
      ) : !partner ? (
        !error && (
          <p className="rounded-[3px] border border-dashed border-slate-300 bg-white p-8 text-center text-[13px] text-slate-500">
            Partner not found.
          </p>
        )
      ) : (
        <div className="grid gap-3 lg:grid-cols-[16rem_1fr]">
          <div className="rounded-[3px]   bg-white  ">
            {partner.photo ? (
              <img
                src={partner.photo}
                alt={partner.partnerName}
                className="mx-auto h-40 w-45 rounded-[3px] border border-slate-300 object-cover"
              />
            ) : (
              <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-[3px] border border-dashed border-slate-300 text-slate-300">
                <ImageIcon className="h-10 w-10" />
              </div>
            )}
            <h2 className="mt-3 text-center text-lg font-bold text-slate-800">
              {partner.partnerName}
            </h2>
            <p className="text-center text-[13px] text-slate-500">
              Partner ID: {partner.partnerId}
            </p>
            {partner.member && (
              <p className="text-center text-[13px] text-slate-500">
                Member:{" "}
                <Link
                  to="/admin/directory/$slug/details"
                  params={{ slug: buildMemberSlug(partner.member) }}
                  className="font-semibold text-sky-700 transition-colors hover:underline"
                >
                  {partner.member.memberName}
                </Link>
              </p>
            )}
            <div className="mt-2 flex justify-center">
              <StatusBadge active={isEffectivelyActive} />
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-[3px] border border-slate-300 bg-white p-4 transition-shadow hover:shadow-sm">
              <h3 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-slate-500">
                Partner Information
              </h3>
              <div className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
                <InfoRow label="Father's Name" value={partner.fatherName} />
                <InfoRow label="Mobile" value={partner.mobile} />
                <InfoRow label="Residential Telephone" value={partner.residentialTelephone} />
                <InfoRow label="Company" value={partner.companyName} />
                <InfoRow
                  label="State / City"
                  value={[
                    partner.city?.cityName || partner.city,
                    partner.state?.stateName || partner.state,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                />
                <InfoRow label="Designation" value={partner.designation} />
                <InfoRow label="Joining Date" value={formatDate(partner.dateOfJoining)} />
                <InfoRow
                  label="Valid Until"
                  value={
                    formatDate(partner.validityTo) &&
                    `${formatDate(partner.validityTo)}${validityHint ? ` (${validityHint})` : ""}`
                  }
                />
              </div>
            </div>

            <div className="rounded-[3px] border border-slate-300 bg-white p-4 transition-shadow hover:shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="text-[13px] font-bold uppercase tracking-wide text-slate-500">
                  Payment &amp; Renewal History
                </h3>
                {partner.renewals && partner.renewals.length > 0 && (
                  <button
                    type="button"
                    onClick={() => downloadRenewalsCsv(partner)}
                    className="inline-flex h-7 shrink-0 items-center gap-1 rounded-[3px] border border-slate-300 px-2.5 text-xs font-semibold text-slate-600 transition-colors hover:border-sky-300 hover:text-sky-700"
                  >
                    <Download className="h-3.5 w-3.5" /> Download report
                  </button>
                )}
              </div>
              {!partner.renewals || partner.renewals.length === 0 ? (
                <p className="text-[13px] text-slate-500">No payment records yet.</p>
              ) : (
                <ol className="space-y-2">
                  {partner.renewals.map((renewal) => (
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

      {partner && (
        <div aria-hidden="true" style={{ position: "fixed", top: 0, left: "-9999px", zIndex: -1 }}>
          <PartnerPrintableForm partner={partner} formRef={printableFormRef} />
        </div>
      )}

      {showRenew && partner && (
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
            <h3 className="text-lg font-bold text-slate-800">Renew partner</h3>
            <p className="mt-1 text-sm text-slate-500">
              {partner.partnerName || "This partner"} — set the new validity date.
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
                {renewing ? "Renewing…" : "Renew Partner"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
