"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { getStroke } from "perfect-freehand";
import { PenTool, RotateCcw, Check } from "lucide-react";

export default function SignatureCanvas({ onSignatureComplete, className = "" }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState([]);
  const [hasSignature, setHasSignature] = useState(false);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      
      // Redraw signature if it exists
      if (points.length > 0) {
        drawSignature();
      }
    };
    
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [points]);

  // Draw signature using Perfect Freehand
  const drawSignature = useCallback(() => {
    if (!canvasRef.current || points.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Generate stroke path
    const stroke = getStroke(points, {
      size: 2,
      thinning: 0.5,
      smoothing: 0.5,
      streamline: 0.5,
    });
    
    if (stroke.length > 0) {
      ctx.fillStyle = "#1f2937";
      ctx.beginPath();
      ctx.moveTo(stroke[0][0], stroke[0][1]);
      
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i][0], stroke[i][1]);
      }
      
      ctx.closePath();
      ctx.fill();
    }
  }, [points]);

  // Mouse event handlers
  const handleMouseDown = useCallback((e) => {
    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPoints([[x, y, 1]]);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDrawing) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setPoints(prev => [...prev, [x, y, 1]]);
  }, [isDrawing]);

  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);
    if (points.length > 2) {
      setHasSignature(true);
    }
  }, [points.length]);

  // Touch event handlers for mobile
  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    setIsDrawing(true);
    setPoints([[x, y, 1]]);
  }, []);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    if (!isDrawing) return;
    
    const touch = e.touches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    setPoints(prev => [...prev, [x, y, 1]]);
  }, [isDrawing]);

  const handleTouchEnd = useCallback(() => {
    setIsDrawing(false);
    if (points.length > 2) {
      setHasSignature(true);
    }
  }, [points.length]);

  // Clear canvas
  const clearCanvas = useCallback(() => {
    setPoints([]);
    setHasSignature(false);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, []);

  // Complete signature
  const completeSignature = useCallback(() => {
    if (!hasSignature || points.length === 0) return;
    
    // Create a new canvas for the signature
    const signatureCanvas = document.createElement("canvas");
    const signatureCtx = signatureCanvas.getContext("2d");
    
    // Set dimensions
    signatureCanvas.width = 400;
    signatureCanvas.height = 150;
    
    // Scale points to fit the signature canvas
    const bounds = getBounds(points);
    const scale = Math.min(350 / bounds.width, 120 / bounds.height);
    const offsetX = (400 - bounds.width * scale) / 2;
    const offsetY = (150 - bounds.height * scale) / 2;
    
    const scaledPoints = points.map(([x, y, pressure]) => [
      (x - bounds.minX) * scale + offsetX,
      (y - bounds.minY) * scale + offsetY,
      pressure
    ]);
    
    // Draw signature on the new canvas
    const stroke = getStroke(scaledPoints, {
      size: 2,
      thinning: 0.5,
      smoothing: 0.5,
      streamline: 0.5,
    });
    
    if (stroke.length > 0) {
      signatureCtx.fillStyle = "#1f2937";
      signatureCtx.beginPath();
      signatureCtx.moveTo(stroke[0][0], stroke[0][1]);
      
      for (let i = 1; i < stroke.length; i++) {
        signatureCtx.lineTo(stroke[i][0], stroke[i][1]);
      }
      
      signatureCtx.closePath();
      signatureCtx.fill();
    }
    
    const dataUrl = signatureCanvas.toDataURL();
    onSignatureComplete(dataUrl);
  }, [hasSignature, points, onSignatureComplete]);

  // Get bounds of points
  const getBounds = (pts) => {
    if (pts.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
    
    let minX = pts[0][0], maxX = pts[0][0];
    let minY = pts[0][1], maxY = pts[0][1];
    
    for (const [x, y] of pts) {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
    
    return {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY
    };
  };

  // Redraw when points change
  useEffect(() => {
    drawSignature();
  }, [drawSignature]);

  return (
    <div className={`space-y-3 sm:space-y-4 ${className}`}>
      <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          className="w-full h-40 sm:h-48 lg:h-64 cursor-crosshair touch-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
      </div>
      
      <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 xs:gap-3">
        <button
          onClick={clearCanvas}
          className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors text-sm flex-1 xs:flex-none"
        >
          <RotateCcw size={14} />
          Clear
        </button>
        
        <button
          onClick={completeSignature}
          disabled={!hasSignature}
          className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex-1 xs:flex-none"
        >
          <Check size={14} />
          Complete Signature
        </button>
      </div>
      
      {hasSignature && (
        <div className="text-xs sm:text-sm text-green-600 flex items-center gap-2 justify-center xs:justify-start">
          <Check size={14} />
          Signature ready to use
        </div>
      )}
    </div>
  );
}


