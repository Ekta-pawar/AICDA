import { api, unwrapData } from "./api";

// ===============================
// Submit Enquiry / Membership Request
// ===============================
export async function submitEnquiry(payload) {
  return unwrapData(
    await api("/enquiries", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  );
}

// ===============================
// Get Enquiries (admin)
// ===============================
export async function getEnquiries(options = {}) {
  const params = new URLSearchParams();

  if (options.page) params.append("page", String(options.page));
  if (options.limit) params.append("limit", String(options.limit));
  if (options.search?.trim()) params.append("search", options.search.trim());

  const response = await api(`/enquiries?${params.toString()}`);
  const data = unwrapData(response);

  return {
    enquiries: data.enquiries || data.items || data.data || [],
    count: data.count ?? data.total ?? data.totalCount ?? 0,
  };
}

// ===============================
// Delete Enquiry (admin)
// ===============================
export async function deleteEnquiry(id) {
  return unwrapData(await api(`/enquiries/${id}`, { method: "DELETE" }));
}
