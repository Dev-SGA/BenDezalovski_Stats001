"use client";

import { useState } from "react";

type VideoLinksPanelProps = {
  initialLinks: string[];
  label?: string;
  maxLinks?: number;
};

export function VideoLinksPanel({ initialLinks, label = "Clips / video", maxLinks = 3 }: VideoLinksPanelProps) {
  const [links, setLinks] = useState(() => {
    const padded = [...initialLinks];
    while (padded.length < maxLinks) padded.push("");
    return padded.slice(0, maxLinks);
  });

  function updateLink(index: number, value: string) {
    setLinks((prev) => prev.map((link, i) => (i === index ? value : link)));
  }

  return (
    <div className="video-links">
      <p className="video-links__label">{label}</p>
      <ul className="video-links__list">
        {links.map((link, index) => {
          const trimmed = link.trim();
          const hasUrl = trimmed.length > 0;

          return (
            <li key={index} className="video-links__item">
              <span className="video-links__index">{index + 1}</span>
              <input
                type="url"
                className="video-links__input"
                placeholder={`Paste link ${index + 1} (Hudl, Drive, etc.)`}
                value={link}
                onChange={(e) => updateLink(index, e.target.value)}
                aria-label={`Video link ${index + 1}`}
              />
              {hasUrl ? (
                <a className="video-links__open btn btn--primary" href={trimmed} target="_blank" rel="noopener noreferrer">
                  Open
                </a>
              ) : (
                <span className="video-links__pending">Pending</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
