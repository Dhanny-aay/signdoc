"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Move, X, RotateCw, RotateCcw } from "lucide-react";

export default function EnhancedDraggableSignature({ 
  signatureData, 
  position, 
  onPositionChange, 
  onRemove,
  onUpdate,
  className = "" 
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const [initialRotation, setInitialRotation] = useState(0);
  
  const signatureRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Smooth updates using requestAnimationFrame for better performance
  const smoothUpdatePosition = useCallback((newPosition) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      onPositionChange(newPosition);
    });
  }, [onPositionChange]);

  const smoothUpdateSize = useCallback((newSize) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      onUpdate(prev => ({ ...prev, size: newSize }));
    });
  }, [onUpdate]);

  const smoothUpdateRotation = useCallback((newRotation) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      onUpdate(prev => ({ ...prev, rotation: newRotation }));
    });
  }, [onUpdate]);

  // Mouse event handlers
  const handleMouseDown = useCallback((e) => {
    if (e.target.closest('.resize-handle, .rotate-handle')) return;
    
    setIsDragging(true);
    const rect = signatureRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setDragOffset({ x, y });
    
    // Prevent text selection during drag
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging && !isResizing && !isRotating) return;
    
    if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Keep within reasonable bounds
      const currentSize = position.size || { width: 200, height: 80 };
      const maxX = window.innerWidth - currentSize.width;
      const maxY = window.innerHeight - currentSize.height;
      
      const boundedPosition = {
        x: Math.max(0, Math.min(maxX, newX)),
        y: Math.max(0, Math.min(maxY, newY))
      };
      
      smoothUpdatePosition(boundedPosition);
    }
    
    if (isResizing) {
      const rect = signatureRef.current.getBoundingClientRect();
      const newWidth = Math.max(50, Math.min(600, e.clientX - rect.left));
      const newHeight = Math.max(25, Math.min(400, e.clientY - rect.top));
      
      smoothUpdateSize({ width: newWidth, height: newHeight });
    }
    
    if (isRotating) {
      const rect = signatureRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
      let degrees = (angle * 180) / Math.PI;
      
      // Snap to 15-degree increments for easier alignment
      degrees = Math.round(degrees / 15) * 15;
      
      smoothUpdateRotation(degrees);
    }
  }, [isDragging, isResizing, isRotating, dragOffset, position, smoothUpdatePosition, smoothUpdateSize, onUpdate]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setIsRotating(false);
  }, []);

  // Handle resize start
  const handleResizeStart = useCallback((e) => {
    e.stopPropagation();
    setIsResizing(true);
    setInitialSize(position.size || { width: 200, height: 80 });
  }, []);

  // Handle rotation start
  const handleRotateStart = useCallback((e) => {
    e.stopPropagation();
    setIsRotating(true);
    setInitialRotation(position.rotation || 0);
  }, []);

  // Touch event handlers for mobile
  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    const touch = e.touches[0];
    
    // Check if touch is on a handle
    if (e.target.closest('.resize-handle, .rotate-handle')) return;
    
    const rect = signatureRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    setDragOffset({ x, y });
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    if (!isDragging) return;
    
    const touch = e.touches[0];
    const newX = touch.clientX - dragOffset.x;
    const newY = touch.clientY - dragOffset.y;
    
    const currentSize = position.size || { width: 200, height: 80 };
    const maxX = window.innerWidth - currentSize.width;
    const maxY = window.innerHeight - currentSize.height;
    
    const boundedPosition = {
      x: Math.max(0, Math.min(maxX, newX)),
      y: Math.max(0, Math.min(maxY, newY))
    };
    
    smoothUpdatePosition(boundedPosition);
  }, [isDragging, dragOffset, smoothUpdatePosition]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setIsRotating(false);
  }, []);

  // Handle resize touch events
  const handleResizeTouchStart = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    setInitialSize(position.size || { width: 200, height: 80 });
  }, []);

  // Handle rotation touch events
  const handleRotateTouchStart = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsRotating(true);
    setInitialRotation(position.rotation || 0);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing || isRotating) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, isResizing, isRotating, handleMouseMove, handleMouseUp]);

  // Cleanup animation frame
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  if (!signatureData) return null;

  const currentSize = position.size || { width: 200, height: 80 };
  const currentRotation = position.rotation || 0;

  return (
    <div
      ref={signatureRef}
      className={`absolute cursor-move select-none touch-none ${className}`}
      style={{
        left: position.x,
        top: position.y,
        width: currentSize.width,
        height: currentSize.height,
        transform: `rotate(${currentRotation}deg)`,
        transition: isDragging || isResizing || isRotating ? 'none' : 'transform 0.1s ease-out'
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Signature Image */}
      <img
        src={signatureData}
        alt="Signature"
        className="w-full h-full object-contain pointer-events-none select-none"
        draggable={false}
      />
      
      {/* Interactive Overlay */}
      <div className="absolute inset-0 bg-transparent hover:bg-blue-50 hover:bg-opacity-30 transition-colors duration-200 rounded touch-manipulation border-2 border-transparent hover:border-blue-300">
        <div className="absolute top-1 left-1 sm:top-2 sm:left-2 opacity-0 hover:opacity-100 transition-opacity duration-200">
          <Move size={14} className="text-blue-600 sm:w-4 sm:h-4" />
        </div>
      </div>
      
      {/* Blue Resize Handle */}
      <div
        className="resize-handle absolute bottom-0 right-0 w-6 h-6 sm:w-5 sm:h-5 cursor-se-resize opacity-0 hover:opacity-100 transition-opacity duration-200 touch-manipulation"
        onMouseDown={handleResizeStart}
        onTouchStart={handleResizeTouchStart}
      >
        <div className="w-4 h-4 sm:w-full sm:h-full bg-blue-600 rounded-full absolute bottom-1 right-1 sm:bottom-0 sm:right-0 shadow-md border-2 border-white"></div>
      </div>
      
      {/* Green Rotation Handle */}
      <div
        className="rotate-handle absolute top-0 right-0 w-6 h-6 sm:w-5 sm:h-5 cursor-grab active:cursor-grabbing opacity-0 hover:opacity-100 transition-opacity duration-200 touch-manipulation"
        onMouseDown={handleRotateStart}
        onTouchStart={handleRotateTouchStart}
      >
        <div className="w-4 h-4 sm:w-full sm:h-full bg-green-600 rounded-full flex items-center justify-center absolute top-1 right-1 sm:top-0 sm:right-0 shadow-md border-2 border-white">
          <RotateCw size={10} className="text-white sm:w-3 sm:h-3" />
        </div>
      </div>
      
      {/* Remove Button */}
      <button
        onClick={onRemove}
        className="absolute -top-3 -right-3 w-7 h-7 sm:w-6 sm:h-6 bg-red-500 text-white rounded-full opacity-0 hover:opacity-100 transition-all duration-200 flex items-center justify-center hover:bg-red-600 touch-manipulation shadow-md border-2 border-white hover:scale-110"
      >
        <X size={14} className="sm:w-4 sm:h-4" />
      </button>
      
      {/* Position Indicator */}
      <div className="absolute -top-8 sm:-top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-lg">
        <div className="text-center">
          <div>Position: {Math.round(position.x)}, {Math.round(position.y)}</div>
          <div className="text-gray-300">Size: {Math.round(currentSize.width)}×{Math.round(currentSize.height)}</div>
          {currentRotation !== 0 && <div className="text-gray-300">Rotation: {Math.round(currentRotation)}°</div>}
        </div>
      </div>
    </div>
  );
}

