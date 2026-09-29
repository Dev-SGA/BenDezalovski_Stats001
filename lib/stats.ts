import gameStats from "@/data/gameStats.json";

export type GameStats = {
  meta: {
    title: string;
    subtitle: string;
  };
  player: {
    name: string;
    club: string;
  };
  carries: {
    progressiveCarries: number;
    foundAdvantage: number;
    notFoundAdvantage: number;
    offensiveDuelsWon: number;
    offensiveDuelsLost: number;
    videoLinks: string[];
  };
  topConnections: {
    passes: number;
    gk: number;
    wrongs: number;
    mc: number;
  };
  defensivePositioning: {
    badAreaDefenseCount: number;
  };
  defensiveActions: {
    successful: number;
  };
};

export function getGameStats(): GameStats {
  return gameStats as GameStats;
}
