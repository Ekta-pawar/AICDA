import { api, unwrapData } from "./api";

export async function getAdmins() {
  const result = unwrapData(await api("/admin"));
  return Array.isArray(result) ? result : result?.admins || result?.items || [];
}

export async function getAdmin(id) {
  return unwrapData(await api(`/admin/${id}`));
}

export async function createAdmin(payload) {
  return unwrapData(
    await api("/admin/create", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  );
}

export async function updateAdmin(id, payload) {
  return unwrapData(
    await api(`/admin/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  );
}

export async function updateAdminStatus(id, payload) {
  return unwrapData(
    await api(`/admin/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  );
}

export async function deleteAdmin(id) {
  return unwrapData(await api(`/admin/${id}`, { method: "DELETE" }));
}
