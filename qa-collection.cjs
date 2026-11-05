const { chromium } = require("playwright");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1040 },
    permissions: ["clipboard-read", "clipboard-write"],
  });
  const page = await context.newPage();
  const errors = [],
    badRequests = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (r) => {
    if (r.url().startsWith("http://localhost:3000") && r.status() >= 400)
      badRequests.push(r.status() + " " + r.url());
  });
  await page.goto("http://localhost:3000");
  await page.waitForSelector(".product");
  await page.evaluate(() => document.fonts.ready);
  await page.locator("#heroNext").click();
  assert(
    (await page.locator("#heroImage").getAttribute("src")).includes("brown"),
  );
  await page.locator('[data-dock="Zapatos"]').click();
  await page.locator("#catalogo").scrollIntoViewIfNeeded();
  await page
    .locator(".product img")
    .evaluateAll((imgs) => imgs.forEach((i) => (i.loading = "eager")));
  await page
    .locator(".product img")
    .evaluateAll((imgs) =>
      Promise.all(imgs.map((i) => i.decode().catch(() => {}))),
    );
  await page.evaluate(() =>
    scrollTo(0, document.querySelector("#catalogo").offsetTop - 100),
  );
  await page.screenshot({ path: "catalog-v3.png" });
  await page.locator(".product [data-detail]").first().click();
  await page.locator("#detailImage").evaluate((img) => img.decode());
  await page.screenshot({ path: "product-v3.png" });
  await page.locator("[data-gallery]").last().click();
  assert.equal(
    await page.locator("#imageType").textContent(),
    "FOTOGRAFÍA ORIGINAL DEL CATÁLOGO",
  );
  await page.locator("[data-gallery]").first().click();
  await page.locator("#zoomProduct").click();
  assert(await page.locator("#zoomDialog").evaluate((d) => d.open));
  await page.locator('[data-close="zoomDialog"]').click();
  await page.locator('[data-size="41"]').click();
  await page.locator("#quantityMore").click();
  let link = new URL(await page.locator("#orderWhatsApp").getAttribute("href"));
  assert.equal(link.origin + link.pathname, "https://wa.me/573004266385");
  assert(link.searchParams.get("text").includes("Talla: 41"));
  assert(link.searchParams.get("text").includes("Cantidad: 2"));
  assert(link.searchParams.get("text").includes("DS-037"));
  assert(link.searchParams.get("text").includes("drive.google.com/file/d/"));
  assert.equal(
    await page.locator("#openBag,#selectionDialog,#addSelection").count(),
    0,
  );
  await page.locator("#detail .close").click();
  await page.locator('[name="sideCategory"][value="Polos"]').check();
  await page.locator(".product [data-detail]").first().click();
  await page.locator("#otherSize").fill("L & negro");
  link = new URL(await page.locator("#orderWhatsApp").getAttribute("href"));
  assert(link.searchParams.get("text").includes("Talla: L & negro"));
  await page.locator("#detail .close").click();
  await page.locator('[data-dock="Zapatos"]').click();
  await page.locator("#searchShortcut").click();
  await page.locator("#search").fill("DS-038");
  assert.equal(await page.locator(".product").count(), 1);
  await page.locator("#resetFilters").click();
  assert.equal(await page.locator("#results").textContent(), "56 referencias");
  await page.locator('[name="sideCategory"][value="Gorras"]').check();
  assert((await page.locator("#grid").textContent()).includes("Gorras"));
  await page.locator(".heart").first().click();
  await page.locator("#onlyFavorites").check();
  assert(
    (await page.locator("#results").textContent()).includes("TU SELECCIÓN"),
  );
  await page.locator("#onlyFavorites").uncheck();
  await page.locator("#sort").selectOption("reverse");
  const refs = await page.locator(".product h3 a").allTextContents();
  assert(refs[0] >= refs.at(-1));
  await page.locator("#universo").scrollIntoViewIfNeeded();
  await page.locator(".editorial-visual img").evaluate((img) => img.decode());
  await page.evaluate(() =>
    scrollTo(0, document.querySelector("#universo").offsetTop - 100),
  );
  await page.screenshot({ path: "universe-v3.png" });
  await page.evaluate(() =>
    scrollTo(0, document.querySelector("#como").offsetTop - 100),
  );
  await page.screenshot({ path: "guide-v3.png" });
  await page.locator("#measureGuide").click();
  assert(await page.locator("#measureDialog").evaluate((d) => d.open));
  await page.locator("#measureDialog .close").click();
  await page.locator(".guide-faq summary").first().click();
  assert(
    await page
      .locator(".guide-faq details")
      .first()
      .evaluate((d) => d.open),
  );
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("http://localhost:3000");
    await page.waitForSelector(".product");
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      "page overflow at " + width,
    );
    await page.locator('[data-dock="Zapatos"]').click();
    await page.locator(".product [data-detail]").first().click();
    assert.equal(
      await page
        .locator("#detail")
        .evaluate((d) => d.scrollWidth > d.clientWidth),
      false,
      "detail overflow at " + width,
    );
    if (width === 390) await page.screenshot({ path: "mobile-product-v3.png" });
    await page.locator("#detail .close").click();
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(badRequests, []);
  console.log(
    JSON.stringify({
      passed: true,
      errors,
      badRequests,
      checks: [
        "carousel",
        "filters",
        "search",
        "sorting",
        "favorites",
        "gallery",
        "zoom",
        "size and quantity",
        "WhatsApp product link",
        "WhatsApp size and quantity",
        "guide",
        "mobile 390px and 320px",
      ],
    }),
  );
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
