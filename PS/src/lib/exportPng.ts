import { toPng } from "html-to-image";
import type { CanvasSize } from "./canvasTypes";

function waitForPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

async function waitForFonts(): Promise<void> {
  if (typeof document !== "undefined" && "fonts" in document) {
    await document.fonts.ready;
  }
}

/**
 * Export the artboard at its native canvas dimensions.
 * The node must already be laid out at size.width × size.height (see CanvasStage).
 */
export async function exportCanvasPng(
  node: HTMLElement,
  size: CanvasSize,
  pixelRatio: 1 | 2,
  filename: string,
): Promise<void> {
  node.setAttribute("data-exporting", "true");
  await waitForFonts();
  await waitForPaint();

  try {
    const dataUrl = await toPng(node, {
      pixelRatio,
      cacheBust: true,
      skipAutoScale: true,
      style: {
        transform: "none",
        margin: "0",
        width: `${size.width}px`,
        height: `${size.height}px`,
      },
    });

    const link = document.createElement("a");
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } finally {
    node.removeAttribute("data-exporting");
  }
}