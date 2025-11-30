// src/App.tsx
import React, { ReactNode } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "@/pages/LandingPage";
import SignUp from "@/pages/SignUp";
import Login from "@/pages/Login";
import CalculatorPage from "@/pages/Calculator";
import StudentDashboard from "@/pages/StudentDashboard";
import RequestInstructor from "@/pages/RequestInstructor";
import InstructorDashboard from "@/pages/instructor/InstructorDashboard";
import ClassroomsList from "@/pages/instructor/ClassroomsList";
import ClassroomDetail from "@/pages/instructor/ClassroomDetail";
import AssignmentDetail from "@/pages/instructor/AssignmentDetail";
import StudentClassroom from "@/pages/StudentClassroom";
import VerifyEmail from "@/pages/VerifyEmail";
import ForgotPassword from "@/pages/ForgotPassword";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminRequestDetail from "@/pages/admin/AdminRequestDetail";
import PageGallery from "@/pages/PageGallery";
import ResetConfirm from "@/pages/ResetConfirm";
import {
  DocsPage,
  ExamplesPage,
  SecurityPage,
  TutorialsPage,
} from "@/pages/InfoPages";

import InstructorSubmissionPage from "@/pages/instructor/InstructorSubmissionPage";
import StudentSubmissionPage from "@/pages/student/StudentSubmissionPage";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";

type Role = "student" | "instructor" | "admin";

type RoleRouteProps = {
  allow: Role[];
  children: ReactNode;
};

function RoleRoute({ allow, children }: RoleRouteProps) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) return <Navigate to="/login" replace />;

  if (!allow.includes(user.role as Role)) {
    if (user.role === "student") return <Navigate to="/student" replace />;
    if (user.role === "instructor") return <Navigate to="/instructor" replace />;
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify" element={<VerifyEmail />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/reset/confirm" element={<ResetConfirm />} />
          <Route path="/pages" element={<PageGallery />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/tutorials" element={<TutorialsPage />} />
          <Route path="/examples" element={<ExamplesPage />} />
          <Route path="/security" element={<SecurityPage />} />

          {/* Calculator */}
          <Route
            path="/calculator"
            element={
              <RoleRoute allow={["student", "instructor", "admin"]}>
                <CalculatorPage />
              </RoleRoute>
            }
          />

          {/* STUDENT */}
          <Route
            path="/student"
            element={
              <RoleRoute allow={["student"]}>
                <StudentDashboard />
              </RoleRoute>
            }
          />
          <Route
            path="/student/classrooms/:classId"
            element={
              <RoleRoute allow={["student"]}>
                <StudentClassroom />
              </RoleRoute>
            }
          />

          {/* STUDENT SUBMISSION REVIEW PAGE */}
          <Route
            path="/student/submissions/:submissionId"
            element={
              <RoleRoute allow={["student"]}>
                <StudentSubmissionPage />
              </RoleRoute>
            }
          />

          {/* Instructor request */}
          <Route
            path="/instructor/request"
            element={
              <RoleRoute allow={["student"]}>
                <RequestInstructor />
              </RoleRoute>
            }
          />

          {/* INSTRUCTOR */}
          <Route
            path="/instructor"
            element={
              <RoleRoute allow={["instructor", "admin"]}>
                <InstructorDashboard />
              </RoleRoute>
            }
          />
          <Route
            path="/instructor/classrooms"
            element={
              <RoleRoute allow={["instructor", "admin"]}>
                <ClassroomsList />
              </RoleRoute>
            }
          />
          <Route
            path="/instructor/classrooms/:classId"
            element={
              <RoleRoute allow={["instructor", "admin"]}>
                <ClassroomDetail />
              </RoleRoute>
            }
          />
          <Route
            path="/instructor/assignments/:assignmentId"
            element={
              <RoleRoute allow={["instructor", "admin"]}>
                <AssignmentDetail />
              </RoleRoute>
            }
          />

          {/* INSTRUCTOR SUBMISSION REVIEW PAGE */}
          <Route
            path="/instructor/submissions/:submissionId"
            element={
              <RoleRoute allow={["instructor", "admin"]}>
                <InstructorSubmissionPage />
              </RoleRoute>
            }
          />

          {/* ADMIN */}
          <Route
            path="/admin"
            element={
              <RoleRoute allow={["admin"]}>
                <AdminDashboard />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/requests/:requestId"
            element={
              <RoleRoute allow={["admin"]}>
                <AdminRequestDetail />
              </RoleRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
