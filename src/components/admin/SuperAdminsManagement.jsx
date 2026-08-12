import { useEffect, useState } from "react";
import { Plus, ShieldCheck } from "lucide-react";
import {
  createSuperAdmin,
  deleteSuperAdmin,
  getSuperAdmins,
  updateSuperAdminStatus,
} from "@/lib/super-admin-api";
import { ChangePasswordModal } from "./ChangePasswordModal";

function SuperAdminField({ id, name, label, type = "text", required = false }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="text-primary"> *</span>}
      </label>
      <input
        id={id}
        name={name || id}
        type={type}
        required={required}
        className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/15"
      />
    </div>
  );
}

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
    <>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">Welcome back,</p>
          <h2 className="mt-0.5 text-2xl font-bold tracking-tight">Super Admin</h2>
        </div>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="font-serif text-3xl font-bold text-primary">Super Admins</h3>
            <p className="mt-1 text-base text-slate-500">Manage Super Admin accounts</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-deep"
          >
            <Plus className="h-5 w-5" /> New Super Admin
          </button>
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}
        {loading ? (
          <p className="py-12 text-center text-sm text-slate-500">Loading Super Admins…</p>
        ) : superAdmins.length ? (
          <div className="mt-5 overflow-x-auto scrollbar-hide">
            <table className="w-full min-w-160 text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-3 py-2.5">Name</th>
                  <th className="px-3 py-2.5">Email</th>
                  <th className="px-3 py-2.5">Role</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {superAdmins.map((superAdmin) => {
                  const isActive =
                    superAdmin.isActive ?? superAdmin.active ?? superAdmin.status === "ACTIVE";
                  return (
                    <tr
                      key={superAdmin.id || superAdmin._id || superAdmin.email}
                      className="border-b border-slate-100"
                    >
                      <td className="px-3 py-3 font-medium">
                        {superAdmin.name ||
                          [superAdmin.firstName, superAdmin.lastName].filter(Boolean).join(" ") ||
                          "—"}
                      </td>
                      <td className="px-3 py-3 text-slate-600">{superAdmin.email}</td>
                      <td className="px-3 py-3 text-slate-600">
                        {superAdmin.role || "SUPER_ADMIN"}
                      </td>
                      <td className="px-3 py-3">
                        <button
                          onClick={() => toggleStatus(superAdmin)}
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="space-x-3 px-3 py-3 text-right">
                        <button
                          onClick={() => setPasswordResetTarget(superAdmin)}
                          className="text-sm font-semibold text-slate-600 hover:text-primary"
                        >
                          Change password
                        </button>
                        <button
                          onClick={() => removeSuperAdmin(superAdmin)}
                          className="text-sm font-semibold text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-5 flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h4 className="mt-5 text-lg font-bold text-slate-800">No Super Admin accounts found</h4>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Create a Super Admin to grant management portal access.
            </p>
          </div>
        )}
      </section>

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-[1px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-super-admin-title"
        >
          <form
            className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl sm:p-7"
            onSubmit={handleCreate}
          >
            <h3 id="create-super-admin-title" className="text-2xl font-bold text-slate-800">
              Create new Super Admin
            </h3>
            <div className="mt-6 grid gap-x-5 gap-y-5 sm:grid-cols-2">
              <SuperAdminField id="first-name" name="firstName" label="First name" required />
              <SuperAdminField id="last-name" name="lastName" label="Last name" required />
              <SuperAdminField
                id="super-admin-email"
                name="email"
                label="Email"
                type="email"
                required
              />
              <SuperAdminField
                id="phone-number"
                name="phone"
                label="Phone number"
                type="tel"
                required
              />
              <SuperAdminField
                id="new-password"
                name="password"
                label="Password"
                type="password"
                required
              />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="h-11 rounded-lg bg-slate-100 px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="h-11 rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-deep disabled:opacity-60"
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
    </>
  );
}
