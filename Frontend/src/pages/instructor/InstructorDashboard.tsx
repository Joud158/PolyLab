import React from "react";
import NavBarUser from "@/components/ui/NavBarUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/PageHeader";
import CopyButton from "@/components/ui/CopyButton";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Users, ExternalLink } from "lucide-react";
import bgCircuit from "@/assets/background.png"; // your background image
import { listClassrooms, createClassroom, Classroom } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/lib/api";

export default function InstructorDashboard() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [classes, setClasses] = React.useState<Classroom[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [creating, setCreating] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listClassrooms();
      setClasses(data);
    } catch (e: any) {
      const msg = e instanceof ApiError ? e.message : "Failed to load classrooms";
      setError(msg);
      console.error("Failed to load classrooms", e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const cls = await createClassroom(newName.trim());
      setNewName("");
      await refresh();
      nav(`/instructor/classrooms/${cls.id}`);
    } catch (e: any) {
      const msg = e instanceof ApiError ? e.message : "Failed to create classroom";
      setError(msg);
      console.error("Failed to create classroom", e);
    } finally {
      setCreating(false);
    }
  }

  const top = classes.slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url(${bgCircuit})` }}
      />
      {/* dark overlay */}
      <div className="absolute inset-0 bg-slate-950/75" />

      <NavBarUser onLogout={() => console.log("logout")} />
      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        <PageHeader
          title="Instructor Dashboard"
          subtitle={user ? `Welcome, ${user.email}` : "Quick overview and actions"}
          right={
            <div className="flex gap-2">
              <Link to="/instructor/classrooms">
                <Button variant="outline" className="border-slate-700 text-slate-200">
                  View All Classrooms
                </Button>
              </Link>
              <Button onClick={() => nav("/instructor/classrooms?create=1")} className="bg-cyan-500 text-slate-900 hover:bg-cyan-400">
                <Plus className="h-4 w-4 mr-1" /> Create Classroom
              </Button>
            </div>
          }
        />

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left: My Classrooms */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur p-6">
            <h2 className="text-xl font-semibold mb-1">My Classrooms</h2>
            <p className="text-slate-400 mb-4">
              {loading ? "Loading..." : `You have ${classes.length} classrooms`}
            </p>
            {error && <p className="mb-3 text-sm text-rose-300">{error}</p>}

            {loading ? (
              <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 text-slate-300">Loading classrooms...</div>
            ) : top.length === 0 ? (
              <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40">
                <p className="text-slate-300">You don’t have any classrooms yet.</p>
                <div className="mt-3 flex gap-2">
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Classroom name"
                    className="bg-slate-900/60 border-slate-700"
                  />
                  <Button onClick={handleCreate} disabled={creating} className="bg-cyan-500 text-slate-900 hover:bg-cyan-400">
                    {creating ? "Creating..." : "Create"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {top.map((c) => (
                  <div key={c.id} className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{c.name}</div>
                        <div className="text-xs text-slate-400">
                          {c.code || "No code"} • Created {new Date(c.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CopyButton text={c.code} />
                        <Link to={`/instructor/classrooms/${c.id}`}>
                          <Button size="sm" variant="outline" className="border-slate-700 text-slate-200">
                            <ExternalLink className="h-4 w-4 mr-1" /> Open
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Right: Quick Actions */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="New classroom name"
                  className="bg-slate-900/60 border-slate-700"
                />
                <Button onClick={handleCreate} disabled={creating} className="h-11 bg-cyan-500 text-slate-900 hover:bg-cyan-400">
                  <Plus className="h-4 w-4 mr-1" /> {creating ? "Creating..." : "Create"}
                </Button>
              </div>
              <Button onClick={() => nav("/instructor/classrooms")} className="w-full h-11 border-slate-700 text-slate-200" variant="outline">
                <Users className="h-4 w-4 mr-1" /> View classrooms
              </Button>
            </div>

            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <div className="text-sm font-medium mb-2">Pending Review</div>
              <div className="text-slate-400 text-sm">No items.</div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
