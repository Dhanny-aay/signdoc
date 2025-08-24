"use client";

import { useState } from "react";
import { Mail, Lock, ArrowRight, Loader2, Github, Chrome } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import NavBar from "@/components/NavBar";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    router.replace("/dashboard");
  }

  async function handleEmailAuth(e) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success("Account created");
      }
      router.replace("/dashboard");
    } catch (err) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(provider) {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider });
      if (error) throw error;
      toast.success("Signed in");
      router.replace("/dashboard");
    } catch (err) {
      toast.error(err.message || "OAuth failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar />
      <main className="flex-1 grid place-items-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-md rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm bg-white">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {mode === "login" ? "Login" : "Create account"}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            {mode === "login"
              ? "Welcome back. Sign in to continue."
              : "Start managing and signing documents."}
          </p>

          <form onSubmit={handleEmailAuth} className="mt-6 space-y-4">
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-700" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 pl-9 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="you@example.com"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-700" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 pl-9 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 text-white py-2.5 hover:bg-blue-700 disabled:opacity-60 transition-colors text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Please wait
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-4 grid grid-cols-1 gap-2">
            <button
              onClick={() => handleOAuth("google")}
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 py-2.5 hover:bg-gray-50 transition-colors"
            >
              <Chrome size={18} /> Continue with Google
            </button>
            <button
              onClick={() => handleOAuth("github")}
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 py-2.5 hover:bg-gray-50 transition-colors"
            >
              <Github size={18} /> Continue with GitHub
            </button>
          </div>

          <p className="text-sm text-gray-600 mt-6">
            {mode === "login" ? "New here?" : "Already have an account?"}{" "}
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="font-medium hover:underline text-blue-600"
            >
              {mode === "login" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}


