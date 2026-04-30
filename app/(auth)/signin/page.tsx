"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const urlError = searchParams.get("error");

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState(urlError ? "Invalid credentials." : "");
  const [loading, setLoading]   = useState(false);

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Incorrect email or password.");
    } else {
      router.push(callbackUrl);
    }
  };

  const handleGoogle = () => {
    setLoading(true);
    signIn("google", { callbackUrl });
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-5">
      <div
        className="w-full max-w-sm rounded-3xl p-8 space-y-6"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(212,160,23,0.2)" }}
      >
        <div className="text-center space-y-1">
          <Link href="/" className="inline-block text-2xl mb-1">🕌</Link>
          <h1 className="text-xl font-black text-amber-50">Welcome back</h1>
          <p className="text-xs text-amber-300/50">Sign in to continue your Arabic journey</p>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-900/20 px-4 py-2.5 text-xs text-rose-300">
            {error}
          </div>
        )}

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-amber-100 hover:bg-white/5 transition disabled:opacity-50"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
          <span className="text-xs text-amber-300/30">or</span>
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
        </div>

        {/* Email/password */}
        <form onSubmit={handleCredentials} className="space-y-4">
          <div className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Email"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-amber-50 placeholder:text-amber-300/30 outline-none focus:border-amber-500/50 transition"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Password"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-amber-50 placeholder:text-amber-300/30 outline-none focus:border-amber-500/50 transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold text-amber-900 transition hover:brightness-110 disabled:opacity-50"
            style={{ background: "#d4a017" }}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign in
          </button>
        </form>

        <p className="text-center text-xs text-amber-300/40">
          No account?{" "}
          <Link href="/signup" className="text-amber-400/70 hover:text-amber-300 transition">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}
