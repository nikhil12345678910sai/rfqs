import api from "./api";

export async function getRFQs(params = {}) {
  const response = await api.get("/rfqs/", {
    params,
  });

  return response.data;
}

export async function getRFQ(id) {
  const response = await api.get(`/rfqs/${id}/`);

  return response.data;
}

export async function createRFQ(rfqData) {
  const response = await api.post(
    "/rfqs/",
    rfqData
  );

  return response.data;
}

export async function updateRFQ(id, rfqData) {
  const response = await api.patch(
    `/rfqs/${id}/`,
    rfqData
  );

  return response.data;
}

export async function deleteRFQ(id) {
  const response = await api.delete(
    `/rfqs/${id}/`
  );

  return response.data;
}