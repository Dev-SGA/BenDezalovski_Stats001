type ClipLinksProps = {
  links: string[];
  slots?: number;
};

export function ClipLinks({ links, slots = links.length }: ClipLinksProps) {
  const items = Array.from({ length: slots }, (_, index) => links[index]?.trim() ?? "");

  return (
    <div className="clips">
      <p className="section-label">Video clips</p>
      <ul className="clips__list">
        {items.map((url, index) => (
          <li key={index}>
            {url ? (
              <a className="clip clip--ready" href={url} target="_blank" rel="noopener noreferrer">
                <span className="clip__icon" aria-hidden="true">
                  ▶
                </span>
                <span className="clip__text">
                  <span className="clip__title">Clip {index + 1}</span>
                  <span className="clip__hint">Watch video</span>
                </span>
              </a>
            ) : (
              <span className="clip clip--pending" aria-disabled="true">
                <span className="clip__icon" aria-hidden="true">
                  ▶
                </span>
                <span className="clip__text">
                  <span className="clip__title">Clip {index + 1}</span>
                  <span className="clip__hint">Coming soon</span>
                </span>
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
