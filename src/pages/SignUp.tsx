import heroImg from "@/assets/polylab-hero.png"; // keep your image path/alias
import React, { useState } from "react";
import Navbar from "@/components/ui/Navbar";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";

export default function SignUp() {
  // local UI state only — hook up to your API later
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (pw.length < 8) return setError("Password must be at least 8 characters.");
    if (pw !== pw2) return setError("Passwords do not match.");
    // TODO: call /auth/signup, then redirect to email verification.
    alert("Signed up! (wire to backend)");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />

      {/* HERO SECTION with right image and overlaid form */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1000px_600px_at_80%_-20%,rgba(56,189,248,0.25),transparent)]" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center w-full">
          {/* LEFT: Heading */}
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              Create Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">PolyLab</span> Account
            </h1>
            <p className="mt-4 text-lg text-slate-300 max-w-md">
              Unlock the full power and cryptographic learning.
            </p>
          </div>

          {/* RIGHT: Image + floating form overlay */}
          <div className="relative w-full h-[520px] lg:h-[560px]">
            {/* Image positioned to the right */}
            <img
              src={heroImg}
              alt="Glowing 3D chip with binary curve"
              className="pointer-events-none select-none absolute right-6 xl:right-24 top-1/2 -translate-y-1/2 w-[520px] lg:w-[580px] xl:w-[620px] max-w-none rounded-[28px]"
              style={{
                filter: "saturate(1.1) brightness(1.06)",
                WebkitMaskImage:
                  "radial-gradient(80% 80% at 70% 30%, black 60%, transparent 100%)",
              }}
            />

            {/* Floating form with gradient border, overlapping the image */}
            <div className="absolute top-1/2 -translate-y-1/2 z-20 w-[360px] sm:w-[400px] left-1/2 -translate-x-1/2 lg:left-auto lg:right-[200px] xl:right-[260px] lg:translate-x-0">
              <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-cyan-400/40 via-fuchsia-400/30 to-blue-400/40 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
                <form onSubmit={onSubmit} className="rounded-2xl bg-slate-900/70 backdrop-blur border border-slate-800 p-6">
                  {/* Full Name */}
                  <label className="block mb-3">
                    <span className="sr-only">Full Name</span>
                    <div className="p-[1px] rounded-lg bg-gradient-to-r from-cyan-500/30 to-blue-500/30">
                      <div className="flex items-center gap-2 rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2.5">
                        <User className="h-4 w-4 text-cyan-300/80" />
                        <input
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          type="text"
                          placeholder="Full Name"
                          className="flex-1 bg-transparent outline-none text-slate-100 placeholder-slate-500"
                        />
                      </div>
                    </div>
                  </label>

                  {/* Email */}
                  <label className="block mb-3">
                    <span className="sr-only">Email</span>
                    <div className="p-[1px] rounded-lg bg-gradient-to-r from-cyan-500/30 to-blue-500/30">
                      <div className="flex items-center gap-2 rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2.5">
                        <Mail className="h-4 w-4 text-cyan-300/80" />
                        <input
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          type="email"
                          placeholder="Email Address"
                          className="flex-1 bg-transparent outline-none text-slate-100 placeholder-slate-500"
                        />
                      </div>
                    </div>
                  </label>

                  {/* Password */}
                  <label className="block mb-3">
                    <span className="sr-only">Password</span>
                    <div className="p-[1px] rounded-lg bg-gradient-to-r from-cyan-500/30 to-blue-500/30">
                      <div className="flex items-center gap-2 rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2.5">
                        <Lock className="h-4 w-4 text-cyan-300/80" />
                        <input
                          value={pw}
                          onChange={(e) => setPw(e.target.value)}
                          type={showPw ? "text" : "password"}
                          placeholder="Password"
                          className="flex-1 bg-transparent outline-none text-slate-100 placeholder-slate-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw((s) => !s)}
                          className="text-slate-400 hover:text-slate-200"
                          aria-label={showPw ? "Hide password" : "Show password"}
                        >
                          {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </label>

                  {/* Confirm Password */}
                  <label className="block mb-4">
                    <span className="sr-only">Confirm Password</span>
                    <div className="p-[1px] rounded-lg bg-gradient-to-r from-cyan-500/30 to-blue-500/30">
                      <div className="flex items-center gap-2 rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2.5">
                        <Lock className="h-4 w-4 text-cyan-300/80" />
                        <input
                          value={pw2}
                          onChange={(e) => setPw2(e.target.value)}
                          type={showPw2 ? "text" : "password"}
                          placeholder="Confirm Password"
                          className="flex-1 bg-transparent outline-none text-slate-100 placeholder-slate-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw2((s) => !s)}
                          className="text-slate-400 hover:text-slate-200"
                          aria-label={showPw2 ? "Hide password" : "Show password"}
                        >
                          {showPw2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </label>

                  {error && (
                    <div className="mb-3 text-sm text-rose-300">{error}</div>
                  )}

                  <p className="text-xs text-slate-400 mb-4">
                    Minimum 8 chars. Avoid common or breached passwords.
                  </p>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-900 font-semibold hover:from-cyan-400 hover:to-blue-400 transition"
                  >
                    Sign Up
                  </button>

                  <div className="mt-4 border-t border-slate-800 pt-4 text-center text-xs text-slate-400">
                    Or sign up with
                  </div>
                  <button
                    type="button"
                    className="w-full mt-2 py-3 rounded-lg border border-slate-700/70 bg-slate-900/30 text-slate-200 flex items-center justify-center gap-2 hover:bg-slate-900/50 transition"
                  >
                    <span className="text-lg">G</span> Sign up with Google
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
