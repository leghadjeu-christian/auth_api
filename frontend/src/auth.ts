const TOKEN_KEY = "jwt_token";
const SESSION_DURATION = 10 * 60 * 1000; // 10 minutes in ms

export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem("login_time", Date.now().toString());
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("login_time");
}

export function isSessionValid() {
  const loginTime = localStorage.getItem("login_time");
  if (!loginTime) return false;
  return Date.now() - parseInt(loginTime) < SESSION_DURATION;
}
