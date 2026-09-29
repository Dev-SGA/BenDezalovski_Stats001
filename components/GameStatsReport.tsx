import { AthleteProfileCard } from "@/components/AthleteProfileCard";
import { ExportPdfButton } from "@/components/ExportPdfButton";
import { ClipLinks } from "@/components/ClipLinks";
import { MetricFlow } from "@/components/MetricFlow";
import { SgaBrand } from "@/components/SgaBrand";
import { SgaCornerBrand } from "@/components/SgaCornerBrand";
import { TopicsBoard, type Topic } from "@/components/TopicsBoard";
import { BRAND } from "@/lib/brand";
import type { GameStats } from "@/lib/stats";

type GameStatsReportProps = {
  stats: GameStats;
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
}: {
  title: string;
  primary: number;
  secondary: number;
  primaryLabel: string;
  secondaryLabel: string;
  primaryTone: BarTone;
  secondaryTone: BarTone;
  headline: string;
}) {
  const total = primary + secondary;
  const primaryPct = percent(primary, total);

  return (
    <div className="metric-card">
      <h3 className="metric-card__title">{title}</h3>
      <p className="metric-card__headline">{headline}</p>
      <div className="meter" role="img" aria-label={`${primaryLabel}: ${primary}. ${secondaryLabel}: ${secondary}.`}>
        <span className={`meter__seg meter__seg--${primaryTone}`} style={{ width: `${primaryPct}%` }} />
        <span className={`meter__seg meter__seg--${secondaryTone}`} style={{ width: `${100 - primaryPct}%` }} />
      </div>
      <ul className="legend">
        <li>
          <span className={`legend__dot legend__dot--${primaryTone}`} />
          <span className="legend__label">{primaryLabel}</span>
          <strong>{primary}</strong>
        </li>
        <li>
          <span className={`legend__dot legend__dot--${secondaryTone}`} />
          <span className="legend__label">{secondaryLabel}</span>
          <strong>{secondary}</strong>
        </li>
      </ul>
    </div>
  );
}

function DualShareCard({
  title,
  rows,
  total,
}: {
  title: string;
  rows: { label: string; value: number; tone: BarTone }[];
  total: number;
}) {
  return (
    <div className="metric-card">
      <h3 className="metric-card__title">{title}</h3>
      <ul className="share-list">
        {rows.map((row) => (
          <li key={row.label} className="share-list__row">
            <span className="share-list__label">{row.label}</span>
            <span className="share-list__track">
              <span className={`share-list__fill share-list__fill--${row.tone}`} style={{ width: `${percent(row.value, total)}%` }} />
            </span>
            <span className="share-list__value">{row.value}</span>
            <span className="share-list__pct">{percent(row.value, total)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BigStat({ value, caption, tone, tag }: { value: string; caption: string; tone: "positive" | "warn"; tag: string }) {
  return (
    <div className={`big-stat big-stat--${tone}`}>
      <span className="big-stat__tag">{tag}</span>
      <span className="big-stat__value">{value}</span>
      <p className="big-stat__caption">{caption}</p>
    </div>
  );
}

export function GameStatsReport({ stats }: GameStatsReportProps) {
  const { player, carries, topConnections, defensivePositioning, defensiveActions, meta } = stats;

  const duelsTotal = carries.offensiveDuelsWon + carries.offensiveDuelsLost;
  const duelWinRate = percent(carries.offensiveDuelsWon, duelsTotal);
  const advantageRate = percent(carries.foundAdvantage, carries.foundAdvantage + carries.notFoundAdvantage);

  const passTotal = topConnections.passes;
  const gkPct = percent(topConnections.gk, passTotal);

  const topics: Topic[] = [
    {
      id: "carries",
      title: "Progressive Carries",
      tone: "accent",
      content: (
        <>
          <MetricFlow
            items={[
              <div key="pc" className="metric-card metric-card--hero">
                <h3 className="metric-card__title">Progressive carries</h3>
                <span className="metric-card__value">{carries.progressiveCarries}</span>
                <p className="metric-card__caption">Carries that moved the ball significantly toward goal</p>
              </div>,
              <SplitMeter
                key="outcome"
                title="Carry outcome"
                headline={`${carries.foundAdvantage} of ${carries.foundAdvantage + carries.notFoundAdvantage} · ${advantageRate}%`}
                primary={carries.foundAdvantage}
                secondary={carries.notFoundAdvantage}
                primaryLabel="Found teammate in advantage"
                secondaryLabel="Did not find"
                primaryTone="positive"
                secondaryTone="muted"
              />,
              <SplitMeter
                key="duels"
                title="Offensive duels"
                headline={`${duelWinRate}% win rate`}
                primary={carries.offensiveDuelsWon}
                secondary={carries.offensiveDuelsLost}
                primaryLabel="Won"
                secondaryLabel="Lost"
                primaryTone="positive"
                secondaryTone="negative"
              />,
            ]}
          />
          <ClipLinks links={carries.videoLinks} slots={3} />
        </>
      ),
    },
    {
      id: "connections",
      title: "Top Connections",
      tone: "accent",
      content: (
        <MetricFlow
          items={[
            <div key="passes" className="metric-card metric-card--hero">
              <h3 className="metric-card__title">Passes</h3>
              <span className="metric-card__value">{passTotal}</span>
              <p className="metric-card__caption">Total passes in the match</p>
            </div>,
            <div key="gk" className="metric-card">
              <h3 className="metric-card__title">GK</h3>
              <span className="metric-card__value">{topConnections.gk}</span>
              <span className="metric-card__pct">{gkPct}% of passes</span>
            </div>,
            <DualShareCard
              key="wrong-mc"
              title="Wrongs & MC"
              total={passTotal}
              rows={[
                { label: "Wrongs", value: topConnections.wrongs, tone: "negative" },
                { label: "MC", value: topConnections.mc, tone: "accent" },
              ]}
            />,
          ]}
        />
      ),
    },
    {
      id: "positioning",
      title: "Box-Defending Positioning",
      tone: "warn",
      content: (
        <div className="split-layout">
          <BigStat
            value={`${defensivePositioning.badAreaDefenseCount}×`}
            caption="Moments out of position while defending the box"
            tone="warn"
            tag="Area to improve"
          />
          <ClipLinks links={[defensivePositioning.videoLink]} slots={1} />
        </div>
      ),
    },
    {
      id: "defensive",
      title: "Defensive Actions",
      tone: "positive",
      content: (
        <BigStat
          value={String(defensiveActions.successful)}
          caption="Successful defensive actions in the match"
          tone="positive"
          tag="Strength"
        />
      ),
    },
  ];

  return (
    <>
      <SgaCornerBrand />

      <div className="shell">
        <header className="report-header">
          <SgaBrand />
          <div className="report-header__intro">
            <p className="report-header__eyebrow">{BRAND.legal}</p>
            <h1 className="report-header__title">{meta.title}</h1>
            <p className="report-header__meta">{meta.subtitle}</p>
          </div>
        </header>

        <div className="report-grid">
          <AthleteProfileCard name={player.name} club={player.club} photoSrc={player.photo} />

          <main className="report-main">
            <ExportPdfButton stats={stats} />
            <TopicsBoard topics={topics} />
          </main>
        </div>

        <footer className="footer">
          <p className="footer__slogan">{BRAND.slogan}</p>
          <p className="footer__rights">All rights reserved.</p>
        </footer>
      </div>
    </>
  );
}
