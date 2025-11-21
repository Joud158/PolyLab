import React from "react";
import Navbar from "@/components/ui/Navbar";

type InfoVariant = "docs" | "tutorials" | "examples" | "security";

const meta: Record<
  InfoVariant,
  { title: string; lead: string; bullets: string[] }
> = {
  docs: {
    title: "Documentation",
    lead: "API surface, auth flow, and environment setup for PolyLab.",
    bullets: [
      "Auth: signup/login, CSRF cookies, MFA, and session lifecycle.",
      "Classrooms: create/join, assignments, quizzes, submissions.",
      "Admin: instructor approvals and role management.",
    ],
  },
  tutorials: {
    title: "Tutorials",
    lead: "Step-by-step labs to explore finite fields and classroom features.",
    bullets: [
      "GF(2^m) walkthrough with worked examples.",
      "Uploading instructor proof and moving to instructor role.",
      "Running through a mock assignment + submission review.",
    ],
  },
  examples: {
    title: "Examples",
    lead: "Reusable snippets for typical PolyLab tasks.",
    bullets: [
      "Calling the API with `fetch` and CSRF headers.",
      "Minimal classroom creation + join flow.",
      "Admin review endpoints for instructor requests.",
    ],
  },
  security: {
    title: "Security",
    lead: "Session cookies, CSRF defense, MFA, and rate limiting in the stack.",
    bullets: [
      "HttpOnly sessions with Argon2 hashing and configurable TTL.",
      "Per-IP rate limiting on FastAPI endpoints.",
      "CSRF cookie + x-csrf-token mirror on unsafe methods.",
    ],
  },
};

function InfoLayout({ variant }: { variant: InfoVariant }) {
  const data = meta[variant];
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-500">PolyLab</p>
        <h1 className="text-3xl font-bold tracking-tight">{data.title}</h1>
        <p className="mt-2 text-slate-400">{data.lead}</p>

        <div className="mt-6 space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          {data.bullets.map((line) => (
            <div key={line} className="flex gap-3 text-slate-200">
              <span className="mt-1 h-2 w-2 rounded-full bg-cyan-400/80" />
              <p className="leading-6 text-sm sm:text-base text-slate-300">{line}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export function DocsPage() {
  return <InfoLayout variant="docs" />;
}

export function TutorialsPage() {
  return <InfoLayout variant="tutorials" />;
}

export function ExamplesPage() {
  return <InfoLayout variant="examples" />;
}

export function SecurityPage() {
  return <InfoLayout variant="security" />;
}
