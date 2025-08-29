import { useRef, useEffect, useCallback } from 'react';
import EnhancedDraggableSignature from './EnhancedDraggableSignature';

const SignatureOverlay = ({ 
  signatures = [], 
  pages = [], 
  scale = 1.0,
  onSignatureMove,
  onSignatureUpdate,
  onSignatureRemove,
  className = ""
}) => {
  const overlayRef = useRef(null);

  // Convert PDF coordinates to canvas coordinates
  const getCanvasPosition = useCallback((pdfX, pdfY, pageNumber) => {
    const pageData = pages.find(p => p.pageNumber === pageNumber);
    if (!pageData) return { x: 0, y: 0 };
    
    // For react-pdf-viewer, coordinates are already in the correct scale
    return {
      x: pdfX,
      y: pdfY
    };
  }, [pages]);

  // Convert canvas coordinates to PDF coordinates
  const getPdfPosition = useCallback((canvasX, canvasY, pageNumber) => {
    // For react-pdf-viewer, coordinates are already in PDF space
    return {
      x: canvasX,
      y: canvasY
    };
  }, []);

  // Handle signature position change with page boundary detection
  const handleSignatureMove = useCallback((signatureId, newPosition, newPageNumber) => {
    if (onSignatureMove) {
      onSignatureMove(signatureId, newPosition, newPageNumber);
    }
  }, [onSignatureMove]);

  // Handle signature updates (resize, rotate)
  const handleSignatureUpdate = useCallback((signatureId, updates) => {
    if (onSignatureUpdate) {
      onSignatureUpdate(signatureId, updates);
    }
  }, [onSignatureUpdate]);

  // Handle signature removal
  const handleSignatureRemove = useCallback((signatureId) => {
    if (onSignatureRemove) {
      onSignatureRemove(signatureId);
    }
  }, [onSignatureRemove]);

  // Get page boundaries for cross-page dragging
  const getPageBoundaries = useCallback((pageNumber) => {
    const pageData = pages.find(p => p.pageNumber === pageNumber);
    if (!pageData) return null;
    
    // For react-pdf-viewer, dimensions are already in the correct scale
    return {
      left: 0,
      top: 0,
      right: pageData.width,
      bottom: pageData.height,
      width: pageData.width,
      height: pageData.height
    };
  }, [pages]);

  // Check if position is within page boundaries
  const isWithinPage = useCallback((position, pageNumber) => {
    const boundaries = getPageBoundaries(pageNumber);
    if (!boundaries) return false;
    
    const { x, y } = position;
    const { width, height } = position.size || { width: 200, height: 80 };
    
    return x >= 0 && y >= 0 && 
           x + width <= boundaries.width && 
           y + height <= boundaries.height;
  }, [getPageBoundaries]);

  // Detect if signature should move to adjacent page
  const detectPageChange = useCallback((position, currentPage) => {
    const boundaries = getPageBoundaries(currentPage);
    if (!boundaries) return currentPage;
    
    const { x, y } = position;
    const { width, height } = position.size || { width: 200, height: 80 };
    
    // Check if signature is dragged past page boundaries
    if (x < 0 && currentPage > 1) {
      // Dragged left - move to previous page
      const prevPage = currentPage - 1;
      const prevBoundaries = getPageBoundaries(prevPage);
      if (prevBoundaries) {
        return {
          newPage: prevPage,
          newPosition: {
            ...position,
            x: prevBoundaries.width - width,
            y: Math.max(0, Math.min(y, prevBoundaries.height - height))
          }
        };
      }
    } else if (x + width > boundaries.width && currentPage < pages.length) {
      // Dragged right - move to next page
      const nextPage = currentPage + 1;
      const nextBoundaries = getPageBoundaries(nextPage);
      if (nextBoundaries) {
        return {
          newPage: nextPage,
          newPosition: {
            ...position,
            x: 0,
            y: Math.max(0, Math.min(y, nextBoundaries.height - height))
          }
        };
      }
    } else if (y < 0 && currentPage > 1) {
      // Dragged up - move to previous page
      const prevPage = currentPage - 1;
      const prevBoundaries = getPageBoundaries(prevPage);
      if (prevBoundaries) {
        return {
          newPage: prevPage,
          newPosition: {
            ...position,
            x: Math.max(0, Math.min(x, prevBoundaries.width - width)),
            y: prevBoundaries.height - height
          }
        };
      }
    } else if (y + height > boundaries.height && currentPage < pages.length) {
      // Dragged down - move to next page
      const nextPage = currentPage + 1;
      const nextBoundaries = getPageBoundaries(nextPage);
      if (nextBoundaries) {
        return {
          newPage: nextPage,
          newPosition: {
            ...position,
            x: Math.max(0, Math.min(x, nextBoundaries.width - width)),
            y: 0
          }
        };
      }
    }
    
    return null; // No page change needed
  }, [getPageBoundaries, pages.length]);

  return (
    <div 
      ref={overlayRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
    >
      {signatures.map((signature) => {
        const pageData = pages.find(p => p.pageNumber === signature.pageNumber);
        if (!pageData) return null;
        
        // For react-pdf-viewer, signatures are positioned relative to their page
        // The viewer handles page positioning automatically
        const canvasPosition = getCanvasPosition(
          signature.position.x, 
          signature.position.y, 
          signature.pageNumber
        );
        
        return (
          <div
            key={signature.id}
            className="absolute pointer-events-auto"
            style={{
              left: canvasPosition.x,
              top: canvasPosition.y,
            }}
          >
            <EnhancedDraggableSignature
              signatureData={signature.data}
              position={{ x: 0, y: 0 }} // Position relative to the page container
              onPositionChange={(newCanvasPosition) => {
                // For react-pdf-viewer, coordinates are already in PDF space
                const pdfPosition = getPdfPosition(
                  newCanvasPosition.x, 
                  newCanvasPosition.y, 
                  signature.pageNumber
                );
                
                // Check for page boundary crossing
                const pageChange = detectPageChange(
                  { ...signature.position, ...pdfPosition }, 
                  signature.pageNumber
                );
                
                if (pageChange) {
                  // Move to new page
                  handleSignatureMove(
                    signature.id, 
                    pageChange.newPosition, 
                    pageChange.newPage
                  );
                } else {
                  // Update position on current page
                  handleSignatureMove(
                    signature.id, 
                    { ...signature.position, ...pdfPosition }, 
                    signature.pageNumber
                  );
                }
              }}
              onUpdate={(updates) => {
                handleSignatureUpdate(signature.id, updates);
              }}
              onRemove={() => handleSignatureRemove(signature.id)}
              className="z-30"
              pageBoundaries={getPageBoundaries(signature.pageNumber)}
              onPageChange={(newPage) => {
                // Handle page change from drag operations
                const currentPosition = signature.position;
                const pageChange = detectPageChange(currentPosition, newPage);
                if (pageChange) {
                  handleSignatureMove(
                    signature.id, 
                    pageChange.newPosition, 
                    pageChange.newPage
                  );
                }
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default SignatureOverlay;
