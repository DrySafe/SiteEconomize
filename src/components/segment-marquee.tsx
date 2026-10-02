"use client";

import { useState } from "react";
import { Pause, Play } from "lucide-react";

const segments = [
  "Panificação",
  "Confeitaria",
  "Açaí & sorvetes",
  "Pizzarias",
  "Restaurantes",
  "Lanchonetes",
  "Hamburguerias",
];

export function SegmentMarquee() {
  const [paused, setPaused] = useState(false);
  return (
    <section className="segment-strip" aria-label="Parceiro de quem produz">
      <div className="container">
        <span className="segment-label">PARCEIRO DE QUEM PRODUZ</span>
        <div className="segment-viewport">
          <div className={`segment-track${paused ? " is-paused" : ""}`}>
            {[0, 1].map((copy) => (
              <ul
                className="segment-group"
                key={copy}
                aria-hidden={copy === 1 ? true : undefined}
              >
                {segments.map((segment) => (
                  <li key={segment}>
                    <span className="tiny-cross" aria-hidden="true">
                      +
                    </span>
                    {segment}
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
        <button
          className="segment-toggle"
          type="button"
          aria-label={
            paused
              ? "Retomar movimento dos segmentos"
              : "Pausar movimento dos segmentos"
          }
          aria-pressed={paused}
          onClick={() => setPaused(!paused)}
        >
          {paused ? <Play size={14} /> : <Pause size={14} />}
        </button>
      </div>
    </section>
  );
}
