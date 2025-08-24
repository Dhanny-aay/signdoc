"use client";

import { useState } from "react";
import { 
  PenTool, 
  Type, 
  RotateCcw, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Download,
  Undo2,
  Redo2,
  X
} from "lucide-react";

export default function SignatureToolbar({ 
  signatureMethod, 
  onSignatureMethodChange,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onFitToScreen,
  onActualSize,
  onDownload,
  canUndo = false,
  canRedo = false,
  className = ""
}) {
  const [showSignaturePanel, setShowSignaturePanel] = useState(false);

  return (
    <div className={`bg-white border-b border-gray-200 shadow-sm ${className}`}>
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Signature Tools */}
          <div className="flex items-center gap-4">
            {/* Signature Method Tabs */}
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              {[
                { id: "drawn", label: "Draw", icon: PenTool },
                { id: "typed", label: "Type", icon: Type }
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => onSignatureMethodChange(method.id)}
                  className={`flex items-center gap-2 px-4 py-2 font-medium transition-all duration-200 ${
                    signatureMethod === method.id
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <method.icon size={18} />
                  {method.label}
                </button>
              ))}
            </div>

            {/* Undo/Redo */}
            <div className="flex items-center gap-1">
              <button
                onClick={onUndo}
                disabled={!canUndo}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                title="Undo"
              >
                <Undo2 size={18} />
              </button>
              <button
                onClick={onRedo}
                disabled={!canRedo}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                title="Redo"
              >
                <RotateCw size={18} />
              </button>
            </div>
          </div>

          {/* Center Section - Document Info */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="font-medium">Document Signing</span>
          </div>

          {/* Right Section - View Controls */}
          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={onZoomOut}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut size={18} />
              </button>
              <button
                onClick={onFitToScreen}
                className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors border-l border-r border-gray-200"
                title="Fit to Screen"
              >
                <Maximize2 size={18} />
              </button>
              <button
                onClick={onActualSize}
                className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors border-r border-gray-200"
                title="Actual Size"
              >
                <RotateCcw size={18} />
              </button>
              <button
                onClick={onZoomIn}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                title="Zoom In"
              >
                <ZoomIn size={18} />
              </button>
            </div>

            {/* Download Button */}
            <button
              onClick={onDownload}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Download size={18} />
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

