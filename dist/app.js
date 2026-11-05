const drive =
  "https://drive.google.com/drive/folders/1lQaJHNPcHnIfwoYB9e_5MznQieff87Or";
document.querySelectorAll(".drive-link").forEach((a) => (a.href = drive));
document.querySelector("#year").textContent = new Date().getFullYear();
const presentationImages = {
  "1ZkI3mMZFQ8XL_oE19-rjE4j7sN3hGYs9": "assets/shoe-terrex-v3.png",
  "1Wi69AHl8FiqGuvvyn7MWvqsVSHpZCfl_": "assets/shoe-newbalance-v3.png",
  "1YWJoof5-LpjkmGayRNdAun88Dx4MkvyB": "assets/shoe-suede-v3.png",
  "1ynEDtTx_XTSRd8QlYJwryx2CXqsDYDIQ": "assets/shoe-superstar-v3.png",
  "1IIcJeE08Q8lZFDyMPRNdY3zh15N4JVMK": "assets/shoe-air-v3.png",
  "1nQL4_FvrMSms5bzY_BujvaxDxkGxAD6t": "assets/hero-shoe-v2.png",
  "1Wp2hOvVppafA3g4lrFKW5GvBOYyetS8Z": "assets/shoe-brown-v3.png",
  "1bs3BAJwC3QL21Xi14i0KLcCmlTcSizh0": "assets/shoe-black-v3.png",
};
let products = [],
  category = "Zapatos",
  limit = 8,
  favoritesOnly = false,
  favorites = [];
