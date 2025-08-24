"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Loader2, Upload, FileText, X, CheckCircle, Cloud } from "lucide-react";

export default function UploadPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
        toast.success("PDF file selected");
      } else {
        toast.error("Please select a PDF file");
      }
    }
  }, []);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
        toast.success("PDF file selected");
      } else {
        toast.error("Please select a PDF file");
      }
    }
  };

  const removeFile = () => {
    setFile(null);
    setUploadProgress(0);
  };

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return;
    
    setSubmitting(true);
    setUploadProgress(0);
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Save to Supabase
      const { data: inserted, error } = await supabase
        .from("documents")
        .insert({
          owner_uid: user.id,
          file_name: file.name,
          url: data.secure_url,
          status: "ready",
        })
        .select("id")
        .single();
      
      if (error) throw error;

      toast.success("Document uploaded successfully!");
      setTimeout(() => {
        router.replace(`/sign/${inserted.id}`);
      }, 1000);
      
    } catch (err) {
      toast.error(err.message || "Upload failed");
      setUploadProgress(0);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar />
      <main className="flex-1 max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Upload Your Document</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload a PDF document to get started with the signing process. Your files are securely stored on Cloudinary.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleUpload} className="space-y-6">
            {/* Drag & Drop Area */}
            <div
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
                dragActive
                  ? "border-blue-400 bg-blue-50"
                  : file
                  ? "border-green-400 bg-green-50"
                  : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {!file ? (
                <div>
                  <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Upload className="text-gray-400" size={32} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Drop your PDF here
                  </h3>
                  <p className="text-gray-600 mb-4">
                    or click to browse files
                  </p>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    <FileText size={20} />
                    Choose PDF File
                  </label>
                </div>
              ) : (
                <div>
                  <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="text-green-600" size={32} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    File Selected
                  </h3>
                  <p className="text-gray-600 mb-4 font-mono text-sm">
                    {file.name}
                  </p>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <X size={20} />
                    Remove File
                  </button>
                </div>
              )}
            </div>

            {/* Upload Progress */}
            {submitting && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Uploading to Cloudinary...</span>
                  <span className="font-medium text-gray-900">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Upload Button */}
            <button
              type="submit"
              disabled={!file || submitting}
              className="w-full inline-flex items-center justify-center gap-3 rounded-xl bg-blue-600 text-white py-4 font-semibold text-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  {uploadProgress === 100 ? "Processing..." : "Uploading..."}
                </>
              ) : (
                <>
                  <Cloud size={20} />
                  Upload and Continue to Signing
                </>
              )}
            </button>
          </form>

          {/* Info Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span>Secure cloud storage</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span>Instant processing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span>PDF format only</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


