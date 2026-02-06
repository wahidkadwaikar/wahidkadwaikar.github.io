(() => {
  const storageKey = "theme";
  const toggle = document.querySelector("[data-theme-toggle]");

  if (!toggle) {
    return;
  }

  const getPreferredTheme = () => {
    const storedTheme = window.localStorage.getItem(storageKey);
    if (storedTheme) {
      return storedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };

  const setTheme = (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    toggle.textContent = theme === "dark" ? "☀️" : "🌙";
    toggle.setAttribute(
      "aria-label",
      theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
    );
    window.localStorage.setItem(storageKey, theme);
  };

  setTheme(getPreferredTheme());

  toggle.addEventListener("click", () => {
    const nextTheme =
      document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  });
})();
