"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { GameStats } from "@/lib/stats";

type VideoLinksContextValue = {
  carriesVideoLink: string;
  setCarriesVideoLink: (value: string) => void;
  positioningLink: string;
  setPositioningLink: (value: string) => void;
  mergeIntoStats: (stats: GameStats) => GameStats;
};

const VideoLinksContext = createContext<VideoLinksContextValue | null>(null);

type VideoLinksProviderProps = {
  initialCarriesVideoLink: string;
  initialPositioningLink: string;
  children: ReactNode;
};

export function VideoLinksProvider({ initialCarriesVideoLink, initialPositioningLink, children }: VideoLinksProviderProps) {
  const [carriesVideoLink, setCarriesVideoLink] = useState(initialCarriesVideoLink);
  const [positioningLink, setPositioningLink] = useState(initialPositioningLink);

  const value = useMemo<VideoLinksContextValue>(
    () => ({
      carriesVideoLink,
      setCarriesVideoLink,
      positioningLink,
      setPositioningLink,
      mergeIntoStats(stats) {
        return {
          ...stats,
          carries: { ...stats.carries, videoLink: carriesVideoLink },
          defensivePositioning: { ...stats.defensivePositioning, videoLink: positioningLink },
        };
      },
    }),
    [carriesVideoLink, positioningLink],
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
