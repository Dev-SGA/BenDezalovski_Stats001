import { BRAND } from "@/lib/brand";
import type { GameStats } from "@/lib/stats";

type StatsGamePdfSheetProps = {
  stats: GameStats;
  photoAbsoluteUrl: string;
  logoAbsoluteUrl: string;
};

function pct(value: number, total: number): number {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

function clipRows(links: string[]): { label: string; url: string }[] {
  return links
    .map((url, index) => ({ label: `Clip ${index + 1}`, url: url.trim() }))
    .filter((row) => row.url.length > 0);
}

export function StatsGamePdfSheet({ stats, photoAbsoluteUrl, logoAbsoluteUrl }: StatsGamePdfSheetProps) {
  const { player, meta, carries, topConnections, defensivePositioning, defensiveActions } = stats;
  const passTotal = topConnections.passes;
  const advantageTotal = carries.foundAdvantage + carries.notFoundAdvantage;
  const duelTotal = carries.offensiveDuelsWon + carries.offensiveDuelsLost;
  const carryClips = clipRows(carries.videoLinks);
  const positioningClip = defensivePositioning.videoLink.trim();

  return (
    <article className="stats-pdf" aria-hidden="true">
      <header className="stats-pdf__head">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoAbsoluteUrl} alt="" className="stats-pdf__logo" />
        <div className="stats-pdf__head-text">
          <p className="stats-pdf__eyebrow">{BRAND.legal}</p>
          <h1 className="stats-pdf__title">{meta.title}</h1>
          <p className="stats-pdf__subtitle">{meta.subtitle}</p>
        </div>
      </header>

      <div className="stats-pdf__body">
        <section className="stats-pdf__profile">
          <div
            className="stats-pdf__photo"
            style={{ backgroundImage: photoAbsoluteUrl ? `url(${photoAbsoluteUrl})` : undefined }}
          />
          <div>
            <p className="stats-pdf__label">Athlete</p>
            <h2 className="stats-pdf__name">{player.name}</h2>
            <p className="stats-pdf__club">{player.club}</p>
          </div>
        </section>

        <section className="stats-pdf__grid">
          <div className="stats-pdf__block">
            <h3 className="stats-pdf__block-title">Progressive Carries</h3>
            <p className="stats-pdf__hero">{carries.progressiveCarries}</p>
            <ul className="stats-pdf__lines">
              <li>
                Carry outcome: {carries.foundAdvantage}/{advantageTotal} found teammate ({pct(carries.foundAdvantage, advantageTotal)}%)
              </li>
              <li>
                Offensive duels: {carries.offensiveDuelsWon} won · {carries.offensiveDuelsLost} lost ({pct(carries.offensiveDuelsWon, duelTotal)}%)
              </li>
            </ul>
            {carryClips.length ? (
              <ul className="stats-pdf__links">
                {carryClips.map((clip) => (
                  <li key={clip.label}>
                    <span data-pdf-link={clip.url}>{clip.label}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="stats-pdf__block">
            <h3 className="stats-pdf__block-title">Top Connections</h3>
            <p className="stats-pdf__hero">{passTotal}</p>
            <p className="stats-pdf__hero-caption">Passes</p>
            <ul className="stats-pdf__lines">
              <li>
                GK: {topConnections.gk} ({pct(topConnections.gk, passTotal)}%)
              </li>
              <li>
                Wrongs: {topConnections.wrongs} ({pct(topConnections.wrongs, passTotal)}%)
              </li>
              <li>
                MC: {topConnections.mc} ({pct(topConnections.mc, passTotal)}%)
              </li>
            </ul>
          </div>

          <div className="stats-pdf__block stats-pdf__block--warn">
            <h3 className="stats-pdf__block-title">Box-Defending Positioning</h3>
            <p className="stats-pdf__hero stats-pdf__hero--warn">{defensivePositioning.badAreaDefenseCount}×</p>
            <p className="stats-pdf__lines">Out-of-position moments in the box</p>
            {positioningClip ? (
              <p className="stats-pdf__links">
                <span data-pdf-link={positioningClip}>Video clip</span>
              </p>
            ) : null}
          </div>

          <div className="stats-pdf__block stats-pdf__block--good">
            <h3 className="stats-pdf__block-title">Defensive Actions</h3>
            <p className="stats-pdf__hero stats-pdf__hero--good">{defensiveActions.successful}</p>
            <p className="stats-pdf__lines">Successful defensive actions</p>
          </div>
        </section>
      </div>

      <footer className="stats-pdf__foot">{BRAND.slogan}</footer>
    </article>
  );
}
