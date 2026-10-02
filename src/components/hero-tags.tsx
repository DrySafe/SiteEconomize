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
    let animation: Animation | undefined;
    const occupiedRows = [...initialRows];

    function stop() {
      generation += 1;
      animation?.cancel();
      animation = undefined;
      container!.removeAttribute("data-animated");
    }

    async function fade(
      element: HTMLElement,
      from: number,
      to: number,
      duration: number,
    ) {
      const previousAnimation = animation;
      animation = element.animate([{ opacity: from }, { opacity: to }], {
        duration,
        easing: "ease-in-out",
        fill: "forwards",
      });
      previousAnimation?.cancel();
      await animation.finished.catch(() => undefined);
    }

    async function start() {
      stop();
      if (preference.matches || !visible) return;
      const current = generation;
      container!.setAttribute("data-animated", "true");
      let previous = -1;

      while (current === generation) {
        const candidates = elements
          .map((_, index) => index)
          .filter((index) => index !== previous);
        const index = candidates[Math.floor(Math.random() * candidates.length)];
        const element = elements[index];
        previous = index;

        // Only one label fades at a time; the other three stay fully visible.
        await fade(element, 1, 0, 1900);
        if (current !== generation) return;

        const available = rows
          .map((_, row) => row)
          .filter((row) => !occupiedRows.includes(row));
        const row = available[Math.floor(Math.random() * available.length)];
        occupiedRows[index] = row;
        const halfWidth = element.offsetWidth / 2 + 12;
        const width = container!.clientWidth;
        const x =
          halfWidth + Math.random() * Math.max(0, width - halfWidth * 2);
        element.style.left = `clamp(${halfWidth}px, ${(x / width) * 100}%, calc(100% - ${halfWidth}px))`;
        element.style.top = `${rows[row]}%`;

        await fade(element, 0, 1, 2200);
        if (current !== generation) return;
        animation?.cancel();
        // A calm interval separates each independently timed appearance.
        await fade(element, 1, 1, 1600 + Math.random() * 1600);
        if (current !== generation) return;
        animation?.cancel();
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
          }}
        >
          <Icon size={14} />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
