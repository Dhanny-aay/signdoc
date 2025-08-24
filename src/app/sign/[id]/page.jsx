"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

import NavBar from "@/components/NavBar";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import SignatureToolbar from "@/components/SignatureToolbar";
import FloatingSignaturePanel from "@/components/FloatingSignaturePanel";
import EnhancedDraggableSignature from "@/components/EnhancedDraggableSignature";

import { 
  Loader2, 
  FileText,
  CheckCircle,
  Plus
} from "lucide-react";
import PdfLibViewer from "@/lib/PdfLibViewer ";
// import SafePdfLibViewer from "@/lib/PdfLibViewer ";

export default function SignDocumentPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [docData, setDocData] = useState(null);
  const [loadingDoc, setLoadingDoc] = useState(true);
  const [signatureMethod, setSignatureMethod] = useState(null);
  const [signatures, setSignatures] = useState([]);
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfScale, setPdfScale] = useState(1.0);
  const [showSignaturePanel, setShowSignaturePanel] = useState(false);
  const [pendingSignaturePosition, setPendingSignaturePosition] = useState(null);
  
  // History for undo/redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    async function fetchDoc() {
      if (!params?.id) return;
      const { data, error } = await supabase
        .from("documents")
        .select("id, file_name, url, status, signature_data_url, signature_position")
        .eq("id", params.id)
        .single();
      if (error || !data) {
        toast.error("Document not found");
        router.replace("/dashboard");
        return;
      }
      setDocData({
        id: data.id,
        fileName: data.file_name,
        url: data.url,
        status: data.status,
      });
      
      // Load existing signatures if any
      if (data.signature_data_url && data.signature_position) {
        const existingSignature = {
          id: Date.now(),
          data: data.signature_data_url,
          pageNumber: data.signature_position.pageNumber || 1,
          position: {
            x: data.signature_position.x || 100,
            y: data.signature_position.y || 100,
            size: data.signature_position.size || { width: 200, height: 80 },
            rotation: data.signature_position.rotation || 0
          }
        };
        setSignatures([existingSignature]);
        addToHistory([existingSignature]);
      }
      
      setLoadingDoc(false);
    }
    fetchDoc();
  }, [params?.id, router]);

  // History management
  const addToHistory = useCallback((newSignatures) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newSignatures]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setSignatures([...history[newIndex]]);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setSignatures([...history[newIndex]]);
    }
  }, [history, historyIndex]);

  // PDF page click handler for signature placement
  const handlePageClick = useCallback((clickData) => {
    if (!signatureMethod) {
      // If no signature method is selected, show options
      setPendingSignaturePosition(clickData);
      setShowSignaturePanel(true);
      return;
    }
    
    // If signature method is selected, place signature at click position
    setPendingSignaturePosition(clickData);
    setShowSignaturePanel(true);
  }, [signatureMethod]);

  // Signature management
  const handleSignatureComplete = useCallback((dataUrl) => {
    const position = pendingSignaturePosition || { x: 100, y: 100, pageNumber: 1 };
    
    const newSignature = {
      id: Date.now(),
      data: dataUrl,
      pageNumber: position.pageNumber || 1,
      position: {
        x: position.x,
        y: position.y,
        size: { width: 200, height: 80 },
        rotation: 0
      }
    };
    
    const newSignatures = [...signatures, newSignature];
    setSignatures(newSignatures);
    addToHistory(newSignatures);
    
    setShowSignaturePanel(false);
    setSignatureMethod(null);
    setPendingSignaturePosition(null);
    toast.success("Signature added successfully!");
  }, [signatures, addToHistory, pendingSignaturePosition]);

  const handleSignaturePositionChange = useCallback((signatureId, newPosition) => {
    const updatedSignatures = signatures.map(sig => 
      sig.id === signatureId 
        ? { ...sig, position: { ...sig.position, ...newPosition } }
        : sig
    );
    setSignatures(updatedSignatures);
    addToHistory(updatedSignatures);
  }, [signatures, addToHistory]);

  const handleSignatureUpdate = useCallback((signatureId, updates) => {
    const updatedSignatures = signatures.map(sig => 
      sig.id === signatureId 
        ? { ...sig, position: { ...sig.position, ...updates } }
        : sig
    );
    setSignatures(updatedSignatures);
  }, [signatures]);

  const handleSignatureRemove = useCallback((signatureId) => {
    const newSignatures = signatures.filter(sig => sig.id !== signatureId);
    setSignatures(newSignatures);
    addToHistory(newSignatures);
    toast.success("Signature removed");
  }, [signatures, addToHistory]);

  // PDF controls
  const handleZoomIn = useCallback(() => {
    setPdfScale(prev => Math.min(3.0, prev + 0.25));
  }, []);

  const handleZoomOut = useCallback(() => {
    setPdfScale(prev => Math.max(0.5, prev - 0.25));
  }, []);

  const handleFitToScreen = useCallback(() => {
    setPdfScale(1.0);
  }, []);

  const handleActualSize = useCallback(() => {
    setPdfScale(1.0);
  }, []);

  // Document operations
  const handleSaveDocument = useCallback(async () => {
    try {
      if (signatures.length === 0) {
        toast.error("Please add at least one signature");
        return;
      }

      // Save signature data and positions
      const signatureData = signatures[0]; // For now, save the first signature
      const { error } = await supabase
        .from("documents")
        .update({ 
          status: "signed", 
          signature_data_url: signatureData.data,
          signature_position: {
            ...signatureData.position,
            pageNumber: signatureData.pageNumber
          }
        })
        .eq("id", docData.id);
      
      if (error) throw error;
      
      toast.success("Document signed successfully!");
      router.replace("/dashboard");
    } catch (err) {
      toast.error(err.message || "Failed to save document");
    }
  }, [signatures, docData, router]);

  const handleDownload = useCallback(async () => {
    if (signatures.length === 0) {
      toast.error("Please add at least one signature first");
      return;
    }
    
    try {
      // Call the download function exposed by the PDF viewer
      if (window.downloadSignedPdf) {
        await window.downloadSignedPdf();
        toast.success("PDF downloaded successfully!");
      } else {
        toast.error("PDF viewer not ready. Please try again.");
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error("Failed to download PDF: " + error.message);
    }
  }, [signatures]);

  const handleSignatureMethodChange = useCallback((method) => {
    setSignatureMethod(method);
    if (!pendingSignaturePosition) {
      toast.info("Click on the document where you want to place the signature");
    } else {
      setShowSignaturePanel(true);
    }
  }, [pendingSignaturePosition]);

  const handleCloseSignaturePanel = useCallback(() => {
    setShowSignaturePanel(false);
    setSignatureMethod(null);
    setPendingSignaturePosition(null);
  }, []);

  const handleDocumentLoadSuccess = useCallback(({ numPages }) => {
    setNumPages(numPages);
    toast.success(`Document loaded with ${numPages} pages`);
  }, []);

  if (loadingDoc) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="inline-flex items-center gap-2 text-gray-600">
          <Loader2 className="animate-spin" /> Loading document...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar />
      
      {/* Top Toolbar */}
      <SignatureToolbar
        signatureMethod={signatureMethod}
        onSignatureMethodChange={handleSignatureMethodChange}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitToScreen={handleFitToScreen}
        onActualSize={handleActualSize}
        onDownload={handleDownload}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Document Header */}
        <div className="px-6 py-4 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{docData.fileName}</h1>
              <p className="text-gray-600">
                {numPages ? `${numPages} pages` : 'Loading...'} • 
                {signatures.length} signature{signatures.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSignaturePanel(true)}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} className="inline mr-2" />
                Add Signature
              </button>
              
              <button
                onClick={handleSaveDocument}
                disabled={signatures.length === 0}
                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <CheckCircle size={20} className="inline mr-2" />
                Save Document
              </button>
            </div>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-auto bg-gray-100">
          <div className="p-6 flex justify-center">
            <PdfLibViewer
              url={docData.url}
              signatures={signatures}
              scale={pdfScale}
              onDocumentLoad={handleDocumentLoadSuccess}
              onPageClick={handlePageClick}
              className="max-w-4xl"
            />
          </div>
        </div>
      </main>

      {/* Floating Signature Panel */}
      {showSignaturePanel && (
        <FloatingSignaturePanel
          signatureMethod={signatureMethod}
          onSignatureComplete={handleSignatureComplete}
          onClose={handleCloseSignaturePanel}
        />
      )}
    </div>
  );
}