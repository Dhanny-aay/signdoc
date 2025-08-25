import Link from "next/link";
import NavBar from "@/components/NavBar";
import {
  FileText,
  Shield,
  Zap,
  Users,
  CheckCircle,
  ArrowRight,
  Download,
  Edit3,
  PenTool,
  Type,
  MousePointer,
  Maximize2,
  Undo2,
  Redo2,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavBar />

      {/* Hero Section */}
      <main className="flex-1">
        <section className="bg-grid px-4 sm:px-6 md:px-8 lg:px-14 w-full py-12 sm:py-16 lg:py-20 bg-[radial-gradient(circle,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 mb-4 sm:mb-6">
              Full-Canvas Document Signing
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8 sm:mb-10 px-4">
              Experience signdoc 4.0 with a revolutionary toolbar-driven
              interface. Maximize your workspace with full-canvas PDF viewing
              and smooth, responsive signature placement.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
              <Link
                href="/login"
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-blue-600 text-white font-semibold text-base sm:text-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Start Signing Free
                <ArrowRight className="inline ml-2" size={20} />
              </Link>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold text-base sm:text-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 sm:px-6 md:px-8 lg:px-14 w-full py-12 sm:py-16 lg:py-20 bg-gray-50">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Revolutionary Toolbar-Driven Interface
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Built for maximum workspace efficiency with top-of-page controls
              and full-canvas document viewing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                <Maximize2 className="text-blue-600" size={32} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                Full-Canvas Workspace
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Maximize document viewing with a top toolbar design that gives
                you the entire canvas for PDF viewing and signature placement.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                <PenTool className="text-blue-600" size={32} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                Perfect Freehand Drawing
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Create natural, smooth signatures with our advanced drawing
                engine. Every stroke is captured with precision.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                <Type className="text-blue-600" size={32} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                Premium Typed Signatures
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Choose from 8 beautiful Google Fonts with customizable size and
                color. Perfect for professional documents.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                <MousePointer className="text-blue-600" size={32} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                Smooth Drag & Drop
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Position signatures with pixel-perfect precision using
                requestAnimationFrame-based transforms for buttery-smooth
                interactions.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                <FileText className="text-blue-600" size={32} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                Full PDF Rendering
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Complete PDF viewing with React PDF, zoom controls, page
                navigation, and seamless signature overlay support.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                <Undo2 className="text-blue-600" size={32} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                Undo/Redo System
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Full history management with undo/redo capabilities. Never lose
                your work with comprehensive action tracking.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="px-4 sm:px-6 md:px-8 lg:px-14 w-full py-12 sm:py-16 lg:py-20">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How Full-Canvas Signing Works
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Experience the most intuitive document signing workflow ever
              created
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-white text-xl sm:text-2xl font-bold">
                1
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                Upload PDF
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Drag and drop your PDF document. Our system securely stores it
                on Cloudinary for instant access.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-white text-xl sm:text-2xl font-bold">
                2
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                Create Signature
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Use the top toolbar to select drawing or typing tools. Create
                signatures in a floating panel that doesn't block your view.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-white text-xl sm:text-2xl font-bold">
                3
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                Place & Position
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Drag your signature anywhere on the full-canvas PDF. Resize,
                rotate, and adjust with smooth, responsive controls.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-white text-xl sm:text-2xl font-bold">
                4
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                Save & Download
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Save your signed document with embedded signatures and download
                the final PDF with perfect positioning preserved.
              </p>
            </div>
          </div>
        </section>

        {/* Technical Features */}
        <section className="px-4 sm:px-6 md:px-8 lg:px-14 w-full py-12 sm:py-16 lg:py-20 bg-gray-50">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Built with Modern Technology
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Cutting-edge tools and libraries powering the future of document
              signing
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-blue-600 font-bold text-lg">PF</span>
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">
                Perfect Freehand
              </h3>
              <p className="text-sm text-gray-600">
                Advanced stroke rendering for natural signatures
              </p>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-blue-600 font-bold text-lg">PDF</span>
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">
                React PDF
              </h3>
              <p className="text-sm text-gray-600">
                Full document rendering with zoom & navigation
              </p>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-blue-600 font-bold text-lg">RAF</span>
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">
                Smooth Transforms
              </h3>
              <p className="text-sm text-gray-600">
                RequestAnimationFrame for fluid interactions
              </p>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-blue-600 font-bold text-lg">SB</span>
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">
                Supabase
              </h3>
              <p className="text-sm text-gray-600">
                Enterprise-grade authentication and database
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 sm:px-6 md:px-8 lg:px-14 w-full mx-auto py-12 sm:py-16 lg:py-20 text-center">
          <div className="bg-blue-600 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-white">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Ready to Experience Full-Canvas Signing?
            </h2>
            <p className="text-lg sm:text-xl mb-6 sm:mb-8 opacity-90">
              Join the future of document signing with toolbar-driven controls
              and maximum workspace efficiency.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-600 font-semibold text-base sm:text-lg rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-lg"
            >
              Start Your Free Trial
              <ArrowRight className="ml-2" size={20} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 py-12 text-center bg-white">
        <div className="px-4 sm:px-6 md:px-8 lg:px-14 w-full">
          <div className="flex items-center justify-center gap-2 mb-4">
            <CheckCircle className="text-blue-600" size={20} />
            <span className="text-base sm:text-lg font-semibold text-gray-900">
              signdoc 4.0
            </span>
          </div>
          <p className="text-sm sm:text-base text-gray-600 mb-4">
            Full-canvas document signing with toolbar-driven interface.
          </p>
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} signdoc. Built with Next.js, Perfect
            Freehand, and Supabase.
          </div>
        </div>
      </footer>
    </div>
  );
}
