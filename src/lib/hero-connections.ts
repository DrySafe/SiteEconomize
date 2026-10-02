type Point = { x: number; y: number; phase: number };
type Edge = { a: number; b: number; phase: number };
const namespace = "http://www.w3.org/2000/svg";

function honeycomb() {
  const points: Point[] = [];
  const edges: Edge[] = [];
  const nodes = new Map<string, number>();
  const links = new Set<string>();
  const radius = 60;
  for (let column = -1; column <= 7; column++) {
    for (let row = -1; row <= 6; row++) {
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
  const bend = Math.sin(time * 0.32 + phase) * 3;
  const nx = (-dy / length) * bend;
  const ny = (dx / length) * bend;
  return `M${a.x.toFixed(2)},${a.y.toFixed(2)} C${(a.x + dx / 3 + nx).toFixed(2)},${(a.y + dy / 3 + ny).toFixed(2)} ${(a.x + (dx * 2) / 3 + nx).toFixed(2)},${(a.y + (dy * 2) / 3 + ny).toFixed(2)} ${b.x.toFixed(2)},${b.y.toFixed(2)}`;
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
  function path(className: string) {
    const element = document.createElementNS(namespace, "path");
    element.setAttribute("class", className);
    element.setAttribute("vector-effect", "non-scaling-stroke");
    svg.appendChild(element);
    return element;
  }
  const base = edges.map(() => path("connection-mesh"));
  const highlighted = edges.map(() => path("connection-active"));
  const leads = labels.map(() => path("connection-lead"));
  const attachments = labels.map(() => ({ node: -1, position: "" }));
  const intensity = edges.map(() => 0);
  let costs = edges.map(() => 1);
  let frame = 0;
  let last = 0;
  let rerouteAt = 0;
  let hub = 0;
  let inViewport = false;
  let disposed = false;

  function route(from: number, to: number) {
    const distance = points.map(() => Infinity);
    const previous = new Map<number, { node: number; edge: number }>();
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
        const next = distance[current] + costs[neighbor.edge];
        if (next < distance[neighbor.node]) {
          distance[neighbor.node] = next;
          previous.set(neighbor.node, { node: current, edge: neighbor.edge });
        }
      }
    }
    const result: number[] = [];
    let current = to;
    while (current !== from && previous.has(current)) {
      const step = previous.get(current)!;
      result.push(step.edge);
      current = step.node;
    }
    return result;
  }

  function draw(now: number) {
    if (disposed || !inViewport) return;
    if (!preference.matches && now - last < 32) {
      frame = requestAnimationFrame(draw);
      return;
    }
    const delta = Math.min(0.1, (now - last) / 1000 || 0.033);
    last = now;
    const time = preference.matches ? 0 : now / 1000;
    const wave = points.map((point) => ({
      ...point,
      x:
        point.x +
        Math.sin(time * 0.21 + point.y * 0.008) * 6 +
        Math.sin(time * 0.13 + point.phase) * 2,
      y: point.y + Math.sin(time * 0.18 + point.x * 0.007) * 8,
    }));
    const bounds = container.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    // Read layout and opacity before writing SVG paths, avoiding layout thrashing.
    const boxes = labels.map((label) => {
      const rect = label.getBoundingClientRect();
      return {
        x: ((rect.left + rect.width / 2 - bounds.left) / bounds.width) * 600,
        y: ((rect.top + rect.height / 2 - bounds.top) / bounds.height) * 600,
        width: (rect.width / bounds.width) * 600,
        height: (rect.height / bounds.height) * 600,
        alpha: Number(getComputedStyle(label).opacity),
      };
    });
    function nearest(x: number, y: number, outside?: (typeof boxes)[number]) {
      let result = -1;
      let distance = Infinity;
      wave.forEach((point, index) => {
        if (!adjacency[index].length) return;
        if (
          outside &&
          Math.abs(point.x - outside.x) < outside.width / 2 + 3 &&
          Math.abs(point.y - outside.y) < outside.height / 2 + 3
        )
          return;
        const next = Math.hypot(point.x - x, point.y - y);
        if (next < distance) {
          result = index;
          distance = next;
        }
      });
      return Math.max(0, result);
    }
    if (now >= rerouteAt) {
      costs = edges.map(() => 0.65 + Math.random() * 1.5);
      hub = nearest(
        300 + (Math.random() - 0.5) * 110,
        315 + (Math.random() - 0.5) * 90,
      );
      rerouteAt = now + 5500 + Math.random() * 6500;
    }
    const target = edges.map(() => 0);
    boxes.forEach((box, index) => {
      const attachment = attachments[index];
      const position = `${labels[index].style.left}/${labels[index].style.top}/${bounds.width}/${bounds.height}`;
      if (box.alpha <= 0.001) attachment.node = -1;
      else if (attachment.node < 0 || attachment.position !== position) {
        attachment.node = nearest(box.x, box.y, box);
        attachment.position = position;
      }
      // Keep the junction attached while the box floats; route changes fade
      // along the mesh instead of snapping its endpoint between vertices.
      const node =
        attachment.node < 0 ? nearest(box.x, box.y, box) : attachment.node;
      const point = wave[node];
      const dx = point.x - box.x;
      const dy = point.y - box.y;
      const scale = Math.min(
        box.width / 2 / Math.max(Math.abs(dx), 0.001),
        box.height / 2 / Math.max(Math.abs(dy), 0.001),
      );
      const endpoint = {
        x: box.x + dx * scale,
        y: box.y + dy * scale,
        phase: 0,
      };
      leads[index].setAttribute("d", curve(endpoint, point, time, index));
      leads[index].setAttribute("opacity", (box.alpha * 0.68).toFixed(3));
      if (box.alpha > 0.001) {
        route(node, hub).forEach((edge) => {
          target[edge] = Math.max(target[edge], box.alpha);
        });
      }
    });
    edges.forEach((edge, index) => {
      const d = curve(wave[edge.a], wave[edge.b], time, edge.phase);
      base[index].setAttribute("d", d);
      highlighted[index].setAttribute("d", d);
      intensity[index] +=
        (target[index] - intensity[index]) *
        (preference.matches ? 1 : 1 - Math.exp(-delta * 2));
      highlighted[index].setAttribute(
        "opacity",
        (intensity[index] * 0.6).toFixed(3),
      );
    });
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
  observer.observe(container);
  preference.addEventListener("change", restart);
  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    preference.removeEventListener("change", restart);
    svg.replaceChildren();
  };
}
