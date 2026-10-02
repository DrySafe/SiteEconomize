"use client";

import { useEffect, useRef } from "react";
import { ChefHat, Leaf, ShoppingCart, Truck } from "lucide-react";

const tags = [
  { label: "FOOD SERVICE", icon: ChefHat },
  { label: "Fazenda Encanto", icon: Leaf },
  { label: "Hiper Mercado", icon: ShoppingCart },
  { label: "Logística que conecta", icon: Truck },
];

// Four separated areas keep the labels inside the hero, including on mobile.
const positions = [
  { x: 25, y: 30 },
  { x: 75, y: 41 },
  { x: 25, y: 62 },
  { x: 75, y: 74 },
];

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
    let animations: Animation[] = [];

    function stop() {
      generation += 1;
      animations.forEach((animation) => animation.cancel());
      animations = [];
      container!.removeAttribute("data-animated");
    }

    async function start() {
      stop();
      if (preference.matches || !visible) return;
      const current = generation;
      container!.setAttribute("data-animated", "true");

      while (current === generation) {
        const slots = [...positions];
        for (let i = slots.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [slots[i], slots[j]] = [slots[j], slots[i]];
        }
        animations = elements.map((element, index) => {
          const slot = slots[index];
          element.style.left = `clamp(76px, ${slot.x + (Math.random() - 0.5) * 3}%, calc(100% - 76px))`;
          element.style.top = `${slot.y + (Math.random() - 0.5) * 5}%`;
          return element.animate(
            [
              {
                opacity: 0,
                transform: "translate(-50%, calc(-50% + 6px))",
                offset: 0,
              },
              { opacity: 1, transform: "translate(-50%, -50%)", offset: 0.24 },
              { opacity: 1, transform: "translate(-50%, -50%)", offset: 0.6 },
              {
                opacity: 0,
                transform: "translate(-50%, calc(-50% - 4px))",
                offset: 0.9,
              },
              { opacity: 0, offset: 1 },
            ],
            {
              duration: 11000 + Math.random() * 1500,
              delay: index * 600,
              easing: "ease-in-out",
            },
          );
        });
        // All labels finish fading out before their positions change.
        await Promise.all(
          animations.map((animation) =>
            animation.finished.catch(() => undefined),
          ),
        );
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
            left: `clamp(76px, ${positions[index].x}%, calc(100% - 76px))`,
            top: `${positions[index].y}%`,
          }}
        >
          <Icon size={14} />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
