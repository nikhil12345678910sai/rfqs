import api from "./api";

export async function getQuotations() {
  const response = await api.get("/quotations/");
  return response.data;
}

export async function getQuotation(id) {
  const response = await api.get(`/quotations/${id}/`);
  return response.data;
}

export async function createQuotation(quotationData) {
  const response = await api.post("/quotations/", quotationData);
  return response.data;
}

export async function updateQuotation(id, quotationData) {
  const response = await api.patch(
    `/quotations/${id}/`,
    quotationData
  );
  return response.data;
}

export async function deleteQuotation(id) {
  const response = await api.delete(`/quotations/${id}/`);
  return response.data;
}

export async function getRFQQuotations(rfqId) {
  const response = await api.get(
    `/quotations/rfq/${rfqId}/`
  );
  return response.data;
}

export async function acceptQuotation(id) {
  const response = await api.post(
    `/quotations/${id}/accept/`
  );
  return response.data;
}

export async function rejectQuotation(id) {
  const response = await api.post(
    `/quotations/${id}/reject/`
  );
  return response.data;
}