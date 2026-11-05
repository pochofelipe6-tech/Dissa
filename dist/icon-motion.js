// Se observan también los iconos que nacen al filtrar o abrir una ficha.
(() => {
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const selector = [
    "nav a svg",
    ".hero-proof > div > span",
    ".icon-button svg",
    ".saved svg",
    ".category-tile svg",
    ".benefits > div > span",
    ".universe-values > div > span",
    ".steps article > svg",
    ".detail-promises > div > span",
    ".heart",
    ".detail-favorite",
    ".rail-arrow",
    ".zoom-trigger",
    ".close",
    ".button > span",
    ".product-bottom > button",
    ".guide-faq summary > span",
    ".search > svg",
    ".sidebar-note > span",
    ".crown",
  ].join(",");
  const groupSelector =
    ".header-actions, #categoryDock, .benefits, .universe-values, .steps, .detail-promises, #grid, .detail-actions, .hero-rail";
  const ownerSelector =
    ".icon-button, .saved, .category-tile, .benefits > div, .universe-values > div, .steps article, .detail-promises > div, .heart, .detail-favorite, .rail-arrow, .zoom-trigger, .close, .button, .product-bottom > button, .guide-faq summary";
  const seen = new WeakSet();
  const interactions = new WeakMap();
  const observer =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          (entries) => {
            entries.forEach(({ target, isIntersecting }) => {
              if (!isIntersecting) return;
              observer.unobserve(target);
              if (reduceMotion.matches) return;
              const group = target.closest(groupSelector);
              const index = group
                ? [...group.querySelectorAll("[data-icon-motion]")].indexOf(
                    target,
                  )
                : 0;
              target.style.setProperty(
                "--icon-delay",
                Math.min(Math.max(index, 0) * 45, 270) + "ms",
              );
              target.classList.add("icon-burst-in");
            });
          },
          { threshold: 0.15 },
        )
      : null;

  function register(root) {
    const icons = [...root.querySelectorAll(selector)];
    if (root.matches?.(selector)) icons.unshift(root);
    icons.forEach((icon) => {
      if (seen.has(icon)) return;
      seen.add(icon);
      icon.setAttribute("data-icon-motion", "");
      observer?.observe(icon);
    });
  }
  register(document);
  new MutationObserver((records) =>
    records.forEach((record) => {
      record.addedNodes.forEach((node) => {
        if (node.nodeType === 1) register(node);
      });
      // Libera los iconos retirados al volver a filtrar el catálogo.
      record.removedNodes.forEach((node) => {
        if (node.nodeType !== 1) return;
        if (node.matches("[data-icon-motion]")) observer?.unobserve(node);
        node
          .querySelectorAll("[data-icon-motion]")
          .forEach((icon) => observer?.unobserve(icon));
      });
    }),
  ).observe(document.body, { childList: true, subtree: true });

  document.addEventListener("animationend", (event) => {
    if (event.animationName === "dissa-icon-burst")
      event.target.classList.remove("icon-burst-in");
  });
  function animateIcons(owner, pressed) {
    if (reduceMotion.matches || !Element.prototype.animate) return;
    const icons = owner.matches("[data-icon-motion]")
      ? [owner]
      : [...owner.querySelectorAll("[data-icon-motion]")];
    icons.forEach((icon) => {
      icon.classList.remove("icon-burst-in");
      interactions.get(icon)?.cancel();
      const animation = icon.animate(
        pressed
          ? [
              { scale: "1", rotate: "0deg" },
              { scale: ".72", rotate: "-16deg", offset: 0.22 },
              {
                scale: "1.3",
                rotate: "12deg",
                filter: "drop-shadow(0 0 10px #d3ff00aa)",
                offset: 0.58,
              },
              {
                scale: "1",
                rotate: "0deg",
                filter: "drop-shadow(0 0 0 #d3ff0000)",
              },
            ]
          : [
              { scale: "1", rotate: "0deg", translate: "0 0" },
              {
                scale: "1.18",
                rotate: "-16deg",
                translate: "0 -3px",
                filter: "drop-shadow(0 0 8px #d3ff0080)",
                offset: 0.3,
              },
              {
                scale: "1.08",
                rotate: "10deg",
                translate: "0 -1px",
                offset: 0.6,
              },
              {
                scale: "1",
                rotate: "0deg",
                translate: "0 0",
                filter: "drop-shadow(0 0 0 #d3ff0000)",
              },
            ],
        { duration: pressed ? 420 : 620, easing: "cubic-bezier(.2,.8,.2,1)" },
      );
      interactions.set(icon, animation);
    });
  }
  document.addEventListener("pointerover", (event) => {
    if (event.pointerType === "touch") return;
    const owner = event.target.closest(ownerSelector);
    if (owner && !owner.contains(event.relatedTarget))
      animateIcons(owner, false);
  });
  document.addEventListener("pointerdown", (event) => {
    const owner = event.target.closest(ownerSelector);
    if (owner) animateIcons(owner, true);
  });
  document.addEventListener("focusin", (event) => {
    const owner = event.target.closest(ownerSelector);
    if (owner && owner.matches(":focus-visible")) animateIcons(owner, false);
  });
})();
