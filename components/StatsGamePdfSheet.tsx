import { BRAND } from "@/lib/brand";
import { clipUrl, connectionTotal, formatCount, type GameStats } from "@/lib/stats";

type StatsGamePdfSheetProps = {
  stats: GameStats;
  photoUrl: string;
  logoUrl: string;
  playIconUrl: string;
  clubLogoUrl?: string;
  opponentLogoUrl?: string;
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

function PdfPlay({ href, playIconUrl }: { href?: string; playIconUrl: string }) {
  if (!href) return null;
  return (
    <a className="spdf-play" href={href} data-pdf-link={href} target="_blank" rel="noreferrer" aria-label="Open video">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={playIconUrl} alt="" className="spdf-play__icon" width={14} height={14} />
    </a>
  );
}

function PdfPlayTarget({ href, children }: { href?: string; children: React.ReactNode }) {
  if (!href) return <>{children}</>;
  return (
    <a className="spdf-play-target" href={href} data-pdf-link={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

function resolveCarriesClip(stats: GameStats): string | undefined {
  const fromList = clipUrl(stats.videos, "Carries", "Progressive carries", "Conduções", "Conducao")?.trim();
  const fallback = stats.carries.videoLink?.trim() ?? "";
  return fromList || fallback || undefined;
}

function resolveBoxDefendingClip(stats: GameStats): string | undefined {
  const fromList = clipUrl(stats.videos, "Box defending", "Box-defending", "Defensive positioning")?.trim();
  const fallback = stats.boxDefending.videoLink?.trim() ?? "";
  return fromList || fallback || undefined;
}

function StatTiles({ items }: { items: { label: string; value: number; tone?: Tone }[] }) {
  return (
    <ul className="spdf-stats">
      {items.map((item) => (
        <li key={item.label} className="spdf-stat">
          <span className={`spdf-stat__value${item.tone ? ` spdf-stat__value--${item.tone}` : ""}`}>{formatCount(item.value)}</span>
          <span className="spdf-stat__label">{item.label}</span>
        </li>
      ))}
    </ul>
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
  playHref,
  playIconUrl,
}: {
  phase: Phase;
  title: string;
  value: number;
  unit: string;
  aside?: React.ReactNode;
  footer?: React.ReactNode;
  playHref?: string;
  playIconUrl: string;
}) {
  return (
    <section className={`spdf-section spdf-section--${phase}`}>
      <p className="spdf-section__phase">{PHASE_LABEL[phase]}</p>
      <h3 className="spdf-section__title">
        {title}
        <PdfPlay href={playHref} playIconUrl={playIconUrl} />
      </h3>
      <div className="spdf-section__body">
        <div className="spdf-section__kpi">
          <span className="spdf-section__value">
            <PdfPlayTarget href={playHref}>{formatCount(value)}</PdfPlayTarget>
            <PdfPlay href={playHref} playIconUrl={playIconUrl} />
          </span>
          <span className="spdf-section__unit">{unit}</span>
        </div>
        {aside ? <div className="spdf-section__aside">{aside}</div> : null}
      </div>
      {footer ? <div className="spdf-section__footer">{footer}</div> : null}
    </section>
  );
}

export function StatsGamePdfSheet({
  stats,
  photoUrl,
  logoUrl,
  playIconUrl,
  clubLogoUrl,
  opponentLogoUrl,
}: StatsGamePdfSheetProps) {
  const { player, meta, carries, offensiveDuels, connections, boxDefending, defensiveActions } = stats;
  const passTotal = connectionTotal(connections);
  const boxTotal = boxDefending.good + boxDefending.bad;
  const connectionGood = connections.positions.reduce((sum, position) => sum + (position.good ?? 0), 0);
  const connectionBad = connections.positions.reduce((sum, position) => sum + (position.bad ?? 0), 0);
  const connectionJudged = connectionGood + connectionBad;
  const carriesClip = resolveCarriesClip(stats);
  const boxClip = resolveBoxDefendingClip(stats);

  const showDuels = Boolean(offensiveDuels && offensiveDuels.won + offensiveDuels.lost > 0);
  const showDefensiveActions = Boolean(defensiveActions && defensiveActions.successful > 0);
  const sectionCount = 3 + (showDuels ? 1 : 0) + (showDefensiveActions ? 1 : 0);
  const gridClass = sectionCount === 3 ? " spdf-grid--three" : sectionCount === 4 ? " spdf-grid--four" : "";

  return (
    <article className="stats-pdf" aria-hidden="true">
      <aside className="spdf-side">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoUrl} alt="" className="spdf-side__logo" />
        <div className="spdf-side__photo" data-pdf-bg={photoUrl} style={{ backgroundImage: `url(${photoUrl})` }} />
        <div className="spdf-side__identity">
          <p className="spdf-side__label">Athlete</p>
          <h2 className="spdf-side__name">{player.name}</h2>
          <p className="spdf-side__club">
            {clubLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={clubLogoUrl} alt="" className="spdf-side__club-logo" />
            ) : null}
            {player.club}
          </p>
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
            <span className="spdf-head__match">
              {opponentLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={opponentLogoUrl} alt="" className="spdf-head__logo" />
              ) : null}
              {meta.subtitle}
            </span>
          </div>
        </header>

        <div className={`spdf-grid${gridClass}`}>
          <Section
            phase="build-up"
            title="Progressive Carries"
            value={carries.total}
            unit="Progressive carries"
            playHref={carriesClip}
            playIconUrl={playIconUrl}
            aside={
              <StatTiles
                items={[
                  { label: "Find Advantage", value: carries.good, tone: "green" },
                  { label: "Wrong Pass", value: carries.bad, tone: "red" },
                ]}
              />
            }
            footer={
              <RateBar
                label="Found advantage"
                value={pct(carries.good, carries.total)}
                note={`${formatCount(carries.good)} of ${formatCount(carries.total)} carries found advantage`}
                segments={[
                  { value: carries.good, tone: "green" },
                  { value: carries.bad, tone: "red" },
                ]}
              />
            }
          />

          <Section
            phase="build-up"
            title="Passes & Connections"
            value={passTotal}
            unit="Passes"
            playIconUrl={playIconUrl}
            aside={
              <StatTiles
                items={connections.positions.map((position) => ({
                  label: position.id,
                  value: position.actions,
                  tone: "blue" as Tone,
                }))}
              />
            }
            footer={
              connectionJudged > 0 ? (
                <RateBar
                  label="Good connections"
                  value={pct(connectionGood, connectionJudged)}
                  note={`${formatCount(connectionGood)} of ${formatCount(connectionJudged)} judged actions good`}
                  segments={[
                    { value: connectionGood, tone: "green" },
                    { value: connectionBad, tone: "red" },
                  ]}
                />
              ) : undefined
            }
          />

          <Section
            phase="defensive"
            title="Box Defending"
            value={boxTotal}
            unit="Box-defending situations"
            playHref={boxClip}
            playIconUrl={playIconUrl}
            aside={
              <StatTiles
                items={[
                  { label: "In Position", value: boxDefending.good, tone: "green" },
                  { label: "Out of Position", value: boxDefending.bad, tone: "red" },
                ]}
              />
            }
            footer={
              <RateBar
                label="In position"
                value={pct(boxDefending.good, boxTotal)}
                note={`${formatCount(boxDefending.good)} of ${formatCount(boxTotal)} situations in position`}
                segments={[
                  { value: boxDefending.good, tone: "green" },
                  { value: boxDefending.bad, tone: "red" },
                ]}
              />
            }
          />

          {showDuels ? (
            <Section
              phase="build-up"
              title="Offensive Duels"
              value={offensiveDuels!.won + offensiveDuels!.lost}
              unit="Offensive duels"
              playIconUrl={playIconUrl}
              aside={
                <StatTiles
                  items={[
                    { label: "Won", value: offensiveDuels!.won, tone: "green" },
                    { label: "Lost", value: offensiveDuels!.lost, tone: "red" },
                  ]}
                />
              }
              footer={
                <RateBar
                  label="Duel win rate"
                  value={pct(offensiveDuels!.won, offensiveDuels!.won + offensiveDuels!.lost)}
                  note={`${formatCount(offensiveDuels!.won)} of ${formatCount(offensiveDuels!.won + offensiveDuels!.lost)} offensive duels won`}
                  segments={[
                    { value: offensiveDuels!.won, tone: "green" },
                    { value: offensiveDuels!.lost, tone: "red" },
                  ]}
                />
              }
            />
          ) : null}

          {showDefensiveActions ? (
            <Section
              phase="defensive"
              title="Defensive Actions"
              value={defensiveActions!.successful}
              unit="Successful defensive actions"
              playIconUrl={playIconUrl}
            />
          ) : null}
        </div>

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
