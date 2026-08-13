import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Image as ImageIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getPartnerDetails } from "@/lib/partner-api";
import { buildMemberSlug, isExpired, parsePartnerSlug } from "./directory-shared";

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
  const validityHint = partner ? daysUntil(partner.validityTo) : null;
  const currentRenewalId = partner?.renewals?.[0]?.id;

  return (
    <section className="space-y-2">
      <div>
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
          <div className="rounded-[3px] border border-slate-300  bg-white p-4 transition-shadow hover:shadow-sm">
            {partner.photo ? (
              <img
                src={partner.photo}
                alt={partner.partnerName}
                className="mx-auto h-40 w-40 rounded-[3px] border border-slate-300 object-cover"
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
                  value={[partner.city?.cityName, partner.state?.stateName]
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
              <h3 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-slate-500">
                Payment &amp; Renewal History
              </h3>
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
    </section>
  );
}
