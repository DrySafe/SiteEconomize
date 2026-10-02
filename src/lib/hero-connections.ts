type Point = { x: number; y: number; phase: number };
type Edge = { a: number; b: number; phase: number };
const namespace = "http://www.w3.org/2000/svg";

function honeycomb() {
  const points: Point[] = [];
  const edges: Edge[] = [];
  const nodes = new Map<string, number>();
  const links = new Set<string>();
  const radius = 36;
  for (
    let column = -1;
    column <= Math.ceil(600 / (radius * 1.5)) + 1;
    column++
  ) {
    for (
      let row = -1;
      row <= Math.ceil(600 / (Math.sqrt(3) * radius)) + 1;
      row++
    ) {
      const x = column * radius * 1.5;
      const y =
        Math.sqrt(3) * radius * (row + (Math.abs(column % 2) ? 0.5 : 0));
      const corners = Array.from({ length: 6 }, (_, corner) => {
        const angle = (corner * Math.PI) / 3;
        const px = x + Math.cos(angle) * radius;
        const py = y + Math.sin(angle) * radius;
        const key = `${px.toFixed(3)},${py.toFixed(3)}`;
        if (!nodes.has(key)) {
          nodes.set(key, points.length);
          points.push({ x: px, y: py, phase: Math.random() * Math.PI * 2 });
        }
        return nodes.get(key)!;
      });
      corners.forEach((a, corner) => {
        const b = corners[(corner + 1) % 6];
        const midpoint = {
          x: (points[a].x + points[b].x) / 2,
          y: (points[a].y + points[b].y) / 2,
        };
        const key = [a, b].sort((first, second) => first - second).join(":");
        if (
          links.has(key) ||
          midpoint.x < 0 ||
          midpoint.x > 600 ||
          midpoint.y < 80 ||
          midpoint.y > 535
        )
          return;
        links.add(key);
        edges.push({ a, b, phase: Math.random() * Math.PI * 2 });
      });
    }
  }
  return { points, edges };
}

function curve(a: Point, b: Point, time: number, phase: number) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy) || 1;
  const bend = Math.sin(time * 0.32 + phase) * 6;
  const nx = (-dy / length) * bend;
  const ny = (dx / length) * bend;
  return `M${a.x.toFixed(2)},${a.y.toFixed(2)} C${(a.x + dx / 3 + nx).toFixed(2)},${(a.y + dy / 3 + ny).toFixed(2)} ${(a.x + (dx * 2) / 3 + nx).toFixed(2)},${(a.y + (dy * 2) / 3 + ny).toFixed(2)} ${b.x.toFixed(2)},${b.y.toFixed(2)}`;
}

function roundedRoute(points: Point[]) {
  if (points.length < 2) return "";
  let d = `M${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`;
  for (let index = 1; index < points.length - 1; index++) {
    const previous = points[index - 1];
    const point = points[index];
    const next = points[index + 1];
    const before = Math.hypot(point.x - previous.x, point.y - previous.y) || 1;
    const after = Math.hypot(next.x - point.x, next.y - point.y) || 1;
    const radius = Math.min(15, before * 0.4, after * 0.4);
    const ax = point.x + ((previous.x - point.x) / before) * radius;
    const ay = point.y + ((previous.y - point.y) / before) * radius;
    const bx = point.x + ((next.x - point.x) / after) * radius;
    const by = point.y + ((next.y - point.y) / after) * radius;
    d += ` L${ax.toFixed(2)},${ay.toFixed(2)} Q${point.x.toFixed(2)},${point.y.toFixed(2)} ${bx.toFixed(2)},${by.toFixed(2)}`;
  }
  const end = points[points.length - 1];
  return `${d} L${end.x.toFixed(2)},${end.y.toFixed(2)}`;
}

