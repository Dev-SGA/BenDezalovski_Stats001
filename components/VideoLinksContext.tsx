"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { GameStats } from "@/lib/stats";

type VideoLinksContextValue = {
  carryLinks: string[];
  setCarryLink: (index: number, value: string) => void;
  positioningLink: string;
  setPositioningLink: (value: string) => void;
  mergeIntoStats: (stats: GameStats) => GameStats;
};

const VideoLinksContext = createContext<VideoLinksContextValue | null>(null);

function padCarryLinks(links: string[]): string[] {
  const next = [...links];
  while (next.length < 3) next.push("");
  return next.slice(0, 3);
}

type VideoLinksProviderProps = {
  initialCarryLinks: string[];
  initialPositioningLink: string;
  children: ReactNode;
};

export function VideoLinksProvider({ initialCarryLinks, initialPositioningLink, children }: VideoLinksProviderProps) {
  const [carryLinks, setCarryLinks] = useState(() => padCarryLinks(initialCarryLinks));
  const [positioningLink, setPositioningLink] = useState(initialPositioningLink);

  const value = useMemo<VideoLinksContextValue>(
    () => ({
      carryLinks,
      setCarryLink(index, value) {
        setCarryLinks((prev) => prev.map((link, i) => (i === index ? value : link)));
      },
      positioningLink,
      setPositioningLink,
      mergeIntoStats(stats) {
        return {
          ...stats,
          carries: { ...stats.carries, videoLinks: carryLinks },
          defensivePositioning: { ...stats.defensivePositioning, videoLink: positioningLink },
        };
      },
    }),
    [carryLinks, positioningLink],
  );

  return <VideoLinksContext.Provider value={value}>{children}</VideoLinksContext.Provider>;
}

export function useVideoLinks(): VideoLinksContextValue {
  const ctx = useContext(VideoLinksContext);
  if (!ctx) {
    throw new Error("useVideoLinks must be used within VideoLinksProvider");
  }
  return ctx;
}
