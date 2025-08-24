"use client";

import { useState, useEffect } from "react";
import { Type, Check } from "lucide-react";

const SIGNATURE_FONTS = [
  { name: "Dancing Script", value: "Dancing Script", category: "Cursive" },
  { name: "Great Vibes", value: "Great Vibes", category: "Elegant" },
  { name: "Pacifico", value: "Pacifico", category: "Casual" },
  { name: "Satisfy", value: "Satisfy", category: "Handwriting" },
  { name: "Kaushan Script", value: "Kaushan Script", category: "Formal" },
  { name: "Allura", value: "Allura", category: "Decorative" },
  { name: "Alex Brush", value: "Alex Brush", category: "Signature" },
  { name: "Tangerine", value: "Tangerine", category: "Classic" }
];

export default function TypedSignature({ onSignatureComplete, className = "" }) {
  const [selectedFont, setSelectedFont] = useState("Dancing Script");
  const [typedSignature, setTypedSignature] = useState("");
  const [fontSize, setFontSize] = useState(48);
  const [fontColor, setFontColor] = useState("#1f2937");

  // Load Google Fonts
  useEffect(() => {
    const link = document.createElement("link");
    link.href = `https://fonts.googleapis.com/css2?family=${SIGNATURE_FONTS.map(f => f.value.replace(" ", "+")).join(":wght@400&family=")}:wght@400&display=swap`;
    link.rel = "stylesheet";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const generateTypedSignature = () => {
    if (!typedSignature.trim()) return;
    
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
    // Set canvas size
    canvas.width = 600;
    canvas.height = 200;
    
    // Set background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Set font properties
    ctx.font = `${fontSize}px "${selectedFont}"`;
    ctx.fillStyle = fontColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    // Measure text for better positioning
    const metrics = ctx.measureText(typedSignature);
    const textWidth = metrics.width;
    const textHeight = fontSize;
    
    // Center the text
    const x = canvas.width / 2;
    const y = canvas.height / 2;
    
    // Add subtle shadow for depth
    ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
    ctx.shadowBlur = 2;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    
    // Draw the text
    ctx.fillText(typedSignature, x, y);
    
    // Reset shadow
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    const dataUrl = canvas.toDataURL();
    onSignatureComplete(dataUrl);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Font Selection */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
          Choose Font Style
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          {SIGNATURE_FONTS.map((font) => (
            <button
              key={font.value}
              onClick={() => setSelectedFont(font.value)}
              className={`p-3 sm:p-4 border rounded-lg text-left transition-all duration-200 ${
                selectedFont === font.value
                  ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div 
                className="text-base sm:text-lg font-medium mb-1"
                style={{ fontFamily: font.value }}
              >
                {font.name}
              </div>
              <div className="text-xs sm:text-sm text-gray-500">{font.category}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
          Font Size: {fontSize}px
        </label>
        <input
          type="range"
          min="24"
          max="72"
          value={fontSize}
          onChange={(e) => setFontSize(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>

      {/* Font Color */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
          Font Color
        </label>
        <div className="flex flex-wrap gap-2">
          {["#1f2937", "#dc2626", "#059669", "#7c3aed", "#ea580c", "#0891b2"].map((color) => (
            <button
              key={color}
              onClick={() => setFontColor(color)}
              className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 transition-all duration-200 ${
                fontColor === color ? "border-gray-400 scale-110" : "border-gray-200"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Text Input */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
          Your Name
        </label>
        <input
          type="text"
          value={typedSignature}
          onChange={(e) => setTypedSignature(e.target.value)}
          placeholder="Enter your name"
          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-lg"
        />
      </div>

      {/* Preview */}
      {typedSignature && (
        <div className="p-4 sm:p-6 border border-gray-200 rounded-lg bg-gray-50">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
            Preview
          </label>
          <div 
            className="text-center p-3 sm:p-4 bg-white rounded border overflow-hidden"
            style={{ 
              fontFamily: selectedFont, 
              fontSize: `${Math.min(fontSize, window.innerWidth < 640 ? 32 : fontSize)}px`, 
              color: fontColor 
            }}
          >
            {typedSignature}
          </div>
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={generateTypedSignature}
        disabled={!typedSignature.trim()}
        className="w-full inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white font-semibold rounded-lg sm:rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base"
      >
        <Type size={16} />
        Generate Signature
      </button>
    </div>
  );
}


