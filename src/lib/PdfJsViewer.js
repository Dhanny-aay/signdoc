import { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

const PdfJsViewer = ({ 
  url, 
  signatures = [], 
  onDocumentLoad, 
  scale = 1.0, 
  onPageClick,
  onSignatureMove,
  className = "" 
}) => {
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  
  const canvasRefs = useRef({});
  const containerRef = useRef(null);
  const pdfJsRef = useRef(null);
  const [pdfJsLoaded, setPdfJsLoaded] = useState(false);

  // Load PDF.js library
  useEffect(() => {
    loadPdfJs();
  }, []);

  // Load PDF document when URL changes
  useEffect(() => {
    if (pdfJsLoaded && url) {
      loadPdf();
    }
  }, [url, pdfJsLoaded]);

  // Re-render pages when scale changes
  useEffect(() => {
    if (pages.length > 0 && pdfJsLoaded) {
      renderAllPages();
    }
  }, [scale, pages.length, pdfJsLoaded]);

  const loadPdfJs = async () => {
    try {
      // Dynamic import of PDF.js
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
          
          // Test worker by creating a simple task
          const testTask = pdfjsLib.getDocument({ url: 'data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsO' });
          await testTask.promise;
          
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
      
      setPdfJsLoaded(true);
    } catch (error) {
      console.error('PDF.js setup failed:', error);
      setError('Failed to load PDF.js library');
      setLoading(false);
    }
  };

  const loadPdf = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading PDF from:', url);
      
      // Load PDF document using PDF.js
      const pdfjsLib = await import('pdfjs-dist');
      const loadingTask = pdfjsLib.getDocument(url);
      const doc = await loadingTask.promise;
      
      setPdfDoc(doc);
      setNumPages(doc.numPages);
      
      // Get page information
      const pagesData = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale: 1.0 });
        
        pagesData.push({
          pageNumber: i,
          width: viewport.width,
          height: viewport.height,
          scaledWidth: viewport.width * scale,
          scaledHeight: viewport.height * scale,
          viewport: viewport
        });
      }
      
      setPages(pagesData);
      onDocumentLoad?.({ numPages: doc.numPages, pages: pagesData });
      
      setLoading(false);
    } catch (err) {
      console.error('Failed to load PDF:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const renderAllPages = async () => {
    if (!pdfDoc) return;
    
    console.log('Rendering all pages with scale:', scale);
    
    for (let i = 1; i <= numPages; i++) {
      try {
        await renderPage(i);
        // Small delay to prevent browser overload
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (error) {
        console.error(`Error rendering page ${i}:`, error);
      }
    }
  };

  const renderPage = async (pageNumber) => {
    if (!pdfDoc) return;
    
    try {
      const page = await pdfDoc.getPage(pageNumber);
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
      console.error(`Could not render page ${pageNumber}:`, error);
    }
  };

  const handleCanvasClick = useCallback((event, pageNumber) => {
    if (!onPageClick) return;
    
    const canvas = event.target;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Convert canvas coordinates to PDF coordinates
    const pageData = pages.find(p => p.pageNumber === pageNumber);
    if (!pageData) return;
    
    const pdfX = (x / scale);
    const pdfY = (y / scale);
    
    console.log('Canvas clicked:', { x: pdfX, y: pdfY, pageNumber });
    onPageClick({ x: pdfX, y: pdfY, pageNumber });
  }, [onPageClick, scale, pages]);

  const handlePageChange = useCallback((direction) => {
    const newPage = direction === 'next' 
      ? Math.min(currentPage + 1, numPages)
      : Math.max(currentPage - 1, 1);
    
    if (newPage !== currentPage) {
      setCurrentPage(newPage);
      // Scroll to the new page
      const pageElement = document.getElementById(`page-${newPage}`);
      if (pageElement) {
        pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [currentPage, numPages]);

  // Convert PDF coordinates to canvas coordinates for signature positioning
  const getCanvasPosition = useCallback((pdfX, pdfY, pageNumber) => {
    const pageData = pages.find(p => p.pageNumber === pageNumber);
    if (!pageData) return { x: 0, y: 0 };
    
    return {
      x: pdfX * scale,
      y: pdfY * scale
    };
  }, [pages, scale]);

  // Convert canvas coordinates to PDF coordinates
  const getPdfPosition = useCallback((canvasX, canvasY, pageNumber) => {
    return {
      x: canvasX / scale,
      y: canvasY / scale
    };
  }, [scale]);

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
        <p className="text-gray-400" />
        <p className="text-gray-600">No pages found in PDF</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 sm:space-y-6 ${className}`}>
      {/* Page Navigation */}
      {numPages > 1 && (
        <div className="flex items-center justify-center gap-4 bg-white rounded-lg shadow-sm p-3">
          <button
            onClick={() => handlePageChange('prev')}
            disabled={currentPage <= 1}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} />
            Previous
          </button>
          
          <span className="text-sm text-gray-600">
            Page {currentPage} of {numPages}
          </span>
          
          <button
            onClick={() => handlePageChange('next')}
            disabled={currentPage >= numPages}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* PDF Pages */}
      {pages.map((pageData) => (
        <div 
          key={pageData.pageNumber} 
          id={`page-${pageData.pageNumber}`}
          className="relative"
        >
          <div className="relative inline-block bg-white shadow-lg rounded-lg overflow-hidden w-full max-w-full">
            <canvas
              ref={(el) => {
                if (el) {
                  canvasRefs.current[pageData.pageNumber] = el;
                  // Render page when canvas is mounted
                  if (pdfDoc && pdfJsLoaded) {
                    setTimeout(() => renderPage(pageData.pageNumber), 100);
                  }
                }
              }}
              onClick={(e) => handleCanvasClick(e, pageData.pageNumber)}
              className="block cursor-crosshair w-full h-auto max-w-full"
            />
            
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-black bg-opacity-70 text-white px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-medium">
              Page {pageData.pageNumber}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PdfJsViewer;
