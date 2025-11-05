// src/components/Navbar.tsx
import React, { useState } from "react";
import { LogIn, Menu, X, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/docs", label: "Docs" },
  { href: "/tutorials", label: "Tutorials" },
  { href: "/examples", label: "Examples" },
  { href: "/security", label: "Security" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/60 bg-slate-950/60 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60">
      <div className="mx-auto w-full max-w-screen-2xl h-16 px-4 sm:px-5 md:px-6 lg:px-8 xl:px-10 2xl:px-12 flex items-center justify-between">
        {/* Brand */}
        <a href="/" className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 grid place-items-center shadow">
            <span className="font-bold text-slate-900">P</span>
          </div>
          <span className="font-semibold tracking-tight text-lg">PolyLab</span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-slate-300">
          {links.map((l) => (
            <a key={l.href} className="hover:text-white" href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-2">
          {/* Home button */}
          <a href="/">
            <Button
              variant="outline"
              className="gap-2 border-slate-700 text-slate-200 hover:bg-slate-800/50"
            >
              <Home className="h-4 w-4" />
              Home
            </Button>
          </a>

          {/* Login button */}
          <a href="/login">
            <Button
              variant="outline"
              className="gap-2 border-slate-700 text-slate-200"
            >
              <LogIn className="h-4 w-4" />
              Login
            </Button>
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-slate-300 hover:bg-slate-800/50 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile sheet */}
      {open && (
        <div className="md:hidden border-t border-slate-800/60 bg-slate-950/95">
          <div className="mx-auto max-w-screen-2xl px-4 sm:px-5 py-3 space-y-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="block rounded-md px-3 py-2 text-slate-200 hover:bg-slate-800/60"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </a>
            ))}
            {/* Mobile Home & Login buttons */}
            <div className="mt-3 flex flex-col gap-2">
              <a href="/" onClick={() => setOpen(false)}>
                <Button
                  variant="outline"
                  className="w-full gap-2 border-slate-700 text-slate-200"
                >
                  <Home className="h-4 w-4" />
                  Home
                </Button>
              </a>
              <a href="/login" onClick={() => setOpen(false)}>
                <Button
                  variant="outline"
                  className="w-full gap-2 border-slate-700 text-slate-200"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Button>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
