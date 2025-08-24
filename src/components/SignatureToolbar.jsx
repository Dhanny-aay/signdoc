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
    <div className={`bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40 ${className}`}>
      <div className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 lg:gap-4">
          {/* Left Section - Signature Tools */}
          <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2 sm:gap-3">
            {/* Signature Method Tabs */}
            <div className="flex border border-gray-200 rounded-lg overflow-hidden w-full xs:w-auto">
              {[
                { id: "drawn", label: "Draw", icon: PenTool },
                { id: "typed", label: "Type", icon: Type }
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => onSignatureMethodChange(method.id)}
                  className={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-4 py-2 font-medium transition-all duration-200 text-xs sm:text-sm lg:text-base flex-1 xs:flex-none ${
                    signatureMethod === method.id
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <method.icon size={14} className="sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">{method.label}</span>
                </button>
              ))}
            </div>

            {/* Undo/Redo */}
            <div className="flex items-center gap-1">
              <button
                onClick={onUndo}
                disabled={!canUndo}
                className="p-1.5 sm:p-2 rounded-lg border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0"
                title="Undo"
              >
                <Undo2 size={14} className="sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={onRedo}
                disabled={!canRedo}
                className="p-1.5 sm:p-2 rounded-lg border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0"
                title="Redo"
              >
                <RotateCw size={14} className="sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          {/* Center Section - Document Info */}
          <div className="hidden xl:flex items-center gap-4 text-sm text-gray-600 flex-shrink-0">
            <span className="font-medium">Document Signing</span>
          </div>

          {/* Right Section - View Controls */}
          <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 xs:gap-3">
            {/* Zoom Controls */}
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden flex-shrink-0">
              <button
                onClick={onZoomOut}
                className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut size={14} />
              </button>
              <button
                onClick={onFitToScreen}
                className="px-2 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors border-l border-r border-gray-200"
                title="Fit to Screen"
              >
                <Maximize2 size={14} />
              </button>
              <button
                onClick={onActualSize}
                className="px-2 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors border-r border-gray-200"
                title="Actual Size"
              >
                <RotateCcw size={14} />
              </button>
              <button
                onClick={onZoomIn}
                className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                title="Zoom In"
              >
                <ZoomIn size={14} />
              </button>
            </div>

            {/* Download Button */}
            <button
              onClick={onDownload}
              className="w-full xs:w-auto inline-flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md text-xs sm:text-sm lg:text-base flex-shrink-0"
            >
              <Download size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline lg:inline">Download</span>
              <span className="sm:hidden lg:hidden">Save</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

