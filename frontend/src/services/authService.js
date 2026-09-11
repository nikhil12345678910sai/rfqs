import api from "./api";

export async function registerUser(userData) {
  const response = await api.post(
    "/auth/register/",
    userData
  );

  return response.data;
}

export async function loginUser(credentials) {
  const response = await api.post(
    "/auth/login/",
    credentials
  );

  const data = response.data;

  if (data.access) {
    localStorage.setItem(
      "access_token",
      data.access
    );
  }

  if (data.refresh) {
    localStorage.setItem(
      "refresh_token",
      data.refresh
    );
  }

  return data;
}

export async function getCurrentUser() {
  const response = await api.get("/auth/me/");

  return response.data;
}

export function logoutUser() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}