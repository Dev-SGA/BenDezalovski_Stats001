import gameStats from "@/data/gameStats.json";

export type Carries = {
  total: number;
  good: number;
  bad: number;
  videoLink?: string;
};

export type OffensiveDuels = {
  won: number;
  lost: number;
};

export type PositionConnection = {
  id: string;
  actions: number;
  good?: number;
  bad?: number;
};

export type Connections = {
  /** Total passes in the match; falls back to the sum of position actions. */
  passes?: number;
  /** Wrong passes, when tracked. */
  wrongs?: number;
  positions: PositionConnection[];
};

export type BoxDefending = {
  good: number;
  bad: number;
  videoLink?: string;
};

export type DefensiveActions = {
  successful: number;
};

export type MatchVideo = {
  label: string;
  url: string;
};

export type MatchKind = "session" | "season";

export type MatchStats = {
  id: string;
  kind?: MatchKind;
  label: string;
  shortLabel: string;
  logo: string;
  carries: Carries;
  offensiveDuels?: OffensiveDuels | null;
  connections: Connections;
  boxDefending: BoxDefending;
  defensiveActions?: DefensiveActions | null;
  videos?: MatchVideo[];
  /** Set on season aggregate — number of matches rolled up. */
  games?: number;
  /** Season numbers divided by the games played. */
  perGame?: boolean;
};

export type StatsReport = {
  meta: {
    title: string;
    subtitle: string;
    session: string;
  };
  player: {
    name: string;
    club: string;
    clubLogo: string;
    photo: string;
  };
  matches: MatchStats[];
};

export type GameStats = {
  meta: StatsReport["meta"] & { fileSlug: string };
  player: StatsReport["player"];
  opponentLogo: string;
  carries: Carries;
  offensiveDuels?: OffensiveDuels | null;
  connections: Connections;
  boxDefending: BoxDefending;
  defensiveActions?: DefensiveActions | null;
  videos?: MatchVideo[];
  games?: number;
};

export function clipUrl(videos: MatchVideo[] | undefined, ...aliases: string[]): string | undefined {
  if (!videos?.length) return undefined;
  const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
  const keys = new Set(aliases.map(normalize));
  return videos.find((video) => keys.has(normalize(video.label)))?.url;
}

function clip(match: MatchStats, videoLink: string | undefined, ...aliases: string[]): string | undefined {
  const fromList = clipUrl(match.videos, ...aliases)?.trim();
  if (fromList) return fromList;
  const trimmed = videoLink?.trim() ?? "";
  return trimmed || undefined;
}

export function carriesClip(match: MatchStats): string | undefined {
  return clip(match, match.carries.videoLink, "Carries", "Progressive carries", "Conduções", "Conducao");
}

export function boxDefendingClip(match: MatchStats): string | undefined {
  return clip(match, match.boxDefending.videoLink, "Box defending", "Box-defending", "Defensive positioning");
}

export function connectionTotal(connections: Connections): number {
  if (connections.passes != null) return connections.passes;
  return connections.positions.reduce((sum, position) => sum + position.actions, 0);
}

export function getStatsReport(): StatsReport {
  return gameStats as StatsReport;
}

/** Average per recorded game, with one decimal when it is not a whole number. */
export function perGame(total: number, games: number): string {
  const value = games > 0 ? total / games : 0;
  const rounded = Math.round(value * 10) / 10;
  return rounded.toFixed(1).replace(/\.0$/, "");
}

export function seasonMatch(matches: MatchStats[]): MatchStats {
  const games = matches.length;
  const positionIds = new Set<string>();
  matches.forEach((match) => match.connections.positions.forEach((position) => positionIds.add(position.id)));

  const positions = [...positionIds].map((id) => {
    const sum = (key: "actions" | "good" | "bad") =>
      matches.reduce(
        (total, match) => total + (match.connections.positions.find((position) => position.id === id)?.[key] ?? 0),
        0,
      );
    return { id, actions: sum("actions"), good: sum("good"), bad: sum("bad") };
  });

  const passes = matches.reduce((sum, match) => sum + (match.connections.passes ?? 0), 0);
  const wrongs = matches.reduce((sum, match) => sum + (match.connections.wrongs ?? 0), 0);
  const duelsWon = matches.reduce((sum, match) => sum + (match.offensiveDuels?.won ?? 0), 0);
  const duelsLost = matches.reduce((sum, match) => sum + (match.offensiveDuels?.lost ?? 0), 0);
  const defensiveSuccessful = matches.reduce((sum, match) => sum + (match.defensiveActions?.successful ?? 0), 0);

  return {
    id: "season",
    kind: "season",
    label: "Season totals",
    shortLabel: "Season",
    logo: "",
    games,
    carries: {
      total: matches.reduce((sum, match) => sum + match.carries.total, 0),
      good: matches.reduce((sum, match) => sum + match.carries.good, 0),
      bad: matches.reduce((sum, match) => sum + match.carries.bad, 0),
      videoLink: "",
    },
    offensiveDuels: duelsWon + duelsLost > 0 ? { won: duelsWon, lost: duelsLost } : null,
    connections: {
      passes: passes > 0 ? passes : undefined,
      wrongs: wrongs > 0 ? wrongs : undefined,
      positions,
    },
    boxDefending: {
      good: matches.reduce((sum, match) => sum + match.boxDefending.good, 0),
      bad: matches.reduce((sum, match) => sum + match.boxDefending.bad, 0),
      videoLink: "",
    },
    defensiveActions: defensiveSuccessful > 0 ? { successful: defensiveSuccessful } : null,
  };
}

/** Whole numbers stay as they are; averages show one decimal. */
export function formatCount(value: number): string {
  if (Number.isInteger(value)) return String(value);
  return (Math.round(value * 10) / 10).toFixed(1).replace(/\.0$/, "");
}

function scaleNumbers<T>(value: T, factor: number): T {
  if (typeof value === "number") return (value * factor) as T;
  if (Array.isArray(value)) return value.map((item) => scaleNumbers(item, factor)) as T;
  if (value === null || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, scaleNumbers(item, factor)]),
  ) as T;
}

/** Season match with every absolute number divided by the games played. Shares stay the same. */
export function perGameMatch(season: MatchStats): MatchStats {
  const games = season.games ?? 0;
  const factor = games > 0 ? 1 / games : 0;

  return {
    ...season,
    label: "Season · Per game",
    carries: scaleNumbers(season.carries, factor),
    offensiveDuels: scaleNumbers(season.offensiveDuels ?? null, factor),
    connections: scaleNumbers(season.connections, factor),
    boxDefending: scaleNumbers(season.boxDefending, factor),
    defensiveActions: scaleNumbers(season.defensiveActions ?? null, factor),
    perGame: true,
  };
}

export function toGameStats(report: StatsReport, match: MatchStats): GameStats {
  return {
    meta: {
      ...report.meta,
      subtitle: match.label,
      fileSlug: `${report.meta.session}-${match.id}${match.perGame ? "-per-game" : ""}`,
    },
    player: report.player,
    opponentLogo: match.logo,
    carries: match.carries,
    offensiveDuels: match.offensiveDuels ?? null,
    connections: match.connections,
    boxDefending: match.boxDefending,
    defensiveActions: match.defensiveActions ?? null,
    videos: match.videos,
    games: match.games,
  };
}
