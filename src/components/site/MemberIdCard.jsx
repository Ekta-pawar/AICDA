import { User } from "lucide-react";
import logoAICDA from "@/assets/logoAICDA.png";
import anniversaryBadge from "@/assets/aicda-anniversary-badge.png";
import presidentSignature from "@/assets/aicda-president-signature.png";
import identityCardTitle from "@/assets/aicda-identity-card-title.png";

const CARD_MIN_HEIGHT = "min-h-[35rem]";

const NAVY = "#173a68";
const GOLD_FROM = "#8a6428";
const GOLD_VIA = "#e9c877";
const GOLD_TO = "#8a6428";
const SEAL_RED = "#a31f22";
const ORANGE = "#e8590c";

const AUTHORIZED_SIGNATORY = {
  name: "J.S. NAYOL",
  title: "National President (AICDA)",
};

const CARD_INSTRUCTIONS = [
  "The Identity Card must be displayed by the holder at all times.",
  "This Identity Card relates to individual identity only.",
  "Loss of this card must be reported immediately to the office of the association and at the nearest police station.",
  "Replacement of card will be made on payment of Rs. 500/-",
];

function formatDDMMYYYY(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${date.getFullYear()}`;
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

function CornerRibbon({ corner }) {
  const isTop = corner === "top";
  const goldAngle = isTop ? 135 : -45;

  // Three nested diagonal triangles anchored at the card corner: a wide gold
  // triangle, a slightly smaller black triangle on top of it (leaving a gold
  // border sliver), and a smaller navy triangle on top of that (leaving a
  // black border sliver) — giving the gold/black/navy diagonal stripe look.
  const clip = (scale) =>
    isTop
      ? `polygon(0 0, ${scale}% 0, 0 ${scale}%)`
      : `polygon(100% 100%, ${100 - scale}% 100%, 100% ${100 - scale}%)`;

  return (
    <div
      className={`pointer-events-none absolute ${isTop ? "left-0 top-0" : "bottom-0 right-0"} h-40 w-40 overflow-hidden`}
    >
      <div
        className="absolute inset-0"
        style={{
          clipPath: clip(100),
          background: `linear-gradient(${goldAngle}deg, ${GOLD_FROM}, ${GOLD_VIA} 55%, ${GOLD_TO})`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{ clipPath: clip(88), backgroundColor: "#0a0a0a" }}
      />
      <div className="absolute inset-0" style={{ clipPath: clip(75), backgroundColor: NAVY }} />
      <div className={`absolute ${isTop ? "left-4 top-4" : "bottom-4 right-4"}`}>
        {isTop ? (
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full border-[3px] bg-white p-0.5"
            style={{ borderColor: GOLD_VIA }}
          >
            <img
              src={logoAICDA}
              alt="AICDA emblem"
              className="h-full w-full rounded-full object-contain"
            />
          </div>
        ) : (
          <SealBadge />
        )}
      </div>
    </div>
  );
}

function MembersRibbon() {
  return (
    <div
      className="absolute right-0 top-4 flex h-8 min-w-38 items-center justify-center pl-4 pr-3"
      style={{
        backgroundColor: NAVY,
        clipPath: "polygon(10px 0, 100% 0, 100% 100%, 10px 100%, 0 50%)",
      }}
    >
      <span className="text-xs font-extrabold italic tracking-wide text-white">AICDA MEMBERS</span>
    </div>
  );
}

export function MemberIdCard({ bearer, cardRef }) {
  const currentYear = new Date().getFullYear();
  const validityFrom = formatDDMMYYYY(bearer.validityFrom) || `01/01/${currentYear}`;
  const validityTo = formatDDMMYYYY(bearer.validityTo) || `31/12/${currentYear}`;

  return (
    <div
      ref={cardRef}
      className={`relative mx-auto w-full max-w-95 overflow-hidden rounded-xl border-[3px] border-black bg-white ${CARD_MIN_HEIGHT}`}
    >
      <CornerRibbon corner="top" />
      <CornerRibbon corner="bottom" />
      <MembersRibbon />

      <div className="relative z-10">
        <div className="h-20" />

        <div className="px-4 text-center">
          <img
            src={identityCardTitle}
            alt={`Identity Card ${currentYear}`}
            className="mx-auto h-11 object-contain"
          />

          <p className="mt-1 text-[10px] font-bold tracking-widest text-slate-500">NGO</p>
          <h2
            className="text-[17px] font-extrabold uppercase leading-tight"
            style={{ color: NAVY }}
          >
            All India Car Dealers Association<sup className="text-[9px]">&reg;</sup>
          </h2>
        </div>

        <div className="mt-2 flex items-center justify-center gap-2 px-3">
          <span className="w-12 shrink-0 text-center text-lg font-extrabold text-black">
            {bearer.memberId || ""}
          </span>
          <div className="h-32 w-28 shrink-0 overflow-hidden rounded-md bg-white">
            {bearer.photo ? (
              <img
                src={bearer.photo}
                alt={bearer.name}
                className="h-full w-full object-contain"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <User className="h-10 w-10 text-slate-300" />
              </div>
            )}
          </div>
          <img
            src={anniversaryBadge}
            alt="Celebrating 25th anniversary, 2001 to 2026"
            className="h-18 w-18 shrink-0 rounded-full object-cover"
          />
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

        <p className="mt-2 text-center text-[13px] font-bold text-black">
          Validity Upto {validityFrom} To {validityTo}
        </p>

        <div className="mt-4 flex items-end justify-between px-4 pb-3">
          <div className="text-left">
            <img src={presidentSignature} alt="Signature" className="h-10 w-28 object-contain" />
            <div className="-mt-1 w-28 border-b border-slate-400" />
            <p className="mt-1 text-sm font-extrabold" style={{ color: NAVY }}>
              {AUTHORIZED_SIGNATORY.name}
            </p>
            <p className="text-[10px] font-semibold text-black">{AUTHORIZED_SIGNATORY.title}</p>
            <p className="text-[9px] tracking-wide text-slate-600">AUTHORISED SIGNATORY</p>
          </div>
          <div className="h-16 w-16" />
        </div>
      </div>
    </div>
  );
}

function Barcode() {
  return (
    <div
      className="mx-auto h-9 w-full max-w-70"
      style={{
        backgroundImage:
          "repeating-linear-gradient(90deg, #111 0px, #111 2px, transparent 2px, transparent 4px, #111 4px, #111 5px, transparent 5px, transparent 8px, #111 8px, #111 11px, transparent 11px, transparent 13px, #111 13px, #111 14px, transparent 14px, transparent 17px, #111 17px, #111 19px, transparent 19px, transparent 21px)",
      }}
    />
  );
}

export function MemberIdCardBack({ bearer, cardRef }) {
  return (
    <div
      ref={cardRef}
      className={`relative mx-auto flex w-full max-w-95 flex-col justify-between overflow-hidden rounded-md border border-slate-300 bg-white p-4 ${CARD_MIN_HEIGHT}`}
    >
      <div>
        <h2 className="text-center text-base font-extrabold text-black">INSTRUCTIONS</h2>
        <div className="mt-2 space-y-1 text-[10.5px] leading-snug text-black">
          {CARD_INSTRUCTIONS.map((line, index) => (
            <p key={line} className="flex gap-1.5">
              <span className="shrink-0">{index + 1}.</span>
              <span>{line}</span>
            </p>
          ))}
        </div>
      </div>

      <Barcode />

      <div className="space-y-1">
        <p className="text-[15px] font-extrabold" style={{ color: ORANGE }}>
          {bearer.companyName || "—"}
        </p>
        <p className="text-[12px] font-bold text-black">M.No. : {bearer.memberId || "—"}</p>
        <p className="text-[12px] font-bold leading-snug text-black">
          ADDRESS : {bearer.officeAddress || "—"}
        </p>
        <p className="text-[12px] font-bold text-black">Contact No. : {bearer.mobile || "—"}</p>
      </div>

      <div>
        <p className="text-[9px] font-bold" style={{ color: ORANGE }}>
          NGO
        </p>
        <p className="text-[17px] font-extrabold uppercase leading-tight" style={{ color: ORANGE }}>
          All India Car Dealers Association<sup className="text-[9px]">&reg;</sup>
        </p>
        <p className="mt-1 text-center text-[10.5px] font-bold text-black">
          PH. : 8595288016, 8587036564&nbsp;&nbsp;&nbsp;Website : www.aicda.in
        </p>
        <p className="text-center text-[10.5px] font-bold text-black">
          CB - 32B, SHALIMAR BAGH, NEW DELHI-88
        </p>
      </div>
    </div>
  );
}
