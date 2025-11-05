// src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "@/pages/LandingPage";
import SignUp from "@/pages/SignUp";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </BrowserRouter>
  );
}