try {
  favorites = JSON.parse(localStorage.getItem("dissa-favorites") || "[]");
  if (!Array.isArray(favorites)) favorites = [];
} catch {}
const $ = (s) => document.querySelector(s),
  esc = (s) =>
    String(s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
function notify(message) {
  $("#toast").textContent = message;
  $("#toast").classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(
    () => $("#toast").classList.remove("show"),
    2400,
  );
}
function toggle(id) {
  favorites = favorites.includes(id)
    ? favorites.filter((x) => x !== id)
    : [...favorites, id];
  try {
    localStorage.setItem("dissa-favorites", JSON.stringify(favorites));
  } catch {}
  render();
  if (currentProduct && $("#detail").open) {
    document.querySelectorAll(".detail-favorite").forEach((b) => {
      const selected = favorites.includes(currentProduct.id);
      b.classList.toggle("selected", selected);
      b.setAttribute("aria-pressed", selected);
      b.textContent = selected ? "♥" : "♡";
    });
  }
  notify(
    favorites.includes(id)
      ? "Guardado en tu selección"
      : "Producto eliminado de tu selección",
  );
}
function choose(cat) {
  category = cat;
  favoritesOnly = false;
  limit = 8;
  $("#saved").setAttribute("aria-pressed", "false");
  $("#search").value = "";
  render();
  $("#catalogo").scrollIntoView({ behavior: "smooth" });
}
function render() {
  let q = $("#search").value.toLocaleLowerCase("es");
  let filtered = products.filter(
    (p) =>
      (category === "Todos" || p.category === category) &&
      (!favoritesOnly || favorites.includes(p.id)) &&
      (p.title + " " + p.category).toLocaleLowerCase("es").includes(q),
  );
  const order = $("#sort").value;
  filtered.sort((a, b) =>
    order === "category"
      ? a.category.localeCompare(b.category, "es") || a.ref.localeCompare(b.ref)
      : order === "reverse"
        ? b.ref.localeCompare(a.ref)
        : a.ref.localeCompare(b.ref),
  );
  $("#onlyFavorites").checked = favoritesOnly;
  document
    .querySelectorAll('[name="sideCategory"]')
    .forEach((input) => (input.checked = input.value === category));
  $("#count").textContent = favorites.length;
  $("#results").textContent =
    (favoritesOnly ? "TU SELECCIÓN · " : "") + filtered.length + " referencias";
  $("#filters")
    .querySelectorAll("button")
    .forEach((b) => {
      let a = b.dataset.cat === category;
      b.classList.toggle("active", a);
      b.setAttribute("aria-pressed", a);
    });
  $("#grid").innerHTML =
    filtered
      .slice(0, limit)
      .map(
        (p, i) =>
          `<article class="product ${presentationImages[p.id] ? "has-cutout" : ""}"><div class="product-photo"><button data-detail="${p.id}" aria-label="Ver ${esc(p.title)}"><img src="${presentationImages[p.id] || p.image}" alt="${esc(p.title)}" loading="lazy" width="500" height="420"></button><button class="heart ${favorites.includes(p.id) ? "selected" : ""}" data-heart="${p.id}" aria-label="${favorites.includes(p.id) ? "Quitar de" : "Añadir a"} favoritos" aria-pressed="${favorites.includes(p.id)}">${favorites.includes(p.id) ? "♥" : "♡"}</button></div><div class="product-meta"><span class="selection-tag">DISSA SELECTION</span><h3><a href="#" data-detail="${p.id}">${esc(p.title)}</a><span>↗</span></h3><div class="product-bottom"><p>Precio por consultar</p><button data-detail="${p.id}" aria-label="Ver detalles de ${esc(p.title)}">→</button></div></div></article>`,
      )
      .join("") ||
    '<p class="empty">' +
      (favoritesOnly
        ? "Tu selección empieza con un corazón. Explora el catálogo y guarda tus favoritos."
        : "No encontramos referencias. Prueba otra categoría o búsqueda.") +
      "</p>";
  $("#more").hidden = filtered.length <= limit;
  document.querySelectorAll("[data-dock]").forEach((b) => {
    const active = b.dataset.dock === category;
    b.classList.toggle("active", active);
    b.setAttribute("aria-pressed", active);
  });
}
let currentProduct = null,
  interestedSize = "",
  interestedQuantity = 1;
function detail(id) {
  let p = products.find((p) => p.id === id);
  if (!p) return;
  currentProduct = p;
  interestedSize = "";
  interestedQuantity = 1;
  const edited = presentationImages[p.id];
  const related = products
    .filter((x) => x.category === p.category && x.id !== p.id)
    .slice(0, 3);
  $("#detailBody").innerHTML =
    `<div class="detail-breadcrumb">DISSA <span>›</span> Catálogo <span>›</span> ${esc(p.category)} <span>›</span> ${p.ref}</div><div class="detail-layout"><div class="detail-gallery"><div class="detail-thumbs">${edited ? `<button class="active" data-gallery="${edited}" data-cutout="true" aria-label="Ver recorte de presentación"><img src="${edited}" alt=""/></button>` : ""}<button class="${edited ? "" : "active"}" data-gallery="${p.image}" data-cutout="false" aria-label="Ver foto original"><img src="${p.image}" alt=""/></button></div><div class="detail-stage ${edited ? "cutout-stage" : ""}"><div class="detail-orbit" aria-hidden="true"></div><button class="zoom-trigger" id="zoomProduct" aria-label="Ampliar foto">⤢</button><img id="detailImage" src="${edited || p.image}" alt="${esc(p.title)}"/><span id="imageType">${edited ? "RECORTE DE PRESENTACIÓN · VER ORIGINAL EN LA MINIATURA" : "FOTOGRAFÍA ORIGINAL DEL CATÁLOGO"}</span></div></div><div class="detail-copy"><span class="selection-tag">DISSA SELECTION</span><h2>${esc(p.title)}</h2><p class="detail-subtitle">Tu próxima pieza. Tu propia forma de llevarla.</p><div class="price-enquiry"><strong>Precio por consultar</strong><span>Confirma disponibilidad con la tienda ↗</span></div><div class="preference-block"><span class="field-label">${p.category === "Zapatos" || p.category === "Chanclas" ? "Tu talla de interés" : "Tu preferencia de talla"} <small>· por confirmar</small></span>${p.category === "Zapatos" || p.category === "Chanclas" ? '<div class="size-options">' + [36, 37, 38, 39, 40, 41, 42, 43, 44].map((n) => '<button data-size="' + n + '" aria-pressed="false">' + n + "</button>").join("") + "</div>" : '<input id="otherSize" class="preference-input" placeholder="Ej. M, L o sin especificar" maxlength="30" aria-label="Preferencia de talla"/>'}<p class="size-note">Preferencia para tu consulta; no indica existencias. <button id="detailSizeGuide">Guía de medida ↗</button></p></div><div class="quantity-block"><span class="field-label">Cantidad de interés</span><div class="quantity-controls"><button id="quantityLess" aria-label="Disminuir cantidad">−</button><output id="quantityValue">1</output><button id="quantityMore" aria-label="Aumentar cantidad">+</button></div></div><div class="detail-actions"><a class="button whatsapp-order" id="orderWhatsApp" target="_blank" rel="noopener noreferrer">Pedir por WhatsApp <span>↗</span></a><button class="detail-favorite ${favorites.includes(p.id) ? "selected" : ""}" data-heart="${p.id}" aria-pressed="${favorites.includes(p.id)}" aria-label="Guardar favorito">${favorites.includes(p.id) ? "♥" : "♡"}</button></div><p class="detail-disclaimer">Te atenderemos por WhatsApp al +57 300 426 6385. El mensaje incluirá este producto, tu talla y la cantidad elegida.</p><a class="original-link" href="https://drive.google.com/file/d/${p.id}/view" target="_blank" rel="noopener">Referencia en Drive ↗</a></div></div><div class="detail-promises"><div><span>↗</span><p><b>Referencia original</b><small>Fotos del catálogo DISSA</small></p></div><div><span>♡</span><p><b>Atención por WhatsApp</b><small>Pedido directo con DISSA</small></p></div><div><span>✳</span><p><b>Confirma los detalles</b><small>Talla, precio y disponibilidad</small></p></div></div><div class="related-products"><div class="eyebrow">SIGUE EXPLORANDO / ${esc(p.category)}</div><h3>También van contigo<span>↗</span></h3><div>${related.map((x) => `<button data-detail="${x.id}"><img src="${presentationImages[x.id] || x.image}" alt="${esc(x.title)}" loading="lazy"/><span>${esc(x.title)} ↗</span></button>`).join("")}</div></div>`;
  if (!$("#detail").open) $("#detail").showModal();
  $("#detail").scrollTop = 0;
  $("#quantityLess").onclick = () => {
    interestedQuantity = Math.max(1, interestedQuantity - 1);
    $("#quantityValue").textContent = interestedQuantity;
    updateWhatsAppLink();
  };
  $("#quantityMore").onclick = () => {
    interestedQuantity = Math.min(10, interestedQuantity + 1);
    $("#quantityValue").textContent = interestedQuantity;
    updateWhatsAppLink();
  };
  updateWhatsAppLink();
  if ($("#otherSize")) $("#otherSize").oninput = updateWhatsAppLink;
  $("#detailSizeGuide").onclick = () => $("#measureDialog").showModal();
  $("#zoomProduct").onclick = () => {
    $("#zoomImage").src = $("#detailImage").src;
    $("#zoomImage").alt = p.title + " — imagen ampliada";
    $("#zoomDialog").showModal();
  };
}

document.addEventListener("click", (e) => {
  let h = e.target.closest("[data-heart]");
  if (h) {
    toggle(h.dataset.heart);
    return;
  }
  let d = e.target.closest("[data-detail]");
  if (d) {
    e.preventDefault();
    detail(d.dataset.detail);
  }
});
$("#detail .close").onclick = () => $("#detail").close();
$("#detail").addEventListener("click", (e) => {
  if (e.target === $("#detail")) $("#detail").close();
});
$("#search").oninput = () => {
  limit = 8;
  render();
};
$("#saved").onclick = () => {
  favoritesOnly = !favoritesOnly;
  category = "Todos";
  limit = 8;
  $("#search").value = "";
  $("#saved").setAttribute("aria-pressed", favoritesOnly);
  render();
  $("#catalogo").scrollIntoView({ behavior: "smooth" });
};
$("#more").onclick = () => {
  limit += 8;
  render();
};
fetch("catalog.json")
  .then((r) => {
    if (!r.ok) throw Error("catalog");
    return r.json();
  })
  .then((data) => {
    products = data;
    let cats = ["Todos", ...new Set(data.map((x) => x.category))];
    $("#filters").innerHTML = cats
      .map((c) => `<button data-cat="${esc(c)}">${esc(c)}</button>`)
      .join("");
    $("#filters").onclick = (e) => {
      if (e.target.dataset.cat) choose(e.target.dataset.cat);
    };
    $("#categoryLinks").innerHTML = cats
      .filter((x) => x !== "Todos")
      .map(
        (c) =>
          `<button data-category="${esc(c)}">${esc(c)} <span>↗</span></button>`,
      )
      .join("");
    $("#categoryLinks").onclick = (e) => {
      let b = e.target.closest("[data-category]");
      if (b) choose(b.dataset.category);
    };
    initShowcase(data);
    initCollection(data, cats);
    render();
  })
  .catch(() => {
    $("#grid").innerHTML =
      '<p class="empty">No pudimos cargar las imágenes. Puedes explorar el catálogo original en Drive.</p>';
  });

// Portada y accesos de categorías del rediseño.
let heroSlides = [],
  heroIndex = 0;
const categoryIcons = {
  Zapatos:
    '<path d="m3 14 5-3 3 3 4 1 5 1 1 4H3v-6Z"/><path d="M4 17h16M9 12l2-2m1 4 2-2m-2-6 3 6"/>',
  Gorras: '<path d="M4 15a8 8 0 0 1 16 0l-8 2-8-2Zm8 2-8 1-2-2 2-1m8-8v9"/>',
  Relojes:
    '<circle cx="12" cy="12" r="7"/><path d="M9 5V2h6v3M9 19v3h6v-3m-3-12v5l3 2"/>',
  Polos: '<path d="m8 3-6 4 3 5 3-2v11h8V10l3 2 3-5-6-4c-1 4-7 4-8 0Z"/>',
  Suéteres:
    '<path d="m8 3-4 3-3 13 5 1 2-9v10h8V11l2 9 5-1-3-13-4-3c-1 4-7 4-8 0Z"/>',
  Chanclas:
    '<path d="M8 3c-5 1-6 17-2 18 6 3 10-10 8-15-1-3-3-4-6-3Zm-3 9 5-4 3 4m-3-4V5"/>',
  Todos:
    '<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z"/>',
};
function showHero(index) {
  if (!heroSlides.length) return;
  heroIndex = (index + heroSlides.length) % heroSlides.length;
  const slide = heroSlides[heroIndex];
  $("#heroImage").src = slide.heroImage || slide.image;
  $("#heroImage").alt = slide.title + " — selección DISSA";
  $("#heroImage").classList.toggle("catalog-photo", !slide.heroImage);
  $("#heroCaption").textContent = slide.ref + " / DISSA SELECTION";
  $("#stageRef").textContent = slide.ref;
  $("#stageCard").dataset.detail = slide.id;
  document.querySelectorAll("[data-slide]").forEach((button) => {
    const active = Number(button.dataset.slide) === heroIndex;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active);
  });
}
function initShowcase(data) {
  const shoes = data.filter((p) => p.category === "Zapatos");
  heroSlides = shoes.slice(0, 3).map((p, i) => ({
    ...p,
    heroImage: presentationImages[p.id] || null,
  }));
  $("#heroThumbs").innerHTML = heroSlides
    .map(
      (p, i) =>
        `<button class="hero-thumb" data-slide="${i}" aria-label="Ver destacado ${i + 1}"><img src="${p.heroImage || p.image}" alt="" /></button>`,
    )
    .join("");
  $("#heroDots").innerHTML = heroSlides
    .map(
      (p, i) =>
        `<button data-slide="${i}" aria-label="Ver destacado ${i + 1}"></button>`,
    )
    .join("");
  $("#heroPrev").onclick = () => showHero(heroIndex - 1);
  $("#heroNext").onclick = () => showHero(heroIndex + 1);
  document.addEventListener("click", (e) => {
    let b = e.target.closest("[data-slide]");
    if (b) showHero(Number(b.dataset.slide));
  });
  const cats = [
    "Zapatos",
    "Chanclas",
    "Gorras",
    "Relojes",
    "Polos",
    "Suéteres",
    "Todos",
  ];
  $("#categoryDock").innerHTML = cats
    .map(
      (c) =>
        `<button class="category-tile" data-dock="${esc(c)}" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true">${categoryIcons[c]}</svg><span>${c === "Todos" ? "Ver todo →" : esc(c)}</span></button>`,
    )
    .join("");
  $("#categoryDock").onclick = (e) => {
    let b = e.target.closest("[data-dock]");
    if (b) choose(b.dataset.dock);
  };
  $("#searchShortcut").onclick = () => {
    $("#catalogo").scrollIntoView({ behavior: "smooth" });
    $("#search").focus({ preventScroll: true });
  };
  showHero(0);
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        const current = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (current)
          document
            .querySelectorAll("nav a")
            .forEach((a) =>
              a.classList.toggle("active", a.hash === "#" + current.target.id),
            );
      },
      { rootMargin: "-15% 0px -45% 0px", threshold: [0, 0.2, 0.5] },
    );
    document
      .querySelectorAll("#catalogo,#universo,#como")
      .forEach((el) => observer.observe(el));
    window.addEventListener(
      "scroll",
      () => {
        if (scrollY < 250)
          document
            .querySelectorAll("nav a")
            .forEach((a) => a.classList.toggle("active", a.hash === "#inicio"));
      },
      { passive: true },
    );
  }
}

