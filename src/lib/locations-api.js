import { api, unwrapData } from "./api";

export async function searchCities(search) {
  const query = new URLSearchParams();
  if (search?.trim()) query.append("search", search.trim());
  const result = unwrapData(await api(`/locations/cities?${query.toString()}`));
  return Array.isArray(result) ? result : [];
}
