type PdfTextItem = {
  str?: string;
  hasEOL?: boolean;
};

function isPdfArtifactLine(line: string, totalPages: number): boolean {
  if (/^pdf(?:\.js)?(?:\s+viewer)?$/i.test(line)) {
    return true;
  }

  if (/^page\s+\d+\s+(?:of|\/)\s+\d+$/i.test(line)) {
    return true;
  }

  if (/^第\s*\d+\s*页\s*(?:\/\s*)?(?:共\s*\d+\s*页)?$/.test(line)) {
    return true;
  }

  const numericPage = Number(line);
  return Number.isInteger(numericPage) && numericPage >= 1 && numericPage <= totalPages;
}

function extractPageLines(items: PdfTextItem[]): string[] {
  const lines: string[] = [];
  let currentLine: string[] = [];

  for (const item of items) {
    const text = item.str?.trim();
    if (text) {
      currentLine.push(text);
    }

    if (item.hasEOL) {
      const line = currentLine.join(" ").replace(/\s+/g, " ").trim();
      if (line) {
        lines.push(line);
      }
      currentLine = [];
    }
  }

  const trailingLine = currentLine.join(" ").replace(/\s+/g, " ").trim();
  if (trailingLine) {
    lines.push(trailingLine);
  }

  return lines;
}

export async function readPdfText(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist/webpack.mjs");

  const data = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({
    data,
    cMapPacked: true,
    cMapUrl: "/pdfjs/cmaps/",
    standardFontDataUrl: "/pdfjs/standard_fonts/"
  }).promise;
  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const text = extractPageLines(content.items as PdfTextItem[])
      .filter((line) => !isPdfArtifactLine(line, pdf.numPages))
      .join(" ");
    pages.push(text);
  }

  const resumeText = pages.join(" ").replace(/\s+/g, " ").trim();
  if (!resumeText) {
    throw new Error("PDF 中没有读取到可用文本");
  }

  return resumeText;
}
