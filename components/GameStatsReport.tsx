import { SgaBrand } from "@/components/SgaBrand";
import { SgaCornerBrand } from "@/components/SgaCornerBrand";
import { TopicDisclosure } from "@/components/TopicDisclosure";
import { VideoLinksPanel } from "@/components/VideoLinksPanel";
import { BRAND } from "@/lib/brand";
import type { GameStats } from "@/lib/stats";

type GameStatsReportProps = {
  stats: GameStats;
};

function pct(value: number, total: number): string {
  if (total <= 0) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}

function StatPill({
  value,
  label,
  tone = "neutral",
  sublabel,
}: {
  value: number | string;
  label: string;
  tone?: "neutral" | "positive" | "negative" | "warn";
  sublabel?: string;
}) {
  return (
    <div className={`stat-pill stat-pill--${tone}`}>
      <span className="stat-pill__value">{value}</span>
      <span className="stat-pill__label">{label}</span>
      {sublabel ? <span className="stat-pill__sublabel">{sublabel}</span> : null}
    </div>
  );
}

function SplitBar({ left, right, leftLabel, rightLabel }: { left: number; right: number; leftLabel: string; rightLabel: string }) {
  const total = left + right || 1;
  const leftPct = Math.round((left / total) * 100);
  const rightPct = 100 - leftPct;

  return (
    <div className="split-bar">
      <div className="split-bar__track" role="img" aria-label={`${leftLabel}: ${left}, ${rightLabel}: ${right}`}>
        <div className="split-bar__seg split-bar__seg--left" style={{ width: `${leftPct}%` }} />
        <div className="split-bar__seg split-bar__seg--right" style={{ width: `${rightPct}%` }} />
      </div>
      <div className="split-bar__legend">
        <span>
          <strong>{left}</strong> ({leftPct}%) {leftLabel}
        </span>
        <span>
          <strong>{right}</strong> ({rightPct}%) {rightLabel}
        </span>
      </div>
    </div>
  );
}

export function GameStatsReport({ stats }: GameStatsReportProps) {
  const { player, carries, topConnections, defensivePositioning, defensiveActions, meta } = stats;
  const passTotal = topConnections.passes;

  return (
    <>
      <SgaCornerBrand />

      <div className="shell">
        <header className="report-header">
          <SgaBrand />
          <div className="report-header__intro">
            <p className="report-header__eyebrow">{BRAND.legal}</p>
            <h1 className="report-header__title">{meta.title}</h1>
            <p className="report-header__meta">
              {player.name} · {player.club} · {meta.subtitle}
            </p>
          </div>
        </header>

        <main className="bento">
          <TopicDisclosure
            num="01"
            title="Carries"
            summary={`${carries.progressiveCarries} progressive carries · ${carries.offensiveDuelsWon} offensive duels won`}
            wide
          >
            <div className="topic__hero-stat">
              <span className="topic__hero-value">{carries.progressiveCarries}</span>
              <span className="topic__hero-label">Progressive carries</span>
            </div>

            <SplitBar
              left={carries.foundAdvantage}
              right={carries.notFoundAdvantage}
              leftLabel="found teammate in advantage"
              rightLabel="did not find"
            />

            <div className="stat-row">
              <StatPill value={carries.offensiveDuelsWon} label="Offensive duels won" tone="positive" />
              <StatPill value={carries.offensiveDuelsLost} label="Offensive duels lost" tone="negative" />
            </div>

            <VideoLinksPanel initialLinks={carries.videoLinks} />
          </TopicDisclosure>

          <TopicDisclosure
            num="02"
            title="Top Connections"
            summary={`${topConnections.passes} passes · GK ${pct(topConnections.gk, passTotal)} · MC ${pct(topConnections.mc, passTotal)}`}
            wide
          >
            <div className="topic__hero-stat">
              <span className="topic__hero-value">{topConnections.passes}</span>
              <span className="topic__hero-label">Passes</span>
            </div>

            <div className="connections-grid">
              <StatPill
                value={topConnections.gk}
                label="GK"
                tone="positive"
                sublabel={pct(topConnections.gk, passTotal)}
              />
              <StatPill
                value={topConnections.wrongs}
                label="Wrongs"
                tone="negative"
                sublabel={pct(topConnections.wrongs, passTotal)}
              />
              <StatPill value={topConnections.mc} label="MC" tone="neutral" sublabel={pct(topConnections.mc, passTotal)} />
            </div>
          </TopicDisclosure>

          <TopicDisclosure
            num="03"
            title="Poor box-defending positioning"
            summary={`${defensivePositioning.badAreaDefenseCount} occurrences`}
          >
            <div className="topic__center-stat">
              <span className="topic__center-value topic__center-value--warn">{defensivePositioning.badAreaDefenseCount}×</span>
              <p className="topic__center-caption">Recorded occurrences in the match</p>
            </div>
            <VideoLinksPanel
              initialLinks={[defensivePositioning.videoLink]}
              maxLinks={1}
              label="Video clip"
            />
          </TopicDisclosure>

          <TopicDisclosure num="04" title="Defensive actions" summary={`${defensiveActions.successful} successful actions`}>
            <div className="topic__center-stat">
              <span className="topic__center-value topic__center-value--positive">{defensiveActions.successful}</span>
              <p className="topic__center-caption">Successful defensive actions</p>
            </div>
          </TopicDisclosure>
        </main>

        <footer className="footer">
          <p className="footer__slogan">{BRAND.slogan}</p>
          <p className="footer__rights">All rights reserved.</p>
        </footer>
      </div>
    </>
  );
}
