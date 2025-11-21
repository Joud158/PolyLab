import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import NavBarUser from "@/components/ui/NavBarUser";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import CopyButton from "@/components/ui/CopyButton";
import { listClassrooms, Classroom } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Upload, FileText, Inbox, CheckCircle, Clock3 } from "lucide-react";
import bgCircuit from "@/assets/background.png"; // your background image

export default function ClassroomDetail() {
  const { classId } = useParams();
  const [classes, setClasses] = React.useState<Classroom[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [materials, setMaterials] = useState<{ id: string; title: string; desc?: string }[]>([]);
  const [assignments, setAssignments] = useState<
    { id: string; title: string; desc?: string; due?: string }[]
  >([]);
  const [submissions, setSubmissions] = useState<
    { id: string; student: string; assignment: string; status: "pending" | "graded"; grade?: string }[]
  >([]);

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await listClassrooms();
        setClasses(data);
      } catch (e) {
        console.error("Failed to load classrooms", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const classroom = classes.find((c) => String(c.id) === classId);
  const defaultAssignment = useMemo(() => assignments[0]?.id, [assignments]);

  if (loading) {
    return (
      <div className="relative min-h-screen bg-slate-950 text-slate-100">
        <div className="absolute inset-0 bg-cover bg-center bg-fixed pointer-events-none" style={{ backgroundImage: `url(${bgCircuit})` }} />
        <div className="absolute inset-0 bg-slate-950/75 pointer-events-none" />
        <div className="relative z-10">
          <NavBarUser onLogout={() => console.log("logout")} />
          <main className="mx-auto max-w-3xl px-4 py-10">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">Loading classroom...</div>
          </main>
        </div>
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="relative min-h-screen bg-slate-950 text-slate-100">
        <div className="absolute inset-0 bg-cover bg-center bg-fixed pointer-events-none" style={{ backgroundImage: `url(${bgCircuit})` }} />
        <div className="absolute inset-0 bg-slate-950/75 pointer-events-none" />
        <div className="relative z-10">
          <NavBarUser onLogout={() => console.log("logout")} />
          <main className="mx-auto max-w-3xl px-4 py-10">
            <div className="rounded-xl border border-rose-700/40 bg-rose-900/20 p-6">Classroom not found.</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100">
      <div className="absolute inset-0 bg-cover bg-center bg-fixed pointer-events-none" style={{ backgroundImage: `url(${bgCircuit})` }} />
      <div className="absolute inset-0 bg-slate-950/75 pointer-events-none" />
      <div className="relative z-10">
        <NavBarUser onLogout={() => console.log("logout")} />
        <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <PageHeader
            title={classroom.name}
            subtitle={`Join code: ${classroom.code}`}
            right={<CopyButton text={classroom.code} />}
          />

          <Tabs defaultValue="materials" className="mt-4">
            <TabsList className="bg-slate-800/60">
              <TabsTrigger value="materials">Materials</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
              <TabsTrigger value="submissions">Submissions</TabsTrigger>
            </TabsList>

            <TabsContent value="materials" className="mt-4">
              <MaterialsPanel materials={materials} onAdd={(m) => setMaterials((prev) => [m, ...prev])} />
            </TabsContent>

            <TabsContent value="assignments" className="mt-4">
              <AssignmentsPanel
                assignments={assignments}
                onAdd={(a) => setAssignments((prev) => [a, ...prev])}
              />
            </TabsContent>

            <TabsContent value="submissions" className="mt-4">
              <SubmissionsPanel
                submissions={submissions}
                assignments={assignments}
                defaultAssignment={defaultAssignment}
                onGrade={(id, grade) =>
                  setSubmissions((prev) =>
                    prev.map((s) => (s.id === id ? { ...s, status: "graded", grade } : s)),
                  )
                }
                onAdd={(sub) => setSubmissions((prev) => [sub, ...prev])}
              />
            </TabsContent>
          </Tabs>

          <div className="mt-6">
            <Button variant="outline" className="border-slate-700 text-slate-200" onClick={() => window.history.back()}>
              Back
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}

function MaterialsPanel({
  materials,
  onAdd,
}: {
  materials: { id: string; title: string; desc?: string }[];
  onAdd: (m: { id: string; title: string; desc?: string }) => void;
}) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  function add() {
    if (!title.trim()) return;
    onAdd({ id: crypto.randomUUID(), title: title.trim(), desc: desc.trim() || undefined });
    setTitle("");
    setDesc("");
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
        <div className="flex-1">
          <label className="text-sm text-slate-300">Title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-slate-900/60 border-slate-700" />
        </div>
        <div className="flex-1">
          <label className="text-sm text-slate-300">Description (optional)</label>
          <Input value={desc} onChange={(e) => setDesc(e.target.value)} className="bg-slate-900/60 border-slate-700" />
        </div>
        <Button onClick={add} className="h-11 bg-cyan-500 text-slate-900 hover:bg-cyan-400">
          <Upload className="h-4 w-4 mr-1" /> Upload
        </Button>
      </div>

      <div className="space-y-3">
        {materials.length === 0 && (
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 text-slate-300">
            No materials yet. Upload slides, PDFs, or links.
          </div>
        )}
        {materials.map((m) => (
          <div key={m.id} className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-cyan-400 mt-0.5" />
              <div>
                <div className="font-semibold">{m.title}</div>
                {m.desc && <div className="text-sm text-slate-400">{m.desc}</div>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AssignmentsPanel({
  assignments,
  onAdd,
}: {
  assignments: { id: string; title: string; desc?: string; due?: string }[];
  onAdd: (a: { id: string; title: string; desc?: string; due?: string }) => void;
}) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [due, setDue] = useState("");

  function add() {
    if (!title.trim()) return;
    onAdd({
      id: crypto.randomUUID(),
      title: title.trim(),
      desc: desc.trim() || undefined,
      due: due || undefined,
    });
    setTitle("");
    setDesc("");
    setDue("");
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <div>
          <label className="text-sm text-slate-300">Title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-slate-900/60 border-slate-700" />
        </div>
        <div>
          <label className="text-sm text-slate-300">Due (optional)</label>
          <Input
            type="datetime-local"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            className="bg-slate-900/60 border-slate-700"
          />
        </div>
        <div className="md:col-span-3">
          <label className="text-sm text-slate-300">Description (optional)</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={3}
            className="w-full rounded-md bg-slate-900/60 border border-slate-700 px-3 py-2 text-sm text-slate-100"
          />
        </div>
      </div>
      <Button onClick={add} className="h-11 bg-cyan-500 text-slate-900 hover:bg-cyan-400">
        <Upload className="h-4 w-4 mr-1" /> Publish Assignment
      </Button>

      <div className="space-y-3">
        {assignments.length === 0 && (
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 text-slate-300">
            No assignments yet. Add one above.
          </div>
        )}
        {assignments.map((a) => (
          <div key={a.id} className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
            <div className="flex items-start gap-3">
              <Inbox className="h-5 w-5 text-indigo-400 mt-0.5" />
              <div>
                <div className="font-semibold">{a.title}</div>
                {a.desc && <div className="text-sm text-slate-400 whitespace-pre-line">{a.desc}</div>}
                <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <Clock3 className="h-3.5 w-3.5" /> {a.due ? `Due ${new Date(a.due).toLocaleString()}` : "No due date"}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SubmissionsPanel({
  submissions,
  assignments,
  defaultAssignment,
  onGrade,
  onAdd,
}: {
  submissions: { id: string; student: string; assignment: string; status: "pending" | "graded"; grade?: string }[];
  assignments: { id: string; title: string }[];
  defaultAssignment?: string;
  onGrade: (id: string, grade: string) => void;
  onAdd: (s: { id: string; student: string; assignment: string; status: "pending" | "graded"; grade?: string }) => void;
}) {
  const [student, setStudent] = useState("");
  const [assignment, setAssignment] = useState(defaultAssignment ?? "");
  const [grade, setGrade] = useState("");

  function addFake() {
    if (!student.trim() || !assignment) return;
    onAdd({ id: crypto.randomUUID(), student: student.trim(), assignment, status: "pending" });
    setStudent("");
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <div>
          <label className="text-sm text-slate-300">Student email</label>
          <Input value={student} onChange={(e) => setStudent(e.target.value)} className="bg-slate-900/60 border-slate-700" />
        </div>
        <div>
          <label className="text-sm text-slate-300">Assignment</label>
          <select
            value={assignment}
            onChange={(e) => setAssignment(e.target.value)}
            className="w-full h-10 rounded-md bg-slate-900/60 border border-slate-700 px-3 text-sm text-slate-100"
          >
            <option value="">Select</option>
            {assignments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <Button onClick={addFake} className="h-10 bg-cyan-500 text-slate-900 hover:bg-cyan-400">
            Add Submission
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {submissions.length === 0 && (
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 text-slate-300">
            No submissions yet. Add a mock submission above.
          </div>
        )}
        {submissions.map((s) => (
          <div key={s.id} className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-semibold">{s.student}</div>
              <div className="text-sm text-slate-400">Assignment: {assignments.find((a) => a.id === s.assignment)?.title || s.assignment}</div>
              <div className="text-xs text-slate-500 flex items-center gap-1">
                {s.status === "graded" ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-emerald-400" /> Graded {s.grade ?? ""}
                  </>
                ) : (
                  <>Pending</>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Input
                value={s.status === "graded" ? s.grade ?? "" : grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="Grade"
                className="w-24 bg-slate-900/60 border-slate-700"
              />
              <Button size="sm" variant="outline" className="border-slate-700 text-slate-200" onClick={() => onGrade(s.id, grade || "Done")}>
                Set Grade
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
