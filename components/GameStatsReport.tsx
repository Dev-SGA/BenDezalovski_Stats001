"use client";

import { useMemo, useState } from "react";
import { AthleteProfileCard } from "@/components/AthleteProfileCard";
import { ExportPdfButton } from "@/components/ExportPdfButton";
import { ClipAnchor, ClipLegendLabel, ClipMetricTitle } from "@/components/ClipUi";
import { CountLine } from "@/components/CountLine";
import { VideoLinksProvider } from "@/components/VideoLinksContext";
import { MetricFlow } from "@/components/MetricFlow";
import { SgaBrand } from "@/components/SgaBrand";
import { SgaCornerBrand } from "@/components/SgaCornerBrand";
import { TopicsBoard, type Topic } from "@/components/TopicsBoard";
import { BRAND } from "@/lib/brand";
import {
  boxDefendingClip,
  carriesClip,
  connectionTotal,
  formatCount,
  perGameMatch,
  seasonMatch,
  toGameStats,
  type MatchStats,
  type StatsReport,
} from "@/lib/stats";

type GameStatsReportProps = {
  report: StatsReport;
};

type BarTone = "accent" | "positive" | "negative" | "muted";

function percent(value: number, total: number): number {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

function SplitMeter({
  title,
  primary,
  secondary,
  primaryLabel,
  secondaryLabel,
  primaryTone,
  secondaryTone,
  headline,
  primaryHref,
  secondaryHref,
  games,
  countUnit,
}: {
  title: string;
  primary: number;
  secondary: number;
  primaryLabel: string;
  secondaryLabel: string;
  primaryTone: BarTone;
  secondaryTone: BarTone;
  headline: string;
  primaryHref?: string;
  secondaryHref?: string;
  games?: number;
  countUnit?: string;
}) {
  const total = primary + secondary;
  const primaryPct = percent(primary, total);

  return (
    <div className="metric-card">
      <h3 className="metric-card__title">{title}</h3>
      {games && countUnit ? <CountLine value={total} unit={countUnit} className="metric-card__count-line--meter" /> : null}
      <p className="metric-card__headline">{headline}</p>
      <div className="meter" role="img" aria-label={`${primaryLabel}: ${primary}. ${secondaryLabel}: ${secondary}.`}>
        <span className={`meter__seg meter__seg--${primaryTone}`} style={{ width: `${primaryPct}%` }} />
        <span className={`meter__seg meter__seg--${secondaryTone}`} style={{ width: `${100 - primaryPct}%` }} />
      </div>
      <ul className="legend">
        <li>
          <span className={`legend__dot legend__dot--${primaryTone}`} />
          <ClipLegendLabel label={primaryLabel} href={primaryHref} />
          {primaryHref ? (
            <ClipAnchor href={primaryHref} className="legend__clip-stat" ariaLabel={`Open video: ${primaryLabel}`}>
              {formatCount(primary)} · {primaryPct}%
            </ClipAnchor>
          ) : (
            <strong>
              {formatCount(primary)} · {primaryPct}%
            </strong>
          )}
        </li>
        <li>
          <span className={`legend__dot legend__dot--${secondaryTone}`} />
          <ClipLegendLabel label={secondaryLabel} href={secondaryHref} />
          {secondaryHref ? (
            <ClipAnchor href={secondaryHref} className="legend__clip-stat" ariaLabel={`Open video: ${secondaryLabel}`}>
              {formatCount(secondary)} · {percent(secondary, total)}%
            </ClipAnchor>
          ) : (
            <strong>
              {formatCount(secondary)} · {percent(secondary, total)}%
            </strong>
          )}
        </li>
      </ul>
    </div>
  );
}

function BigStat({ value, caption, tone }: { value: string; caption: string; tone: "positive" | "warn" }) {
  return (
    <div className={`big-stat big-stat--${tone}`}>
      <span className="big-stat__value">{value}</span>
      <p className="big-stat__caption">{caption}</p>
    </div>
  );
}

type SeasonMode = "total" | "perGame";

function SeasonModeToggle({ mode, onChange }: { mode: SeasonMode; onChange: (mode: SeasonMode) => void }) {
  const items: { id: SeasonMode; label: string }[] = [
    { id: "total", label: "Total" },
    { id: "perGame", label: "Per game" },
  ];

  return (
    <div className="match-nav__pills season-mode" role="group" aria-label="Season numbers">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`match-nav__pill${item.id === mode ? " is-active" : ""}`}
          aria-pressed={item.id === mode}
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function MatchSwitcher({
  matches,
  activeId,
  onChange,
  children,
}: {
  matches: MatchStats[];
  activeId: string;
  onChange: (id: string) => void;
  children?: React.ReactNode;
}) {
  const index = matches.findIndex((match) => match.id === activeId);

  return (
    <div className="match-nav">
      <div className="match-nav__session" role="group" aria-label="Matches">
        <button
          type="button"
          className="match-nav__arrow"
          onClick={() => onChange(matches[index - 1].id)}
          disabled={index <= 0}
          aria-label="Previous match"
        >
          <span aria-hidden="true">‹</span>
        </button>
        <div className="match-nav__pills">
          {matches.map((match) => (
            <button
              key={match.id}
              type="button"
              className={`match-nav__pill${match.id === activeId ? " is-active" : ""}`}
              aria-pressed={match.id === activeId}
              onClick={() => onChange(match.id)}
            >
              {match.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={match.logo} alt="" className="club-logo club-logo--pill" />
              ) : null}
              {match.shortLabel}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="match-nav__arrow"
          onClick={() => onChange(matches[index + 1].id)}
          disabled={index < 0 || index === matches.length - 1}
          aria-label="Next match"
        >
          <span aria-hidden="true">›</span>
        </button>
      </div>
      {children}
    </div>
  );
}

function buildTopics(match: MatchStats): Topic[] {
  const { carries, offensiveDuels, connections, boxDefending, defensiveActions } = match;
  const games = match.id === "season" ? match.games : undefined;
  const isSeason = Boolean(games && games > 0);
  const seasonCaption = (what: string) =>
    match.perGame ? `Average ${what} per game` : `Total ${what} across recorded matches`;

  const carryClip = isSeason ? undefined : carriesClip(match);
  const boxClip = isSeason ? undefined : boxDefendingClip(match);

  const carryPositiveRate = percent(carries.good, carries.total);
  const passTotal = connectionTotal(connections);
  const boxTotal = boxDefending.good + boxDefending.bad;
  const sortedConnections = [...connections.positions].sort((a, b) => b.actions - a.actions);
  const topConnections = sortedConnections.slice(0, 2);
  const otherConnections = sortedConnections.slice(2);

  const topics: Topic[] = [
    {
      id: "carries",
      title: "Progressive Carries",
      phase: "build-up",
      content: (
        <>
          <MetricFlow
            items={[
              <div key="carries" className="metric-card metric-card--hero">
                <ClipMetricTitle label="Progressive carries" href={carryClip} />
                {games ? (
                  <CountLine value={carries.total} unit="carries" size="hero" />
                ) : carryClip ? (
                  <ClipAnchor href={carryClip} className="metric-card__value clip-link--value" ariaLabel="Open video: Progressive carries">
                    {formatCount(carries.total)}
                  </ClipAnchor>
                ) : (
                  <span className="metric-card__value">{formatCount(carries.total)}</span>
                )}
                <p className="metric-card__caption">
                  {isSeason ? seasonCaption("progressive carries") : "Carries that moved the ball significantly toward goal"}
                </p>
              </div>,
              <SplitMeter
                key="outcome"
                title="Carry outcome"
                headline={`${formatCount(carries.good)} of ${formatCount(carries.total)} · ${carryPositiveRate}%`}
                primary={carries.good}
                secondary={carries.bad}
                primaryLabel="Find Advantage"
                secondaryLabel="Wrong Pass"
                primaryTone="positive"
                secondaryTone="muted"
                games={games}
                countUnit="carries"
              />,
              ...(offensiveDuels && offensiveDuels.won + offensiveDuels.lost > 0
                ? [
                    <SplitMeter
                      key="duels"
                      title="Offensive duels"
                      headline={`${percent(offensiveDuels.won, offensiveDuels.won + offensiveDuels.lost)}% win rate`}
                      primary={offensiveDuels.won}
                      secondary={offensiveDuels.lost}
                      primaryLabel="Won"
                      secondaryLabel="Lost"
                      primaryTone="positive"
                      secondaryTone="negative"
                      games={games}
                      countUnit="offensive duels"
                    />,
                  ]
                : []),
            ]}
          />
        </>
      ),
    },
    {
      id: "connections",
      title: "Passes & Connections",
      phase: "build-up",
      content: (
        <div className="conn-layout">
          <div className="metric-card metric-card--hero">
            <h3 className="metric-card__title">Passes</h3>
            {games ? (
              <CountLine value={passTotal} unit="passes" size="hero" />
            ) : (
              <span className="metric-card__value">{formatCount(passTotal)}</span>
            )}
            <p className="metric-card__caption">
              {isSeason ? seasonCaption("passes") : "Total passes and connection actions in the match"}
            </p>
          </div>
          <div className="conn-side">
            <div className="conn-top">
              {topConnections.map((position) => (
                <div key={position.id} className="metric-card">
                  <h3 className="metric-card__title">{position.id}</h3>
                  <span className="metric-card__value">{formatCount(position.actions)}</span>
                  <span className="metric-card__pct">{percent(position.actions, passTotal)}% of passes</span>
                </div>
              ))}
            </div>
            <div className="conn-grid">
              {otherConnections.map((position) => (
                <div key={position.id} className="metric-card metric-card--mini">
                  <h3 className="metric-card__title">{position.id}</h3>
                  <span className="metric-card__value">{formatCount(position.actions)}</span>
                  <span className="metric-card__pct">{percent(position.actions, passTotal)}%</span>
                </div>
              ))}
              {connections.wrongs != null && connections.wrongs > 0 ? (
                <div className="metric-card metric-card--mini">
                  <h3 className="metric-card__title">Wrong</h3>
                  <span className="metric-card__value">{formatCount(connections.wrongs)}</span>
                  <span className="metric-card__pct">{percent(connections.wrongs, passTotal)}%</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "positioning",
      title: "Box Defending",
      phase: "defensive",
      content: (
        <>
          <div className="metric-card metric-card--hero">
            <ClipMetricTitle label="Box-defending situations" href={boxClip} />
            {games ? (
              <CountLine value={boxTotal} unit="situations" size="hero" />
            ) : boxClip ? (
              <ClipAnchor href={boxClip} className="metric-card__value clip-link--value" ariaLabel="Open video: Box defending">
                {formatCount(boxTotal)}
              </ClipAnchor>
            ) : (
              <span className="metric-card__value">{formatCount(boxTotal)}</span>
            )}
            <p className="metric-card__caption">
              {isSeason ? seasonCaption("box-defending situations") : "Total situations while defending the box"}
            </p>
          </div>
          <SplitMeter
            title="Positioning"
            headline={`${formatCount(boxDefending.good)} of ${formatCount(boxTotal)} · ${percent(boxDefending.good, boxTotal)}%`}
            primary={boxDefending.good}
            secondary={boxDefending.bad}
            primaryLabel="In Position"
            secondaryLabel="Out of Position"
            primaryTone="positive"
            secondaryTone="negative"
            games={games}
            countUnit="situations"
          />
        </>
      ),
    },
  ];

  if (defensiveActions && defensiveActions.successful > 0) {
    topics.push({
      id: "defensive",
      title: "Defensive Actions",
      phase: "defensive",
      content: (
        <BigStat
          value={formatCount(defensiveActions.successful)}
          caption={isSeason ? seasonCaption("successful defensive actions") : "Successful defensive actions in the match"}
          tone="positive"
        />
      ),
    });
  }

  return topics;
}

export function GameStatsReport({ report }: GameStatsReportProps) {
  const { player, meta, matches } = report;
  const [seasonMode, setSeasonMode] = useState<SeasonMode>("total");
  const options = useMemo(() => {
    const season = seasonMatch(matches);
    return [...matches, seasonMode === "perGame" ? perGameMatch(season) : season];
  }, [matches, seasonMode]);
  const initialMatchId = matches[0]?.id ?? "";
  const [matchId, setMatchId] = useState(initialMatchId);
  const match = options.find((item) => item.id === matchId) ?? options[0];
  const exportStats = useMemo(() => toGameStats(report, match), [report, match]);
  const topics = useMemo(() => buildTopics(match), [match]);

  return (
    <VideoLinksProvider
      key={match.id}
      initialCarriesVideoLink={match.carries.videoLink ?? ""}
      initialPositioningLink={match.boxDefending.videoLink ?? ""}
    >
      <SgaCornerBrand />

      <div className="shell">
        <header className="report-header">
          <SgaBrand />
          <div className="report-header__intro">
            <p className="report-header__eyebrow">{BRAND.legal}</p>
            <h1 className="report-header__title">{meta.title}</h1>
            <p className="report-header__meta">
              {match.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={match.logo} alt="" className="club-logo club-logo--meta" />
              ) : null}
              {match.label}
            </p>
          </div>
        </header>

        <div className="report-grid">
          <AthleteProfileCard
            name={player.name}
            club={player.club}
            clubLogo={player.clubLogo}
            photoSrc={player.photo}
          >
            <ExportPdfButton stats={exportStats} />
          </AthleteProfileCard>

          <main className="report-main">
            <div className="view-panel">
              <MatchSwitcher matches={options} activeId={match.id} onChange={setMatchId}>
                {match.id === "season" ? <SeasonModeToggle mode={seasonMode} onChange={setSeasonMode} /> : null}
              </MatchSwitcher>
              <TopicsBoard topics={topics} />
            </div>
          </main>
        </div>

        <footer className="footer">
          <p className="footer__slogan">{BRAND.slogan}</p>
          <p className="footer__rights">All rights reserved.</p>
        </footer>
      </div>
    </VideoLinksProvider>
  );
}
