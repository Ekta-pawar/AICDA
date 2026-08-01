import { api, unwrapData } from "./api";

// ===============================
// Upload Image
// ===============================
export async function uploadGalleryImage(file, category, title = "", description = "") {
  const formData = new FormData();

  formData.append("image", file);
  formData.append("category", category);

  if (title) formData.append("title", title);
  if (description) formData.append("description", description);

  return unwrapData(
    await api("/gallery/upload", {
      method: "POST",
      body: formData,
    }),
  );
}

// ===============================
// Test Gallery Route
// ===============================
export async function testGallery() {
  return unwrapData(await api("/gallery/test"));
}

// ===============================
// Get Gallery Images
// ===============================
export async function getGalleryImages(category = "", options = {}) {
  const params = new URLSearchParams();

  if (category) {
    params.append("category", category);
  }
  if (options.page) params.append("page", String(options.page));
  if (options.limit) params.append("limit", String(options.limit));
  if (options.search?.trim()) params.append("search", options.search.trim());

  const response = await api(`/gallery?${params.toString()}`);

  const data = unwrapData(response);

  return {
    gallery: data.gallery || data.items || data.images || [],
    count: data.count ?? data.total ?? data.totalCount ?? 0,
  };
}

// ===============================
// Get Single Image
// ===============================
export async function getSingleGalleryImage(id) {
  return unwrapData(await api(`/gallery/${id}`));
}

// ===============================
// Update Image
// ===============================
export async function updateGalleryImage(id, { file, category, title, description }) {
  const formData = new FormData();

  if (file) formData.append("image", file);
  if (category) formData.append("category", category);
  if (title) formData.append("title", title);
  if (description) formData.append("description", description);

  return unwrapData(
    await api(`/gallery/${id}`, {
      method: "PATCH",
      body: formData,
    }),
  );
}

// ===============================
// Delete Image
// ===============================
export async function deleteGalleryImage(id) {
  return unwrapData(
    await api(`/gallery/${id}`, {
      method: "DELETE",
    }),
  );
}
