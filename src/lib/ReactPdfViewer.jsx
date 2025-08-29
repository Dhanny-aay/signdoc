import { useState, useEffect, useCallback, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Loader2, FileText, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

const ReactPdfViewer = ({ 
  url, 
  scale = 1.0, 
  onDocumentLoad, 
  onPageClick,
  className = "" 
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentScale, setCurrentScale] = useState(scale);
  const [pdfDocument, setPdfDocument] = useState(null);
  
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Load PDF document
  useEffect(() => {
    if (!url) return;

    const loadDocument = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;
        
        setPdfDocument(pdf);
        setNumPages(pdf.numPages);
        setCurrentPage(1);
        
        // Call parent callback
        onDocumentLoad?.({
          numPages: pdf.numPages,
          pages: Array.from({ length: pdf.numPages }, (_, i) => ({
            pageNumber: i + 1,
            width: 595,
            height: 842,
            scaledWidth: 595 * currentScale,
            scaledHeight: 842 * currentScale,
          })),
          scale: currentScale,
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError(err.message || 'Failed to load PDF');
        setLoading(false);
      }
    };

    loadDocument();
  }, [url, onDocumentLoad, currentScale]);

  // Render current page
  useEffect(() => {
    if (!pdfDocument || !canvasRef.current) return;

    const renderPage = async () => {
      try {
        const page = await pdfDocument.getPage(currentPage);
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        // Calculate viewport
        const viewport = page.getViewport({ scale: currentScale });
        
        // Set canvas dimensions
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        // Render page
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
      } catch (err) {
        console.error('Error rendering page:', err);
        setError('Failed to render page');
      }
    };

    renderPage();
  }, [pdfDocument, currentPage, currentScale]);

  // Handle zoom changes
  const handleZoomChange = useCallback((newScale) => {
    console.log('Zoom changed:', newScale);
    setCurrentScale(newScale);
    
    if (onDocumentLoad && numPages > 0) {
      const updatedPages = Array.from({ length: numPages }, (_, i) => ({
        pageNumber: i + 1,
        width: 595,
        height: 842,
        scaledWidth: 595 * newScale,
        scaledHeight: 842 * newScale,
      }));
      onDocumentLoad({ numPages, pages: updatedPages, scale: newScale });
    }
  }, [numPages, onDocumentLoad]);

  // Handle page navigation
  const nextPage = useCallback(() => {
    if (currentPage < numPages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, numPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  // Handle canvas click for signature placement
  const handleCanvasClick = useCallback((e) => {
    if (!onPageClick) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    onPageClick({
      pageNumber: currentPage,
      x: x,
      y: y,
    });
  }, [onPageClick, currentPage]);

  // Apply scale when scale prop changes
  useEffect(() => {
    setCurrentScale(scale);
  }, [scale]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="text-gray-600">Loading PDF document...</p>
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
          onClick={() => setLoading(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div ref={containerRef} className="relative w-full">
        {/* PDF Controls */}
        <div className="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={prevPage}
              disabled={currentPage <= 1}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {numPages}
            </span>
            <button
              onClick={nextPage}
              disabled={currentPage >= numPages}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleZoomChange(Math.max(0.5, currentScale - 0.25))}
              className="p-2 rounded hover:bg-gray-100"
            >
              <ZoomOut size={20} />
            </button>
            <span className="text-sm text-gray-600 min-w-[60px] text-center">
              {Math.round(currentScale * 100)}%
            </span>
            <button
              onClick={() => handleZoomChange(Math.min(3.0, currentScale + 0.25))}
              className="p-2 rounded hover:bg-gray-100"
            >
              <ZoomIn size={20} />
            </button>
            <button
              onClick={() => handleZoomChange(1.0)}
              className="p-2 rounded hover:bg-gray-100"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </div>

        {/* PDF Canvas */}
        <div className="flex justify-center bg-gray-100 p-4">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="border border-gray-300 shadow-lg cursor-crosshair"
            style={{ 
              maxWidth: '100%', 
              height: 'auto',
              cursor: onPageClick ? 'crosshair' : 'default'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ReactPdfViewer;

