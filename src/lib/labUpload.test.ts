import { describe, expect, it } from "vitest";
import {
  describeUploadFiles,
  isLabImage,
  isLabPdf,
  normalizeLabUpload,
  validateLabUpload,
} from "@/lib/labUpload";

function file(name: string, type = ""): File {
  return new File(["x"], name, { type });
}

describe("labUpload", () => {
  it("detects common image types", () => {
    expect(isLabImage(file("panel.png", "image/png"))).toBe(true);
    expect(isLabImage(file("screen.jpg", "image/jpeg"))).toBe(true);
    expect(isLabImage(file("shot.heic", "image/heic"))).toBe(true);
    expect(isLabImage(file("report.pdf", "application/pdf"))).toBe(false);
  });

  it("allows multiple images but not mixed document batches", () => {
    expect(validateLabUpload([file("a.png", "image/png"), file("b.jpg", "image/jpeg")])).toBeNull();
    expect(validateLabUpload([file("a.pdf", "application/pdf"), file("b.png", "image/png")])).toContain(
      "multiple photos"
    );
  });

  it("describes multi-photo uploads", () => {
    expect(describeUploadFiles([file("labs.png", "image/png"), file("labs2.png", "image/png")])).toBe("2 photos");
    expect(describeUploadFiles([file("labs.pdf", "application/pdf")])).toBe("labs.pdf");
  });

  it("normalizes single and multi inputs", () => {
    const one = file("a.pdf", "application/pdf");
    expect(normalizeLabUpload(one)).toEqual([one]);
    expect(normalizeLabUpload([one]).length).toBe(1);
    expect(isLabPdf(one)).toBe(true);
  });
});