"use client";

import { useEffect, useRef } from "react";
import { ChefHat, Leaf, ShoppingCart, Truck } from "lucide-react";
import { animateHeroTags, heroTagPositions } from "@/lib/hero-tag-animation";
import { animateHeroConnections } from "@/lib/hero-connections";

const tags = [
  { label: "FOOD SERVICE", icon: ChefHat },
  { label: "Fazenda Encanto", icon: Leaf },
  { label: "Hiper Mercado", icon: ShoppingCart },
  { label: "Logística que conecta", icon: Truck },
];

export function HeroTags() {
  const root = useRef<HTMLDivElement>(null);
  const connections = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!root.current || !connections.current) return;
    const stopTags = animateHeroTags(root.current);
    const stopConnections = animateHeroConnections(
      connections.current,
      root.current,
    );
    return () => {
      stopConnections();
      stopTags();
    };
  }, []);

  return (
    <div
      ref={root}
      className="hero-tags"
      role="img"
      aria-label={tags.map((tag) => tag.label).join(", ")}
    >
      <svg
        ref={connections}
        className="hero-connections"
        viewBox="0 0 600 600"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      />
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
