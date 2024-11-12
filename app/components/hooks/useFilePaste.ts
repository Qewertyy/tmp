import { useEffect } from "react";

interface UseFilePasteOptions {
  onFilePaste: (file: File) => void;
  fileTypes: string[];
}

export function useFilePaste({ onFilePaste, fileTypes }: UseFilePasteOptions) {
  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (items) {
        for (let item of items) {
          if (fileTypes.some((type) => item.type.match(type))) {
            const file = item.getAsFile();
            if (file) {
              onFilePaste(file);
              break;
            }
          }
        }
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, [onFilePaste, fileTypes]);
}
