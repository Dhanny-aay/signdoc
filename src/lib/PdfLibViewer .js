import { PDFDocument } from 'pdf-lib';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, FileText } from 'lucide-react';

const PdfLibViewer = ({ 
  url, 
  signatures, 
  onDocumentLoad, 
  scale = 1.0, 
  onPageClick,
  className = ""
}) => {
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const canvasRefs = useRef({});
  const pdfJsRef = useRef(null);
  const [pdfJsLoaded, setPdfJsLoaded] = useState(false);

  useEffect(() => {
    loadPdf();
  }, [url]);

  useEffect(() => {
    if (pages.length > 0 && pdfJsLoaded) {
      renderAllPages();
    }
  }, [pages, scale]);

  const loadPdf = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading PDF from:', url);
      
      // Add CORS headers for PDF loading
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.statusText}`);
      }
      
      const pdfBytes = await response.arrayBuffer();
      console.log('PDF bytes loaded:', pdfBytes.byteLength);
      
      const doc = await PDFDocument.load(pdfBytes);
      setPdfDoc(doc);
      
      // Get page information
      const pageCount = doc.getPageCount();
      console.log('PDF loaded with', pageCount, 'pages');
      
      const pagesData = Array.from({ length: pageCount }, (_, i) => {
        const page = doc.getPage(i);
        const { width, height } = page.getSize();
        
        return {
          pageNumber: i + 1,
          width,
          height,
          scaledWidth: width * scale,
          scaledHeight: height * scale
        };
      });
      
      setPages(pagesData);
      onDocumentLoad?.({ numPages: pageCount });
      
      // Load PDF.js for rendering
      try {
        await loadPdfJs(pdfBytes);
        setPdfJsLoaded(true);
      } catch (pdfJsError) {
        console.warn('PDF.js failed, using placeholders:', pdfJsError);
        setPdfJsLoaded(false);
        // Create placeholders immediately if PDF.js fails
        setTimeout(() => createPlaceholderPages(), 100);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Failed to load PDF:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const loadPdfJs = async (pdfBytes) => {
    try {
      // Dynamic import PDF.js with better error handling
      const pdfjsLib = await import('pdfjs-dist');
      
      // Set worker source - try local first, then CDN
      const workerUrls = [
        '/pdf.worker.min.js',
        `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`,
        `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`
      ];

      let workerLoaded = false;
      
      for (const workerUrl of workerUrls) {
        try {
          console.log('Trying PDF.js worker:', workerUrl);
          pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
          
          // Test worker by loading the PDF
          const testTask = pdfjsLib.getDocument({ data: pdfBytes });
          const testDoc = await testTask.promise;
          
          pdfJsRef.current = testDoc;
          workerLoaded = true;
          console.log('PDF.js worker loaded successfully from:', workerUrl);
          break;
        } catch (workerError) {
          console.warn(`Worker failed for ${workerUrl}:`, workerError);
          continue;
        }
      }
      
      if (!workerLoaded) {
        throw new Error('All PDF.js worker URLs failed');
      }
      
    } catch (error) {
      console.warn('PDF.js setup failed completely:', error);
      pdfJsRef.current = null;
      throw error;
    }
  };

  const renderAllPages = async () => {
    if (!pdfJsRef.current) {
      console.log('No PDF.js available, creating placeholders');
      createPlaceholderPages();
      return;
    }
    
    console.log('Rendering pages with PDF.js');
    for (let i = 0; i < pages.length; i++) {
      try {
        await renderPage(i + 1);
        // Small delay to prevent browser overload
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error rendering page ${i + 1}:`, error);
        createPlaceholderPage(i + 1);
      }
    }
  };

  const createPlaceholderPages = () => {
    pages.forEach((pageData, index) => {
      setTimeout(() => createPlaceholderPage(pageData.pageNumber), index * 50);
    });
  };

  const createPlaceholderPage = (pageNumber) => {
    const canvas = canvasRefs.current[pageNumber];
    if (!canvas) return;
    
    const pageData = pages.find(p => p.pageNumber === pageNumber);
    if (!pageData) return;
    
    const context = canvas.getContext('2d');
    canvas.width = pageData.scaledWidth;
    canvas.height = pageData.scaledHeight;
    
    // Enhanced placeholder design
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.strokeStyle = '#d1d5db';
    context.lineWidth = 2;
    context.strokeRect(0, 0, canvas.width, canvas.height);
    
    // Document-like grid pattern
    context.strokeStyle = '#f3f4f6';
    context.lineWidth = 1;
    
    for (let y = 50; y < canvas.height; y += 30) {
      context.beginPath();
      context.moveTo(50, y);
      context.lineTo(canvas.width - 50, y);
      context.stroke();
    }
    
    // Page information
    context.fillStyle = '#6b7280';
    context.font = 'bold 18px Arial';
    context.textAlign = 'center';
    context.fillText(
      `Page ${pageNumber}`,
      canvas.width / 2,
      canvas.height / 2 - 20
    );
    
    context.font = '14px Arial';
    context.fillText(
      'Click to place signatures',
      canvas.width / 2,
      canvas.height / 2 + 10
    );
  };

  const renderPage = async (pageNumber) => {
    if (!pdfJsRef.current) return;
    
    try {
      const page = await pdfJsRef.current.getPage(pageNumber);
      const canvas = canvasRefs.current[pageNumber];
      if (!canvas) return;
      
      const context = canvas.getContext('2d');
      const viewport = page.getViewport({ scale });
      
      // Set canvas dimensions with device pixel ratio for crisp rendering
      const devicePixelRatio = window.devicePixelRatio || 1;
      canvas.width = viewport.width * devicePixelRatio;
      canvas.height = viewport.height * devicePixelRatio;
      canvas.style.width = viewport.width + 'px';
      canvas.style.height = viewport.height + 'px';
      
      context.scale(devicePixelRatio, devicePixelRatio);
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };
      
      await page.render(renderContext).promise;
      console.log(`Successfully rendered page ${pageNumber}`);
    } catch (error) {
      console.warn(`Could not render page ${pageNumber}:`, error);
      createPlaceholderPage(pageNumber);
    }
  };

  const handleCanvasClick = useCallback((event, pageNumber) => {
    if (!onPageClick) return;
    
    const canvas = event.target;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    console.log('Canvas clicked:', { x, y, pageNumber });
    onPageClick({ x, y, pageNumber });
  }, [onPageClick, scale]);

  const downloadWithSignatures = async () => {
    if (!pdfDoc || signatures.length === 0) {
      alert('No signatures to save');
      return;
    }
    
    try {
      console.log('Creating signed PDF with', signatures.length, 'signatures');
      
      const pdfBytes = await pdfDoc.save();
      const modifiedDoc = await PDFDocument.load(pdfBytes);
      const docPages = modifiedDoc.getPages();
      
      for (const signature of signatures) {
        const pageIndex = (signature.pageNumber || 1) - 1;
        const page = docPages[pageIndex];
        
        if (!page) {
          console.warn(`Page ${pageIndex + 1} not found, skipping signature`);
          continue;
        }
        
        try {
          // Convert data URL to image bytes
          const response = await fetch(signature.data);
          const imageBytes = await response.arrayBuffer();
          
          let image;
          if (signature.data.includes('data:image/png')) {
            image = await modifiedDoc.embedPng(imageBytes);
          } else if (signature.data.includes('data:image/jpeg') || signature.data.includes('data:image/jpg')) {
            image = await modifiedDoc.embedJpg(imageBytes);
          } else {
            try {
              image = await modifiedDoc.embedPng(imageBytes);
            } catch {
              image = await modifiedDoc.embedJpg(imageBytes);
            }
          }
          
          const { x, y, size, rotation } = signature.position;
          const { height: pageHeight } = page.getSize();
          
          // Draw image with proper positioning
          page.drawImage(image, {
            x: x,
            y: pageHeight - y - size.height,
            width: size.width,
            height: size.height,
            rotate: rotation ? { angle: rotation } : undefined,
          });
          
          console.log(`Added signature to page ${pageIndex + 1}`);
        } catch (imgError) {
          console.error('Error adding signature:', imgError);
        }
      }
      
      const finalPdfBytes = await modifiedDoc.save();
      const blob = new Blob([finalPdfBytes], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'signed-document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(downloadUrl);
      
      console.log('PDF download completed');
      return finalPdfBytes;
    } catch (error) {
      console.error('Error downloading signed PDF:', error);
      throw error;
    }
  };

  // Expose download function globally
  useEffect(() => {
    window.downloadSignedPdf = downloadWithSignatures;
    return () => {
      delete window.downloadSignedPdf;
    };
  }, [downloadWithSignatures]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="text-gray-600">Loading PDF document...</p>
        <p className="text-sm text-gray-500 mt-2">This may take a moment for large files</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <FileText size={48} className="mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium mb-2 text-red-600">Failed to load PDF</p>
        <p className="text-sm text-gray-600 mb-4">{error}</p>
        <button 
          onClick={loadPdf}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <FileText size={48} className="mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600">No pages found in PDF</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 sm:space-y-6 ${className}`}>
      {pages.map((pageData) => (
        <div key={pageData.pageNumber} className="relative">
          <div className="relative inline-block bg-white shadow-lg rounded-lg overflow-hidden w-full max-w-full">
            <canvas
              ref={(el) => {
                if (el) {
                  canvasRefs.current[pageData.pageNumber] = el;
                  // Render page when canvas is mounted
                  if (pdfJsRef.current && pdfJsLoaded) {
                    setTimeout(() => renderPage(pageData.pageNumber), 100);
                  } else if (!pdfJsLoaded) {
                    setTimeout(() => createPlaceholderPage(pageData.pageNumber), 100);
                  }
                }
              }}
              onClick={(e) => handleCanvasClick(e, pageData.pageNumber)}
              className="block cursor-crosshair w-full h-auto max-w-full"
            />
            
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-black bg-opacity-70 text-white px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-medium">
              Page {pageData.pageNumber}
            </div>
            
            {/* Render signatures for this page */}
            {signatures
              .filter(sig => (sig.pageNumber || 1) === pageData.pageNumber)
              .map((signature) => (
                <div
                  key={signature.id}
                  className="absolute pointer-events-none"
                  style={{
                    left: signature.position.x,
                    top: signature.position.y,
                    width: signature.position.size?.width || 200,
                    height: signature.position.size?.height || 80,
                    transform: `rotate(${signature.position.rotation || 0}deg)`,
                    transformOrigin: 'center center',
                  }}
                >
                  <img
                    src={signature.data}
                    alt="Signature"
                    className="w-full h-full object-contain opacity-90 drop-shadow-sm pointer-events-none"
                    draggable={false}
                  />
                </div>
              ))}
          </div>
        </div>
      ))}
      
      {signatures.length > 0 && (
        <div className="flex justify-center pt-4 sm:pt-6 px-4">
          <button
            onClick={downloadWithSignatures}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="hidden sm:inline">Download Signed PDF</span>
            <span className="sm:hidden">Download PDF</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default PdfLibViewer;