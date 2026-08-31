"use client";

import { useEffect, useState } from "react";
import type { PipelineItem, ScoredLot, Stage } from "./types";

const K = {
  stars: "lotdesk.stars",
  pipe: "lotdesk.pipe",
  extra: "lotdesk.extra",
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function useDeskState() {
  const [stars, setStars] = useState<string[]>([]);
  const [pipe, setPipe] = useState<PipelineItem[]>([]);
  const [extra, setExtra] = useState<ScoredLot[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setStars(read(K.stars, [] as string[]));
    setPipe(read(K.pipe, [] as PipelineItem[]));
    setExtra(read(K.extra, [] as ScoredLot[]));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(K.stars, JSON.stringify(stars));
  }, [stars, ready]);
  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(K.pipe, JSON.stringify(pipe));
  }, [pipe, ready]);
  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(K.extra, JSON.stringify(extra));
  }, [extra, ready]);

  function toggleStar(id: string) {
    setStars((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  function addLots(lots: ScoredLot[]) {
    setExtra((prev) => {
      const ids = new Set(prev.map((l) => l.id));
      return [...lots.filter((l) => !ids.has(l.id)), ...prev];
    });
  }

  function stageOf(id: string): Stage | undefined {
    return pipe.find((p) => p.lotId === id)?.stage;
  }

  function setStage(lot: ScoredLot, stage: Stage) {
    setPipe((prev) => {
      const rest = prev.filter((p) => p.lotId !== lot.id);
      return [...rest, { lotId: lot.id, stage, capital: lot.score.allIn - lot.score.sellFee }];
    });
    if (!stars.includes(lot.id)) toggleStar(lot.id);
  }

  const capitalInYard = pipe
    .filter((p) => ["won", "rehab", "listed"].includes(p.stage))
    .reduce((a, b) => a + b.capital, 0);

  return { stars, toggleStar, pipe, setStage, stageOf, extra, addLots, ready, capitalInYard };
}
