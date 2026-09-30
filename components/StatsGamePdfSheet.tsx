import { BRAND } from "@/lib/brand";
import type { GameStats } from "@/lib/stats";

type StatsGamePdfSheetProps = {
  stats: GameStats;
  photoUrl: string;
  logoUrl: string;
};

type Phase = "build-up" | "defensive";

type Tone = "blue" | "green" | "red" | "grey";

const PHASE_LABEL: Record<Phase, string> = {
  "build-up": "Build-Up",
  defensive: "Defensive Phase",
};

function pct(value: number, total: number): number {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

function linkHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.length > 48 ? `${url.slice(0, 45)}…` : url;
  }
}

function StatTiles({ items }: { items: { label: string; value: number; tone?: Tone; detail?: string }[] }) {
  return (
    <ul className="spdf-stats">
      {items.map((item) => (
        <li key={item.label} className="spdf-stat">
          <span className={`spdf-stat__value${item.tone ? ` spdf-stat__value--${item.tone}` : ""}`}>{item.value}</span>
          <span className="spdf-stat__label">{item.label}</span>
          {item.detail ? <span className="spdf-stat__detail">{item.detail}</span> : null}
        </li>
      ))}
    </ul>
  );
}

function Highlight({ value, label, note }: { value: number; label: string; note: string }) {
  return (
    <div className="spdf-highlight">
      <span className="spdf-highlight__value">{value}%</span>
      <span className="spdf-highlight__label">{label}</span>
      <span className="spdf-highlight__note">{note}</span>
    </div>
  );
}

function DuelStrip({ won, lost }: { won: number; lost: number }) {
  const total = won + lost;
  return (
    <div className="spdf-strip">
      <span className="spdf-strip__label">Offensive duels</span>
      <span className="spdf-strip__figures">
        <strong className="spdf-strip__won">{won}</strong> won · <strong className="spdf-strip__lost">{lost}</strong> lost
      </span>
      <span className="spdf-strip__rate">{pct(won, total)}% win rate</span>
    </div>
  );
}