function intersectsBox(
  a: Point,
  b: Point,
  box: { x: number; y: number; width: number; height: number },
) {
  const dx = b.x - a.x,
    dy = b.y - a.y;
  const padding = 12;
  const p = [-dx, dx, -dy, dy];
  const q = [
    a.x - box.x + padding,
    box.x + box.width + padding - a.x,
    a.y - box.y + box.height / 2 + padding,
    box.y + box.height / 2 + padding - a.y,
  ];
  let near = 0,
    far = 1;
  for (let index = 0; index < 4; index++) {
    if (p[index] === 0) {
      if (q[index] < 0) return false;
    } else {
      const ratio = q[index] / p[index];
      if (p[index] < 0) near = Math.max(near, ratio);
      else far = Math.min(far, ratio);
      if (near > far) return false;
    }
  }
  return true;
}

export function animateHeroConnections(
  svg: SVGSVGElement,
  container: HTMLElement,
) {
  const { points, edges } = honeycomb();
  const labels = Array.from(
    container.querySelectorAll<HTMLElement>(".visual-tag"),
  );
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const adjacency = points.map(() => [] as { node: number; edge: number }[]);
  edges.forEach(({ a, b }, edge) => {
    adjacency[a].push({ node: b, edge });
    adjacency[b].push({ node: a, edge });
  });
  function group(className: string) {
    const element = document.createElementNS(namespace, "g");
    element.setAttribute("class", className);
    svg.appendChild(element);
    return element;
  }
  const mesh = group("connection-background");
  const network = group("connection-network");
  const dust = group("connection-dust");
  function path(className: string, parent: SVGGElement) {
    const element = document.createElementNS(namespace, "path");
    element.setAttribute("class", className);
    element.setAttribute("vector-effect", "non-scaling-stroke");
    parent.appendChild(element);
    return element;
  }
  function dot() {
    const element = document.createElementNS(namespace, "circle");
    element.setAttribute("class", "connection-particle");
    dust.appendChild(element);
    return element;
  }
  const base = edges.map(() => path("connection-mesh", mesh));
  const attachments = labels.map(() => ({
    node: -1,
    position: "",
    alpha: 0,
    trend: "",
  }));
  const pairs = labels.flatMap((_, a) =>
    labels.slice(a + 1).map((_, offset) => {
      const b = a + offset + 1;
      const paths = [
        path("connection-active", network),
        path("connection-active", network),
      ];
      paths.forEach((element) => {
        element.dataset.from = String(a);
        element.dataset.to = String(b);
      });
      const pulses = [dot(), dot()];
      return {
        a,
        b,
        paths,
        pulses,
        nodes: [] as number[],
        previous: [] as number[],
        key: "",
        changed: 0,
      };
    }),
  );
  const particles: {
    element: SVGCircleElement;
    x: number;
    y: number;
    vx: number;
    vy: number;
    born: number;
    life: number;
    size: number;
  }[] = [];
  const cachedRoutes = new Map<string, number[]>();
  let costs = edges.map(() => 1);
  let version = 0;
  let blocked = edges.map(() => false);
  let layout = "";
  let frame = 0;
  let last = 0;
  let rerouteAt = 0;
  let inViewport = false;
  let disposed = false;

  function route(from: number, to: number) {
    const key = `${from}:${to}`;
    if (cachedRoutes.has(key)) return cachedRoutes.get(key)!;
    const distance = points.map(() => Infinity);
    const previous = new Map<number, number>();
    const visited = new Set<number>();
    distance[from] = 0;
    while (visited.size < points.length) {
      let current = -1;
      for (let index = 0; index < points.length; index++) {
        if (
          !visited.has(index) &&
          (current < 0 || distance[index] < distance[current])
        )
          current = index;
      }
      if (current < 0 || !Number.isFinite(distance[current]) || current === to)
        break;
      visited.add(current);
      for (const neighbor of adjacency[current]) {
        if (blocked[neighbor.edge]) continue;
        const point = points[neighbor.node];
        if (point.x < 5 || point.x > 595 || point.y < 85 || point.y > 535)
          continue;
        const next = distance[current] + costs[neighbor.edge];
        if (next < distance[neighbor.node]) {
          distance[neighbor.node] = next;
          previous.set(neighbor.node, current);
        }
      }
    }
    const result = [to];
    let current = to;
    while (current !== from && previous.has(current)) {
      current = previous.get(current)!;
      result.unshift(current);
    }
    const valid = current === from ? result : [];
    cachedRoutes.set(key, valid);
    return valid;
  }

  function burst(x: number, y: number, now: number, disconnecting: boolean) {
    if (preference.matches) return;
    for (let index = 0; index < 9 && particles.length < 72; index++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 10 + Math.random() * 25;
      particles.push({
        element: dot(),
        x,
        y,
        vx: Math.cos(angle) * speed - (disconnecting ? 12 : 4),
        vy: Math.sin(angle) * speed,
        born: now,
        life: 650 + Math.random() * 800,
        size: 0.9 + Math.random() * 1.2,
      });
    }
  }

  function draw(now: number) {
    if (disposed || !inViewport) return;
    if (!preference.matches && now - last < 32) {
      frame = requestAnimationFrame(draw);
      return;
    }
    last = now;
    const time = preference.matches ? 0 : now / 1000;
    const wave = points.map((point) => ({
      ...point,
      x:
        point.x +
        Math.sin(time * 0.21 + point.y * 0.008) * 5 +
        Math.sin(time * 0.13 + point.phase) * 1.5,
      y: point.y + Math.sin(time * 0.18 + point.x * 0.007) * 6,
    }));
    const bounds = container.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const boxes = labels.map((label) => {
      const rect = label.getBoundingClientRect();
      return {
        x: ((rect.left - bounds.left) / bounds.width) * 600,
        y: ((rect.top + rect.height / 2 - bounds.top) / bounds.height) * 600,
        width: (rect.width / bounds.width) * 600,
        height: (rect.height / bounds.height) * 600,
        alpha: Number(getComputedStyle(label).opacity),
        phase: 0,
      };
    });
    const obstacles = boxes.filter((box) => box.alpha > 0.04);
    const nextLayout =
      boxes
        .map((box, index) =>
          box.alpha > 0.04
            ? `${index}:${labels[index].style.left}:${labels[index].style.top}`
            : "",
        )
        .join("|") + `/${bounds.width}/${bounds.height}`;
    if (nextLayout !== layout) {
      layout = nextLayout;
      blocked = edges.map((edge) =>
        obstacles.some((box) =>
          intersectsBox(points[edge.a], points[edge.b], box),
        ),
      );
      cachedRoutes.clear();
      version++;
    }
    function nearest(x: number, y: number) {
      let result = -1,
        distance = Infinity;
      wave.forEach((point, index) => {
        if (
          !adjacency[index].length ||
          points[index].x < 5 ||
          points[index].x > 595 ||
          points[index].y < 85 ||
          points[index].y > 535
        )
          return;
        if (adjacency[index].every((neighbor) => blocked[neighbor.edge]))
          return;
        const next =
          Math.hypot(point.x - x, point.y - y) + Math.max(0, point.x - x) * 2;
        if (next < distance) {
          result = index;
          distance = next;
        }
      });
      return Math.max(0, result);
    }
    if (now >= rerouteAt) {
      costs = edges.map(() => 0.7 + Math.random() * 1.3);
      cachedRoutes.clear();
      version++;
      rerouteAt = now + 5500 + Math.random() * 6500;
    }
    boxes.forEach((box, index) => {
      const attachment = attachments[index];
      const position = `${labels[index].style.left}/${labels[index].style.top}/${layout}`;
      if (box.alpha <= 0.001) attachment.node = -1;
      else if (attachment.node < 0 || attachment.position !== position) {
        attachment.node = nearest(Math.max(8, box.x - 22), box.y);
        attachment.position = position;
      }
      if (
        box.alpha > attachment.alpha + 0.002 &&
        attachment.trend !== "in" &&
        box.alpha > 0.06
      ) {
        burst(box.x, box.y, now, false);
        attachment.trend = "in";
      }
      if (
        box.alpha < attachment.alpha - 0.002 &&
        attachment.trend !== "out" &&
        box.alpha < 0.9
      ) {
        burst(box.x, box.y, now, true);
        attachment.trend = "out";
      }
      attachment.alpha = box.alpha;
    });
    base.forEach((element, index) => {
      const edge = edges[index];
      element.setAttribute(
        "d",
        curve(wave[edge.a], wave[edge.b], time, edge.phase),
      );
    });
    pairs.forEach((pair, pairIndex) => {
      const a = boxes[pair.a],
        b = boxes[pair.b];
      const alpha = Math.min(a.alpha, b.alpha);
      const connected =
        alpha > 0.04 &&
        attachments[pair.a].node >= 0 &&
        attachments[pair.b].node >= 0;
      if (!connected) {
        pair.paths.forEach((element) => element.setAttribute("opacity", "0"));
        pair.pulses.forEach((element) => element.setAttribute("opacity", "0"));
        pair.key = "";
        pair.nodes = [];
        pair.previous = [];
        return;
      }
      const key = `${attachments[pair.a].node}:${attachments[pair.b].node}:${version}`;
      if (key !== pair.key) {
        pair.previous = pair.nodes;
        pair.nodes = route(attachments[pair.a].node, attachments[pair.b].node);
        pair.key = key;
        pair.changed = now;
      }
      const blend = preference.matches
        ? 1
        : Math.min(1, (now - pair.changed) / 950);
      const opacity = Math.pow(alpha, 2) * 0.85;
      function geometry(nodes: number[]) {
        if (!nodes.length) return "";
        return roundedRoute([
          a,
          { ...a, x: Math.max(3, a.x - 22) },
          ...nodes.map((node) => wave[node]),
          { ...b, x: Math.max(3, b.x - 22) },
          b,
        ]);
      }
      pair.paths[0].setAttribute("d", geometry(pair.nodes));
      pair.paths[0].setAttribute(
        "opacity",
        (opacity * (pair.previous.length ? blend : 1)).toFixed(4),
      );
      pair.paths[1].setAttribute("d", geometry(pair.previous));
      pair.paths[1].setAttribute(
        "opacity",
        (pair.previous.length ? opacity * (1 - blend) : 0).toFixed(4),
      );
      pair.pulses.forEach((element, index) => {
        if (preference.matches || !pair.nodes.length) {
          element.setAttribute("opacity", "0");
          return;
        }
        const length = pair.paths[0].getTotalLength();
        if (!length) {
          element.setAttribute("opacity", "0");
          return;
        }
        const progress = (time * 0.09 + pairIndex * 0.23 + index * 0.5) % 1;
        const point = pair.paths[0].getPointAtLength(length * progress);
        element.setAttribute("cx", String(point.x));
        element.setAttribute("cy", String(point.y));
        element.setAttribute("r", "1.6");
        element.setAttribute(
          "opacity",
          (opacity * Math.sin(progress * Math.PI) * 0.9).toFixed(3),
        );
      });
    });
    for (let index = particles.length - 1; index >= 0; index--) {
      const particle = particles[index];
      const age = now - particle.born;
      if (age >= particle.life || preference.matches) {
        particle.element.remove();
        particles.splice(index, 1);
        continue;
      }
      const elapsed = age / 1000;
      particle.element.setAttribute(
        "cx",
        String(particle.x + particle.vx * elapsed),
      );
      particle.element.setAttribute(
        "cy",
        String(particle.y + particle.vy * elapsed + elapsed * elapsed * 6),
      );
      particle.element.setAttribute(
        "r",
        String(particle.size * (1 - (age / particle.life) * 0.5)),
      );
      particle.element.setAttribute(
        "opacity",
        String(Math.pow(1 - age / particle.life, 2) * 0.65),
      );
    }
    if (!preference.matches) frame = requestAnimationFrame(draw);
  }
  function restart() {
    cancelAnimationFrame(frame);
    if (inViewport && !disposed) frame = requestAnimationFrame(draw);
  }
  const observer = new IntersectionObserver(([entry]) => {
    inViewport = entry.isIntersecting;
    restart();
  });
  const resize = new ResizeObserver(restart);
  observer.observe(container);
  resize.observe(container);
  preference.addEventListener("change", restart);
  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    resize.disconnect();
    preference.removeEventListener("change", restart);
    svg.replaceChildren();
  };
}
