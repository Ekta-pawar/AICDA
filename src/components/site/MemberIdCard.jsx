import { useId } from "react";
import { ThumbsUp, User } from "lucide-react";
import logoAICDA from "@/assets/logoAICDA.png";

const NAVY = "#173a68";
const GOLD_FROM = "#8a6428";
const GOLD_VIA = "#e9c877";
const GOLD_TO = "#8a6428";
const SEAL_RED = "#a31f22";

const AUTHORIZED_SIGNATORY = {
  name: "J.S. NAYOL",
  title: "National President (AICDA)",
};

const FOUNDING_YEAR = 2001;

function isValidityActive(validityTo) {
  if (!validityTo) return false;
  const expiry = new Date(validityTo);
  if (Number.isNaN(expiry.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return expiry >= today;
}

function formatDDMMYYYY(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${date.getFullYear()}`;
}

function AnniversaryBadge({ years, fromYear, toYear }) {
  const pathId = useId();
  return (
    <svg viewBox="0 0 120 120" className="h-18 w-18 shrink-0">
      <defs>
        <path id={pathId} d="M 60,60 m -46,0 a 46,46 0 1,1 92,0 a 46,46 0 1,1 -92,0" />
      </defs>
      <circle cx="60" cy="60" r="58" fill={GOLD_VIA} />
      <circle cx="60" cy="60" r="52" fill="#ffffff" stroke={NAVY} strokeWidth="1" />
      <text fontSize="8.5" fontWeight="700" fill={NAVY} letterSpacing="1.5">
        <textPath href={`#${pathId}`} startOffset="1%">
          CELEBRATING • ANNIVERSARY •
        </textPath>
      </text>
      <text
        x="60"
        y="58"
        textAnchor="middle"
        fontSize="26"
        fontWeight="800"
        fill={NAVY}
        fontFamily="Georgia, serif"
      >
        {years}
      </text>
      <text x="60" y="70" textAnchor="middle" fontSize="8" fontWeight="700" fill={NAVY}>
        TH
      </text>
      <text x="32" y="66" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#8a6428">
        {fromYear}
      </text>
      <text x="88" y="66" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#8a6428">
        {toYear}
      </text>
    </svg>
  );
}

function SealBadge() {
  return (
    <div
      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-[3px] shadow"
      style={{ borderColor: GOLD_VIA, backgroundColor: SEAL_RED }}
    >
      <span className="text-[13px] font-extrabold italic text-white">AICDA</span>
    </div>
  );
}

function GoldBar({ className = "" }) {
  return (
    <div
      className={`h-1.5 w-full ${className}`}
      style={{ background: `linear-gradient(90deg, ${GOLD_FROM}, ${GOLD_VIA}, ${GOLD_TO})` }}
    />
  );
}

export function MemberIdCard({ bearer, cardRef }) {
  const currentYear = new Date().getFullYear();
  const anniversaryYears = Math.max(1, currentYear - FOUNDING_YEAR);
  const validityFrom = formatDDMMYYYY(bearer.validityFrom) || `01/01/${currentYear}`;
  const validityTo = formatDDMMYYYY(bearer.validityTo) || `31/12/${currentYear}`;

  return (
    <div
      ref={cardRef}
      className="relative mx-auto w-full max-w-95 overflow-hidden rounded-xl border-[3px] border-black bg-white"
    >
      <GoldBar />

      <div className="relative flex items-start justify-between px-4 pb-1 pt-3">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-[3px] bg-white p-0.5"
          style={{ borderColor: GOLD_VIA }}
        >
          <img
            src={logoAICDA}
            alt="AICDA emblem"
            className="h-full w-full rounded-full object-contain"
          />
        </div>
        <div
          className="mt-2 flex h-8 items-center rounded-l-md px-3 text-right"
          style={{ backgroundColor: NAVY }}
        >
          <span className="text-xs font-extrabold italic tracking-wide text-white">
            AICDA MEMBERS
          </span>
        </div>
      </div>

      <div className="px-4 text-center">
        <span
          className="text-3xl leading-none"
          style={{ fontFamily: "'Dancing Script', cursive", color: NAVY }}
        >
          Identity Card
        </span>
        <span className="ml-2 align-middle text-base font-extrabold" style={{ color: NAVY }}>
          {currentYear}
        </span>

        <p className="mt-1 text-[10px] font-bold tracking-widest text-slate-500">NGO</p>
        <h2 className="text-[17px] font-extrabold uppercase leading-tight" style={{ color: NAVY }}>
          All India Car Dealers Association<sup className="text-[9px]">&reg;</sup>
        </h2>
      </div>

      <div className="mt-2 flex items-center justify-center gap-2 px-3">
        <span className="w-8 shrink-0 text-lg font-extrabold text-black">
          {bearer.memberId || ""}
        </span>
        <div className="w-28 shrink-0 overflow-hidden rounded-md border-2 border-slate-300 bg-white">
          {bearer.photo ? (
            <img
              src={bearer.photo}
              alt={bearer.name}
              className="w-full object-contain"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center">
              <User className="h-10 w-10 text-slate-300" />
            </div>
          )}
        </div>
        <AnniversaryBadge years={anniversaryYears} fromYear={FOUNDING_YEAR} toYear={currentYear} />
      </div>

      <h3
        className="mt-2 truncate px-4 text-center text-xl font-extrabold uppercase"
        style={{ color: NAVY }}
      >
        {bearer.name || "—"}
      </h3>

      <div className="mt-1 py-1 text-center" style={{ backgroundColor: NAVY }}>
        <span className="text-sm font-bold uppercase tracking-wide text-white">
          {bearer.designation || "AICDA Members"}
        </span>
      </div>

      <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-[13px] font-bold text-black">
        Validity Upto {validityFrom} To {validityTo}
        {isValidityActive(bearer.validityTo) && (
          <ThumbsUp className="h-3.5 w-3.5 text-emerald-600" aria-label="Membership valid" />
        )}
      </p>

      <div className="mt-4 flex items-end justify-between px-4 pb-3">
        <div className="text-left">
          <div className="h-6 w-28 border-b border-slate-400" />
          <p className="mt-1 text-sm font-extrabold" style={{ color: NAVY }}>
            {AUTHORIZED_SIGNATORY.name}
          </p>
          <p className="text-[10px] font-semibold text-black">{AUTHORIZED_SIGNATORY.title}</p>
          <p className="text-[9px] tracking-wide text-slate-600">AUTHORISED SIGNATORY</p>
        </div>
        <SealBadge />
      </div>

      <GoldBar />
    </div>
  );
}
