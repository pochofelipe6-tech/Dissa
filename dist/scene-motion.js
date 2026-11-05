// Humo procedural: texturas de ruido, sin vídeo ni descargas adicionales.
(() => {
  const hero = document.querySelector(".hero");
  if (!hero) return;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const canvas = document.createElement("canvas");
  canvas.className = "hero-smoke";
  canvas.setAttribute("aria-hidden", "true");
  hero.prepend(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const textures = [];
  function hash(x, y, seed) {
    let n = Math.sin(x * 127.1 + y * 311.7 + seed * 73.2) * 43758.5453;
    return n - Math.floor(n);
  }
  function noise(x, y, seed) {
    let ix = Math.floor(x),
      iy = Math.floor(y),
      fx = x - ix,
      fy = y - iy;
    fx = fx * fx * (3 - 2 * fx);
    fy = fy * fy * (3 - 2 * fy);
    return (
      (hash(ix, iy, seed) * (1 - fx) + hash(ix + 1, iy, seed) * fx) * (1 - fy) +
      (hash(ix, iy + 1, seed) * (1 - fx) + hash(ix + 1, iy + 1, seed) * fx) * fy
    );
  }
  for (let seed = 0; seed < 4; seed++) {
    const texture = document.createElement("canvas");
    texture.width = texture.height = 160;
    const tc = texture.getContext("2d"),
      data = tc.createImageData(160, 160);
    for (let y = 0; y < 160; y++)
      for (let x = 0; x < 160; x++) {
        let nx = x / 160,
          ny = y / 160,
          radial = Math.max(0, 1 - Math.hypot((nx - 0.5) * 2, (ny - 0.5) * 2));
        let n =
          noise(nx * 5, ny * 5, seed) * 0.58 +
          noise(nx * 11, ny * 11, seed + 5) * 0.28 +
          noise(nx * 23, ny * 23, seed + 9) * 0.14;
        let alpha = Math.pow(radial, 1.2) * Math.max(0, n - 0.18) * 2.1;
        const i = (y * 160 + x) * 4;
        data.data[i] = 143 + n * 65;
        data.data[i + 1] = 35 + n * 24;
        data.data[i + 2] = 220 + n * 35;
        data.data[i + 3] = Math.min(255, alpha * 255);
      }
    tc.putImageData(data, 0, 0);
    textures.push(texture);
  }
  let width = 0,
    height = 0,
    frame = 0,
    last = 0,
    time = 0,
    visible = true;
  const plumes = Array.from({ length: 24 }, (_, i) => ({
    x: (i % 6) / 5,
    y: (i * 0.173 + 0.14) % 1,
    phase: i * 2.399,
    speed: 0.95 + (i % 4) * 0.24,
    size: 0.2 + (i % 5) * 0.035,
    texture: textures[i % 4],
  }));
  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = "screen";
    const mobile = hero.clientWidth < 761;
    plumes.forEach((p, i) => {
      const wave = Math.sin(time * 0.95 + p.phase),
        rise = (time * p.speed * 0.085 + p.y) % 1;
      const x = width * (p.x + 0.13 * Math.sin(time * 0.75 + p.phase));
      const base = mobile ? 0.94 : 0.84;
      const y =
        height * (base - rise * (mobile ? 0.25 : 0.36)) + wave * height * 0.065;
      const size = width * (mobile ? p.size * 1.8 : p.size) * (1 + rise * 0.45);
      const fade = Math.sin(rise * Math.PI);
      ctx.save();
      ctx.globalAlpha = (0.64 + 0.18 * Math.sin(p.phase + time * 0.8)) * fade;
      ctx.translate(x, y);
      ctx.rotate(Math.sin(time * 0.48 + p.phase) * 1.1);
      ctx.scale(1.3 + Math.sin(time * 0.6 + p.phase) * 0.22, 1);
      ctx.drawImage(p.texture, -size / 2, -size / 2, size, size);
      ctx.restore();
    });
  }
  function tick(now) {
    frame = 0;
    if (!visible || document.hidden || reduced.matches) return;
    if (now - last > 32) {
      time += Math.min((now - last) / 1000, 0.065);
      last = now;
      draw();
    }
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame);
    frame = 0;
    if (!visible || document.hidden) return;
    last = performance.now();
    if (reduced.matches) draw();
    else frame = requestAnimationFrame(tick);
  }
  const resize = new ResizeObserver(() => {
    const ratio = Math.min(devicePixelRatio || 1, 1.25);
    width = canvas.width = Math.round(hero.clientWidth * ratio);
    height = canvas.height = Math.round(hero.clientHeight * ratio);
    draw();
  });
  resize.observe(hero);
  if ("IntersectionObserver" in window)
    new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
        sync();
      },
      { rootMargin: "60px" },
    ).observe(hero);
  document.addEventListener("visibilitychange", sync);
  reduced.addEventListener("change", sync);
  sync();
})();

