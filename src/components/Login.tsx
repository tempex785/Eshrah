import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { BookMarked, User, Lock, Loader2, ArrowRight } from "lucide-react";
import { cn } from "../lib/utils";

export function Login({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;
      if (data.session) {
        // Check if email exists in admins table
        const { data: adminData, error: adminError } = await supabase
          .from('admins')
          .select('*')
          .eq('email', email)
          .single();

        if (adminError || !adminData) {
          await supabase.auth.signOut();
          throw new Error("هذا البريد الإلكتروني غير مصرح له بالدخول كمسؤول.");
        }
        
        onLoginSuccess();
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "حدث خطأ أثناء تسجيل الدخول");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-bg-card border border-border-card rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Decorator */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-info-500/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none" />

        <div className="flex flex-col items-center mb-8 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 mb-4 ring-1 ring-primary-500/20">
            <BookMarked className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-text-title text-center">إشرحــ طب</h1>
          <p className="text-text-muted text-sm mt-1">
            تسجيل الدخول للوحة التحكم
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
              {error === "Invalid login credentials" ? "البريد الإلكتروني أو كلمة المرور غير صحيحة" : error}
            </div>
          )}
          
          {message && (
            <div className="p-3 rounded-xl bg-success-500/10 border border-success-500/20 text-success-500 font-medium text-sm text-center">
              {message}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text-body mb-1.5 ml-1">البريد الإلكتروني</label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-bg-hover border border-border-card rounded-xl py-3 pr-10 pl-4 text-text-title placeholder:text-text-muted focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all"
                placeholder="admin@academy.com"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-body mb-1.5 ml-1">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-bg-hover border border-border-card rounded-xl py-3 pr-10 pl-4 text-text-title placeholder:text-text-muted focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all font-sans tracking-widest"
                placeholder="••••••••"
                dir="ltr"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-primary-500/25 active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                تسجيل الدخول
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
