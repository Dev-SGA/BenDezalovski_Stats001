"use client";

import { useState } from "react";
import { createRoot } from "react-dom/client";
import { StatsGamePdfSheet } from "@/components/StatsGamePdfSheet";
import { BRAND } from "@/lib/brand";
import { exportStatsSlideToPdf } from "@/lib/exportPdf";
import type { GameStats } from "@/lib/stats";

type ExportPdfButtonProps = {
  stats: GameStats;
};

export function ExportPdfButton({ stats }: ExportPdfButtonProps) {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generatePdf() {
    setError(null);
    setExporting(true);

    const host = document.createElement("div");
    host.className = "stats-pdf-host";
    document.body.appendChild(host);

    const origin = window.location.origin;
    const photoAbsoluteUrl = `${origin}${stats.player.photo}`;
    const logoAbsoluteUrl = `${origin}${BRAND.logoTrimmed}`;

    const root = createRoot(host);

    try {
      root.render(<StatsGamePdfSheet stats={stats} photoAbsoluteUrl={photoAbsoluteUrl} logoAbsoluteUrl={logoAbsoluteUrl} />);
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });

      const sheet = host.querySelector(".stats-pdf");
      if (!(sheet instanceof HTMLElement)) {
        throw new Error("Could not prepare the PDF layout.");
      }

      const safeName = stats.player.name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      await exportStatsSlideToPdf(sheet, `stats-game-report-${safeName || "export"}.pdf`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "PDF export failed.");
    } finally {
      root.unmount();
      host.remove();
      setExporting(false);
    }
  }

  return (
    <div className="export-pdf">
      <button type="button" className="btn btn--primary" disabled={exporting} onClick={() => void generatePdf()}>
        {exporting ? "Building PDF…" : "Generate PDF (16:9)"}
      </button>
      {error ? <p className="export-pdf__error">{error}</p> : null}
    </div>
  );
}
