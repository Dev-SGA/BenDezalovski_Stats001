import { VideoLinksPanel } from "@/components/VideoLinksPanel";
import type { GameStats } from "@/lib/stats";

type GameStatsReportProps = {
  stats: GameStats;
};

function StatPill({ value, label, tone = "neutral" }: { value: number | string; label: string; tone?: "neutral" | "positive" | "negative" | "warn" }) {
  return (
    <div className={`stat-pill stat-pill--${tone}`}>
      <span className="stat-pill__value">{value}</span>
      <span className="stat-pill__label">{label}</span>
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
          <strong>{left}</strong> {leftLabel}
        </span>
        <span>
          <strong>{right}</strong> {rightLabel}
        </span>
      </div>
    </div>
  );
}

export function GameStatsReport({ stats }: GameStatsReportProps) {
  const { player, carries, topConnections, defensivePositioning, defensiveActions, meta } = stats;

  return (
    <div className="page">
      <div className="page__glow page__glow--a" aria-hidden />
      <div className="page__glow page__glow--b" aria-hidden />

      <div className="wrap">
        <header className="hero">
          <div className="hero__badge">{player.club}</div>
          <h1 className="hero__name">{player.name}</h1>
          <p className="hero__meta">
            {meta.title} · {meta.subtitle}
          </p>
        </header>

        <main className="bento">
          <section className="topic topic--wide" aria-labelledby="topic-carries">
            <div className="topic__head">
              <span className="topic__num">01</span>
              <h2 id="topic-carries" className="topic__title">
                Conduções
              </h2>
            </div>

            <div className="topic__hero-stat">
              <span className="topic__hero-value">{carries.progressiveCarries}</span>
              <span className="topic__hero-label">Conduções progressivas</span>
            </div>

            <SplitBar
              left={carries.foundAdvantage}
              right={carries.notFoundAdvantage}
              leftLabel="achou companheiro em vantagem"
              rightLabel="não achou"
            />

            <div className="stat-row">
              <StatPill value={carries.offensiveDuelsWon} label="Duelos ofensivos ganhos" tone="positive" />
              <StatPill value={carries.offensiveDuelsLost} label="Duelo ofensivo perdido" tone="negative" />
            </div>

            <VideoLinksPanel initialLinks={carries.videoLinks} />
          </section>

          <section className="topic topic--wide" aria-labelledby="topic-connections">
            <div className="topic__head">
              <span className="topic__num">02</span>
              <h2 id="topic-connections" className="topic__title">
                Top Connections
              </h2>
            </div>

            <div className="topic__hero-stat">
              <span className="topic__hero-value">{topConnections.passes}</span>
              <span className="topic__hero-label">Passes</span>
            </div>

            <div className="connections-grid">
              <StatPill value={topConnections.gk} label="GK" tone="positive" />
              <StatPill value={topConnections.wrongs} label="Wrongs" tone="negative" />
              <StatPill value={topConnections.mc} label="MC" tone="neutral" />
            </div>
          </section>

          <section className="topic" aria-labelledby="topic-positioning">
            <div className="topic__head">
              <span className="topic__num">03</span>
              <h2 id="topic-positioning" className="topic__title">
                Posicionamento ruim em defesa de área
              </h2>
            </div>
            <div className="topic__center-stat">
              <span className="topic__center-value topic__center-value--warn">{defensivePositioning.badAreaDefenseCount}×</span>
              <p className="topic__center-caption">Ocorrências registradas no jogo</p>
            </div>
          </section>

          <section className="topic" aria-labelledby="topic-defensive">
            <div className="topic__head">
              <span className="topic__num">04</span>
              <h2 id="topic-defensive" className="topic__title">
                Ações defensivas
              </h2>
            </div>
            <div className="topic__center-stat">
              <span className="topic__center-value topic__center-value--positive">{defensiveActions.successful}</span>
              <p className="topic__center-caption">Ações defensivas bem-sucedidas</p>
            </div>
          </section>
        </main>

        <footer className="foot">
          <p>Club Ohio · Ben Dezalovski · Stats de jogo</p>
        </footer>
      </div>
    </div>
  );
}
