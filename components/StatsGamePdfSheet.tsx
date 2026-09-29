import { BRAND } from "@/lib/brand";
import type { GameStats } from "@/lib/stats";

type StatsGamePdfSheetProps = {
  stats: GameStats;
  photoUrl: string;
  logoUrl: string;
};

type Phase = "build-up" | "defensive";

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

function Bar({
  label,
  value,
  total,
  tone,
  detail,
}: {
  label: string;
  value: number;
  total: number;
  tone: "blue" | "green" | "red";
  detail?: string;
}) {
  const share = pct(value, total);
  return (
    <div className="spdf-bar">
      <div className="spdf-bar__head">
        <span className="spdf-bar__label">{label}</span>
        <span className="spdf-bar__figure">
          {detail ?? value}
          <span className="spdf-bar__pct">{share}%</span>
        </span>
      </div>
      <div className="spdf-bar__track">
        <div className={`spdf-bar__fill spdf-bar__fill--${tone}`} style={{ width: `${share}%` }} />
      </div>
    </div>
  );
}

function Section({
  phase,
  title,
  value,
  unit,
  children,
}: {
  phase: Phase;
  title: string;
  value: string;
  unit: string;
  children?: React.ReactNode;
}) {
  return (
    <section className={`spdf-section spdf-section--${phase}`}>
      <p className="spdf-section__phase">{PHASE_LABEL[phase]}</p>
      <h3 className="spdf-section__title">{title}</h3>
      <div className="spdf-section__kpi">
        <span className="spdf-section__value">{value}</span>
        <span className="spdf-section__unit">{unit}</span>
      </div>
      {children ? <div className="spdf-section__detail">{children}</div> : null}
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
  const passTotal = topConnections.passes;
  const advantageTotal = carries.foundAdvantage + carries.notFoundAdvantage;
  const duelTotal = carries.offensiveDuelsWon + carries.offensiveDuelsLost;
  const issued = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

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
            <span>{issued}</span>
          </div>
        </header>

        <div className="spdf-grid">
          <Section phase="build-up" title="Progressive Carries" value={String(carries.progressiveCarries)} unit="progressive carries">
            <Bar
              label="Found teammate in advantage"
              value={carries.foundAdvantage}
              total={advantageTotal}
              detail={`${carries.foundAdvantage}/${advantageTotal}`}
              tone="blue"
            />
            <Bar
              label="Offensive duels won"
              value={carries.offensiveDuelsWon}
              total={duelTotal}
              detail={`${carries.offensiveDuelsWon}/${duelTotal}`}
              tone="green"
            />
          </Section>

          <Section phase="build-up" title="Top Connections" value={String(passTotal)} unit="passes">
            <Bar label="GK" value={topConnections.gk} total={passTotal} tone="blue" />
            <Bar label="MC" value={topConnections.mc} total={passTotal} tone="blue" />
          </Section>

          <Section
            phase="defensive"
            title="Box-Defending Positioning"
            value={String(defensivePositioning.totalSituations)}
            unit="situations"
          >
            <Bar
              label="Bad positioning"
              value={defensivePositioning.badAreaDefenseCount}
              total={defensivePositioning.totalSituations}
              detail={`${defensivePositioning.badAreaDefenseCount}/${defensivePositioning.totalSituations}`}
              tone="red"
            />
            <Bar
              label="In position"
              value={defensivePositioning.totalSituations - defensivePositioning.badAreaDefenseCount}
              total={defensivePositioning.totalSituations}
              detail={`${defensivePositioning.totalSituations - defensivePositioning.badAreaDefenseCount}/${defensivePositioning.totalSituations}`}
              tone="green"
            />
          </Section>

          <Section phase="defensive" title="Defensive Actions" value={String(defensiveActions.successful)} unit="successful actions">
            <p className="spdf-note">Successful defensive actions completed in the match.</p>
          </Section>
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
