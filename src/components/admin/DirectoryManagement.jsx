import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Image as ImageIcon,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import {
  createMember,
  deleteMember as deleteMemberRequest,
  getMembers,
  toggleMemberStatus,
  updateMember,
} from "@/lib/member-api";

const STATES = [
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

const DESIGNATIONS = [
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

const emptyForm = {
  memberId: "",
  memberName: "",
  fatherName: "",
  photo: null,
  residentialAddress: "",
  mobile: "",
  residentialTelephone: "",
  panCardNo: "",
  designation: "",
  companyName: "",
  companyAddress: "",
  state: "",
  city: "",
  companyTelephone: "",
  packetNo: "",
  dateOfJoining: "",
  aadharNo: "",
};

function Field({ label, required, className = "", children }) {
  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="text-primary"> *</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/15";

function DesignationCombobox({ value, onChange }) {
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
        className={`${inputClass} pr-10`}
      />
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        tabIndex={-1}
        aria-label="Toggle designation options"
        className="absolute right-0 top-0 flex h-11 w-10 items-center justify-center text-slate-400 transition-colors hover:text-primary"
      >
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul className="absolute z-20 mt-1.5 max-h-52 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-slate-400">
              No matches — press Enter to use “{value}”
            </li>
          ) : (
            filtered.map((designation, index) => (
              <li key={designation}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectOption(designation)}
                  onMouseEnter={() => setHighlighted(index)}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors ${
                    index === highlighted
                      ? "bg-primary/10 text-primary"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {designation}
                  {designation === value && <Check className="h-4 w-4 text-primary" />}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

export function DirectoryManagement() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [listError, setListError] = useState("");
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(5);
  const [page, setPage] = useState(1);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  const loadMembers = async () => {
    setLoading(true);
    setListError("");
    try {
      setMembers(await getMembers());
    } catch (requestError) {
      setListError(requestError.message || "Could not load members.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    if (!form.photo) {
      setPhotoPreview(null);
      return;
    }
    const url = URL.createObjectURL(form.photo);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [form.photo]);

  const totalPartners = useMemo(
    () => members.filter((member) => /partner/i.test(member.designation || "")).length,
    [members],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return members;
    return members.filter((member) =>
      [
        member.memberId,
        member.memberName,
        member.companyName,
        member.state?.stateName,
        member.city?.cityName,
        member.mobile,
        member.designation,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [members, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const updateField = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const clearPhoto = () => {
    updateField("photo", null);
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.memberId.trim() || !form.memberName.trim()) {
      setError("Member ID and Member Name are required.");
      return;
    }
    if (!editingId && members.some((member) => member.memberId === form.memberId.trim())) {
      setError("A member with this Member ID already exists.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      if (editingId) {
        await updateMember(editingId, form);
      } else {
        await createMember(form);
      }
      await loadMembers();
      closeForm();
    } catch (requestError) {
      setError(requestError.message || "Could not save member.");
    } finally {
      setSaving(false);
    }
  };

  const editMember = (member) => {
    setForm({
      ...emptyForm,
      memberId: member.memberId || "",
      memberName: member.memberName || "",
      fatherName: member.fatherName || "",
      residentialAddress: member.residentialAddress || "",
      mobile: member.mobile || "",
      residentialTelephone: member.residentialTelephone || "",
      panCardNo: member.panCardNo || "",
      designation: member.designation || "",
      companyName: member.companyName || "",
      companyAddress: member.companyAddress || "",
      companyTelephone: member.companyTelephone || "",
      packetNo: member.packetNo || "",
      dateOfJoining: member.dateOfJoining ? member.dateOfJoining.slice(0, 10) : "",
      aadharNo: member.aadharNo || "",
      state: member.state?.stateName || "",
      city: member.city?.cityName || "",
      photo: null,
    });
    setEditingId(member.id);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    setShowForm(true);
  };

  const deleteMember = async (member) => {
    if (!window.confirm(`Remove ${member.memberName || "this member"} from the directory?`)) return;
    try {
      await deleteMemberRequest(member.id);
      if (editingId === member.id) closeForm();
      await loadMembers();
    } catch (requestError) {
      setListError(requestError.message || "Could not delete member.");
    }
  };

  const toggleStatus = async (member) => {
    try {
      await toggleMemberStatus(member.id);
      await loadMembers();
    } catch (requestError) {
      setListError(requestError.message || "Could not update member status.");
    }
  };

  return (
    <section className="space-y-2">
      <div className="flex flex-col gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-bold text-primary">
          Total Member : <span className="text-slate-700">{members.length}</span>
        </p>
        <p className="text-sm font-bold text-primary">
          Total Partner : <span className="text-slate-700">{totalPartners}</span>
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <h2 className="text-xl font-bold">Manage Directory</h2>
        {!showForm && (
          <button
            type="button"
            onClick={openNewForm}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-deep"
          >
            <Plus className="h-5 w-5" /> Add Member
          </button>
        )}
      </div>

      {showForm && (
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={closeForm}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            {editingId && (
              <span className="rounded-full bg-amber-100 px-1 py-1 text-xs font-semibold text-amber-700 whitespace-nowrap">
                Editing {form.memberName || form.memberId}
              </span>
            )}
          </div>
          <h2 className="w-full text-center text-2xl font-bold mt-3 mb-4">
            {editingId ? "Edit Member" : "Add Member"}
          </h2>

          <form onSubmit={handleSubmit} className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
            <Field label="Member ID" required>
              <input
                value={form.memberId}
                onChange={(e) => updateField("memberId", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Company Name">
              <input
                value={form.companyName}
                onChange={(e) => updateField("companyName", e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Member Name" required>
              <input
                value={form.memberName}
                onChange={(e) => updateField("memberName", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Company Address">
              <input
                value={form.companyAddress}
                onChange={(e) => updateField("companyAddress", e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Father's Name">
              <input
                value={form.fatherName}
                onChange={(e) => updateField("fatherName", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="State">
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
            </Field>

            <Field label="Member Photo">
              <div className="flex items-center gap-3">
                {photoPreview ? (
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-slate-200">
                    <img
                      src={photoPreview}
                      alt="Member preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-300 text-slate-300">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => updateField("photo", e.target.files?.[0] || null)}
                  className="block w-full flex-1 rounded-lg border border-slate-200 p-2.5 text-sm text-slate-600"
                />
                {form.photo && (
                  <button
                    type="button"
                    onClick={clearPhoto}
                    aria-label="Remove photo"
                    className="shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </Field>
            <Field label="City">
              <input
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Mobile">
              <input
                value={form.mobile}
                onChange={(e) => updateField("mobile", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Company Tel.">
              <input
                value={form.companyTelephone}
                onChange={(e) => updateField("companyTelephone", e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Residential Telephone">
              <input
                value={form.residentialTelephone}
                onChange={(e) => updateField("residentialTelephone", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Packet No.">
              <input
                value={form.packetNo}
                onChange={(e) => updateField("packetNo", e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Pan Card No.">
              <input
                value={form.panCardNo}
                onChange={(e) => updateField("panCardNo", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Aadhar Card No.">
              <input
                value={form.aadharNo}
                onChange={(e) => updateField("aadharNo", e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Date of Joining">
              <input
                type="date"
                value={form.dateOfJoining}
                onChange={(e) => updateField("dateOfJoining", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Designation">
              <DesignationCombobox
                value={form.designation}
                onChange={(value) => updateField("designation", value)}
              />
            </Field>

            <Field label="Residential Address" className="sm:col-span-2">
              <textarea
                value={form.residentialAddress}
                onChange={(e) => updateField("residentialAddress", e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/15"
              />
            </Field>

            {error && (
              <p
                role="alert"
                className="sm:col-span-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            <div className="flex gap-3 sm:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-deep disabled:opacity-60"
              >
                <Plus className="h-4 w-4" />{" "}
                {saving ? "Saving…" : editingId ? "Save Member" : "Add Member"}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="h-11 rounded-lg bg-red-600 px-6 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            Show
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="h-9 rounded-lg border border-slate-200 px-2 text-sm"
            >
              {[5, 10, 25, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            entries
          </label>
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search"
              className="h-9 w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm sm:w-64"
            />
          </label>
        </div>

        {listError && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {listError}
          </p>
        )}

        {loading ? (
          <p className="mt-6 py-12 text-center text-sm text-slate-500">Loading members…</p>
        ) : pageRows.length === 0 ? (
          <div className="mt-6 flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300">
            <Users className="h-9 w-9 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-500">No members found</p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto scrollbar-hide rounded-xl border border-slate-200">
            <table className="w-full min-w-175 text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-3 py-2.5">Member ID</th>
                  <th className="px-3 py-2.5">Name</th>
                  <th className="px-3 py-2.5">Company</th>
                  <th className="px-3 py-2.5">State / City</th>
                  <th className="px-3 py-2.5">Mobile</th>
                  <th className="px-3 py-2.5">Designation</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((member) => (
                  <tr key={member.id} className="border-t border-slate-100">
                    <td className="px-3 py-2.5 font-medium">{member.memberId}</td>
                    <td className="px-3 py-2.5">{member.memberName}</td>
                    <td className="px-3 py-2.5 text-slate-600">{member.companyName || "—"}</td>
                    <td className="px-3 py-2.5 text-slate-600">
                      {[member.city?.cityName, member.state?.stateName]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </td>
                    <td className="px-3 py-2.5 text-slate-600">{member.mobile || "—"}</td>
                    <td className="px-3 py-2.5 text-slate-600">{member.designation || "—"}</td>
                    <td className="px-3 py-2.5">
                      <button
                        onClick={() => toggleStatus(member)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${member.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}
                      >
                        {member.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => editMember(member)}
                          className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-primary"
                        >
                          <Pencil className="h-4 w-4" /> Edit
                        </button>
                        <button
                          onClick={() => deleteMember(member)}
                          className="inline-flex items-center gap-1 font-semibold text-red-600"
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
            <p>
              Showing {(currentPage - 1) * pageSize + 1}–
              {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}
            </p>
            <div className="flex gap-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