const whatsappPhone = "573004266385";
function whatsappUrl(product) {
  const size =
    $("#otherSize")?.value.trim() || interestedSize || "Por confirmar";
  const message = product
    ? "Hola, DISSA. Quiero pedir este producto:\n\n" +
      product.title +
      "\nReferencia: " +
      product.ref +
      "\nTalla: " +
      size +
      "\nCantidad: " +
      interestedQuantity +
      "\nFoto del producto: https://drive.google.com/file/d/" +
      product.id +
      "/view\n\n¿Me confirman el precio, la disponibilidad y cómo realizar el pedido?"
    : "Hola, DISSA. Me gustaría consultar sus productos y realizar un pedido.";
  return (
    "https://wa.me/" + whatsappPhone + "?text=" + encodeURIComponent(message)
  );
}
function updateWhatsAppLink() {
  if ($("#orderWhatsApp") && currentProduct)
    $("#orderWhatsApp").href = whatsappUrl(currentProduct);
}
function initCollection(data, cats) {
  $("#actualProductCount").textContent = data.length;
  $("#sideCategories").innerHTML = cats
    .map(
      (c) =>
        `<label class="check-row"><input type="radio" name="sideCategory" value="${esc(c)}"/><span>${esc(c)}</span><small>${c === "Todos" ? data.length : data.filter((x) => x.category === c).length}</small></label>`,
    )
    .join("");
  $("#sideCategories").onchange = (e) => choose(e.target.value);
  $("#sort").onchange = () => {
    limit = 8;
    render();
  };
  $("#onlyFavorites").onchange = (e) => {
    favoritesOnly = e.target.checked;
    limit = 8;
    $("#saved").setAttribute("aria-pressed", favoritesOnly);
    render();
  };
  $("#resetFilters").onclick = () => {
    $("#search").value = "";
    $("#sort").value = "reference";
    choose("Todos");
  };
  document
    .querySelectorAll(".whatsapp-contact")
    .forEach((a) => (a.href = whatsappUrl()));
  $("#measureGuide").onclick = () => $("#measureDialog").showModal();
}
document.addEventListener("click", (e) => {
  const close = e.target.closest("[data-close]");
  if (close) document.getElementById(close.dataset.close).close();
  const size = e.target.closest("[data-size]");
  if (size) {
    interestedSize = size.dataset.size;
    updateWhatsAppLink();
    document.querySelectorAll("[data-size]").forEach((b) => {
      let active = b === size;
      b.classList.toggle("active", active);
      b.setAttribute("aria-pressed", active);
    });
  }
  const gallery = e.target.closest("[data-gallery]");
  if (gallery) {
    $("#detailImage").src = gallery.dataset.gallery;
    $(".detail-stage").classList.toggle(
      "cutout-stage",
      gallery.dataset.cutout === "true",
    );
    $("#imageType").textContent =
      gallery.dataset.cutout === "true"
        ? "RECORTE DE PRESENTACIÓN · VER ORIGINAL EN LA MINIATURA"
        : "FOTOGRAFÍA ORIGINAL DEL CATÁLOGO";
    document
      .querySelectorAll("[data-gallery]")
      .forEach((b) => b.classList.toggle("active", b === gallery));
  }
});
["measureDialog", "zoomDialog"].forEach((id) =>
  document.getElementById(id).addEventListener("click", (e) => {
    if (e.target === document.getElementById(id))
      document.getElementById(id).close();
  }),
);
