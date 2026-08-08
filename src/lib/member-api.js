import { api, unwrapData } from "./api";

function buildMemberFormData(member) {
  const formData = new FormData();
  const fields = {
    memberId: member.memberId,
    memberName: member.memberName,
    fatherName: member.fatherName,
    residentialAddress: member.residentialAddress,
    mobile: member.mobile,
    residentialTelephone: member.residentialTelephone,
    panCardNo: member.panCardNo,
    designation: member.designation,
    companyName: member.companyName,
    companyAddress: member.companyAddress,
    companyTelephone: member.companyTelephone,
    packetNo: member.packetNo,
    dateOfJoining: member.dateOfJoining,
    aadharNo: member.aadharNo,
  };

  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) formData.append(key, value);
  });

  if (member.photo instanceof File) formData.append("photo", member.photo);

  return formData;
}

export async function getMembers() {
  const result = unwrapData(await api("/members"));
  return Array.isArray(result) ? result : result?.members || result?.items || [];
}

export async function getMember(id) {
  return unwrapData(await api(`/members/${id}`));
}

export async function getPublicMembers() {
  const result = unwrapData(await api("/members/public"));
  return Array.isArray(result) ? result : result?.members || result?.items || [];
}

export async function createMember(member) {
  return unwrapData(
    await api("/members", {
      method: "POST",
      body: buildMemberFormData(member),
    }),
  );
}

export async function updateMember(id, member) {
  return unwrapData(
    await api(`/members/${id}`, {
      method: "PUT",
      body: buildMemberFormData(member),
    }),
  );
}

export async function toggleMemberStatus(id) {
  return unwrapData(await api(`/members/${id}/status`, { method: "PATCH" }));
}

export async function deleteMember(id) {
  return unwrapData(await api(`/members/${id}`, { method: "DELETE" }));
}
