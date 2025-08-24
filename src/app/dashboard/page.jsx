"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import NavBar from "@/components/NavBar";
import Link from "next/link";
import { FileText, CheckCircle, Clock, Archive, Plus, Search, Calendar, Download } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [docs, setDocs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    const fetchDocs = async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("id, file_name, url, status, created_at")
        .eq("owner_uid", user.id)
        .order("created_at", { ascending: false });
      if (!error) {
        setDocs(
          (data || []).map((d) => ({
            id: d.id,
            fileName: d.file_name,
            url: d.url,
            status: d.status,
            createdAt: d.created_at,
          }))
        );
      }
    };
    fetchDocs();
  }, [user]);

  const filteredDocs = docs.filter(doc =>
    doc.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case "signed":
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
            <CheckCircle size={16} className="text-green-600" />
            Signed
          </span>
        );
      case "ready":
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
            <Clock size={16} className="text-blue-600" />
            Ready for signing
          </span>
        );
      case "archived":
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200">
            <Archive size={16} className="text-gray-600" />
            Archived
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200">
            <FileText size={16} className="text-gray-600" />
            {status}
          </span>
        );
    }
  };

  const getStatusCount = (status) => {
    return docs.filter(doc => doc.status === status).length;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar />
      <main className="flex-1 max-w-7xl mx-auto px-6 py-10">
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Document Dashboard</h1>
          <p className="text-lg text-gray-600">Manage and track all your documents in one place</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Documents</p>
                <p className="text-3xl font-bold text-gray-900">{docs.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ready to Sign</p>
                <p className="text-3xl font-bold text-blue-600">{getStatusCount("ready")}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Clock className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Signed</p>
                <p className="text-3xl font-bold text-green-600">{getStatusCount("signed")}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Archived</p>
                <p className="text-3xl font-bold text-gray-600">{getStatusCount("archived")}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <Archive className="text-gray-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Plus size={20} />
              Upload New Document
            </Link>
          </div>
        </div>

        {/* Documents List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Your Documents</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredDocs.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? "No documents found" : "No documents yet"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm 
                    ? "Try adjusting your search terms" 
                    : "Upload your first PDF to get started with document signing"
                  }
                </p>
                {!searchTerm && (
                  <Link
                    href="/upload"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={20} />
                    Upload First Document
                  </Link>
                )}
              </div>
            ) : (
              filteredDocs.map((doc) => (
                <div key={doc.id} className="px-6 py-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FileText className="text-blue-600" size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {doc.fileName}
                        </h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar size={16} />
                            {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : "Unknown date"}
                          </div>
                          {doc.status === "signed" && (
                            <div className="flex items-center gap-1">
                              <Download size={16} />
                              <span>Ready to download</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 ml-6">
                      {getStatusBadge(doc.status)}
                      <Link
                        href={`/sign/${doc.id}`}
                        className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                          doc.status === "signed"
                            ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md"
                        }`}
                      >
                        {doc.status === "signed" ? "View" : "Sign Now"}
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}


