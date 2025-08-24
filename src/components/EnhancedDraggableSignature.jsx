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
  const [resizeOffset, setResizeOffset] = useState({ x: 0, y: 0 });
  const [rotationOffset, setRotationOffset] = useState(0);
  
  const signatureRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Smooth position update using requestAnimationFrame
  const smoothUpdatePosition = useCallback((newPosition) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      onPositionChange(newPosition);
    });
  }, [onPositionChange]);

  // Smooth size update
  const smoothUpdateSize = useCallback((newSize) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      onUpdate(prev => ({ ...prev, size: newSize }));
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
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging && !isResizing && !isRotating) return;
    
    if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Keep within viewport bounds
      const maxX = window.innerWidth - 200;
      const maxY = window.innerHeight - 100;
      
      const boundedPosition = {
        x: Math.max(0, Math.min(maxX, newX)),
        y: Math.max(0, Math.min(maxY, newY))
      };
      
      smoothUpdatePosition(boundedPosition);
    }
    
    if (isResizing) {
      const newWidth = Math.max(100, Math.min(500, e.clientX - position.x));
      const newHeight = Math.max(50, Math.min(300, e.clientY - position.y));
      
      smoothUpdateSize({ width: newWidth, height: newHeight });
    }
    
    if (isRotating) {
      const rect = signatureRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
      const degrees = (angle * 180) / Math.PI;
      
      onUpdate(prev => ({ ...prev, rotation: degrees }));
    }
  }, [isDragging, isResizing, isRotating, dragOffset, position, smoothUpdatePosition, smoothUpdateSize, onUpdate]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setIsRotating(false);
  }, []);

  // Resize handlers
  const handleResizeStart = useCallback((e) => {
    e.stopPropagation();
    setIsResizing(true);
    const rect = signatureRef.current.getBoundingClientRect();
    const x = e.clientX - rect.right;
    const y = e.clientY - rect.bottom;
    setResizeOffset({ x, y });
  }, []);

  // Rotation handlers
  const handleRotateStart = useCallback((e) => {
    e.stopPropagation();
    setIsRotating(true);
    const rect = signatureRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    setRotationOffset(angle);
  }, []);

  // Touch event handlers for mobile
  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    const touch = e.touches[0];
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
    
    const maxX = window.innerWidth - 200;
    const maxY = window.innerHeight - 100;
    
    const boundedPosition = {
      x: Math.max(0, Math.min(maxX, newX)),
      y: Math.max(0, Math.min(maxY, newY))
    };
    
    smoothUpdatePosition(boundedPosition);
  }, [isDragging, dragOffset, smoothUpdatePosition]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing || isRotating) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
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

  return (
    <div
      ref={signatureRef}
      className={`absolute cursor-move select-none touch-none ${className}`}
      style={{
        left: position.x,
        top: position.y,
        width: position.size?.width || 200,
        height: position.size?.height || 80,
        transform: `rotate(${position.rotation || 0}deg)`,
        transition: isDragging || isResizing || isRotating ? 'none' : 'transform 0.1s ease-out'
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Signature Image */}
      <img
        src={signatureData}
        alt="Signature"
        className="w-full h-full object-contain pointer-events-none select-none"
        draggable={false}
      />
      
      {/* Drag Handle */}
      <div className="absolute inset-0 bg-transparent hover:bg-blue-50 hover:bg-opacity-20 transition-colors duration-200 rounded touch-manipulation">
        <div className="absolute top-1 left-1 sm:top-2 sm:left-2 opacity-0 hover:opacity-100 transition-opacity duration-200">
          <Move size={14} className="text-blue-600 sm:w-4 sm:h-4" />
        </div>
      </div>
      
      {/* Resize Handle */}
      <div
        className="resize-handle absolute bottom-0 right-0 w-5 h-5 sm:w-4 sm:h-4 cursor-se-resize opacity-0 hover:opacity-100 transition-opacity duration-200 touch-manipulation"
        onMouseDown={handleResizeStart}
      >
        <div className="w-3 h-3 sm:w-full sm:h-full bg-blue-600 rounded-full absolute bottom-1 right-1 sm:bottom-0 sm:right-0"></div>
      </div>
      
      {/* Rotation Handle */}
      <div
        className="rotate-handle absolute top-0 right-0 w-5 h-5 sm:w-4 sm:h-4 cursor-grab opacity-0 hover:opacity-100 transition-opacity duration-200 touch-manipulation"
        onMouseDown={handleRotateStart}
      >
        <div className="w-3 h-3 sm:w-full sm:h-full bg-green-600 rounded-full flex items-center justify-center absolute top-1 right-1 sm:top-0 sm:right-0">
          <RotateCw size={8} className="text-white sm:w-3 sm:h-3" />
        </div>
      </div>
      
      {/* Remove Button */}
      <button
        onClick={onRemove}
        className="absolute -top-2 -right-2 w-6 h-6 sm:w-5 sm:h-5 bg-red-500 text-white rounded-full opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center hover:bg-red-600 touch-manipulation"
      >
        <X size={12} className="sm:w-3 sm:h-3" />
      </button>
      
      {/* Position Indicator */}
      <div className="absolute -top-6 sm:-top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
        {Math.round(position.x)}, {Math.round(position.y)}
      </div>
    </div>
  );
}

