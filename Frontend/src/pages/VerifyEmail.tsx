import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/ui/Navbar";
import { Button } from "@/components/ui/button";
import bgCircuit from "@/assets/background.png";
import { verifyEmail, ApiError } from "@/lib/api";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [token, setToken] = useState(searchParams.get("token") ?? "");
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{ type: "success" | "error"; msg: string } | null>(
    null,
  );

  const status = searchParams.get("status");
  const alreadyVerified = status === "verified";

  useEffect(() => {
    const urlToken = searchParams.get("token");
    if (urlToken) setToken(urlToken);

    if (alreadyVerified) {
      setBanner({
        type: "success",
        msg: "Your email has been verified! You can now log in.",
      });
    }
  }, [searchParams, alreadyVerified]);

  async function handleVerify() {
    // If backend already verified and redirected with status=verified,
    // just go to login and don't call the API again.
    if (alreadyVerified) {
      navigate("/login");
      return;
    }

    if (!token) {
      setBanner({ type: "error", msg: "Invalid or missing token." });
      return;
    }

    setLoading(true);
    setBanner(null);

    try {
      await verifyEmail(token);
      setBanner({
        type: "success",
        msg: "Your email has been verified! Redirecting to login...",
      });
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : "Verification failed. Please request a new link.";
      setBanner({ type: "error", msg });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen text-slate-100">
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url(${bgCircuit})` }}
      />
      <div className="absolute inset-0 bg-slate-950/70" />

      <div className="relative">
        <Navbar />
        <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="mx-auto max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur p-6 shadow">
            <h1 className="text-2xl font-bold tracking-tight">Verify your email</h1>
            <p className="mt-2 text-slate-300">
              {alreadyVerified
                ? "Your email is already verified. You can now log in."
                : "Click the button below to complete your email verification."}
            </p>

            {banner && (
              <div
                className={`mt-4 rounded-lg border px-3 py-2 text-sm ${
                  banner.type === "success"
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                    : "border-rose-500/40 bg-rose-500/10 text-rose-300"
                }`}
              >
                {banner.msg}
              </div>
            )}

            <Button
              className="mt-5 w-full h-11 bg-cyan-500 text-slate-900 hover:bg-cyan-400 disabled:opacity-60"
              disabled={loading}
              onClick={handleVerify}
            >
              {alreadyVerified
                ? "Go to Login"
                : loading
                ? "Verifying..."
                : "Verify Email"}
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}
