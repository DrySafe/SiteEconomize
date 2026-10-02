"use client";

import { useEffect, useRef } from "react";
import { ChefHat, Leaf, ShoppingCart, Truck } from "lucide-react";

const tags = [
  { label: "FOOD SERVICE", icon: ChefHat },
  { label: "Fazenda Encanto", icon: Leaf },
  { label: "Hiper Mercado", icon: ShoppingCart },
  { label: "Logística que conecta", icon: Truck },
];

// One spare row lets a hidden label move without covering another label.
const rows = [26, 39, 52, 65, 78];
const initialRows = [0, 1, 3, 4];
const positions = initialRows.map((row, index) => ({
  x: index % 2 === 0 ? 28 : 72,
  y: rows[row],
}));

export function HeroTags() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = root.current;
    if (!container) return;
    const elements = Array.from(
      container.querySelectorAll<HTMLElement>(".visual-tag"),
    );
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let generation = 0;
    let visible = true;
    const animations = new Set<Animation>();
    const occupiedRows = [...initialRows];

    function stop() {
      generation += 1;
      animations.forEach((animation) => animation.cancel());
      animations.clear();
      elements.forEach((element, index) => {
        element.style.opacity = index === 3 ? "0" : "1";
      });
      container!.removeAttribute("data-animated");
    }

    function move(index: number) {
      const available = rows
        .map((_, row) => row)
        .filter((row) => !occupiedRows.includes(row));
      const row = available[Math.floor(Math.random() * available.length)];
      occupiedRows[index] = row;
      const element = elements[index];
      const halfWidth = element.offsetWidth / 2 + 12;
      const width = container!.clientWidth;
      const x = halfWidth + Math.random() * Math.max(0, width - halfWidth * 2);
      element.style.left = `clamp(${halfWidth}px, ${(x / width) * 100}%, calc(100% - ${halfWidth}px))`;
      element.style.top = `${rows[row]}%`;
    }

    async function fade(
      index: number,
      from: number,
      to: number,
      duration: number,
      delay: number,
      current: number,
    ) {
      const element = elements[index];
      const animation = element.animate([{ opacity: from }, { opacity: to }], {
        duration,
        delay,
        easing: "ease-in-out",
        fill: "forwards",
      });
      animations.add(animation);
      try {
        await animation.finished;
        if (current === generation) element.style.opacity = String(to);
      } catch {
        // Leaving the viewport or changing motion preferences cancels the cycle.
      } finally {
        animation.cancel();
        animations.delete(animation);
      }
    }

    async function start() {
      stop();
      if (preference.matches || !visible) return;
      const current = generation;
      container!.setAttribute("data-animated", "true");
      let active = [0, 1, 2];
      let hidden = 3;

      while (current === generation) {
        const outgoing = [...active];
        for (let i = outgoing.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [outgoing[i], outgoing[j]] = [outgoing[j], outgoing[i]];
        }
        const began = performance.now();
        move(hidden);
        // Exits start at 0, 0.5 and 1 second, and finish at 1.9, 2.4 and 2.9.
        const exits = outgoing.map((index, order) =>
          fade(index, 1, 0, 1900, order * 500, current),
        );
        // Schedule the first entrance immediately on the browser's animation
        // timeline: it starts before the last exit ends, even if JS is busy.
        const firstEntrance = fade(hidden, 0, 1, 2200, 2650, current);
        const returning = outgoing.slice(0, 2).map(async (index, order) => {
          await exits[order];
          if (current !== generation) return;
          move(index);
          const delay = Math.max(
            0,
            3150 + order * 500 - (performance.now() - began),
          );
          await fade(index, 0, 1, 2200, delay, current);
        });
        await Promise.all([...exits, firstEntrance, ...returning]);
        if (current !== generation) return;
        active = [hidden, outgoing[0], outgoing[1]];
        hidden = outgoing[2];
        await fade(active[0], 1, 1, 700, 0, current);
      }
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      void start();
    });
    observer.observe(container);
    preference.addEventListener("change", start);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", start);
      stop();
    };
  }, []);

  return (
    <div
      ref={root}
      className="hero-tags"
      role="img"
      aria-label={tags.map((tag) => tag.label).join(", ")}
    >
      {tags.map(({ label, icon: Icon }, index) => (
        <div
          key={label}
          className="visual-tag"
          aria-hidden="true"
          style={{
            left: `clamp(100px, ${positions[index].x}%, calc(100% - 100px))`,
            top: `${positions[index].y}%`,
            animationDelay: `${index * -1.7}s`,
            opacity: index === 3 ? 0 : 1,
          }}
        >
          <Icon size={14} />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
