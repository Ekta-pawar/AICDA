import { api, unwrapData } from "./api";

function buildImportantDateFormData(importantDate) {
  const formData = new FormData();
  const fields = {
    title: importantDate.title,
    date: importantDate.date,
    description: importantDate.description,
  };

  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") formData.append(key, value);
  });

  if (importantDate.image instanceof File) formData.append("image", importantDate.image);

  return formData;
}

export async function getImportantDates() {
  const response = await api("/important-dates");
  const dates = unwrapData(response);
  return Array.isArray(dates) ? dates : [];
}

export async function createImportantDate(importantDate) {
  return unwrapData(
    await api("/important-dates", {
      method: "POST",
      body: buildImportantDateFormData(importantDate),
    }),
  );
}

export async function updateImportantDate(id, importantDate) {
  return unwrapData(
    await api(`/important-dates/${id}`, {
      method: "PUT",
      body: buildImportantDateFormData(importantDate),
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
