import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Submission, AUTH_BASE_URL, getSubmissionById, ApiError } from "@/lib/api";
import NavBarUser from "@/components/ui/NavBarUser";
import { useAuth } from "@/contexts/AuthContext";

function parseBackendTime(iso: string): Date {
  if (/[zZ]|[+-]\d\d:\d\d$/.test(iso)) return new Date(iso);
  return new Date(iso + "Z");
}

type LocationState = {
  submission?: Submission;
};

export default function StudentSubmissionPage() {
  const { user } = useAuth();
  const { submissionId } = useParams<{ submissionId: string }>();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const [submission, setSubmission] = useState<Submission | null>(state?.submission ?? null);
  const [loading, setLoading] = useState(!state?.submission);
  const [error, setError] = useState<string | null>(null);

  // Fetch from backend if user entered directly by URL
  useEffect(() => {
    if (submission) return;
    if (!submissionId) return;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getSubmissionById(Number(submissionId));
        setSubmission(data);
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : "Failed to load submission.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, [submissionId, submission]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
        <NavBarUser email={user?.email} role={user?.role ?? "student"} />
        <div className="mt-6 text-slate-300">Loading your submission...</div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
        <NavBarUser email={user?.email} role={user?.role ?? "student"} />
        <div className="mt-6 text-sm text-rose-300">
          {error ?? "No submission found."}
        </div>
      </div>
    );
  }

  const localTime = parseBackendTime(submission.submitted_at).toLocaleString("en-LB", {
    timeZone: "Asia/Beirut",
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <NavBarUser email={user?.email} role={user?.role ?? "student"} />

      <main className="max-w-3xl mx-auto mt-6 space-y-4">
        <h1 className="text-2xl font-bold">Your Submission</h1>

        <div className="text-sm text-slate-300 space-y-1">
          <div>
            <span className="font-semibold">Submitted at: </span>
            {localTime}
          </div>
          {submission.grade !== null && submission.grade !== undefined && (
            <div>
              <span className="font-semibold">Grade: </span>
              {submission.grade}
            </div>
          )}
        </div>

        {submission.content && (
          <section>
            <h2 className="text-sm font-semibold text-slate-200 mb-2">
              Your Answer
            </h2>
            <pre className="whitespace-pre-wrap rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100">
              {submission.content}
            </pre>
          </section>
        )}

        {submission.file_url && (
          <section>
            <a
              href={`${AUTH_BASE_URL}${submission.file_url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-cyan-300 hover:text-cyan-200 underline"
            >
              Download your file
            </a>
          </section>
        )}
      </main>
    </div>
  );
}
