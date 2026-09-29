/** 16:9 slide — width and height in CSS pixels (matches StatsGamePdfSheet). */
export const PDF_SLIDE_WIDTH = 960;
export const PDF_SLIDE_HEIGHT = 540;

async function waitForImages(element: HTMLElement): Promise<void> {
  const images = Array.from(element.querySelectorAll("img"));
  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
          }
          img.addEventListener("load", () => resolve(), { once: true });
          img.addEventListener("error", () => resolve(), { once: true });
        }),
    ),
  );
}

export async function exportStatsSlideToPdf(element: HTMLElement, filename: string): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);

  await waitForImages(element);
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  const links = Array.from(element.querySelectorAll<HTMLElement>("[data-pdf-link]"))
    .map((node) => ({ url: node.dataset.pdfLink ?? "", rect: node.getBoundingClientRect() }))
    .filter((link) => link.url);

  const sheetRect = element.getBoundingClientRect();

  const canvas = await html2canvas(element, {
    scale: 2,
    width: PDF_SLIDE_WIDTH,
    height: PDF_SLIDE_HEIGHT,
    useCORS: true,
    backgroundColor: "#072334",
    logging: false,
  });

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [PDF_SLIDE_WIDTH, PDF_SLIDE_HEIGHT],
    compress: true,
  });

  pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, PDF_SLIDE_WIDTH, PDF_SLIDE_HEIGHT);

  for (const link of links) {
    pdf.link(
      link.rect.left - sheetRect.left,
      link.rect.top - sheetRect.top,
      link.rect.width,
      link.rect.height,
      { url: link.url },
    );
  }

  pdf.save(filename);
}
