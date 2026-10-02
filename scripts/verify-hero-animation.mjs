import assert from "node:assert/strict";
import fs from "node:fs/promises";
import ts from "typescript";
import { chromium } from "@playwright/test";

const source = await fs.readFile("src/lib/hero-tag-animation.ts", "utf8");
const javascript = ts.transpileModule(source, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
  },
}).outputText;
const connectionsSource = await fs.readFile(
  "src/lib/hero-connections.ts",
  "utf8",
);
const connectionsJavascript = ts.transpileModule(connectionsSource, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
  },
}).outputText;
const css = await fs.readFile("src/app/globals.css", "utf8");
const logo = (await fs.readFile("public/images/Logo-PNG.png")).toString(
  "base64",
);
const labels = [
  "FOOD SERVICE",
  "Fazenda Encanto",
  "Hiper Mercado",
  "Logística que conecta",
];
const duration = Number(process.env.HERO_VERIFY_MS || 65000);
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});

async function verify(viewport) {
  const page = await browser.newPage({ viewport });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setContent(`<style>${css}</style><div class="hero-visual" style="width:min(510px,calc(100vw - 40px));margin:20px;">
    <div class="visual-grid"></div><div class="visual-top-label"><strong>GRUPO E</strong><br>MUITAS POSSIBILIDADES.</div>
    <div class="hero-symbol"><img src="data:image/png;base64,${logo}" alt="GRUPO E"></div>
    <div class="hero-tags"><svg class="hero-connections" viewBox="0 0 600 600" preserveAspectRatio="none"></svg>${labels.map((label, index) => `<div class="visual-tag" style="opacity:${index < 2 ? 1 : 0};left:${index % 2 ? 72 : 28}%;top:${[26, 39, 65, 78][index]}%;animation-delay:${index * -1.7}s"><svg width="14" height="14" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor"/></svg><span>${label}</span></div>`).join("")}</div>
    <div class="visual-bottom">Qualidade em cada conexão.</div></div>`);
  await page.evaluate(() => {
    window.heroTransitions = [];
    const animate = HTMLElement.prototype.animate;
    HTMLElement.prototype.animate = function (frames, options) {
      if (this.classList.contains("visual-tag")) {
        window.heroTransitions.push({
          label: this.textContent,
          duration: options.duration,
          at: performance.now(),
          direction: frames[1].opacity,
        });
      }
      return animate.call(this, frames, options);
    };
  });
  await page.addScriptTag({
    type: "module",
    content: `${javascript}\nwindow.cleanupHero = animateHeroTags(document.querySelector('.hero-tags'));`,
  });
  await page.waitForFunction(() =>
    document.querySelector(".hero-tags").hasAttribute("data-animated"),
  );
  await page.addScriptTag({
    type: "module",
    content: `${connectionsJavascript}\nwindow.cleanupConnections = animateHeroConnections(document.querySelector('.hero-connections'), document.querySelector('.hero-tags'));`,
  });
  await page.waitForFunction(() =>
    document.querySelector(".connection-mesh")?.getAttribute("d"),
  );
  await page.screenshot({
    path: `/tmp/grupoe-connections-initial-${viewport.width}.png`,
  });
  const result = await page.evaluate(async (milliseconds) => {
    const elements = Array.from(document.querySelectorAll(".visual-tag"));
    const began = performance.now();
    const summary = {
      min: 4,
      max: 0,
      samples: 0,
      violations: [],
      positions: elements.map(() => new Set()),
      floatPositions: new Set(),
      meshPaths: new Set(),
      networkShapes: new Set(),
      missingMesh: 0,
    };
    await new Promise((resolve) => {
      function sample() {
        const opacity = elements.map((element) =>
          Number(getComputedStyle(element).opacity),
        );
        const visible = opacity.filter((value) => value > 0.000001).length;
        const anchor = opacity.some((value) => value >= 0.999);
        summary.min = Math.min(summary.min, visible);
        summary.max = Math.max(summary.max, visible);
        summary.samples++;
        if (summary.samples % 15 === 0) {
          const mesh = Array.from(
            document.querySelectorAll(".connection-mesh"),
          );
          if (
            !mesh.length ||
            mesh.some(
              (path) =>
                Number(getComputedStyle(path).opacity) === 0 ||
                !path.getAttribute("d"),
            )
          )
            summary.missingMesh++;
          summary.meshPaths.add(mesh[0]?.getAttribute("d"));
          summary.networkShapes.add(
            Array.from(document.querySelectorAll(".connection-active"))
              .map((path, index) =>
                Number(path.getAttribute("opacity")) > 0.2 ? index : null,
              )
              .filter((index) => index !== null)
              .join(","),
          );
        }
        if (visible < 1 || visible > 3 || !anchor)
          summary.violations.push({ time: performance.now() - began, opacity });
        elements.forEach((element, index) => {
          if (opacity[index] > 0.01)
            summary.positions[index].add(
              `${element.style.left}|${element.style.top}`,
            );
        });
        summary.floatPositions.add(getComputedStyle(elements[0]).translate);
        if (performance.now() - began < milliseconds)
          requestAnimationFrame(sample);
        else resolve();
      }
      sample();
    });
    return {
      ...summary,
      positions: summary.positions.map((set) => set.size),
      floatPositions: summary.floatPositions.size,
      transitions: window.heroTransitions,
      meshPaths: summary.meshPaths.size,
      networkShapes: summary.networkShapes.size,
    };
  }, duration);
  assert.equal(
    result.violations.length,
    0,
    JSON.stringify(result.violations.slice(0, 5)),
  );
  assert.equal(
    result.min,
    1,
    "A animação deve chegar a um único item visível.",
  );
  assert.equal(result.max, 3);
  assert.ok(
    result.positions.every((count) => count >= 2),
    "Todos os itens precisam mudar de posição.",
  );
  assert.ok(
    new Set(result.transitions.map((entry) => Math.round(entry.duration)))
      .size >= 5,
    "As durações devem variar.",
  );
  assert.ok(
    result.floatPositions > 20,
    "O balanço vertical deve continuar durante os fades.",
  );
  assert.equal(
    result.missingMesh,
    0,
    "As linhas cinzas não podem desaparecer.",
  );
  assert.ok(result.meshPaths > 20, "A malha deve ondular continuamente.");
  assert.ok(
    result.networkShapes > 5,
    "Os caminhos pretos precisam se reconectar.",
  );
  assert.equal(errors.length, 0, errors.join("\n"));
  await page.screenshot({ path: `/tmp/grupoe-hero-${viewport.width}.png` });
  // Check a pause/restart and reduced motion, which used to reset opacity.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForFunction(
    () => !document.querySelector(".hero-tags").hasAttribute("data-animated"),
  );
  assert.equal(
    await page
      .locator(".visual-tag")
      .evaluateAll(
        (items) =>
          items.filter((item) => Number(getComputedStyle(item).opacity) > 0)
            .length,
      ),
    2,
  );
  await page.waitForTimeout(150);
  const stillPath = await page
    .locator(".connection-mesh")
    .first()
    .getAttribute("d");
  await page.waitForTimeout(200);
  assert.equal(
    await page.locator(".connection-mesh").first().getAttribute("d"),
    stillPath,
    "Movimento reduzido deve parar as ondas.",
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.waitForFunction(() =>
    document.querySelector(".hero-tags").hasAttribute("data-animated"),
  );
  await page.evaluate(() => {
    window.cleanupConnections();
    window.cleanupHero();
  });
  assert.equal(await page.locator(".hero-connections path").count(), 0);
  assert.equal(
    await page
      .locator(".visual-tag")
      .evaluateAll(
        (items) =>
          items.filter((item) => Number(getComputedStyle(item).opacity) > 0)
            .length,
      ),
    2,
  );
  console.log(
    `${viewport.width}px: ${result.samples} frames; ${result.min}–${result.max} itens visíveis; posições por item: ${result.positions.join(", ")}; ${result.transitions.length} transições, sem tela vazia.`,
  );
  await page.close();
}

try {
  await Promise.all([
    verify({ width: 1440, height: 900 }),
    verify({ width: 390, height: 844 }),
  ]);
} finally {
  await browser.close();
}
