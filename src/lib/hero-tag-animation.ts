const rows = [26, 39, 52, 65, 78];
const initialRows = [0, 1, 3, 4];

export const heroTagPositions = initialRows.map((row, index) => ({
  x: index % 2 === 0 ? 28 : 72,
  y: rows[row],
}));

type Phase = "hidden" | "entering" | "shown" | "leaving";
const randomBetween = (min: number, max: number) =>
  min + Math.random() * (max - min);

export function animateHeroTags(container: HTMLElement) {
  const elements = Array.from(
    container.querySelectorAll<HTMLElement>(".visual-tag"),
  );
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const occupiedRows = [...initialRows];
  const animations = new Set<Animation>();
  let generation = 0;
  let inViewport = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  function stop() {
    generation += 1;
    clearTimeout(timer);
    animations.forEach((animation) => animation.cancel());
    animations.clear();
    elements.forEach((element, index) => {
      element.style.opacity = index < 2 ? "1" : "0";
    });
    container.removeAttribute("data-animated");
  }

  function move(index: number) {
    // Reserve separate rows, and always leave the label's previous row.
    const available = rows
      .map((_, row) => row)
      .filter((row) => !occupiedRows.includes(row));
    const row = available[Math.floor(Math.random() * available.length)];
    occupiedRows[index] = row;
    const element = elements[index];
    const halfWidth = element.offsetWidth / 2 + 12;
    const width = container.clientWidth;
    const x = halfWidth + Math.random() * Math.max(0, width - halfWidth * 2);
    element.style.left = `clamp(${halfWidth}px, ${(x / width) * 100}%, calc(100% - ${halfWidth}px))`;
    element.style.top = `${rows[row]}%`;
  }

  function start() {
    stop();
    if (preference.matches || !inViewport) return;
    const current = generation;
    const states = elements.map((_, index) => ({
      phase: (index < 2 ? "shown" : "hidden") as Phase,
      eligibleAt: performance.now() + randomBetween(700, 4200),
    }));
    container.setAttribute("data-animated", "true");

    async function transition(index: number, entering: boolean) {
      const state = states[index];
      const element = elements[index];
      // Reserve capacity before starting a fade. Fading items also count.
      state.phase = entering ? "entering" : "leaving";
      if (entering) move(index);
      const animation = element.animate(
        [{ opacity: entering ? 0 : 1 }, { opacity: entering ? 1 : 0 }],
        {
          duration: randomBetween(1800, 3400),
          easing: "ease-in-out",
          fill: "forwards",
        },
      );
      animations.add(animation);
      try {
        await animation.finished;
        if (current !== generation) return;
        element.style.opacity = entering ? "1" : "0";
        state.phase = entering ? "shown" : "hidden";
        state.eligibleAt =
          performance.now() +
          (entering ? randomBetween(2200, 7200) : randomBetween(600, 2800));
      } catch {
        // Observer changes and unmounts cancel animations without restarting them.
      } finally {
        animation.cancel();
        animations.delete(animation);
      }
    }

    function tick() {
      if (current !== generation) return;
      const active = states.filter((state) => state.phase !== "hidden").length;
      const fullyVisible = states.filter(
        (state) => state.phase === "shown",
      ).length;
      const settlingToOne =
        active === 2 &&
        fullyVisible === 1 &&
        states.some((state) => state.phase === "leaving");
      const now = performance.now();
      const candidates = states.flatMap((state, index) => {
        if (state.eligibleAt > now) return [];
        // Occasionally let an exit finish before admitting the next item,
        // so the hero reaches one visible label instead of staying at 2–3.
        if (state.phase === "hidden" && active < 3 && !settlingToOne)
          return [index];
        // Keep a fully opaque anchor. Incoming and outgoing fades cannot
        // release this last visible label, even when their durations overlap.
        if (state.phase === "shown" && fullyVisible > 1) return [index];
        return [];
      });
      if (candidates.length) {
        const index = candidates[Math.floor(Math.random() * candidates.length)];
        void transition(index, states[index].phase === "hidden");
      }
      // Independent eligibility times, random durations and a random choice
      // avoid a repeating order or a shared start/end cycle.
      timer = setTimeout(tick, randomBetween(450, 1100));
    }
    tick();
  }

  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting === inViewport) return;
    inViewport = entry.isIntersecting;
    start();
  });
  observer.observe(container);
  preference.addEventListener("change", start);
  return () => {
    observer.disconnect();
    preference.removeEventListener("change", start);
    stop();
  };
}
