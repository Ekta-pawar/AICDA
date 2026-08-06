import { useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2, Users } from "lucide-react";

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

const emptyForm = {
  memberId: "",
  memberName: "",
  fatherName: "",
  photo: null,
  residentialAddress: "",
  mobile: "",
  residentialTelephone: "",
  panCard: "",
  designation: "",
  companyName: "",
  companyAddress: "",
  state: "",
  city: "",
  companyTel: "",
  packetNo: "",
  dateOfJoining: "",
  aadharCard: "",
};

function Field({ label, required, children }) {
  return (
    <div>
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

export function DirectoryManagement() {
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(5);
  const [page, setPage] = useState(1);

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
        member.state,
        member.city,
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
  };

  const handleSubmit = (event) => {
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
    if (editingId) {
      setMembers((prev) =>
        prev.map((member) => (member.id === editingId ? { ...form, id: editingId } : member)),
      );
    } else {
      setMembers((prev) => [...prev, { ...form, id: crypto.randomUUID() }]);
    }
    resetForm();
  };

  const editMember = (member) => {
    setForm({ ...emptyForm, ...member });
    setEditingId(member.id);
    setError("");
  };

  const deleteMember = (member) => {
    if (!window.confirm(`Remove ${member.memberName || "this member"} from the directory?`)) return;
    setMembers((prev) => prev.filter((item) => item.id !== member.id));
    if (editingId === member.id) resetForm();
  };

  return (
    <section className="space-y-2">
      <div className="flex flex-col gap-4 rounded-xl border border-primary/20 bg-primary/5 px-2 py-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-bold text-primary">
          Total Member : <span className="text-slate-700">{members.length}</span>
        </p>
        <p className="text-sm font-bold text-primary">
          Total Partner : <span className="text-slate-700">{totalPartners}</span>
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Manage Directory</h2>
            <p className="mt-1 text-sm text-slate-500">
              Add and maintain member directory records.
            </p>
          </div>
          {editingId && (
            <span className="rounded-full bg-amber-100 px-1 py-1 text-xs font-semibold text-amber-700">
              Editing {form.memberName || form.memberId}
            </span>
          )}
        </div>

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
            <input
              type="file"
              accept="image/*"
              onChange={(e) => updateField("photo", e.target.files?.[0] || null)}
              className="block w-full rounded-lg border border-slate-200 p-2.5 text-sm text-slate-600"
            />
          </Field>
          <Field label="City">
            <input
              value={form.city}
              onChange={(e) => updateField("city", e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Residential Address">
            <textarea
              value={form.residentialAddress}
              onChange={(e) => updateField("residentialAddress", e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/15"
            />
          </Field>
          <Field label="Company Tel.">
            <input
              value={form.companyTel}
              onChange={(e) => updateField("companyTel", e.target.value)}
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
          <Field label="Packet No.">
            <input
              value={form.packetNo}
              onChange={(e) => updateField("packetNo", e.target.value)}
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
          <Field label="Date of Joining">
            <input
              type="date"
              value={form.dateOfJoining}
              onChange={(e) => updateField("dateOfJoining", e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Pan Card No.">
            <input
              value={form.panCard}
              onChange={(e) => updateField("panCard", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Aadhar Card No.">
            <input
              value={form.aadharCard}
              onChange={(e) => updateField("aadharCard", e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Designation">
            <input
              value={form.designation}
              onChange={(e) => updateField("designation", e.target.value)}
              className={inputClass}
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
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-deep"
            >
              <Plus className="h-4 w-4" /> {editingId ? "Save Member" : "Add Member"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="h-11 rounded-lg bg-red-600 px-6 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
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

        {pageRows.length === 0 ? (
          <div className="mt-6 flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300">
            <Users className="h-9 w-9 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-500">No members found</p>
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto scrollbar-hide rounded-xl border border-slate-200">
            <table className="w-full min-w-180 text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3">Member ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">State / City</th>
                  <th className="px-4 py-3">Mobile</th>
                  <th className="px-4 py-3">Designation</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((member) => (
                  <tr key={member.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium">{member.memberId}</td>
                    <td className="px-4 py-3">{member.memberName}</td>
                    <td className="px-4 py-3 text-slate-600">{member.companyName || "—"}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {[member.city, member.state].filter(Boolean).join(", ") || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{member.mobile || "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{member.designation || "—"}</td>
                    <td className="px-4 py-3">
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
          <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
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
