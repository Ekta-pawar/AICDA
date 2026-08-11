const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export async function api(path, options = {}) {
  const { headers, body, ...requestOptions } = options;
  const isFormData = body instanceof FormData;
  const token =
    typeof window !== "undefined" ? window.localStorage.getItem("aicda_access_token") : null;

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      credentials: "include",
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body,
      ...requestOptions,
    });
  } catch {
    throw new ApiError("Could not reach the server. Check your connection and try again.", 0, null);
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      (typeof data === "string" && data.trim()) ||
      `Request failed with status ${response.status}.`;
    throw new ApiError(message, response.status, data);
  }

  return data;
}

export function unwrapData(response) {
  return response?.data ?? response?.result ?? response;
}
