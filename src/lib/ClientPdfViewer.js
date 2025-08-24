"use client";

import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.min.mjs"; // ✅ use this

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function ClientPdfViewer({ file, pageNumber, scale, onLoadSuccess }) {
  const canvasRef = useRef(null);
  const [numPages, setNumPages] = useState(null);

  useEffect(() => {
    if (!file) return;

    const loadPdf = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument(file);
        const pdf = await loadingTask.promise;

        setNumPages(pdf.numPages);
        onLoadSuccess && onLoadSuccess({ numPages: pdf.numPages });

        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport,
        };

        await page.render(renderContext).promise;
      } catch (err) {
        console.error("Error loading PDF:", err);
      }
    };

    loadPdf();
  }, [file, pageNumber, scale, onLoadSuccess]);

  return <canvas ref={canvasRef} className="shadow-md rounded" />;
}
