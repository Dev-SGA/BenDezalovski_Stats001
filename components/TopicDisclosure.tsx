"use client";

import { useId, useState } from "react";

type TopicDisclosureProps = {
  num: string;
  title: string;
  summary: string;
  wide?: boolean;
  defaultOpen?: boolean;
  children: React.ReactNode;
};

export function TopicDisclosure({ num, title, summary, wide = false, defaultOpen = false, children }: TopicDisclosureProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <article className={`topic topic-disclosure${wide ? " topic--wide" : ""}${open ? " is-open" : ""}`}>
      <button
        type="button"
        className="topic-disclosure__trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls={panelId}
      >
        <span className="topic__num">{num}</span>
        <span className="topic-disclosure__text">
          <span className="topic__title topic-disclosure__title">{title}</span>
          {!open ? <span className="topic-disclosure__summary">{summary}</span> : null}
        </span>
        <span className="topic-disclosure__icon" aria-hidden="true">
          {open ? "−" : "+"}
        </span>
      </button>
      {open ? (
        <div id={panelId} className="topic-disclosure__body">
          {children}
        </div>
      ) : null}
    </article>
  );
}
