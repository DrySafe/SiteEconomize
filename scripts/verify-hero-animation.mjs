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
  await page.waitForFunction(
    () => Number(document.querySelector(".hero-flow-field")?.dataset.frame) > 2,
  );
  await page.screenshot({
    path: `/tmp/grupoe-connections-initial-${viewport.width}.png`,
  });
  const result = await page.evaluate(async (milliseconds) => {
    const elements = Array.from(document.querySelectorAll(".visual-tag"));
    const began = performance.now();
    const canvas = document.querySelector(".hero-flow-field");
    const initialFrame = Number(canvas.dataset.frame);
    const summary = {
      min: 4,
      max: 0,
      samples: 0,
      violations: [],
      positions: elements.map(() => new Set()),
      networkShapes: new Set(),
      wrongEndpoints: 0,
      orphanLines: 0,
      particleFrames: 0,
      sparkFrames: 0,
    };
    await new Promise((resolve) => {
      function sample() {
        const opacity = elements.map((element) =>
          Number(getComputedStyle(element).opacity),
        );
        const visible = opacity.filter((value) => value > 0.000001).length;
        summary.min = Math.min(summary.min, visible);
        summary.max = Math.max(summary.max, visible);
        summary.samples++;
        if (
          visible < 1 ||
          visible > 3 ||
          !opacity.some((value) => value >= 0.999)
        )
          summary.violations.push({ time: performance.now() - began, opacity });
        elements.forEach((element, index) => {
          if (opacity[index] > 0.01)
            summary.positions[index].add(
              `${element.style.left}|${element.style.top}`,
            );
        });
        if (summary.samples % 15 === 0) {
          const bounds = document
            .querySelector(".hero-tags")
            .getBoundingClientRect();
          const core = document.querySelector(".connection-core");
          const origin = {
            x: Number(core.getAttribute("cx")),
            y: Number(core.getAttribute("cy")),
          };
          if (Number(canvas.dataset.sparks) > 0) summary.sparkFrames++;
          if (
            Array.from(document.querySelectorAll(".connection-particle")).some(
              (dot) => Number(dot.getAttribute("opacity")) > 0.05,
            )
          )
            summary.particleFrames++;
          document.querySelectorAll(".connection-active").forEach((path) => {
            if (
              Number(path.getAttribute("opacity")) <= 0.005 ||
              !path.getAttribute("d")
            )
              return;
            const to = Number(path.dataset.to);
            if (opacity[to] < 0.03) summary.orphanLines++;
            const start = path.getPointAtLength(0),
              end = path.getPointAtLength(path.getTotalLength());
            const rect = elements[to].getBoundingClientRect();
            const target = {
              x: ((rect.left - bounds.left) / bounds.width) * 600,
              y:
                ((rect.top + rect.height / 2 - bounds.top) / bounds.height) *
                600,
            };
            if (
              Math.hypot(start.x - origin.x, start.y - origin.y) > 1.5 ||
              Math.hypot(end.x - target.x, end.y - target.y) > 1.5
            )
              summary.wrongEndpoints++;
            summary.networkShapes.add(path.getAttribute("d"));
          });
        }
        if (performance.now() - began < milliseconds)
          requestAnimationFrame(sample);
        else resolve();
      }
      sample();
    });
    return {
      ...summary,
      positions: summary.positions.map((set) => set.size),
      networkShapes: summary.networkShapes.size,
      transitions: window.heroTransitions,
      frames: Number(canvas.dataset.frame) - initialFrame,
    };
  }, duration);
  assert.equal(
    result.violations.length,
    0,
    JSON.stringify(result.violations.slice(0, 3)),
  );
  assert.equal(result.min, 1);
  assert.equal(result.max, 3);
  assert.ok(
    result.positions.every((count) => count >= 2),
    "Todos os itens devem mudar de posição.",
  );
  assert.equal(
    result.wrongEndpoints,
    0,
    "As linhas devem ligar a logo à ponta esquerda das caixas.",
  );
  assert.equal(
    result.orphanLines,
    0,
    "Nenhum sinal deve ficar aceso sem a caixa correspondente.",
  );
  assert.ok(
    result.networkShapes > 30,
    "As curvas devem se movimentar continuamente.",
  );
  assert.ok(
    result.particleFrames > 10,
    "Os pulsos devem percorrer as conexões.",
  );
  assert.ok(
    result.sparkFrames > 5,
    "Entradas e saídas devem emitir partículas.",
  );
  assert.ok(
    result.frames > duration / 40,
    "O campo de partículas deve manter pelo menos 25 quadros/s.",
  );
  assert.equal(errors.length, 0, errors.join("\n"));
  await page.screenshot({ path: `/tmp/grupoe-hero-${viewport.width}.png` });
  const stage = await page.locator(".hero-visual").boundingBox();
  await page.mouse.move(
    stage.x + stage.width * 0.8,
    stage.y + stage.height * 0.2,
  );
  await page.waitForTimeout(450);
  assert.ok(
    Math.abs(
      Number.parseFloat(
        await page
          .locator(".hero-visual")
          .evaluate((element) =>
            element.style.getPropertyValue("--hero-tilt-y"),
          ),
      ),
    ) > 1,
    "A cena deve responder ao cursor.",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForFunction(
    () => !document.querySelector(".hero-tags").hasAttribute("data-animated"),
  );
  await page.waitForTimeout(150);
  const still = await page
    .locator(".hero-flow-field")
    .getAttribute("data-frame");
  await page.waitForTimeout(250);
  assert.equal(
    await page.locator(".hero-flow-field").getAttribute("data-frame"),
    still,
    "Movimento reduzido deve pausar o cenário.",
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
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.waitForFunction(() =>
    document.querySelector(".hero-tags").hasAttribute("data-animated"),
  );
  await page.evaluate(() => {
    window.cleanupConnections();
    window.cleanupHero();
  });
  assert.equal(await page.locator(".hero-flow-field").count(), 0);
  assert.equal(await page.locator(".hero-connections path").count(), 0);
  console.log(
    `${viewport.width}px: ${result.samples} amostras; ${result.min}–${result.max} itens; ${result.frames} quadros do cenário; curvas, pulsos, partículas, cursor e movimento reduzido verificados.`,
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
