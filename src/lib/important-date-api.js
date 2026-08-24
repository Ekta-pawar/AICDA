import { api, unwrapData } from "./api";

export async function getImportantDates() {
  const response = await api("/important-dates");
  const dates = unwrapData(response);
  return Array.isArray(dates) ? dates : [];
}

export async function createImportantDate(importantDate) {
  return unwrapData(
    await api("/important-dates", {
      method: "POST",
      body: JSON.stringify(importantDate),
    }),
  );
}

export async function updateImportantDate(id, importantDate) {
  return unwrapData(
    await api(`/important-dates/${id}`, {
      method: "PUT",
      body: JSON.stringify(importantDate),
    }),
  );
}

export async function deleteImportantDate(id) {
  return unwrapData(await api(`/important-dates/${id}`, { method: "DELETE" }));
}

export async function getUpcomingBirthdays() {
  const response = await api("/important-dates/birthdays/upcoming");
  const birthdays = unwrapData(response);
  return Array.isArray(birthdays) ? birthdays : [];
}
