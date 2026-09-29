"use client";

import { useState } from "react";

type VideoLinksPanelProps = {
  initialLinks: string[];
};

export function VideoLinksPanel({ initialLinks }: VideoLinksPanelProps) {
  const [links, setLinks] = useState(() =>
    initialLinks.length >= 3 ? initialLinks.slice(0, 3) : [...initialLinks, "", "", ""].slice(0, 3),
  );

  function updateLink(index: number, value: string) {
    setLinks((prev) => prev.map((link, i) => (i === index ? value : link)));
  }

  return (
    <div className="video-links">
      <p className="video-links__label">Clipes / vídeos</p>
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
                placeholder={`Cole o link ${index + 1} (Hudl, Drive, etc.)`}
                value={link}
                onChange={(e) => updateLink(index, e.target.value)}
                aria-label={`Link de vídeo ${index + 1}`}
              />
              {hasUrl ? (
                <a className="video-links__open btn btn--small" href={trimmed} target="_blank" rel="noopener noreferrer">
                  Abrir
                </a>
              ) : (
                <span className="video-links__pending">Pendente</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
