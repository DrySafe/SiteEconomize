"use client";
import { useEffect } from "react";
export function Reveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const targets = document.querySelectorAll("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.08 },
    );
    targets.forEach((el) => {
      el.classList.add("will-reveal");
      observer.observe(el);
    });
    return () => {
      observer.disconnect();
      targets.forEach((el) => el.classList.remove("will-reveal"));
    };
  }, []);
  return null;
}
