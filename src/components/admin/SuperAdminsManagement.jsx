import { useEffect, useState } from "react";
import { Plus, ShieldCheck } from "lucide-react";
import {
  createSuperAdmin,
  deleteSuperAdmin,
  getSuperAdmins,
  updateSuperAdminStatus,
} from "@/lib/super-admin-api";
import { FieldRow, inputClass } from "./directory-shared";
import { ChangePasswordModal } from "./ChangePasswordModal";

export function SuperAdminsManagement() {
  const [showForm, setShowForm] = useState(false);
  const [superAdmins, setSuperAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [passwordResetTarget, setPasswordResetTarget] = useState(null);

  const loadSuperAdmins = async () => {
    setLoading(true);
    setError("");
    try {
      setSuperAdmins(await getSuperAdmins());
    } catch (requestError) {
      setError(requestError.message || "Could not load Super Admins.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuperAdmins();
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setError("");
    try {
      await createSuperAdmin({
        firstName: form.get("firstName"),
        lastName: form.get("lastName"),
        email: form.get("email"),
        phone: form.get("phone"),
        password: form.get("password"),
      });
      setShowForm(false);
      await loadSuperAdmins();
    } catch (requestError) {
      setError(requestError.message || "Could not create Super Admin.");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (superAdmin) => {
    const id = superAdmin.id || superAdmin._id;
    if (!id) return;
    const isActive = superAdmin.isActive ?? superAdmin.active ?? superAdmin.status === "ACTIVE";
    try {
      await updateSuperAdminStatus(id, { isActive: !isActive });
      await loadSuperAdmins();
    } catch (requestError) {
      setError(requestError.message || "Could not update Super Admin status.");
    }
  };

  const removeSuperAdmin = async (superAdmin) => {
    const id = superAdmin.id || superAdmin._id;
    if (!id || !window.confirm(`Delete ${superAdmin.email || "this Super Admin"}?`)) return;
    try {
      await deleteSuperAdmin(id);
      await loadSuperAdmins();
    } catch (requestError) {
      setError(requestError.message || "Could not delete Super Admin.");
    }
  };

  return (
    <section className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[3px] border border-slate-300 bg-white px-3 py-2">
        <h2 className="text-lg font-bold">Super Admins</h2>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-[3px] bg-blue-600 px-3 text-[13px] font-semibold text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> New Super Admin
        </button>
      </div>

      <div className="rounded-[3px] border border-slate-300 bg-white p-3">
        {error && (
          <p role="alert" className="rounded-[3px] bg-red-50 px-3 py-2 text-[13px] text-red-700">
            {error}
          </p>
        )}

        {loading ? (
          <p className="py-12 text-center text-[13px] text-slate-500">Loading Super Admins…</p>
        ) : superAdmins.length ? (
          <>
            <div className="mt-3 space-y-2 md:hidden">
              {superAdmins.map((superAdmin) => {
                const isActive =
                  superAdmin.isActive ?? superAdmin.active ?? superAdmin.status === "ACTIVE";
                const name =
                  superAdmin.name ||
                  [superAdmin.firstName, superAdmin.lastName].filter(Boolean).join(" ") ||
                  "—";
                return (
                  <div
                    key={superAdmin.id || superAdmin._id || superAdmin.email}
                    className="rounded-[3px] border border-slate-300 p-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold">{name}</p>
                        <p className="truncate text-xs text-slate-500">{superAdmin.email}</p>
                      </div>
                      <button
                        onClick={() => toggleStatus(superAdmin)}
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-opacity hover:opacity-80 ${isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}
                      >
                        {isActive ? "Active" : "Inactive"}
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      Role:{" "}
                      <span className="text-slate-700">{superAdmin.role || "SUPER_ADMIN"}</span>
                    </p>
                    <div className="mt-2 flex flex-wrap justify-end gap-4 border-t border-slate-100 pt-2">
                      <button
                        onClick={() => setPasswordResetTarget(superAdmin)}
                        className="text-[13px] font-semibold text-slate-600 transition-colors hover:text-sky-700"
                      >
                        Change password
                      </button>
                      <button
                        onClick={() => removeSuperAdmin(superAdmin)}
                        className="text-[13px] font-semibold text-red-600 transition-colors hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 hidden overflow-x-auto scrollbar-hide rounded-[3px] border border-slate-300 md:block">
              <table className="w-full min-w-160 text-left text-[13px]">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-2.5 py-2">Name</th>
                    <th className="px-2.5 py-2">Email</th>
                    <th className="px-2.5 py-2">Role</th>
                    <th className="px-2.5 py-2">Status</th>
                    <th className="px-2.5 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {superAdmins.map((superAdmin, index) => {
                    const isActive =
                      superAdmin.isActive ?? superAdmin.active ?? superAdmin.status === "ACTIVE";
                    return (
                      <tr
                        key={superAdmin.id || superAdmin._id || superAdmin.email}
                        className={`border-t border-slate-200 transition-colors hover:bg-sky-50/60 ${index % 2 === 0 ? "bg-rose-50/70" : "bg-white"}`}
                      >
                        <td className="px-2.5 py-2 font-medium">
                          {superAdmin.name ||
                            [superAdmin.firstName, superAdmin.lastName].filter(Boolean).join(" ") ||
                            "—"}
                        </td>
                        <td className="px-2.5 py-2 text-slate-600">{superAdmin.email}</td>
                        <td className="px-2.5 py-2 text-slate-600">
                          {superAdmin.role || "SUPER_ADMIN"}
                        </td>
                        <td className="px-2.5 py-2">
                          <button
                            onClick={() => toggleStatus(superAdmin)}
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold transition-opacity hover:opacity-80 ${isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}
                          >
                            {isActive ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="px-2.5 py-2">
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={() => setPasswordResetTarget(superAdmin)}
                              className="font-semibold text-slate-600 transition-colors hover:text-sky-700"
                            >
                              Change password
                            </button>
                            <button
                              onClick={() => removeSuperAdmin(superAdmin)}
                              className="font-semibold text-red-600 transition-colors hover:text-red-700"
                            >
                              Delete
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
        ) : (
          <div className="mt-3 flex min-h-48 flex-col items-center justify-center rounded-[3px] border border-dashed border-slate-300">
            <ShieldCheck className="h-9 w-9 text-slate-300" />
            <p className="mt-3 text-[13px] font-semibold text-slate-500">
              No Super Admin accounts found
            </p>
          </div>
        )}
      </div>

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-super-admin-title"
        >
          <form
            className="w-full max-w-2xl animate-in rounded-[3px] bg-white shadow-2xl fade-in-0 zoom-in-95 duration-150"
            onSubmit={handleCreate}
          >
            <div className="border-b border-slate-200 bg-slate-50 px-5 py-3">
              <p
                id="create-super-admin-title"
                className="text-[13px] font-bold uppercase tracking-wide text-slate-500"
              >
                Create new Super Admin
              </p>
            </div>
            <div className="grid gap-x-2 p-3 sm:grid-cols-2">
              <FieldRow label="First name" required>
                <input name="firstName" required className={inputClass} />
              </FieldRow>
              <FieldRow label="Last name" required>
                <input name="lastName" required className={inputClass} />
              </FieldRow>
              <FieldRow label="Email" required>
                <input name="email" type="email" required className={inputClass} />
              </FieldRow>
              <FieldRow label="Phone number" required>
                <input name="phone" type="tel" required className={inputClass} />
              </FieldRow>
              <FieldRow label="Password" required>
                <input name="password" type="password" required className={inputClass} />
              </FieldRow>
            </div>
            {error && (
              <p role="alert" className="px-3 pb-2 text-[13px] text-red-700">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-2 border-t border-slate-200 px-3 py-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="h-9 rounded-[3px] bg-slate-100 px-4 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="h-9 rounded-[3px] bg-blue-600 px-4 text-[13px] font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Creating…" : "Create Super Admin"}
              </button>
            </div>
          </form>
        </div>
      )}

      {passwordResetTarget && (
        <ChangePasswordModal
          onClose={() => setPasswordResetTarget(null)}
          defaultEmail={passwordResetTarget.email}
          superAdminId={passwordResetTarget.id || passwordResetTarget._id}
        />
      )}
    </section>
  );
}