// Entradas escalonadas para tarjetas, fotografías y botones, incluidos los dinámicos.
(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const selector =
    ".product, .benefits > div, .category-tile, .steps article, .editorial-visual, .guide-shoe, .button, .more, .related-products > div > button, .hero-thumb";
  const seen = new WeakSet();
  const observer =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          (entries) => {
            entries.forEach(({ target, isIntersecting }) => {
              if (!isIntersecting) return;
              observer.unobserve(target);
              target.classList.remove("surface-waiting");
              if (reduced.matches) return;
              const group = target.closest(
                "#grid,.benefits,#categoryDock,.steps,.related-products>div,#heroThumbs,.hero-buttons",
              );
              const index = group
                ? [...group.querySelectorAll("[data-surface-motion]")].indexOf(
                    target,
                  )
                : 0;
              target.style.setProperty(
                "--surface-delay",
                Math.min(Math.max(index, 0) * 65, 325) + "ms",
              );
              target.classList.add("surface-enter");
            });
          },
          { threshold: 0.08, rootMargin: "0px 0px -12px 0px" },
        )
      : null;
  function register(root) {
    const elements = [...root.querySelectorAll(selector)];
    if (root.matches?.(selector)) elements.unshift(root);
    elements.forEach((el) => {
      if (seen.has(el)) return;
      seen.add(el);
      el.setAttribute("data-surface-motion", "");
      if (observer && !reduced.matches) {
        el.classList.add("surface-waiting");
        observer.observe(el);
      }
    });
  }
  register(document);
  new MutationObserver((records) =>
    records.forEach((record) => {
      record.addedNodes.forEach((node) => {
        if (node.nodeType === 1) register(node);
      });
      record.removedNodes.forEach((node) => {
        if (node.nodeType !== 1) return;
        observer?.unobserve(node);
        node
          .querySelectorAll("[data-surface-motion]")
          .forEach((el) => observer?.unobserve(el));
      });
    }),
  ).observe(document.body, { childList: true, subtree: true });
  document.addEventListener("animationend", (e) => {
    if (e.animationName === "dissa-surface-enter")
      e.target.classList.remove("surface-enter");
  });
  reduced.addEventListener("change", () => {
    if (reduced.matches)
      document
        .querySelectorAll(".surface-waiting,.surface-enter")
        .forEach((el) => {
          el.classList.remove("surface-waiting", "surface-enter");
          observer?.unobserve(el);
        });
  });
  let pending = 0;
  document.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType === "touch" || reduced.matches) return;
      const card = event.target.closest(".product");
      if (!card || pending) return;
      const x = event.clientX,
        y = event.clientY;
      pending = requestAnimationFrame(() => {
        const r = card.getBoundingClientRect();
        card.style.setProperty(
          "--pointer-x",
          ((x - r.left) / r.width) * 100 + "%",
        );
        card.style.setProperty(
          "--pointer-y",
          ((y - r.top) / r.height) * 100 + "%",
        );
        pending = 0;
      });
    },
    { passive: true },
  );
})();
