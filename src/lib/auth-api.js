import { api, unwrapData } from "./api";

export async function login(email, password) {
  const response = unwrapData(
    await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  );
  const token = response?.accessToken || response?.token || response?.access_token;
  if (token && typeof window !== "undefined") {
    window.localStorage.setItem("aicda_access_token", token);
  }
  return response;
}

export async function logout() {
  try {
    return unwrapData(await api("/auth/logout", { method: "POST" }));
  } finally {
    if (typeof window !== "undefined") window.localStorage.removeItem("aicda_access_token");
  }
}

export async function getCurrentUser() {
  const response = unwrapData(await api("/auth/me"));
  return response?.user || response;
}

export async function testAuth() {
  return unwrapData(await api("/auth/test"));
}

export async function changePassword({ email, newPassword, confirmPassword }) {
  return unwrapData(
    await api("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ email, newPassword, confirmPassword }),
    }),
  );
}
