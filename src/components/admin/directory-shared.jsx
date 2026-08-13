import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, LoaderCircle, Users, UserCheck, UserX } from "lucide-react";
import { searchCities } from "@/lib/locations-api";

const STAT_CARD_ACCENTS = {
  sky: "bg-sky-50 text-sky-700",
  emerald: "bg-emerald-50 text-emerald-700",
  slate: "bg-slate-100 text-slate-500",
  amber: "bg-amber-50 text-amber-700",
  violet: "bg-violet-50 text-violet-700",
};

const STAT_CARD_HOVER_BORDERS = {
  sky: "hover:border-sky-300",
  emerald: "hover:border-emerald-300",
  slate: "hover:border-slate-400",
  amber: "hover:border-amber-300",
  violet: "hover:border-violet-300",
};

export function StatCard({ icon: Icon, label, value, accent = "slate" }) {
  return (
    <div
      className={`group rounded-[3px] border border-slate-300 bg-white p-3 shadow-sm transition-all sm:p-4 ${STAT_CARD_HOVER_BORDERS[accent]}`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[3px] transition-transform duration-200 group-hover:scale-110 ${STAT_CARD_ACCENTS[accent]}`}
        >
          <Icon className="h-4 w-4" />
        </span>
        <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p className="ml-auto text-2xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

export function MemberStatsCards({ stats }) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      <StatCard icon={Users} label="Total Member" value={stats.total} accent="sky" />
      <StatCard icon={UserCheck} label="Active Member" value={stats.active} accent="emerald" />
      <StatCard icon={UserX} label="Inactive Member" value={stats.inactive} accent="slate" />
    </div>
  );
}

export const STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Chandigarh",
  "Puducherry",
];

export const DESIGNATIONS = [
  "National President",
  "National Vice President",
  "National General Secretary",
  "National Secretary",
  "Joint Secretary",
  "Treasurer",
  "President",
  "Vice President",
  "Secretary",
  "Member",
  "Partner",
];

export const inputClass =
  "h-8 w-full rounded-[3px] border border-slate-300 bg-white px-2 text-[13px] text-slate-800 outline-none transition-colors hover:border-slate-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-200";

export const textareaClass =
  "w-full rounded-[3px] border border-slate-300 bg-white px-2 py-1 text-[13px] text-slate-800 outline-none transition-colors hover:border-slate-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-200";

export function FieldRow({ label, required, children }) {
  return (
    <div className=" px-3 py-2 transition-colors">
      <label className="mb-1 block text-[13px] font-semibold text-slate-700">
        {label} {required && <span className="text-red-600">*</span>}:
      </label>
      {children}
    </div>
  );
}

export function SectionHeading({ children }) {
  return (
    <h3 className=" px-4 py-2 text-[13px] font-bold uppercase tracking-wide text-slate-500">
      {children}
    </h3>
  );
}

const MAX_SUGGESTIONS = 10;

// Shared freeform-with-suggestions combobox: text input + filtered dropdown
// (top N matches), keyboard nav, click-outside close, and a fallback to use
// whatever was typed if nothing matches. Backs Designation and State; City
// needs its own variant below since its suggestions come from the backend.
function SuggestCombobox({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef(null);

  const filtered = useMemo(() => {
    const query = value.trim().toLowerCase();
    const source = query
      ? options.filter((option) => option.toLowerCase().includes(query))
      : options;
    return source.slice(0, MAX_SUGGESTIONS);
  }, [value, options]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectOption = (option) => {
    onChange(option);
    setOpen(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setHighlighted((i) => Math.min(i + 1, filtered.length - 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlighted((i) => Math.max(i - 1, 0));
      return;
    }
    if (event.key === "Enter" && open && filtered[highlighted]) {
      event.preventDefault();
      selectOption(filtered[highlighted]);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setHighlighted(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        className={`${inputClass} pr-8`}
      />
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        tabIndex={-1}
        aria-label="Toggle options"
        className="absolute right-0 top-0 flex h-8 w-8 items-center justify-center text-slate-400 transition-colors hover:text-sky-600"
      >
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul className="absolute z-20 mt-1.5 max-h-52 w-full origin-top animate-in overflow-auto rounded-lg border border-slate-200 bg-white p-1.5 text-[13px] shadow-xl fade-in-0 zoom-in-95 duration-150">
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-slate-400">No matches — press Enter to use “{value}”</li>
          ) : (
            filtered.map((option, index) => (
              <li key={option}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectOption(option)}
                  onMouseEnter={() => setHighlighted(index)}
                  className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left transition-all duration-100 ${
                    index === highlighted
                      ? "scale-[1.02] bg-sky-50 text-sky-700"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {option}
                  {option === value && <Check className="h-3.5 w-3.5 text-sky-600" />}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

export function DesignationCombobox({ value, onChange }) {
  return (
    <SuggestCombobox
      value={value}
      onChange={onChange}
      options={DESIGNATIONS}
      placeholder="Type or choose a designation"
    />
  );
}

export function StateCombobox({ value, onChange }) {
  return (
    <SuggestCombobox
      value={value}
      onChange={onChange}
      options={STATES}
      placeholder="Type or choose a state"
    />
  );
}

const CITY_SEARCH_DEBOUNCE_MS = 350;

// City suggestions come from the backend (existing cities already entered
// anywhere), so this needs its own debounced-fetch variant instead of
// SuggestCombobox's synchronous in-memory filter. Freeform entry is always
// allowed — a brand-new city just gets created on save.
export function CityCombobox({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => {
      searchCities(value)
        .then(setSuggestions)
        .catch(() => setSuggestions([]))
        .finally(() => setLoading(false));
    }, CITY_SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [open, value]);

  return (
    <div ref={containerRef} className="relative">
      <input
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
          if (event.key === "Enter") {
            event.preventDefault();
            setOpen(false);
          }
        }}
        placeholder="Type or choose a city"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        className={inputClass}
      />

      {open && (
        <ul className="absolute z-20 mt-1.5 max-h-52 w-full origin-top animate-in overflow-auto rounded-lg border border-slate-200 bg-white p-1.5 text-[13px] shadow-xl fade-in-0 zoom-in-95 duration-150">
          {loading ? (
            <li className="flex items-center gap-2 px-3 py-2 text-slate-400">
              <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> Searching…
            </li>
          ) : suggestions.length === 0 ? (
            <li className="px-3 py-2 text-slate-400">
              No matches{value.trim() ? ` — press Enter to use “${value}”` : ""}
            </li>
          ) : (
            suggestions.map((city) => (
              <li key={city.id}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    onChange(city.cityName);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left transition-all duration-100 ${
                    city.cityName === value
                      ? "scale-[1.02] bg-sky-50 text-sky-700"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {city.cityName}
                  {city.cityName === value && <Check className="h-3.5 w-3.5 text-sky-600" />}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

export function isExpired(record) {
  if (!record.validityTo) return false;
  const validityDate = new Date(record.validityTo);
  if (Number.isNaN(validityDate.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  validityDate.setHours(0, 0, 0, 0);
  return validityDate < today;
}

// A renewal is meant to push the validity into the future — a date of today
// or earlier would save successfully but leave the member/partner expired
// again immediately, silently undoing the renewal.
export function isTodayOrPast(dateString) {
  if (!dateString) return false;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date <= today;
}

// Human-readable but still unique: the name is cosmetic only, the trailing
// `-<id>` (the internal DB id GET /members/:id already looks up by) is what
// the details route actually uses — see parseMemberSlug. Duplicate member
// names never collide because of it.
export function buildMemberSlug(member) {
  const slug = (member.memberName || "member")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${slug || "member"}-${member.id}`;
}

export function parseMemberSlug(slug) {
  const match = /-(\d+)$/.exec(slug || "");
  return match ? match[1] : slug;
}

// Same cosmetic-name + trailing internal-id pattern as buildMemberSlug/
// parseMemberSlug, applied to partners.
export function buildPartnerSlug(partner) {
  const slug = (partner.partnerName || "partner")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${slug || "partner"}-${partner.id}`;
}

export function parsePartnerSlug(slug) {
  const match = /-(\d+)$/.exec(slug || "");
  return match ? match[1] : slug;
}
