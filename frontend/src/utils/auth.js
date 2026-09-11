export function getAccessToken() {
  return localStorage.getItem("access_token");
}

export function getRefreshToken() {
  return localStorage.getItem("refresh_token");
}

export function isAuthenticated() {
  return Boolean(getAccessToken());
}

export function saveTokens(accessToken, refreshToken) {
  if (accessToken) {
    localStorage.setItem(
      "access_token",
      accessToken
    );
  }

  if (refreshToken) {
    localStorage.setItem(
      "refresh_token",
      refreshToken
    );
  }
}

export function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}