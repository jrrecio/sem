
import { Routes, Route, Navigate } from "react-router";
import { Center, Loader } from "@mantine/core";
import { useAuth } from "../context/AuthContext";

import { Login } from "../pages/auth/Login";
import { Home } from "../pages/home/Home";
import { Dashboard } from "../pages/AdminDashboard/Dashboard";
import { UserDashboard } from "../pages/home/UserDashboard";
import { Users } from "../pages/myproposal/MyProposal";
import { AddUser } from "../pages/Adduser/AddUser";
import CreateEvent from "../pages/createevents/CreateEvent";
import AppShellLayout from "../layouts/AppShellLayout";
import EventApproval from "../pages/EventApproval/EventApproval";
import EventManagement from "../pages/EventManagement/EventManagement";
import { EventRoleAssignment } from "../pages/EventRoleAssignment/EventRoleAssignment";

type Role = "admin" | "user";

function RoleRoute({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    return (
      <Navigate
        to={
          user.role === "admin"
            ? "/admin/dashboard"
            : "/user/dashboard"
        }
        replace
      />
    );
  }

  return <>{children}</>;
}

function AuthRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function DashboardRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Navigate
      to={
        user.role === "admin"
          ? "/admin/dashboard"
          : "/user/dashboard"
      }
      replace
    />
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={<DashboardRedirect />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route element={<AppShellLayout />}>
        <Route
          path="/dashboard"
          element={<DashboardRedirect />}
        />

        <Route
          path="/admin/dashboard"
          element={
            <RoleRoute role="admin">
              <Dashboard />
            </RoleRoute>
          }
        />

        <Route
          path="/user/dashboard"
          element={
            <RoleRoute role="user">
              <UserDashboard />
            </RoleRoute>
          }
        />

        <Route
          path="/create-event"
          element={
            <AuthRoute>
              <CreateEvent />
            </AuthRoute>
          }
        />

        <Route
          path="/users"
          element={
            <AuthRoute>
              <Users />
            </AuthRoute>
          }
        />

        <Route
          path="/event-management"
          element={
            <RoleRoute role="admin">
              <EventManagement />
            </RoleRoute>
          }
        />

        <Route
          path="/AddUser"
          element={
            <RoleRoute role="admin">
              <AddUser />
            </RoleRoute>
          }
        />

        <Route
          path="/event-approval"
          element={
            <AuthRoute>
              <EventApproval />
            </AuthRoute>
          }
        />

        <Route
          path="/home"
          element={
            <AuthRoute>
              <Home />
            </AuthRoute>
          }
        />
            <Route
          path="/event-role-assignment"
          element={
            <RoleRoute role="admin">
              <EventRoleAssignment />
            </RoleRoute>
          }
        />
      </Route>

      <Route
        path="*"
        element={<DashboardRedirect />}
      />
    </Routes>
  );
}
