import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

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
  "h-8 w-full rounded-[3px] border border-slate-300 bg-white px-2 text-[13px] text-slate-800 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-200";

export function FieldRow({ label, required, shaded, children }) {
  return (
    <div className={`px-3 py-2 ${shaded ? "bg-rose-50/70" : "bg-white"}`}>
      <label className="mb-1 block text-[13px] font-semibold text-slate-700">
        {label} {required && <span className="text-red-600">*</span>}:
      </label>
      {children}
    </div>
  );
}

export function DesignationCombobox({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef(null);

  const filtered = useMemo(() => {
    const query = value.trim().toLowerCase();
    if (!query) return DESIGNATIONS;
    return DESIGNATIONS.filter((designation) => designation.toLowerCase().includes(query));
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectOption = (designation) => {
    onChange(designation);
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
        placeholder="Type or choose a designation"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        className={`${inputClass} pr-8`}
      />
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        tabIndex={-1}
        aria-label="Toggle designation options"
        className="absolute right-0 top-0 flex h-8 w-8 items-center justify-center text-slate-400 transition-colors hover:text-sky-600"
      >
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul className="absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-[3px] border border-slate-300 bg-white py-1 text-[13px] shadow-lg">
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-slate-400">No matches — press Enter to use “{value}”</li>
          ) : (
            filtered.map((designation, index) => (
              <li key={designation}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectOption(designation)}
                  onMouseEnter={() => setHighlighted(index)}
                  className={`flex w-full items-center justify-between px-3 py-1.5 text-left transition-colors ${
                    index === highlighted
                      ? "bg-sky-50 text-sky-700"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {designation}
                  {designation === value && <Check className="h-3.5 w-3.5 text-sky-600" />}
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
