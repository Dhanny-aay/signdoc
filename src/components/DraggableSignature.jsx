"use client";

import { useState, useRef, useEffect } from "react";
import { Move, X, Check } from "lucide-react";

export default function DraggableSignature({ 
  signatureData, 
  position, 
  onPositionChange, 
  onRemove,
  className = "" 
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [size, setSize] = useState({ width: 200, height: 80 });
  const signatureRef = useRef(null);

  const handleMouseDown = (e) => {
    if (e.target.closest('.resize-handle')) return;
    
    setIsDragging(true);
    const rect = signatureRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setDragOffset({ x, y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging && !isResizing) return;
    
    if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      onPositionChange({
        x: Math.max(0, Math.min(newX, window.innerWidth - size.width)),
        y: Math.max(0, Math.min(newY, window.innerHeight - size.height))
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const handleResizeStart = (e) => {
    e.stopPropagation();
    setIsResizing(true);
  };

  const handleResize = (e) => {
    if (!isResizing) return;
    
    const newWidth = Math.max(100, Math.min(400, e.clientX - position.x));
    const newHeight = Math.max(50, Math.min(200, e.clientY - position.y));
    
    setSize({ width: newWidth, height: newHeight });
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragOffset, position, size]);

  if (!signatureData) return null;

  return (
    <div
      ref={signatureRef}
      className={`absolute cursor-move select-none ${className}`}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Signature Image */}
      <img
        src={signatureData}
        alt="Signature"
        className="w-full h-full object-contain pointer-events-none"
        draggable={false}
      />
      
      {/* Drag Handle */}
      <div className="absolute inset-0 bg-transparent hover:bg-blue-50 hover:bg-opacity-20 transition-colors duration-200 rounded">
        <div className="absolute top-2 left-2 opacity-0 hover:opacity-100 transition-opacity duration-200">
          <Move size={16} className="text-blue-600" />
        </div>
      </div>
      
      {/* Resize Handle */}
      <div
        className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-0 hover:opacity-100 transition-opacity duration-200"
        onMouseDown={handleResizeStart}
        onMouseMove={handleResize}
      >
        <div className="w-full h-full bg-blue-600 rounded-full"></div>
      </div>
      
      {/* Remove Button */}
      <button
        onClick={onRemove}
        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center hover:bg-red-600"
      >
        <X size={14} />
      </button>
      
      {/* Position Indicator */}
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
        Position: {Math.round(position.x)}, {Math.round(position.y)}
      </div>
    </div>
  );
}


