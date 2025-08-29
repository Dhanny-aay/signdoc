"use client";

import Link from "next/link";
import { LogOut, FilePlus2, User, Home } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function NavBar() {
  const { user, signOutUser } = useAuth();
  
  return (
    <header className="w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-gray-900">
            <FilePlus2 className="text-blue-600" size={24} />
            signdoc
          </Link>
          
          <nav className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <>
                <Link
                  href="/"
                  className="hidden sm:inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
                >
                  <Home size={18} />
                  Home
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 text-sm sm:text-base"
                >
                  <span className="sm:hidden">📊</span>
                  Dashboard
                </Link>
                <Link
                  href="/upload"
                  className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base"
                >
                  <FilePlus2 size={16} />
                  <span className="hidden sm:inline">Upload</span>
                  <span className="sm:hidden">+</span>
                </Link>
                <div className="flex items-center gap-1 sm:gap-2 ml-1 sm:ml-2 pl-2 sm:pl-4 border-l border-gray-200">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-700 hidden md:block">
                    {user.email?.split('@')[0] || 'User'}
                  </span>
                  <button
                    onClick={signOutUser}
                    className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 text-xs sm:text-sm"
                  >
                    <LogOut size={14} />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  href="/"
                  className="hidden sm:block px-4 py-2 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
                >
                  Home
                </Link>
                <Link
                  href="/login"
                  className="px-4 sm:px-6 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base"
                >
                  Get Started
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}



