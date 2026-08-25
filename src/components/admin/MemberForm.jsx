import { useEffect, useMemo, useRef, useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { createMember, updateMember } from "@/lib/member-api";
import { getDistrictsForStateName } from "@/lib/india-districts";
import {
  DesignationCombobox,
  DistrictSelect,
  FieldRow,
  PROFILE_FIELD_KEYS,
  SectionHeading,
  StateCombobox,
  digitsOnly,
  fieldClass,
  inputClass,
  textareaClass,
} from "./directory-shared";

function buildInitialForm(member) {
  if (!member) {
    return {
      memberId: "",
      memberName: "",
      fatherName: "",
      dateOfBirth: "",
      photo: null,
      residentialAddress: "",
      mobile: "",
      residentialTelephone: "",
      panCardNo: "",
      designation: "",
      companyName: "",
      companyAddress: "",
      state: "",
      district: "",
      city: "",
      companyTelephone: "",
      packetNo: "",
      dateOfJoining: "",
      aadharNo: "",
      validityTo: "",
      amount: "",
      note: "",
    };
  }

  return {
    memberId: member.memberId != null ? String(member.memberId) : "",
    memberName: member.memberName || "",
    fatherName: member.fatherName || "",
    dateOfBirth: member.dateOfBirth ? member.dateOfBirth.slice(0, 10) : "",
    photo: null,
    residentialAddress: member.residentialAddress || "",
    mobile: member.mobile || "",
    residentialTelephone: member.residentialTelephone || "",
    panCardNo: member.panCardNo || "",
    designation: member.designation || "",
    companyName: member.companyName || "",
    companyAddress: member.companyAddress || "",
    state: member.state?.stateName || member.state || "",
    district: member.district || "",
    city: member.city?.cityName || member.city || "",
    companyTelephone: member.companyTelephone || "",
    packetNo: member.packetNo || "",
    dateOfJoining: member.dateOfJoining ? member.dateOfJoining.slice(0, 10) : "",
    aadharNo: member.aadharNo || "",
    validityTo: member.validityTo ? member.validityTo.slice(0, 10) : "",
    amount: "",
    note: "",
  };
}

export function MemberForm({ member, onCancel, onSaved }) {
  const isEdit = Boolean(member);
  const [form, setForm] = useState(() => buildInitialForm(member));
  const [existingPhotoUrl, setExistingPhotoUrl] = useState(
    typeof member?.photo === "string" && /^https?:\/\//.test(member.photo) ? member.photo : null,
  );
  const [photoPreview, setPhotoPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    setForm(buildInitialForm(member));
    setExistingPhotoUrl(
      typeof member?.photo === "string" && /^https?:\/\//.test(member.photo) ? member.photo : null,
    );
    if (fileInputRef.current) fileInputRef.current.value = "";
    // Only re-initialize when switching which member is being edited.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member?.id]);

  useEffect(() => {
    if (!form.photo) {
      setPhotoPreview(null);
      return;
    }
    const url = URL.createObjectURL(form.photo);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [form.photo]);

  const districtOptions = useMemo(() => getDistrictsForStateName(form.state), [form.state]);

  // Live view of exactly what the "Profile Incomplete" check will still flag
  // if saved right now — Photo counts as present if either a new file was
  // picked this session or one already exists from before, since form.photo
  // itself resets to null on every edit even when a photo is already saved.
  const missingProfileFields = useMemo(() => {
    return PROFILE_FIELD_KEYS.filter(([key]) => {
      if (key === "photo") return !(form.photo || existingPhotoUrl);
      return !String(form[key] || "").trim();
    }).map(([, label]) => label);
  }, [form, existingPhotoUrl]);

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
      setError("");
    }
  };

  const failValidation = (name, message) => {
    setError(message);
    setFieldErrors({ [name]: message });
    toast.error(message);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.memberId.trim()) {
      failValidation("memberId", "Member ID is required.");
      return;
    }
    if (!form.memberName.trim()) {
      failValidation("memberName", "Member Name is required.");
      return;
    }
    if (form.mobile && form.mobile.length !== 10) {
      failValidation("mobile", "Mobile number must be exactly 10 digits.");
      return;
    }
    if (form.aadharNo && form.aadharNo.length !== 12) {
      failValidation("aadharNo", "Aadhar Card No. must be exactly 12 digits.");
      return;
    }
    setError("");
    setFieldErrors({});
    setSaving(true);
    try {
      const saved = isEdit ? await updateMember(member.id, form) : await createMember(form);
      toast.success(isEdit ? "Member updated." : "Member added.");
      onSaved(saved);
    } catch (requestError) {
      const message = requestError.message || "Could not save member.";
      setError(message);
      // Backend returns '...Member ID... is already in use...' for a
      // duplicate — flag that specific field instead of just the generic
      // banner, so the input itself shows red alongside the toast.
      if (/member id.*already in use/i.test(message)) setFieldErrors({ memberId: message });
      toast.error(message, { duration: 6000 });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col items-center gap-3 rounded-[3px]  bg-white p-4 sm:flex-row sm:items-start">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Choose member photo"
          className="group relative shrink-0 cursor-pointer overflow-hidden rounded-[3px]"
        >
          {photoPreview || existingPhotoUrl ? (
            <>
              <img
                src={photoPreview || existingPhotoUrl}
                alt="Member preview"
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
            Member Photo
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => updateField("photo", e.target.files?.[0] || null)}
            className="block w-full text-[13px] text-slate-600 file:mr-3 file:rounded-[3px] file:border file:border-slate-300 file:bg-slate-50 file:px-2 file:py-1 file:text-[13px] file:font-semibold file:text-slate-700 hover:file:bg-slate-100"
          />
          <p className="mt-1.5 text-xs text-slate-500">A clear, centered photo works best.</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-[3px] ">
        {/* <SectionHeading>Personal Details</SectionHeading> */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="flex flex-col">
            <FieldRow label="Member ID" required error={fieldErrors.memberId}>
              <input
                value={form.memberId}
                onChange={(e) => updateField("memberId", e.target.value)}
                className={fieldClass(fieldErrors.memberId)}
              />
            </FieldRow>
            <FieldRow label="Member Name" required error={fieldErrors.memberName}>
              <input
                value={form.memberName}
                onChange={(e) => updateField("memberName", e.target.value)}
                className={fieldClass(fieldErrors.memberName)}
              />
            </FieldRow>
            <FieldRow label="Father's Name">
              <input
                value={form.fatherName}
                onChange={(e) => updateField("fatherName", e.target.value)}
                className={inputClass}
              />
            </FieldRow>
            <FieldRow label="Mobile" error={fieldErrors.mobile}>
              <input
                value={form.mobile}
                onChange={(e) => updateField("mobile", digitsOnly(e.target.value, 10))}
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit mobile number"
                className={fieldClass(fieldErrors.mobile)}
              />
            </FieldRow>
          </div>
          <div className="flex flex-col">
            <FieldRow label="Residential Telephone">
              <input
                value={form.residentialTelephone}
                onChange={(e) => updateField("residentialTelephone", e.target.value)}
                className={inputClass}
              />
            </FieldRow>
            <FieldRow label="Pan Card No.">
              <input
                value={form.panCardNo}
                onChange={(e) => updateField("panCardNo", e.target.value)}
                className={inputClass}
              />
            </FieldRow>
            <FieldRow label="Aadhar Card No." error={fieldErrors.aadharNo}>
              <input
                value={form.aadharNo}
                onChange={(e) => updateField("aadharNo", digitsOnly(e.target.value, 12))}
                inputMode="numeric"
                maxLength={12}
                placeholder="12-digit Aadhar number"
                className={fieldClass(fieldErrors.aadharNo)}
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

      <div className="overflow-hidden ">
        {/* <SectionHeading>Company Details</SectionHeading> */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="flex flex-col">
            <FieldRow label="Company Name">
              <input
                value={form.companyName}
                onChange={(e) => updateField("companyName", e.target.value)}
                className={inputClass}
              />
            </FieldRow>
            <FieldRow label="Company Address">
              <input
                value={form.companyAddress}
                onChange={(e) => updateField("companyAddress", e.target.value)}
                className={inputClass}
              />
            </FieldRow>
            <FieldRow label="Company Tel.">
              <input
                value={form.companyTelephone}
                onChange={(e) => updateField("companyTelephone", e.target.value)}
                className={inputClass}
              />
            </FieldRow>
          </div>
          <div className="flex flex-col">
            <FieldRow label="State">
              <StateCombobox
                value={form.state}
                onChange={(value) => {
                  updateField("state", value);
                  // StateCombobox fires onChange on every keystroke and on
                  // re-picking the same option — only wipe District/City when
                  // the state actually changed, so re-confirming the current
                  // state doesn't silently discard a District/City already set.
                  if (value !== form.state) {
                    updateField("district", "");
                    updateField("city", "");
                  }
                }}
              />
            </FieldRow>
            <FieldRow label="District">
              <DistrictSelect
                value={form.district}
                onChange={(value) => updateField("district", value)}
                districts={districtOptions}
                disabled={districtOptions.length === 0}
              />
            </FieldRow>
            <FieldRow label="City">
              <input
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
                placeholder="Type the city name"
                className={inputClass}
              />
            </FieldRow>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2">
          <FieldRow label="Packet No.">
            <input
              value={form.packetNo}
              onChange={(e) => updateField("packetNo", e.target.value)}
              maxLength={10}
              className={inputClass}
            />
          </FieldRow>
          <FieldRow label="Birth Day">
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => updateField("dateOfBirth", e.target.value)}
              className={inputClass}
            />
          </FieldRow>
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

      {missingProfileFields.length > 0 && (
        <p className="rounded-[3px] bg-amber-50 px-3 py-2 text-[13px] text-amber-700">
          Profile will still show as Incomplete — missing: {missingProfileFields.join(", ")}
        </p>
      )}

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
          {saving ? "Saving…" : isEdit ? "Save Member" : "Add Member"}
        </button>
      </div>
    </form>
  );
}
