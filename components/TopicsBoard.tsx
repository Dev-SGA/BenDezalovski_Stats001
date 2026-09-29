"use client";

import { useState } from "react";

export type Tone = "accent" | "positive" | "warn";

export type Topic = {
  id: string;
  num: string;
  title: string;
  metric: string;
  metricLabel: string;
  summary: string;
  tone: Tone;
  content: React.ReactNode;
};

type TopicsBoardProps = {
  topics: Topic[];
};

export function TopicsBoard({ topics }: TopicsBoardProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set());
  const allOpen = openIds.size === topics.length;

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setOpenIds(allOpen ? new Set() : new Set(topics.map((topic) => topic.id)));
  }

  return (
    <div className="board">
      <div className="board__toolbar">
        <h2 className="board__heading">Match breakdown</h2>
        <button type="button" className="btn btn--ghost" onClick={toggleAll}>
          {allOpen ? "Collapse all" : "Expand all"}
        </button>
      </div>

      <div className="topic-list">
        {topics.map((topic) => {
          const open = openIds.has(topic.id);
          const panelId = `topic-panel-${topic.id}`;

          return (
            <article
              key={topic.id}
              id={`topic-${topic.id}`}
              className={`topic topic--${topic.tone}${open ? " is-open" : ""}`}
            >
              <button
                type="button"
                className="topic__trigger"
                onClick={() => toggle(topic.id)}
                aria-expanded={open}
                aria-controls={panelId}
              >
                <span className="topic__num">{topic.num}</span>
                <span className="topic__text">
                  <span className="topic__title">{topic.title}</span>
                  <span className="topic__summary">{topic.summary}</span>
                </span>
                <span className="topic__metric">
                  <span className="topic__metric-value">{topic.metric}</span>
                  <span className="topic__metric-label">{topic.metricLabel}</span>
                </span>
                <span className="topic__chevron" aria-hidden="true" />
              </button>
              {open ? (
                <div id={panelId} className="topic__body">
                  {topic.content}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
