export const ADMIN_USERNAME = "binzain";
export const ADMIN_PASSWORD = "Mohmmed@1313";

export function isAdminLoggedIn() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem("adminLoggedIn") === "true";
}

export function loginAdmin(username: string, password: string) {
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    window.localStorage.setItem("adminLoggedIn", "true");
    return true;
  }
  return false;
}

export function logoutAdmin() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("adminLoggedIn");
}
