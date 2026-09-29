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
    clubLogo: string;
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
    videoLink: string;
  };
  defensiveActions: {
    successful: number;
  };
};

export function getGameStats(): GameStats {
  return gameStats as GameStats;
}
