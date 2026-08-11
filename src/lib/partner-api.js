import { api, unwrapData } from "./api";

function buildPartnerFormData(partner) {
  const formData = new FormData();
  const fields = {
    memberId: partner.memberId,
    partnerName: partner.partnerName,
    fatherName: partner.fatherName,
    residentialAddress: partner.residentialAddress,
    mobile: partner.mobile,
    residentialTelephone: partner.residentialTelephone,
    panCardNo: partner.panCardNo,
    aadharNo: partner.aadharNo,
    designation: partner.designation,
    companyName: partner.companyName,
    companyAddress: partner.companyAddress,
    companyTelephone: partner.companyTelephone,
    packetNo: partner.packetNo,
    dateOfJoining: partner.dateOfJoining,
    state: partner.state,
    city: partner.city,
    validityFrom: partner.validityFrom,
    validityTo: partner.validityTo,
  };

  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) formData.append(key, value);
  });

  if (partner.photo instanceof File) formData.append("photo", partner.photo);

  return formData;
}

export async function getPartners() {
  const result = unwrapData(await api("/partners"));
  return Array.isArray(result) ? result : result?.partners || result?.items || [];
}

export async function getPublicPartners() {
  const result = unwrapData(await api("/partners/public"));
  return Array.isArray(result) ? result : result?.partners || result?.items || [];
}

export async function getPartner(id) {
  return unwrapData(await api(`/partners/${id}`));
}

export async function createPartner(partner) {
  return unwrapData(
    await api("/partners", {
      method: "POST",
      body: buildPartnerFormData(partner),
    }),
  );
}

export async function updatePartner(id, partner) {
  return unwrapData(
    await api(`/partners/${id}`, {
      method: "PUT",
      body: buildPartnerFormData(partner),
    }),
  );
}

export async function togglePartnerStatus(id) {
  return unwrapData(await api(`/partners/${id}/status`, { method: "PATCH" }));
}

export async function deletePartner(id) {
  return unwrapData(await api(`/partners/${id}`, { method: "DELETE" }));
}
