export type AdminTheme = "light" | "dark";

const STORAGE_KEY = "protech-admin-theme";

function applyThemeClass(theme: AdminTheme) {
  if (!import.meta.client) return;

  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.dataset.adminTheme = theme;
}

export function useAdminTheme() {
  const theme = useState<AdminTheme>("admin-theme", () => "light");

  function setTheme(nextTheme: AdminTheme) {
    theme.value = nextTheme;
    applyThemeClass(nextTheme);

    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, nextTheme);
    }
  }

  function initTheme() {
    if (!import.meta.client) return;

    const stored = localStorage.getItem(STORAGE_KEY) as AdminTheme | null;
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    setTheme(stored === "dark" || stored === "light" ? stored : prefersDark ? "dark" : "light");
  }

  function toggleTheme() {
    setTheme(theme.value === "dark" ? "light" : "dark");
  }

  return {
    theme,
    initTheme,
    setTheme,
    toggleTheme,
  };
}
