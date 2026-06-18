"use client";

import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import {
  describeUploadFiles,
  LAB_IMAGE_ACCEPT,
  LAB_UPLOAD_ACCEPT,
  validateLabUpload,
} from "@/lib/labUpload";
import { useCallback, useRef, useState } from "react";

export function useLabFilePicker() {
  const { handleFileUpload } = useApp();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [parsing, setParsing] = useState(false);

  const openPicker = useCallback((accept: string, multiple: boolean) => {
    const input = fileRef.current;
    if (!input) return;
    input.accept = accept;
    input.multiple = multiple;
    input.click();
  }, []);

  const processFiles = useCallback(
    async (raw: FileList | File[] | null | undefined) => {
      const files = raw ? Array.from(raw) : [];
      if (!files.length) return;

      const validationError = validateLabUpload(files);
      if (validationError) {
        toast({ type: "warning", title: "Upload issue", description: validationError });
        return;
      }

      const label = describeUploadFiles(files);
      const isMultiPhoto = files.length > 1;
      setParsing(true);
      toast({
        type: "info",
        title: isMultiPhoto ? "Reading photos" : "Reading file",
        description: isMultiPhoto ? `Scanning ${label}…` : `Parsing ${label}…`,
      });

      try {
        await handleFileUpload(files.length === 1 ? files[0] : files);
        toast({
          type: "success",
          title: "Upload complete",
          description: isMultiPhoto ? `Extracted text from ${label}.` : `Parsed ${label}.`,
        });
      } catch (error) {
        toast({
          type: "error",
          title: "Could not read upload",
          description: error instanceof Error ? error.message : "Try again or paste your results manually.",
        });
      } finally {
        setParsing(false);
      }
    },
    [handleFileUpload, toast]
  );

  const onInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      await processFiles(e.target.files);
      e.target.value = "";
    },
    [processFiles]
  );

  const onDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      await processFiles(e.dataTransfer.files);
    },
    [processFiles]
  );

  const pickPhotos = useCallback(() => openPicker(LAB_IMAGE_ACCEPT, true), [openPicker]);
  const pickAny = useCallback(() => openPicker(LAB_UPLOAD_ACCEPT, true), [openPicker]);
  const pickDocument = useCallback((accept: string) => openPicker(accept, false), [openPicker]);

  return {
    fileRef,
    parsing,
    onInputChange,
    onDrop,
    pickPhotos,
    pickAny,
    pickDocument,
    processFiles,
  };
}