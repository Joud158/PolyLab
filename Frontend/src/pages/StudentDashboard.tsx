// src/pages/StudentDashboard.tsx
import React, { useMemo, useState } from "react";
import NavbarStudent from "@/components/ui/StudentNavbar";
import { CheckCircle2, FileUp, Loader2, Shield, ChevronRight, Link } from "lucide-react";
import bgCircuit from "@/assets/background.png"; // your background image
import { useAuth } from "@/contexts/AuthContext";
import { joinClassroom } from "@/lib/api";

type ReqStatus = "not_submitted" | "pending" | "approved" | "rejected";

type InstructorRequest = {
  status: ReqStatus;
  note?: string;
  fileName?: string;
  adminReason?: string; // present if rejected
};

type Classroom = {
  id: string;
  title: string;
  instructor: string;
  joinedAt: string;
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const email = user?.email ?? "guest@polylab.dev";
  const role: "student" | "instructor" | "admin" = user?.role ?? "student";

  // ----- Request Instructor state -----
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [req, setReq] = useState<InstructorRequest>({ status: "not_submitted" });

  // ----- Classrooms state (mock) -----
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [classes, setClasses] = useState<Classroom[]>([
    { id: "c1", title: "Cryptography 101", instructor: "Prof. Alice Smith", joinedAt: "Jun 27" },
    { id: "c2", title: "Network Security", instructor: "Prof. Alice Smith", joinedAt: "Jun 22" },
  ]);

  const statusChip = useMemo(() => {
    switch (req.status) {
      case "not_submitted": return { label: "Not Submitted", cls: "bg-slate-700 text-slate-100" };
      case "pending":       return { label: "Pending",        cls: "bg-amber-500/20 text-amber-300 border border-amber-500/40" };
      case "approved":      return { label: "Approved",       cls: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" };
      case "rejected":      return { label: "Rejected",       cls: "bg-rose-500/20 text-rose-300 border border-rose-500/40" };
    }
  }, [req.status]);

  // ----- Mock submit to backend -----
  async function submitRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!proofFile) return;

    setSubmitting(true);
    // simulate upload + create request
    await new Promise(r => setTimeout(r, 900));
    setReq({
      status: "pending",
      fileName: proofFile.name,
      note,
    });
    setSubmitting(false);
  }

  // ----- Join a classroom (mock) -----
  async function joinClass() {
    setJoinError(null);
    if (!/^[A-Z0-9]{6,10}$/i.test(joinCode.trim())) {
      setJoinError("Enter a valid join code.");
      return;
    }
    setJoining(true);
    try {
      await joinClassroom(joinCode.trim());
      setClasses(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          title: `Joined by Code ${joinCode.toUpperCase()}`,
          instructor: "Your instructor",
          joinedAt: new Date().toLocaleDateString(undefined, { month: "short", day: "2-digit" }),
        },
      ]);
      setJoinCode("");
    } catch (e) {
      setJoinError("Unable to join. Check the code or try again.");
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="relative min-h-screen text-slate-100">
      {/* background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url(${bgCircuit})` }}
      />
      {/* dark overlay */}
      <div className="absolute inset-0 bg-slate-950/75" />

      <div className="relative">
        <NavbarStudent onLogout={() => console.log("logout")} />

        <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Student Dashboard</h1>
            <div className="mt-2 inline-flex items-center rounded-full bg-slate-800/70 px-2.5 py-1 text-xs">
              Student
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">

            {/* RIGHT: My Classrooms */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur p-6">
              <h2 className="text-xl font-semibold">My Classrooms</h2>

              <div className="mt-4 flex items-center gap-2">
                <input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 10))}
                  placeholder="Join a Classroom"
                  className="h-10 w-full rounded-lg bg-slate-900/70 border border-slate-700/70 px-3 text-slate-100 placeholder:text-slate-400"
                />
                <button
                  onClick={joinClass}
                  disabled={joining || !/^[A-Z0-9]{6,10}$/.test(joinCode)}
                  className="rounded-lg bg-indigo-500 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-400 disabled:opacity-50"
                >
                  {joining ? "..." : "Join"}
                </button>
              </div>

              <p className="mt-2 text-xs text-slate-500">Enter the code your instructor shared with you.</p>
              {joinError && <p className="mt-2 text-sm text-rose-300">{joinError}</p>}

              <div className="mt-5 space-y-3">
                {classes.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{c.title}</div>
                        <div className="text-sm text-slate-400"> {c.instructor}</div>
                        <div className="text-xs text-slate-500">Join {c.joinedAt}</div>
                      </div>
                      <button
                        className="inline-flex items-center gap-1 rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-800/60"
                        onClick={() => alert(`Open class ${c.title}`)}
                      >
                        Open Class <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-2 text-slate-400 text-sm">
                <Shield className="h-4 w-4 text-cyan-400" />
                Secure classrooms. Codes are case-insensitive.
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
