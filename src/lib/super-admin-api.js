import { api, unwrapData } from "./api";

export async function getSuperAdmins() {
  const result = unwrapData(await api("/super-admin"));
  return Array.isArray(result) ? result : result?.admins || result?.items || [];
}

export async function getSuperAdmin(id) {
  return unwrapData(await api(`/super-admin/${id}`));
}

export async function createSuperAdmin(payload) {
  return unwrapData(
    await api("/super-admin/create", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  );
}

export async function updateSuperAdmin(id, payload) {
  return unwrapData(
    await api(`/super-admin/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  );
}

export async function updateSuperAdminStatus(id, payload) {
  return unwrapData(
    await api(`/super-admin/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  );
}

export async function deleteSuperAdmin(id) {
  return unwrapData(await api(`/super-admin/${id}`, { method: "DELETE" }));
}

export async function resetSuperAdminPassword(id, payload) {
  return unwrapData(
    await api(`/super-admin/${id}/reset-password`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  );
}
