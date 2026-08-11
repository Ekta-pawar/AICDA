import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Image as ImageIcon, Pencil, Plus, Search, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  createPartner,
  deletePartner as deletePartnerRequest,
  togglePartnerStatus,
  updatePartner,
} from "@/lib/partner-api";
import { DesignationCombobox, FieldRow, STATES, inputClass, isExpired } from "./directory-shared";
import { DirectoryTableSkeleton } from "./DirectoryManagement";

const PAGE_SIZE = 10;

const emptyForm = {
  memberId: "",
  partnerName: "",
  fatherName: "",
  photo: null,
  residentialAddress: "",
  mobile: "",
  residentialTelephone: "",
  panCardNo: "",
  aadharNo: "",
  designation: "",
  companyName: "",
  companyAddress: "",
  companyTelephone: "",
  packetNo: "",
  state: "",
  city: "",
  dateOfJoining: "",
  validityFrom: "",
  validityTo: "",
};

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

function PartnerCardSkeleton() {
  return (
    <div className="rounded-[3px] border border-slate-300 p-2.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-5 w-14 shrink-0 rounded-full" />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-1">
            <Skeleton className="h-2.5 w-14" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PartnerDirectory({
  members,
  partners,
  loading,
  onReload,
  prefillMemberId,
  onPrefillConsumed,
}) {
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [selectedMember, setSelectedMember] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [listError, setListError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!form.photo) {
      setPhotoPreview(null);
      return;
    }
    const url = URL.createObjectURL(form.photo);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [form.photo]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return partners.filter((partner) => {
      const matchesQuery =
        !query ||
        [
          partner.partnerId,
          partner.partnerName,
          partner.companyName,
          partner.state?.stateName,
          partner.city?.cityName,
          partner.mobile,
          partner.designation,
          partner.member?.memberName,
          partner.member?.memberId,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query);

      const isEffectivelyActive = partner.isActive && !isExpired(partner);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && isEffectivelyActive) ||
        (statusFilter === "inactive" && !isEffectivelyActive);

      return matchesQuery && matchesStatus;
    });
  }, [partners, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const updateField = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  const resetForm = () => {
    setForm(emptyForm);
    setSelectedMember(null);
    setEditingId(null);
    setError("");
    setExistingPhotoUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openNewForm = () => {
    resetForm();
    setShowForm(true);
  };

  const closeForm = () => {
    resetForm();
    setShowForm(false);
  };

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

  const openNewFormForMember = (member) => {
    resetForm();
    selectMember(member);
    setShowForm(true);
  };

  useEffect(() => {
    if (!prefillMemberId) return;
    const member = members.find((m) => String(m.memberId) === String(prefillMemberId));
    if (member) openNewFormForMember(member);
    onPrefillConsumed?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillMemberId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!editingId && !form.memberId) {
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
      if (editingId) {
        await updatePartner(editingId, form);
      } else {
        await createPartner(form);
      }
      await onReload();
      closeForm();
    } catch (requestError) {
      const message = requestError.message || "Could not save partner.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const editPartner = (partner) => {
    setForm({
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
      validityFrom: partner.validityFrom ? partner.validityFrom.slice(0, 10) : "",
      validityTo: partner.validityTo ? partner.validityTo.slice(0, 10) : "",
    });
    setSelectedMember(partner.member || null);
    setEditingId(partner.id);
    setError("");
    setExistingPhotoUrl(
      typeof partner.photo === "string" && /^https?:\/\//.test(partner.photo)
        ? partner.photo
        : null,
    );
    if (fileInputRef.current) fileInputRef.current.value = "";
    setShowForm(true);
  };

  const performDelete = async (partner) => {
    try {
      await deletePartnerRequest(partner.id);
      if (editingId === partner.id) closeForm();
      await onReload();
      toast.success(`${partner.partnerName || "Partner"} removed from the directory.`);
    } catch (requestError) {
      const message = requestError.message || "Could not delete partner.";
      setListError(message);
      toast.error(message);
    }
  };

  const deletePartner = (partner) => {
    toast(`Remove ${partner.partnerName || "this partner"} from the directory?`, {
      description: "This action cannot be undone.",
      action: {
        label: "Delete",
        onClick: () => performDelete(partner),
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  const toggleStatus = async (partner) => {
    try {
      await togglePartnerStatus(partner.id);
      await onReload();
    } catch (requestError) {
      setListError(requestError.message || "Could not update partner status.");
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[3px] border border-slate-300 bg-white px-3 py-2">
        <h2 className="text-lg font-bold">Manage Partners</h2>
        {!showForm && (
          <button
            type="button"
            onClick={openNewForm}
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-[3px] bg-blue-600 px-3 text-[13px] font-semibold text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> Add Partner
          </button>
        )}
      </div>

      {showForm && (
        <div className="rounded-[3px] border border-slate-300 bg-white p-3">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={closeForm}
              className="inline-flex items-center gap-1 rounded-[3px] px-2 py-1 text-[13px] font-semibold text-slate-600 hover:bg-slate-100 hover:text-sky-700"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            {editingId && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 whitespace-nowrap">
                Editing {form.partnerName}
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 border border-slate-300 sm:grid-cols-2">
              <div className="flex flex-col divide-y divide-slate-300 border-b border-slate-300 sm:border-b-0 sm:border-r sm:border-r-slate-300">
                <FieldRow label="Member" required shaded>
                  <MemberPicker
                    members={members}
                    selectedMember={selectedMember}
                    onSelect={selectMember}
                    disabled={Boolean(editingId)}
                  />
                </FieldRow>

                <FieldRow label="Partner Photo">
                  <div className="flex items-center gap-3">
                    {photoPreview || existingPhotoUrl ? (
                      <img
                        src={photoPreview || existingPhotoUrl}
                        alt="Partner preview"
                        className="h-14 w-14 shrink-0 rounded-[3px] border border-slate-300 object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[3px] border border-dashed border-slate-300 text-slate-300">
                        <ImageIcon className="h-5 w-5" />
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => updateField("photo", e.target.files?.[0] || null)}
                      className="block w-full flex-1 text-[13px] text-slate-600 file:mr-3 file:rounded-[3px] file:border file:border-slate-300 file:bg-slate-50 file:px-2 file:py-1 file:text-[13px] file:font-semibold file:text-slate-700 hover:file:bg-slate-100"
                    />
                  </div>
                </FieldRow>
                <FieldRow label="Partner Name" required shaded>
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
                <FieldRow label="Residential Address" shaded>
                  <textarea
                    value={form.residentialAddress}
                    onChange={(e) => updateField("residentialAddress", e.target.value)}
                    rows={3}
                    className="w-full rounded-[3px] border border-slate-300 bg-white px-2 py-1 text-[13px] text-slate-800 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-200"
                  />
                </FieldRow>
                <FieldRow label="Mobile">
                  <input
                    value={form.mobile}
                    onChange={(e) => updateField("mobile", e.target.value)}
                    className={inputClass}
                  />
                </FieldRow>
                <FieldRow label="Residential Telephone" shaded>
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
                <FieldRow label="Aadhar Card No." shaded>
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

              <div className="flex flex-col divide-y divide-slate-300">
                <FieldRow label="Company Name" shaded>
                  <input
                    value={form.companyName}
                    onChange={(e) => updateField("companyName", e.target.value)}
                    readOnly={!editingId}
                    className={`${inputClass} ${!editingId ? "bg-slate-50 text-slate-500" : ""}`}
                  />
                </FieldRow>
                <FieldRow label="Company Address">
                  <input
                    value={form.companyAddress}
                    onChange={(e) => updateField("companyAddress", e.target.value)}
                    readOnly={!editingId}
                    className={`${inputClass} ${!editingId ? "bg-slate-50 text-slate-500" : ""}`}
                  />
                </FieldRow>
                <FieldRow label="State" shaded>
                  {editingId ? (
                    <select
                      value={form.state}
                      onChange={(e) => updateField("state", e.target.value)}
                      className={inputClass}
                    >
                      <option value="">--Select State--</option>
                      {STATES.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      value={form.state}
                      readOnly
                      className={`${inputClass} bg-slate-50 text-slate-500`}
                    />
                  )}
                </FieldRow>
                <FieldRow label="City">
                  <input
                    value={form.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    readOnly={!editingId}
                    className={`${inputClass} ${!editingId ? "bg-slate-50 text-slate-500" : ""}`}
                  />
                </FieldRow>
                <div className="space-y-2 bg-rose-50/70 px-3 py-2">
                  <div>
                    <label className="mb-1 block text-[13px] font-semibold text-slate-700">
                      Company Tel. :
                    </label>
                    <input
                      value={form.companyTelephone}
                      onChange={(e) => updateField("companyTelephone", e.target.value)}
                      readOnly={!editingId}
                      className={`${inputClass} ${!editingId ? "bg-slate-50 text-slate-500" : ""}`}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[13px] font-semibold text-slate-700">
                      Packet No. :
                    </label>
                    <input
                      value={form.packetNo}
                      onChange={(e) => updateField("packetNo", e.target.value)}
                      readOnly={!editingId}
                      className={`${inputClass} ${!editingId ? "bg-slate-50 text-slate-500" : ""}`}
                    />
                  </div>
                </div>
                <FieldRow label="Date of Joining">
                  <input
                    type="date"
                    value={form.dateOfJoining}
                    onChange={(e) => updateField("dateOfJoining", e.target.value)}
                    className={inputClass}
                  />
                </FieldRow>
                <div className="space-y-2 bg-white px-3 py-2">
                  <div>
                    <label className="mb-1 block text-[13px] font-semibold text-slate-700">
                      Validity From :
                    </label>
                    <input
                      type="date"
                      value={form.validityFrom}
                      onChange={(e) => updateField("validityFrom", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[13px] font-semibold text-slate-700">
                      Validity To :
                    </label>
                    <input
                      type="date"
                      value={form.validityTo}
                      onChange={(e) => updateField("validityTo", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="bg-rose-50/70 px-3 py-2">
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex h-8 items-center gap-1.5 rounded-[3px] bg-blue-600 px-4 text-[13px] font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                      {saving ? "Saving…" : editingId ? "Save Partner" : "Add Partner"}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="h-8 rounded-[3px] bg-red-600 px-4 text-[13px] font-semibold text-white hover:bg-red-700"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="mt-2 rounded-[3px] bg-red-50 px-3 py-2 text-[13px] text-red-700"
              >
                {error}
              </p>
            )}
          </form>
        </div>
      )}

      {!showForm && (
        <div className="rounded-[3px] border border-slate-300 bg-white p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-2 text-[13px] text-slate-600">
              Status:
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="h-8 rounded-[3px] border border-slate-300 px-2 text-[13px]"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-[13px] text-slate-600">
              Search:
              <span className="relative">
                <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="h-8 w-full rounded-[3px] border border-slate-300 py-1 pl-7 pr-2 text-[13px] sm:w-56"
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
                  <PartnerCardSkeleton key={index} />
                ))}
              </div>
              <DirectoryTableSkeleton columns={8} />
            </>
          ) : pageRows.length === 0 ? (
            <div className="mt-3 flex min-h-48 flex-col items-center justify-center rounded-[3px] border border-dashed border-slate-300">
              <Users className="h-9 w-9 text-slate-300" />
              <p className="mt-3 text-[13px] font-semibold text-slate-500">No partners found</p>
            </div>
          ) : (
            <>
              <div className="mt-3 space-y-2 md:hidden">
                {pageRows.map((partner) => {
                  const isEffectivelyActive = partner.isActive && !isExpired(partner);
                  return (
                    <div key={partner.id} className="rounded-[3px] border border-slate-300 p-2.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-semibold">
                            {partner.partnerName}
                          </p>
                          <p className="text-xs text-slate-500">ID: {partner.partnerId}</p>
                        </div>
                        <button
                          onClick={() => toggleStatus(partner)}
                          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${isEffectivelyActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}
                        >
                          {isEffectivelyActive ? "Active" : "Inactive"}
                        </button>
                      </div>
                      <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                        <div>
                          <dt className="text-slate-400">Member</dt>
                          <dd className="truncate text-slate-600">
                            {partner.member?.memberName || "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-slate-400">Company</dt>
                          <dd className="truncate text-slate-600">{partner.companyName || "—"}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-400">Mobile</dt>
                          <dd className="truncate text-slate-600">{partner.mobile || "—"}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-400">Designation</dt>
                          <dd className="truncate text-slate-600">{partner.designation || "—"}</dd>
                        </div>
                      </dl>
                      <div className="mt-2 flex justify-end gap-4 border-t border-slate-100 pt-2">
                        <button
                          onClick={() => editPartner(partner)}
                          className="inline-flex items-center gap-1 text-[13px] font-semibold text-slate-600 hover:text-sky-700"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => deletePartner(partner)}
                          className="inline-flex items-center gap-1 text-[13px] font-semibold text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
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
                      <th className="px-2.5 py-2">Partner ID</th>
                      <th className="px-2.5 py-2">Name</th>
                      <th className="px-2.5 py-2">Member</th>
                      <th className="px-2.5 py-2">Company</th>
                      <th className="px-2.5 py-2">Mobile</th>
                      <th className="px-2.5 py-2">Designation</th>
                      <th className="px-2.5 py-2">Status</th>
                      <th className="px-2.5 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.map((partner, index) => {
                      const isEffectivelyActive = partner.isActive && !isExpired(partner);
                      return (
                        <tr
                          key={partner.id}
                          className={`border-t border-slate-200 ${index % 2 === 0 ? "bg-rose-50/70" : "bg-white"}`}
                        >
                          <td className="px-2.5 py-2 font-medium">{partner.partnerId}</td>
                          <td className="px-2.5 py-2">{partner.partnerName}</td>
                          <td className="px-2.5 py-2 text-slate-600">
                            {partner.member?.memberName || "—"}{" "}
                            {partner.member?.memberId ? `(#${partner.member.memberId})` : ""}
                          </td>
                          <td className="px-2.5 py-2 text-slate-600">
                            {partner.companyName || "—"}
                          </td>
                          <td className="px-2.5 py-2 text-slate-600">{partner.mobile || "—"}</td>
                          <td className="px-2.5 py-2 text-slate-600">
                            {partner.designation || "—"}
                          </td>
                          <td className="px-2.5 py-2">
                            <button
                              onClick={() => toggleStatus(partner)}
                              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${isEffectivelyActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}
                            >
                              {isEffectivelyActive ? "Active" : "Inactive"}
                            </button>
                          </td>
                          <td className="px-2.5 py-2">
                            <div className="flex justify-end gap-3">
                              <button
                                onClick={() => editPartner(partner)}
                                className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-sky-700"
                              >
                                <Pencil className="h-3.5 w-3.5" /> Edit
                              </button>
                              <button
                                onClick={() => deletePartner(partner)}
                                className="inline-flex items-center gap-1 font-semibold text-red-600"
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Delete
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

          {filtered.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[13px] text-slate-500">
              <p>
                Showing {(currentPage - 1) * PAGE_SIZE + 1}–
                {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-[3px] border border-slate-300 px-2.5 py-1 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-[3px] border border-slate-300 px-2.5 py-1 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
