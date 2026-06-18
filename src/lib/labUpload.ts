export const LAB_UPLOAD_ACCEPT = ".pdf,.txt,.csv,image/*";
export const LAB_IMAGE_ACCEPT = "image/*";

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif", "heic", "heif", "bmp"]);

function extension(file: File): string {
  return file.name.split(".").pop()?.toLowerCase() ?? "";
}

export function isLabImage(file: File): boolean {
  if (file.type.startsWith("image/")) return true;
  return IMAGE_EXTENSIONS.has(extension(file));
}

export function isLabPdf(file: File): boolean {
  return file.type === "application/pdf" || extension(file) === "pdf";
}

export function isLabCsv(file: File): boolean {
  return file.type === "text/csv" || extension(file) === "csv";
}

export function isLabTxt(file: File): boolean {
  return file.type === "text/plain" || extension(file) === "txt";
}

export function normalizeLabUpload(input: File | File[]): File[] {
  return Array.isArray(input) ? input : [input];
}

export function validateLabUpload(files: File[]): string | null {
  if (!files.length) return "No files selected.";
  if (files.length === 1) return null;
  if (files.every(isLabImage)) return null;
  return "Select multiple photos or screenshots, or upload one PDF, TXT, or CSV file.";
}

export function describeUploadFiles(files: File[]): string {
  if (files.length === 1) return files[0].name;
  const imageCount = files.filter(isLabImage).length;
  return `${imageCount} photo${imageCount === 1 ? "" : "s"}`;
}