import { api, unwrapData } from "./api";

export async function uploadGalleryImage(file, category) {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("category", category);
  return unwrapData(await api("/gallery/upload", { method: "POST", body: formData }));
}

export async function testGallery() {
  return unwrapData(await api("/gallery/test"));
}

export async function getGalleryImages({ category, page = 1, limit = 12 } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (category) params.set("category", category);

  const response = await api(`/gallery?${params}`);
  const data = unwrapData(response);
  const images = Array.isArray(data) ? data : data?.images || data?.items || [];

  return {
    images,
    pagination: response?.pagination || data?.pagination || {},
  };
}
