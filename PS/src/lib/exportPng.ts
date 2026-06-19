import { toPng } from "html-to-image";
import type { CanvasSize } from "./canvasTypes";

export async function exportCanvasPng(
  node: HTMLElement,
  size: CanvasSize,
  scale: 1 | 2,
  filename: string,
): Promise<void> {
  node.setAttribute("data-exporting", "true");
  const prevWidth = node.style.width;
  const prevHeight = node.style.height;
  const prevMaxWidth = node.style.maxWidth;
  node.style.width = `${size.width}px`;
  node.style.height = `${size.height}px`;
  node.style.maxWidth = "none";
  try {
    const dataUrl = await toPng(node, {
      width: size.width,
      height: size.height,
      pixelRatio: scale,
      cacheBust: true,
      style: {
        transform: "none",
        margin: "0",
      },
    });

    const link = document.createElement("a");
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } finally {
    node.style.width = prevWidth;
    node.style.height = prevHeight;
    node.style.maxWidth = prevMaxWidth;
    node.removeAttribute("data-exporting");
  }
}