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

  return (
    <div
      className={`fixed z-50 bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-xl ${className}`}
      style={{
        left: position.x,
        top: position.y,
        width: window.innerWidth < 640 ? '90vw' : '380px',
        maxWidth: '90vw',
        maxHeight: window.innerWidth < 640 ? '80vh' : '600px'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl sm:rounded-t-2xl cursor-move">
        <div className="flex items-center gap-2">
          <Move size={14} className="text-gray-500" />
          <span className="text-sm sm:text-base font-medium text-gray-700">
            {signatureMethod === 'drawn' ? 'Draw Signature' : 'Type Signature'}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <X size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 max-h-[70vh] sm:max-h-[500px] overflow-y-auto">
        {signatureMethod === "drawn" && (
          <SignatureCanvas onSignatureComplete={onSignatureComplete} />
        )}

        {signatureMethod === "typed" && (
          <TypedSignature onSignatureComplete={onSignatureComplete} />
        )}
      </div>

    </div>
  );
}