function RateBar({
  label,
  value,
  note,
  segments,
}: {
  label: string;
  value: number;
  note: string;
  segments: { value: number; tone: Tone }[];
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  return (
    <div className="spdf-rate">
      <div className="spdf-rate__head">
        <span className="spdf-rate__label">{label}</span>
        <span className="spdf-rate__value">{value}%</span>
      </div>
      <div className="spdf-rate__track">
        {segments.map((segment, index) =>
          segment.value > 0 ? (
            <span
              key={index}
              className={`spdf-rate__seg spdf-rate__seg--${segment.tone}`}
              style={{ width: `${pct(segment.value, total)}%` }}
            />
          ) : null,
        )}
      </div>
      <p className="spdf-rate__note">{note}</p>
    </div>
  );
}

function Section({
  phase,
  title,
  value,
  unit,
  aside,
  footer,
}: {
  phase: Phase;
  title: string;
  value: number;
  unit: string;
  aside: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <section className={`spdf-section spdf-section--${phase}`}>
      <p className="spdf-section__phase">{PHASE_LABEL[phase]}</p>
      <h3 className="spdf-section__title">{title}</h3>
      <div className="spdf-section__body">
        <div className="spdf-section__kpi">
          <span className="spdf-section__value">{value}</span>
          <span className="spdf-section__unit">{unit}</span>
        </div>
        <div className="spdf-section__aside">{aside}</div>
      </div>
      {footer ? <div className="spdf-section__footer">{footer}</div> : null}
    </section>
  );
}

function PdfVideoLinks({ carriesVideoLink, positioningLink }: { carriesVideoLink: string; positioningLink: string }) {
  const rows = [
    { label: "Progressive carries", url: carriesVideoLink.trim() },
    { label: "Box-defending positioning", url: positioningLink.trim() },
  ];

  return (
    <section className="spdf-videos" aria-label="Video clips">
      <h4 className="spdf-videos__title">Video clips</h4>
      <ul className="spdf-videos__list">
        {rows.map((row) => (
          <li key={row.label}>
            {row.url ? (
              <a className="spdf-videos__link" href={row.url} data-pdf-link={row.url}>
                <span className="spdf-videos__play" aria-hidden="true">
                  ▶
                </span>
                <span className="spdf-videos__text">
                  <strong>{row.label}</strong>
                  <span>{linkHost(row.url)}</span>
                </span>
              </a>
            ) : (
              <span className="spdf-videos__empty">{row.label} — pending</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function StatsGamePdfSheet({ stats, photoUrl, logoUrl }: StatsGamePdfSheetProps) {
  const { player, meta, carries, topConnections, defensivePositioning, defensiveActions } = stats;
  const advantageTotal = carries.foundAdvantage + carries.notFoundAdvantage;
  const inPosition = defensivePositioning.totalSituations - defensivePositioning.badAreaDefenseCount;
  return (
    <article className="stats-pdf" aria-hidden="true">
      <aside className="spdf-side">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoUrl} alt="" className="spdf-side__logo" />
        <div className="spdf-side__photo" data-pdf-bg={photoUrl} style={{ backgroundImage: `url(${photoUrl})` }} />
        <div className="spdf-side__identity">
          <p className="spdf-side__label">Athlete</p>
          <h2 className="spdf-side__name">{player.name}</h2>
          <p className="spdf-side__club">{player.club}</p>
        </div>
        <p className="spdf-side__slogan">{BRAND.slogan}</p>
      </aside>

      <div className="spdf-main">
        <header className="spdf-head">
          <div>
            <p className="spdf-head__eyebrow">{BRAND.legal}</p>
            <h1 className="spdf-head__title">{meta.title}</h1>
          </div>
          <div className="spdf-head__meta">
            <span>{meta.subtitle}</span>
          </div>
        </header>

        <div className="spdf-grid">
          <Section
            phase="build-up"
            title="Progressive Carries"
            value={carries.progressiveCarries}
            unit="Progressive carries"
            aside={
              <Highlight
                value={pct(carries.foundAdvantage, advantageTotal)}
                label="Found a teammate in advantage"
                note={`${carries.foundAdvantage} of ${advantageTotal} carries`}
              />
            }
            footer={<DuelStrip won={carries.offensiveDuelsWon} lost={carries.offensiveDuelsLost} />}
          />

          <Section
            phase="build-up"
            title="Top Connections"
            value={topConnections.passes}
            unit="Total passes"
            aside={
              <StatTiles
                items={[
                  {
                    label: "GK",
                    value: topConnections.gk,
                    tone: "blue",
                    detail: `${pct(topConnections.gk, topConnections.passes)}% of passes`,
                  },
                  {
                    label: "MC",
                    value: topConnections.mc,
                    tone: "blue",
                    detail: `${pct(topConnections.mc, topConnections.passes)}% of passes`,
                  },
                ]}
              />
            }
            footer={
              <RateBar
                label="Pass accuracy"
                value={pct(topConnections.passes - topConnections.wrongs, topConnections.passes)}
                note={`${topConnections.passes - topConnections.wrongs} of ${topConnections.passes} passes completed · ${topConnections.wrongs} wrong`}
                segments={[
                  { value: topConnections.passes - topConnections.wrongs, tone: "green" },
                  { value: topConnections.wrongs, tone: "red" },
                ]}
              />
            }
          />

          <Section
            phase="defensive"
            title="Box-Defending Positioning"
            value={defensivePositioning.totalSituations}
            unit="Box-defending situations"
            aside={
              <StatTiles
                items={[
                  { label: "In position", value: inPosition, tone: "green" },
                  { label: "Bad positioning", value: defensivePositioning.badAreaDefenseCount, tone: "red" },
                ]}
              />
            }
            footer={
              <RateBar
                label="In-position rate"
                value={pct(inPosition, defensivePositioning.totalSituations)}
                note={`${inPosition} of ${defensivePositioning.totalSituations} situations in position`}
                segments={[
                  { value: inPosition, tone: "green" },
                  { value: defensivePositioning.badAreaDefenseCount, tone: "red" },
                ]}
              />
            }
          />

          <Section
            phase="defensive"
            title="Defensive Actions"
            value={defensiveActions.successful}
            unit="Successful actions"
            aside={
              <p className="spdf-note">
                {defensiveActions.successful} successful actions across interceptions, clearances and tackles.
              </p>
            }
          />
        </div>

        <PdfVideoLinks carriesVideoLink={carries.videoLink} positioningLink={defensivePositioning.videoLink} />

        <footer className="spdf-foot">
          <span>{BRAND.name}</span>
          <span>
            {player.name} · {meta.title}
          </span>
        </footer>
      </div>
    </article>
  );
}
