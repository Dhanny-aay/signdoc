"use client";

import { useState, useEffect } from "react";
import SignatureCanvas from "./SignatureCanvas";
import TypedSignature from "./TypedSignature";
import { X, Move } from "lucide-react";

export default function FloatingSignaturePanel({ 
  signatureMethod, 
  onSignatureComplete, 
  onClose,
  className = "" 
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Handle panel dragging
  const handleMouseDown = (e) => {
    if (e.target.closest('button, input, canvas')) return;
    
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setDragOffset({ x, y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    // Keep panel within viewport bounds
    const maxX = window.innerWidth - 400;
    const maxY = window.innerHeight - 600;
    
    setPosition({
      x: Math.max(20, Math.min(maxX, newX)),
      y: Math.max(20, Math.min(maxY, newY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  if (!signatureMethod) return null;

  // Responsive positioning and sizing
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const isTablet = typeof window !== 'undefined' && window.innerWidth < 1024;
  
  const panelWidth = isMobile ? '95vw' : isTablet ? '400px' : '420px';
  const panelHeight = isMobile ? '85vh' : '600px';
  const panelX = isMobile ? '2.5vw' : Math.min(position.x, window.innerWidth - 440);
  const panelY = isMobile ? '5vh' : Math.min(position.y, window.innerHeight - 620);

  return (
    <div
      className={`fixed z-50 bg-white rounded-lg sm:rounded-xl lg:rounded-2xl border border-gray-200 shadow-xl ${className}`}
      style={{
        left: panelX,
        top: panelY,
        width: panelWidth,
        maxWidth: '95vw',
        maxHeight: panelHeight
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg sm:rounded-t-xl lg:rounded-t-2xl cursor-move">
        <div className="flex items-center gap-2">
          <Move size={14} className="text-gray-500 hidden sm:block" />
          <span className="text-sm sm:text-base font-medium text-gray-700">
            {signatureMethod === 'drawn' ? 'Draw Signature' : 'Type Signature'}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 sm:p-1 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <X size={16} className="text-gray-500 sm:w-4 sm:h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 lg:p-6 max-h-[75vh] sm:max-h-[500px] overflow-y-auto">
        {signatureMethod === "drawn" && (
          <SignatureCanvas onSignatureComplete={onSignatureComplete} />
        )}

        {signatureMethod === "typed" && (
          <TypedSignature onSignatureComplete={onSignatureComplete} />
        )}
      </div>
      
      {/* Mobile close button */}
      {isMobile && (
        <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button onClick={onClose} className="w-full py-2 text-center text-gray-600 hover:text-gray-800 transition-colors">
            Close Panel
          </button>
        </div>
      )}

    </div>
  );
}

