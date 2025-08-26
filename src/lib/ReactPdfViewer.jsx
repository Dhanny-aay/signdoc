import { useState, useEffect, useCallback, useRef } from 'react';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { zoomPlugin } from '@react-pdf-viewer/zoom';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import { Loader2, FileText } from 'lucide-react';
import createCustomToolbarPlugin from '@/components/CustomToolbarPlugin';

// Import styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

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
  
  const viewerRef = useRef(null);
  const containerRef = useRef(null);

  console.log('url', url);

  // Create plugins
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: () => [], // Disable sidebar for full-canvas experience
    toolbarPlugin: {
      fullScreenPlugin: {
        onEnterFullScreen: (zoom) => {
          zoom(scale);
          return Promise.resolve();
        },
        onExitFullScreen: (zoom) => {
          zoom(scale);
          return Promise.resolve();
        },
      },
    },
    // Handle document load through plugin configuration
    onDocumentLoad: (e) => {
      console.log('Document loaded:', e);
      setLoading(false);
      setNumPages(e.doc.numPages);
      setCurrentPage(1);

      // Apply initial zoom
      if (zoomTo) {
        zoomTo(scale);
      }

      // Update custom toolbar plugin
      customToolbarPlugin.onDocumentLoad(e);

      onDocumentLoad?.({
        numPages: e.doc.numPages,
        pages: Array.from({ length: e.doc.numPages }, (_, i) => ({
          pageNumber: i + 1,
          width: 595,
          height: 842,
          scaledWidth: 595 * scale,
          scaledHeight: 842 * scale,
        })),
        scale,
      });
    },
  });

  const zoomPluginInstance = zoomPlugin({
    // Handle zoom changes through plugin configuration
    onZoom: (e) => {
      console.log('Zoom changed:', e);
      const newScale = e.scale;
      
      // Update custom toolbar plugin
      customToolbarPlugin.onZoom(e);
      
      if (onDocumentLoad && numPages > 0) {
        // Update pages with new scale
        const updatedPages = Array.from({ length: numPages }, (_, i) => ({
          pageNumber: i + 1,
          width: 595,
          height: 842,
          scaledWidth: 595 * newScale,
          scaledHeight: 842 * newScale
        }));
        
        onDocumentLoad({ 
          numPages, 
          pages: updatedPages,
          scale: newScale
        });
      }
    },
  });

  const pageNavigationPluginInstance = pageNavigationPlugin({
    // Handle page changes through plugin configuration
    onPageChange: (e) => {
      console.log('Page changed:', e);
      setCurrentPage(e.currentPage);
      customToolbarPlugin.onPageChange(e);
    },
  });
  
  // Custom toolbar plugin
  const customToolbarPlugin = createCustomToolbarPlugin(
    (newScale) => {
      console.log('Custom toolbar zoom change:', newScale);
      if (onDocumentLoad && numPages > 0) {
        const updatedPages = Array.from({ length: numPages }, (_, i) => ({
          pageNumber: i + 1,
          width: 595, // Default A4 width
          height: 842, // Default A4 height
          scaledWidth: 595 * newScale,
          scaledHeight: 842 * newScale
        }));
        
        onDocumentLoad({ 
          numPages, 
          pages: updatedPages,
          scale: newScale
        });
      }
    },
    (newPage) => {
      console.log('Custom toolbar page change:', newPage);
      setCurrentPage(newPage);
    }
  );

  // Extract helpers
  const { zoomTo } = zoomPluginInstance;
  const { jumpToPage } = pageNavigationPluginInstance;

  // Custom renderPage function to capture clicks for signature placement
  const renderPage = useCallback((props) => {
    const { canvasLayer, annotationLayer, textLayer, pageIndex } = props;
    
    return (
      <div 
        key={`page-${pageIndex}`}
        className="relative"
        onClick={(e) => {
          if (!onPageClick) return;
          
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          const currentPageInfo = {
            pageNumber: pageIndex + 1,
            x,
            y
          };
          
          onPageClick(currentPageInfo);
        }}
      >
        {canvasLayer}
        {annotationLayer}
        {textLayer}
      </div>
    );
  }, [onPageClick]);

  // Apply zoom when scale prop changes
  useEffect(() => {
    if (zoomTo && !loading) {
      zoomTo(scale);
    }
  }, [scale, zoomTo, loading]);

  // Jump to page when currentPage updates
  useEffect(() => {
    if (jumpToPage && currentPage > 0 && currentPage <= numPages) {
      jumpToPage(currentPage - 1); // Viewer uses 0-based indexing
    }
  }, [currentPage, numPages, jumpToPage]);

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
      <div 
        ref={containerRef}
        className="relative w-full"
        style={{ minHeight: '600px' }}
      >
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <div
            ref={viewerRef}
            className="w-full h-full"
            style={{ height: '100%', minHeight: '600px' }}
          >
            <Viewer
              fileUrl={url}
              plugins={[
                defaultLayoutPluginInstance,
                zoomPluginInstance,
                pageNavigationPluginInstance,
                customToolbarPlugin,
              ]}
              renderPage={renderPage}
              defaultScale={scale}
              theme={{ theme: 'auto' }}
            />
          </div>
        </Worker>
      </div>
    </div>
  );
};

export default ReactPdfViewer;
