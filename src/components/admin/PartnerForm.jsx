import { useEffect, useMemo, useRef, useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { createPartner, updatePartner } from "@/lib/partner-api";
import {
  CityCombobox,
  DesignationCombobox,
  FieldRow,
  SectionHeading,
  StateCombobox,
  inputClass,
  textareaClass,
} from "./directory-shared";

function buildInitialForm(partner, lockedMember) {
  if (!partner) {
    return {
      memberId: lockedMember?.memberId || "",
      partnerName: "",
      fatherName: "",
      photo: null,
      residentialAddress: "",
      mobile: "",
      residentialTelephone: "",
      panCardNo: "",
      aadharNo: "",
      designation: "",
      companyName: lockedMember?.companyName || "",
      companyAddress: lockedMember?.companyAddress || "",
      companyTelephone: lockedMember?.companyTelephone || "",
      packetNo: lockedMember?.packetNo || "",
      state: lockedMember?.state?.stateName || "",
      city: lockedMember?.city?.cityName || "",
      dateOfJoining: "",
      validityTo: "",
      amount: "",
      note: "",
    };
  }

  return {
    memberId: partner.member?.memberId || "",
    partnerName: partner.partnerName || "",
    fatherName: partner.fatherName || "",
    photo: null,
    residentialAddress: partner.residentialAddress || "",
    mobile: partner.mobile || "",
    residentialTelephone: partner.residentialTelephone || "",
    panCardNo: partner.panCardNo || "",
    aadharNo: partner.aadharNo || "",
    designation: partner.designation || "",
    companyName: partner.companyName || "",
    companyAddress: partner.companyAddress || "",
    companyTelephone: partner.companyTelephone || "",
    packetNo: partner.packetNo || "",
    state: partner.state?.stateName || "",
    city: partner.city?.cityName || "",
    dateOfJoining: partner.dateOfJoining ? partner.dateOfJoining.slice(0, 10) : "",
    validityTo: partner.validityTo ? partner.validityTo.slice(0, 10) : "",
    amount: "",
    note: "",
  };
}

function MemberPicker({ members, selectedMember, onSelect, disabled }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members.slice(0, 20);
    return members
      .filter((member) =>
        [member.memberId, member.memberName, member.companyName]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q),
      )
      .slice(0, 20);
  }, [members, query]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (selectedMember) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-[3px] border border-slate-300 bg-slate-50 px-2 py-1.5 text-[13px]">
        <span>
          <span className="font-semibold">{selectedMember.memberId}</span> —{" "}
          {selectedMember.memberName}
          {selectedMember.companyName ? ` (${selectedMember.companyName})` : ""}
        </span>
        {!disabled && (
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="text-xs font-semibold text-sky-700 hover:underline"
          >
            Change
          </button>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search Member ID, name or company"
        className={inputClass}
      />
      {open && (
        <ul className="absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-[3px] border border-slate-300 bg-white py-1 text-[13px] shadow-lg">
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-slate-400">No members found</li>
          ) : (
            filtered.map((member) => (
              <li key={member.id}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    onSelect(member);
                    setQuery("");
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between px-3 py-1.5 text-left text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <span>
                    <span className="font-semibold">{member.memberId}</span> — {member.memberName}
                    {member.companyName ? ` (${member.companyName})` : ""}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

export function PartnerForm({ partner, members, lockedMember, onCancel, onSaved }) {
  const isEdit = Boolean(partner);
  // Locked: the caller already knows which member this is for (e.g. adding
  // a partner from that member's own details page) — skip the picker.
  const isMemberLocked = Boolean(lockedMember) && !isEdit;
  const [form, setForm] = useState(() => buildInitialForm(partner, lockedMember));
  const [selectedMember, setSelectedMember] = useState(partner?.member || lockedMember || null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState(
    typeof partner?.photo === "string" && /^https?:\/\//.test(partner.photo) ? partner.photo : null,
  );
  const [photoPreview, setPhotoPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    setForm(buildInitialForm(partner, lockedMember));
    setSelectedMember(partner?.member || lockedMember || null);
    setExistingPhotoUrl(
      typeof partner?.photo === "string" && /^https?:\/\//.test(partner.photo)
        ? partner.photo
        : null,
    );
    if (fileInputRef.current) fileInputRef.current.value = "";
    // Only re-initialize when switching which partner/member is being edited.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partner?.id, lockedMember?.id]);

  useEffect(() => {
    if (!form.photo) {
      setPhotoPreview(null);
      return;
    }
    const url = URL.createObjectURL(form.photo);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [form.photo]);

  const updateField = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  const selectMember = (member) => {
    setSelectedMember(member);
    setForm((prev) => ({
      ...prev,
      memberId: member?.memberId || "",
      companyName: member?.companyName || "",
      companyAddress: member?.companyAddress || "",
      companyTelephone: member?.companyTelephone || "",
      packetNo: member?.packetNo || "",
      state: member?.state?.stateName || "",
      city: member?.city?.cityName || "",
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isEdit && !form.memberId) {
      setError("Choose the Member this partner belongs to.");
      return;
    }
    if (!form.partnerName.trim()) {
      setError("Partner Name is required.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const saved = isEdit ? await updatePartner(partner.id, form) : await createPartner(form);
      toast.success(isEdit ? "Partner updated." : "Partner added.");
      onSaved(saved);
    } catch (requestError) {
      const message = requestError.message || "Could not save partner.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col items-center gap-3 rounded-[3px] bg-white p-4 transition-shadow hover:shadow-sm sm:flex-row sm:items-start">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Choose partner photo"
          className="group relative shrink-0 cursor-pointer overflow-hidden rounded-[3px]"
        >
          {photoPreview || existingPhotoUrl ? (
            <>
              <img
                src={photoPreview || existingPhotoUrl}
                alt="Partner preview"
                className="h-28 w-28 rounded-[3px] border border-slate-300 object-cover sm:h-35 sm:w-35"
              />
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-900/50 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                Change
              </span>
            </>
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-[3px] border border-dashed border-slate-300 text-slate-300 transition-colors group-hover:border-sky-400 group-hover:text-sky-400 sm:h-35 sm:w-35">
              <ImageIcon className="h-10 w-10" />
            </div>
          )}
        </button>
        <div className="w-full text-center sm:text-left">
          <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">
            Partner Photo
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => updateField("photo", e.target.files?.[0] || null)}
            className="block w-full text-[13px] text-slate-600 file:mr-3 file:rounded-[3px] file:border file:border-slate-300 file:bg-slate-50 file:px-2 file:py-1 file:text-[13px] file:font-semibold file:text-slate-700 file:transition-colors hover:file:bg-slate-100"
          />
          <p className="mt-1.5 text-xs text-slate-500">A clear, centered photo works best.</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-[3px]">
        <SectionHeading>Member</SectionHeading>
        <FieldRow label="Linked Member" required>
          <MemberPicker
            members={members}
            selectedMember={selectedMember}
            onSelect={selectMember}
            disabled={isEdit || isMemberLocked}
          />
        </FieldRow>
      </div>

      <div className="overflow-hidden rounded-[3px]">
        {/* <SectionHeading>Personal Details</SectionHeading> */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="flex flex-col">
            <FieldRow label="Partner Name" required>
              <input
                value={form.partnerName}
                onChange={(e) => updateField("partnerName", e.target.value)}
                className={inputClass}
              />
            </FieldRow>
            <FieldRow label="Father's Name">
              <input
                value={form.fatherName}
                onChange={(e) => updateField("fatherName", e.target.value)}
                className={inputClass}
              />
            </FieldRow>
            <FieldRow label="Mobile">
              <input
                value={form.mobile}
                onChange={(e) => updateField("mobile", e.target.value)}
                className={inputClass}
              />
            </FieldRow>
            <FieldRow label="Residential Telephone">
              <input
                value={form.residentialTelephone}
                onChange={(e) => updateField("residentialTelephone", e.target.value)}
                className={inputClass}
              />
            </FieldRow>
          </div>
          <div className="flex flex-col">
            <FieldRow label="Pan Card No.">
              <input
                value={form.panCardNo}
                onChange={(e) => updateField("panCardNo", e.target.value)}
                className={inputClass}
              />
            </FieldRow>
            <FieldRow label="Aadhar Card No.">
              <input
                value={form.aadharNo}
                onChange={(e) => updateField("aadharNo", e.target.value)}
                className={inputClass}
              />
            </FieldRow>
            <FieldRow label="Designation">
              <DesignationCombobox
                value={form.designation}
                onChange={(value) => updateField("designation", value)}
              />
            </FieldRow>
          </div>
        </div>
        <FieldRow label="Residential Address">
          <textarea
            value={form.residentialAddress}
            onChange={(e) => updateField("residentialAddress", e.target.value)}
            rows={2}
            className={textareaClass}
          />
        </FieldRow>
      </div>

      <div className="overflow-hidden rounded-[3px]">
        {/* <SectionHeading>Company Details</SectionHeading> */}
        {!isEdit && (
          <p className="bg-amber-50 px-4 py-2 text-xs text-amber-700">
            Auto-filled from the linked member — editable after the partner is created.
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="flex flex-col">
            <FieldRow label="Company Name">
              <input
                value={form.companyName}
                onChange={(e) => updateField("companyName", e.target.value)}
                readOnly={!isEdit}
                className={`${inputClass} ${!isEdit ? "bg-slate-50 text-slate-500" : ""}`}
              />
            </FieldRow>
            <FieldRow label="Company Address">
              <input
                value={form.companyAddress}
                onChange={(e) => updateField("companyAddress", e.target.value)}
                readOnly={!isEdit}
                className={`${inputClass} ${!isEdit ? "bg-slate-50 text-slate-500" : ""}`}
              />
            </FieldRow>
            <FieldRow label="Company Tel.">
              <input
                value={form.companyTelephone}
                onChange={(e) => updateField("companyTelephone", e.target.value)}
                readOnly={!isEdit}
                className={`${inputClass} ${!isEdit ? "bg-slate-50 text-slate-500" : ""}`}
              />
            </FieldRow>
          </div>
          <div className="flex flex-col">
            {isEdit ? (
              <>
                <FieldRow label="State">
                  <StateCombobox
                    value={form.state}
                    onChange={(value) => {
                      updateField("state", value);
                      updateField("city", "");
                    }}
                  />
                </FieldRow>
                <FieldRow label="City">
                  <CityCombobox
                    value={form.city}
                    onChange={(value) => updateField("city", value)}
                  />
                </FieldRow>
              </>
            ) : (
              <>
                <FieldRow label="State">
                  <input
                    value={form.state}
                    readOnly
                    className={`${inputClass} bg-slate-50 text-slate-500`}
                  />
                </FieldRow>
                <FieldRow label="City">
                  <input
                    value={form.city}
                    readOnly
                    className={`${inputClass} bg-slate-50 text-slate-500`}
                  />
                </FieldRow>
              </>
            )}
            <FieldRow label="Packet No.">
              <input
                value={form.packetNo}
                onChange={(e) => updateField("packetNo", e.target.value)}
                readOnly={!isEdit}
                className={`${inputClass} ${!isEdit ? "bg-slate-50 text-slate-500" : ""}`}
              />
            </FieldRow>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[3px]">
        {/* <SectionHeading>Membership &amp; Payment</SectionHeading> */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="flex flex-col">
            <FieldRow label="Date of Joining">
              <input
                type="date"
                value={form.dateOfJoining}
                onChange={(e) => updateField("dateOfJoining", e.target.value)}
                className={inputClass}
              />
            </FieldRow>
            <FieldRow label="Validity To">
              <input
                type="date"
                value={form.validityTo}
                onChange={(e) => updateField("validityTo", e.target.value)}
                className={inputClass}
              />
            </FieldRow>
          </div>
          <div className="flex flex-col">
            <FieldRow label="Amount Paid">
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(e) => updateField("amount", e.target.value)}
                className={inputClass}
                placeholder="Optional"
              />
            </FieldRow>
            <FieldRow label="Note">
              <input
                value={form.note}
                onChange={(e) => updateField("note", e.target.value)}
                className={inputClass}
                placeholder="Optional"
              />
            </FieldRow>
          </div>
        </div>
        {/* <p className="px-4 py-2 text-xs text-slate-500">
          Validity starts from the joining date automatically — only the expiry needs to be set.
        </p> */}
      </div>

      {error && (
        <p role="alert" className="rounded-[3px] px-3 py-2 text-[13px] text-red-700">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-9 rounded-[3px] bg-slate-100 px-4 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="h-9 rounded-[3px] bg-blue-600 px-5 text-[13px] font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving…" : isEdit ? "Save Partner" : "Add Partner"}
        </button>
      </div>
    </form>
  );
}
