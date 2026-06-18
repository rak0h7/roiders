async function fileToOcrSource(file: File): Promise<File | Blob> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  const isHeic =
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    ext === "heic" ||
    ext === "heif";

  if (!isHeic) return file;

  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Could not decode HEIC image"));
      el.src = url;
    });

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not prepare image for OCR");

    ctx.drawImage(img, 0, 0);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not convert image"))), "image/jpeg", 0.92);
    });
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function extractTextFromImages(
  files: File[],
  onProgress?: (current: number, total: number) => void
): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("Image OCR is only available in the browser.");
  }

  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng");
  const parts: string[] = [];

  try {
    for (let i = 0; i < files.length; i++) {
      onProgress?.(i + 1, files.length);
      const source = await fileToOcrSource(files[i]);
      const { data } = await worker.recognize(source);
      const text = data.text?.trim();
      if (text) parts.push(text);
    }
  } finally {
    await worker.terminate();
  }

  const combined = parts.join("\n\n").trim();
  if (!combined) {
    throw new Error("No readable text found in the selected images. Try clearer screenshots or paste results manually.");
  }

  return combined;
}