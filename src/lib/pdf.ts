type PdfTextItem = {
  str: string;
  transform: number[];
  width?: number;
};

function isPdfTextItem(item: unknown): item is PdfTextItem {
  return (
    typeof item === "object" &&
    item !== null &&
    "str" in item &&
    typeof (item as PdfTextItem).str === "string" &&
    "transform" in item &&
    Array.isArray((item as PdfTextItem).transform)
  );
}

function joinLineItems(items: PdfTextItem[]): string {
  if (!items.length) return "";

  const sorted = [...items].sort((a, b) => a.transform[4] - b.transform[4]);
  let line = "";
  let lastEnd = -Infinity;

  for (const item of sorted) {
    const text = item.str.trim();
    if (!text) continue;

    const x = item.transform[4];
    const gap = x - lastEnd;

    if (line && gap > 12) {
      line += "\t";
    } else if (line && gap > 2) {
      line += " ";
    }

    line += text;
    lastEnd = x + (item.width ?? text.length * 4);
  }

  return line.trim();
}

function pageToLines(items: PdfTextItem[]): string[] {
  const rows = new Map<number, PdfTextItem[]>();

  for (const item of items) {
    if (!item.str?.trim()) continue;
    const y = Math.round(item.transform[5]);
    const bucket = rows.get(y) ?? [];
    bucket.push(item);
    rows.set(y, bucket);
  }

  return [...rows.entries()]
    .sort(([a], [b]) => b - a)
    .map(([, rowItems]) => joinLineItems(rowItems))
    .filter(Boolean);
}

export async function extractTextFromPDF(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");

  if (typeof window !== "undefined") {
    const version = pdfjs.version ?? "6.0.227";
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer, useSystemFonts: true }).promise;
  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const items: PdfTextItem[] = [];
    for (const item of content.items) {
      if (isPdfTextItem(item)) items.push(item);
    }
    pages.push(pageToLines(items).join("\n"));
  }

  return pages.filter((p) => p.trim()).join("\n\n");
}