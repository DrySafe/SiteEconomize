"use client";

import { useEffect, useRef } from "react";
import { ChefHat, Leaf, ShoppingCart, Truck } from "lucide-react";
import { animateHeroTags, heroTagPositions } from "@/lib/hero-tag-animation";

const tags = [
  { label: "FOOD SERVICE", icon: ChefHat },
  { label: "Fazenda Encanto", icon: Leaf },
  { label: "Hiper Mercado", icon: ShoppingCart },
  { label: "Logística que conecta", icon: Truck },
];

export function HeroTags() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (root.current) return animateHeroTags(root.current);
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
            left: `clamp(100px, ${heroTagPositions[index].x}%, calc(100% - 100px))`,
            top: `${heroTagPositions[index].y}%`,
            animationDelay: `${index * -1.7}s`,
            opacity: index < 2 ? 1 : 0,
          }}
        >
          <Icon size={14} />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
