import gameStats from "@/data/gameStats.json";

export type GameStats = {
  meta: {
    title: string;
    subtitle: string;
  };
  player: {
    name: string;
    club: string;
    photo: string;
  };
  carries: {
    progressiveCarries: number;
    foundAdvantage: number;
    notFoundAdvantage: number;
    offensiveDuelsWon: number;
    offensiveDuelsLost: number;
    videoLink: string;
  };
  topConnections: {
    passes: number;
    gk: number;
    wrongs: number;
    mc: number;
  };
  defensivePositioning: {
    totalSituations: number;
    badAreaDefenseCount: number;
    videoLink: string;
  };
  defensiveActions: {
    successful: number;
  };
};

export function getGameStats(): GameStats {
  return gameStats as GameStats;
}
