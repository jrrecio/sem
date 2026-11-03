import { Routes, Route, Navigate } from "react-router";

import { Login } from "../pages/auth/Login";
import { Register } from "../pages/auth/Register";

import { Home } from "../pages/home/Home";
import { Dashboard } from "../pages/dashboard/Dashboard";
import { Users } from "../pages/user/User";
import { Settings } from "../pages/settings/Settings";

import AppShellLayout  from "../layouts/AppShellLayout";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<AppShellLayout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}