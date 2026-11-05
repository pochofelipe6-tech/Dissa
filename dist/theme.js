// Aplica la preferencia antes de pintar la página para evitar destellos.
(() => {
  let theme = "dark";
  try {
    if (localStorage.getItem("dissa-theme") === "light") theme = "light";
  } catch {}
  function apply(value) {
    document.documentElement.dataset.theme = value;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", value === "light" ? "#f5f3fa" : "#050408");
    const button = document.getElementById("themeToggle");
    if (button) {
      const label =
        value === "light" ? "Activar modo oscuro" : "Activar modo claro";
      button.setAttribute("aria-label", label);
      button.title = label;
      button.setAttribute("aria-pressed", String(value === "light"));
    }
  }
  apply(theme);
  document.addEventListener(
    "DOMContentLoaded",
    () => {
      apply(theme);
      document.getElementById("themeToggle").addEventListener("click", () => {
        theme =
          document.documentElement.dataset.theme === "light" ? "dark" : "light";
        apply(theme);
        try {
          localStorage.setItem("dissa-theme", theme);
        } catch {}
      });
    },
    { once: true },
  );
  addEventListener("storage", (event) => {
    if (event.key === "dissa-theme") {
      theme = event.newValue === "light" ? "light" : "dark";
      apply(theme);
    }
  });
})();
