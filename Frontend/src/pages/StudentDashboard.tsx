// src/pages/StudentDashboard.tsx
import React, { useState, useEffect, useCallback } from "react";
import NavbarStudent from "@/components/ui/StudentNavbar";
import { Shield, ChevronRight } from "lucide-react";
import bgCircuit from "@/assets/background.png"; // your background image
import { useAuth } from "@/contexts/AuthContext";
import { joinClassroom, listClassrooms, Classroom, ApiError } from "@/lib/api";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const { user } = useAuth();
  const nav = useNavigate();
  const email = user?.email ?? "guest@polylab.dev";

  // ----- Classrooms state -----
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [classesLoading, setClassesLoading] = useState(true);

  const loadClasses = useCallback(async () => {
    setClassesLoading(true);
    setJoinError(null);
    try {
      const data = await listClassrooms();
      setClasses(data);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Failed to load classrooms";
      setJoinError(msg);
    } finally {
      setClassesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  // ----- Join a classroom -----
  async function joinClass() {
    setJoinError(null);
    if (!/^[A-Z0-9]{6,10}$/i.test(joinCode.trim())) {
      setJoinError("Enter a valid join code.");
      return;
    }
    setJoining(true);
    try {
      await joinClassroom(joinCode.trim());
      await loadClasses();
      setJoinCode("");
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Unable to join. Check the code or try again.";
      setJoinError(msg);
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
            <p className="mt-1 text-sm text-slate-400">Signed in as {email}</p>
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
                {classesLoading ? (
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-slate-300">
                    Loading classrooms...
                  </div>
                ) : classes.length === 0 ? (
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-slate-300">
                    You are not enrolled in any classrooms yet. Enter a join code above to get started.
                  </div>
                ) : (
                  classes.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{c.name}</div>
                          <div className="text-xs text-slate-500">
                            Created {new Date(c.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <button
                          className="inline-flex items-center gap-1 rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-800/60"
                          onClick={() => nav(`/student/classrooms/${c.id}`)}
                        >
                          Open Class <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
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
