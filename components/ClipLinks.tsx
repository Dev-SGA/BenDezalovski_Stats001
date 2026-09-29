"use client";

import { useVideoLinks } from "@/components/VideoLinksContext";

type ClipLinksProps = {
  scope: "carries" | "positioning";
  slots?: number;
};

export function ClipLinks({ scope, slots = scope === "carries" ? 3 : 1 }: ClipLinksProps) {
  const { carryLinks, setCarryLink, positioningLink, setPositioningLink } = useVideoLinks();

  const items =
    scope === "carries"
      ? Array.from({ length: slots }, (_, index) => ({
          url: carryLinks[index] ?? "",
          onChange: (value: string) => setCarryLink(index, value),
        }))
      : [{ url: positioningLink, onChange: setPositioningLink }];

  return (
    <div className="clips">
      <p className="section-label">Video clips</p>
      <ul className="clips__list">
        {items.map((item, index) => {
          const trimmed = item.url.trim();
          const hasUrl = trimmed.length > 0;

          return (
            <li key={index} className="clips__row">
              <span className="clips__index">{index + 1}</span>
              <input
                type="url"
                className="clips__input"
                placeholder={`Paste video link ${index + 1}`}
                value={item.url}
                onChange={(e) => item.onChange(e.target.value)}
                aria-label={`Video link ${index + 1}`}
              />
              {hasUrl ? (
                <a className="clip clip--ready btn btn--primary" href={trimmed} target="_blank" rel="noopener noreferrer">
                  Open
                </a>
              ) : (
                <span className="clips__pending">Pending</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
