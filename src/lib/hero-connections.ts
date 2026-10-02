type Point = { x: number; y: number };
type Mote = {
  angle: number;
  radius: number;
  depth: number;
  speed: number;
  phase: number;
};
type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  born: number;
  life: number;
};
const namespace = "http://www.w3.org/2000/svg";

/** A lightweight, layered particle field with brand-to-company signal paths. */
export function animateHeroConnections(
  svg: SVGSVGElement,
  container: HTMLElement,
) {
  const stage = container.parentElement!;
  const labels = Array.from(
    container.querySelectorAll<HTMLElement>(".visual-tag"),
  );
  const logo = stage.querySelector<HTMLImageElement>(".hero-symbol img");
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const canvas = document.createElement("canvas");
  canvas.className = "hero-flow-field";
  canvas.setAttribute("aria-hidden", "true");
  stage.insertBefore(canvas, container);
  const context = canvas.getContext("2d");
  if (!context) {
    canvas.remove();
    return () => {};
  }
  const ctx = context;
  // Cache the soft light once; avoid repeated blur filters for every mote.
  const glow = document.createElement("canvas");
  glow.width = 32;
  glow.height = 32;
  const glowContext = glow.getContext("2d")!;
  const light = glowContext.createRadialGradient(16, 16, 0, 16, 16, 16);
  light.addColorStop(0, "#ffdda899");
  light.addColorStop(0.2, "#ffbe6240");
  light.addColorStop(1, "#ffbe6200");
  glowContext.fillStyle = light;
  glowContext.fillRect(0, 0, 32, 32);
  const id = `hero-signal-${Math.random().toString(36).slice(2)}`;
  function element<K extends keyof SVGElementTagNameMap>(
    tag: K,
    className: string,
    parent: SVGElement = svg,
  ) {
    const node = document.createElementNS(namespace, tag);
    node.setAttribute("class", className);
    parent.appendChild(node);
    return node;
  }
  const defs = element("defs", "connection-definitions");
  const gradient = element("linearGradient", "", defs);
  gradient.id = id;
  gradient.setAttribute("x1", "0%");
  gradient.setAttribute("x2", "100%");
  [
    ["0%", "#ffc16e"],
    ["50%", "#ffe2ae"],
    ["100%", "#fff6e8"],
  ].forEach(([offset, color]) => {
    const stop = element("stop", "", gradient);
    stop.setAttribute("offset", offset);
    stop.setAttribute("stop-color", color);
  });
  const network = element("g", "connection-network");
  const signals = labels.map((_, index) => {
    const path = element("path", "connection-active", network);
    path.setAttribute("stroke", `url(#${id})`);
    path.setAttribute("vector-effect", "non-scaling-stroke");
    path.dataset.from = "core";
    path.dataset.to = String(index);
    const pulses = Array.from({ length: 6 }, () =>
      element("circle", "connection-particle", network),
    );
    const port = element("circle", "connection-port", network);
    return {
      path,
      pulses,
      port,
      alpha: 0,
      trend: "",
      phase: Math.random() * Math.PI * 2,
      bend: 0,
      nextBend: 0,
      target: 0,
    };
  });
  const core = element("circle", "connection-core", network);
  const motes: Mote[] = Array.from(
    { length: container.clientWidth < 430 ? 62 : 90 },
    () => ({
      angle: Math.random() * Math.PI * 2,
      radius: 155 + Math.random() * 235,
      depth: 0.35 + Math.random() * 0.65,
      speed: (0.012 + Math.random() * 0.025) * (Math.random() > 0.5 ? 1 : -1),
      phase: Math.random() * Math.PI * 2,
    }),
  );
  const sparks: Spark[] = [];
  const mouse = { x: 300, y: 300, tx: 300, ty: 300, active: false };
  let frame = 0,
    last = 0,
    count = 0;
  let visible = false,
    disposed = false;

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(stage.clientWidth * ratio);
    canvas.height = Math.round(stage.clientHeight * ratio);
    restart();
  }
  function pointer(event: PointerEvent) {
    if (event.pointerType === "touch") return;
    const bounds = stage.getBoundingClientRect();
    mouse.tx = ((event.clientX - bounds.left) / bounds.width) * 600;
    mouse.ty = ((event.clientY - bounds.top) / bounds.height) * 600;
    mouse.active = true;
  }
  function leave() {
    mouse.tx = 300;
    mouse.ty = 300;
    mouse.active = false;
  }
  function burst(point: Point, now: number, outward: boolean) {
    if (preference.matches) return;
    for (let index = 0; index < 12 && sparks.length < 64; index++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 13 + Math.random() * 30;
      sparks.push({
        ...point,
        vx: Math.cos(angle) * speed - (outward ? 18 : 7),
        vy: Math.sin(angle) * speed,
        born: now,
        life: 650 + Math.random() * 950,
      });
    }
  }
  function draw(now: number) {
    if (!visible || disposed) return;
    const delta = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    const reduced = preference.matches;
    const time = reduced ? 0 : now / 1000;
    mouse.x += (mouse.tx - mouse.x) * (reduced ? 1 : 1 - Math.exp(-delta * 4));
    mouse.y += (mouse.ty - mouse.y) * (reduced ? 1 : 1 - Math.exp(-delta * 4));
    const px = reduced ? 0 : (mouse.x - 300) / 300;
    const py = reduced ? 0 : (mouse.y - 300) / 300;
    stage.style.setProperty("--hero-tilt-x", `${-py * 5}deg`);
    stage.style.setProperty("--hero-tilt-y", `${px * 7}deg`);
    ctx.setTransform(canvas.width / 600, 0, 0, canvas.height / 600, 0, 0);
    ctx.clearRect(0, 0, 600, 600);
    const field = motes.map((mote) => {
      const angle = mote.angle + time * mote.speed;
      const depth = mote.depth;
      let x =
        300 +
        Math.cos(angle) * mote.radius +
        Math.sin(time * 0.47 + mote.phase) * 15 +
        px * depth * 18;
      let y =
        310 +
        Math.sin(angle) * mote.radius * 0.78 +
        Math.cos(time * 0.39 + mote.phase) * 13 +
        py * depth * 18;
      const distance = Math.hypot(x - mouse.x, y - mouse.y);
      if (mouse.active && !reduced && distance < 100) {
        const force = ((100 - distance) / 100) * 0.23;
        x += (x - mouse.x) * force;
        y += (y - mouse.y) * force;
      }
      return { x, y, depth };
    });
    field.forEach((point, index) => {
      ctx.shadowBlur = 0;
      const neighbors = field
        .slice(index + 1)
        .map((other) => ({
          other,
          distance: Math.hypot(point.x - other.x, point.y - other.y),
        }))
        .filter((item) => item.distance < 92)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3);
      neighbors.forEach(({ other, distance }) => {
        ctx.strokeStyle = `rgba(219,181,131,${(1 - distance / 92) * 0.25 * point.depth})`;
        ctx.lineWidth = 0.65;
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(other.x, other.y);
        ctx.stroke();
      });
      ctx.fillStyle = `rgba(255,218,159,${0.18 + point.depth * 0.4})`;
      if (point.depth > 0.75)
        ctx.drawImage(glow, point.x - 8, point.y - 8, 16, 16);
      ctx.beginPath();
      ctx.arc(point.x, point.y, 0.6 + point.depth * 1.5, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.shadowBlur = 0;
    const bounds = container.getBoundingClientRect();
    const image = logo?.getBoundingClientRect();
    const origin = image
      ? {
          x:
            ((image.left + image.width * 0.2 - bounds.left) / bounds.width) *
            600,
          y:
            ((image.top + image.height * 0.56 - bounds.top) / bounds.height) *
            600,
        }
      : { x: 215, y: 320 };
    core.setAttribute("cx", String(origin.x));
    core.setAttribute("cy", String(origin.y));
    core.setAttribute("r", "3.5");
    const boxes = labels.map((label) => {
      const rect = label.getBoundingClientRect();
      return {
        x: ((rect.left - bounds.left) / bounds.width) * 600,
        y: ((rect.top + rect.height / 2 - bounds.top) / bounds.height) * 600,
        alpha: Number(getComputedStyle(label).opacity),
      };
    });
    signals.forEach((signal, index) => {
      const box = boxes[index];
      if (
        box.alpha > signal.alpha + 0.002 &&
        signal.trend !== "in" &&
        box.alpha > 0.06
      ) {
        burst(box, now, false);
        signal.trend = "in";
      }
      if (
        box.alpha < signal.alpha - 0.002 &&
        signal.trend !== "out" &&
        box.alpha < 0.85
      ) {
        burst(box, now, true);
        signal.trend = "out";
      }
      signal.alpha = box.alpha;
      if (box.alpha <= 0.04) {
        signal.path.setAttribute("opacity", "0");
        signal.port.setAttribute("opacity", "0");
        signal.pulses.forEach((pulse) => pulse.setAttribute("opacity", "0"));
        return;
      }
      if (now >= signal.nextBend) {
        signal.target = (Math.random() - 0.5) * 60;
        signal.nextBend = now + 4000 + Math.random() * 7000;
      }
      signal.bend +=
        (signal.target - signal.bend) *
        (reduced ? 1 : 1 - Math.exp(-delta * 0.6));
      const breath = reduced ? 0 : Math.sin(time * 0.85 + signal.phase) * 18;
      const control1 = {
        x: origin.x - 75 - Math.cos(time * 0.4 + signal.phase) * 14,
        y: origin.y + signal.bend + breath,
      };
      const control2 = {
        x: Math.max(6, box.x - 68),
        y: box.y - signal.bend * 0.4 + breath * 0.55,
      };
      const d = `M${origin.x.toFixed(2)},${origin.y.toFixed(2)} C${control1.x.toFixed(2)},${control1.y.toFixed(2)} ${control2.x.toFixed(2)},${control2.y.toFixed(2)} ${box.x.toFixed(2)},${box.y.toFixed(2)}`;
      const alpha = Math.pow(box.alpha, 2);
      signal.path.setAttribute("d", d);
      signal.path.setAttribute("opacity", (alpha * 0.62).toFixed(4));
      signal.port.setAttribute("cx", String(box.x));
      signal.port.setAttribute("cy", String(box.y));
      signal.port.setAttribute("r", "2.4");
      signal.port.setAttribute("opacity", String(alpha));
      const length = signal.path.getTotalLength();
      const progress = (time * (0.16 + index * 0.013) + signal.phase) % 1;
      signal.pulses.forEach((pulse, tail) => {
        const at = progress - tail * 0.025;
        if (reduced || at <= 0 || at >= 1 || !length) {
          pulse.setAttribute("opacity", "0");
          return;
        }
        const point = signal.path.getPointAtLength(length * at);
        pulse.setAttribute("cx", String(point.x));
        pulse.setAttribute("cy", String(point.y));
        pulse.setAttribute("r", String(tail === 0 ? 2.1 : 1.25));
        pulse.setAttribute(
          "opacity",
          String(alpha * (1 - tail / 6) * Math.sin(at * Math.PI)),
        );
      });
    });
    for (let index = sparks.length - 1; index >= 0; index--) {
      const spark = sparks[index];
      const age = now - spark.born;
      if (age >= spark.life || reduced) {
        sparks.splice(index, 1);
        continue;
      }
      const elapsed = age / 1000;
      const alpha = Math.pow(1 - age / spark.life, 2);
      ctx.fillStyle = `rgba(255,228,183,${alpha * 0.85})`;
      ctx.globalAlpha = alpha;
      ctx.drawImage(
        glow,
        spark.x + spark.vx * elapsed - 6,
        spark.y + spark.vy * elapsed - 6,
        12,
        12,
      );
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(
        spark.x + spark.vx * elapsed,
        spark.y + spark.vy * elapsed,
        1.4 * alpha + 0.3,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    canvas.dataset.frame = String(++count);
    canvas.dataset.sparks = String(sparks.length);
    if (!reduced) frame = requestAnimationFrame(draw);
  }
  function restart() {
    cancelAnimationFrame(frame);
    if (visible && !disposed) frame = requestAnimationFrame(draw);
  }
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    restart();
  });
  const size = new ResizeObserver(resize);
  observer.observe(container);
  size.observe(stage);
  stage.addEventListener("pointermove", pointer);
  stage.addEventListener("pointerleave", leave);
  preference.addEventListener("change", restart);
  resize();
  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    size.disconnect();
    stage.removeEventListener("pointermove", pointer);
    stage.removeEventListener("pointerleave", leave);
    preference.removeEventListener("change", restart);
    stage.style.removeProperty("--hero-tilt-x");
    stage.style.removeProperty("--hero-tilt-y");
    canvas.remove();
    svg.replaceChildren();
  };
}
