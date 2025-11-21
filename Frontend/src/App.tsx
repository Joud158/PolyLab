// src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "@/pages/LandingPage";
import SignUp from "@/pages/SignUp";
import Login from "@/pages/Login";
import CalculatorPage from "@/pages/Calculator";
import StudentDashboard from "./pages/StudentDashboard";
import RequestInstructor from "./pages/RequestInstructor";
import InstructorDashboard from "./pages/instructor/InstructorDashboard";
import ClassroomsList from "./pages/instructor/ClassroomsList";
import ClassroomDetail from "./pages/instructor/ClassroomDetail";
import VerifyEmail from "@/pages/VerifyEmail";
import ForgotPassword from "@/pages/ForgotPassword";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PageGallery from "./pages/PageGallery";
import { DocsPage, ExamplesPage, SecurityPage, TutorialsPage } from "./pages/InfoPages";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

function RoleRoute({
  allow,
  children,
}: {
  allow: Array<"student" | "instructor" | "admin">;
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!allow.includes(user.role)) return <Navigate to="/student" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify" element={<VerifyEmail />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/pages" element={<PageGallery />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/tutorials" element={<TutorialsPage />} />
          <Route path="/examples" element={<ExamplesPage />} />
          <Route path="/security" element={<SecurityPage />} />
          <Route path="/calculator" element={<CalculatorPage />} />
          <Route
            path="/student"
            element={
              <RoleRoute allow={["student", "instructor", "admin"]}>
                <StudentDashboard />
              </RoleRoute>
            }
          />
          <Route
            path="/instructor/request"
            element={
              <RoleRoute allow={["student", "instructor", "admin"]}>
                <RequestInstructor />
              </RoleRoute>
            }
          />

      {/* Instructor area */}
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
            path="/admin"
            element={
              <RoleRoute allow={["admin"]}>
                <AdminDashboard />
              </RoleRoute>
            }
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
