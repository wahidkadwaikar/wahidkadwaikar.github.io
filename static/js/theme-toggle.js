(() => {
  const storageKey = "theme";
  const toggle = document.querySelector("[data-theme-toggle]");

  if (!toggle) {
    return;
  }

  const safeStorageGet = () => {
    try {
      return window.localStorage.getItem(storageKey);
    } catch (error) {
      return null;
    }
  };

  const safeStorageSet = (theme) => {
    try {
      window.localStorage.setItem(storageKey, theme);
    } catch (error) {
      return;
    }
  };

  const getPreferredTheme = () => {
    const storedTheme = safeStorageGet();
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
    safeStorageSet(theme);
  };

  setTheme(getPreferredTheme());

  toggle.addEventListener("click", (e) => {
    e.preventDefault();
    const nextTheme =
      document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  });
})();
