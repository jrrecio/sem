
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
import EventMonitoring from "../pages/eventmonitoring/EventMonitoring";
import VenueManagement from "../pages/venue/VenueManagement";

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
      {/* PUBLIC ROUTES */}
      <Route
        path="/"
        element={<DashboardRedirect />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      {/* ROUTES WITH SIDEBAR AND HEADER */}
      <Route element={<AppShellLayout />}>

        <Route
          path="/dashboard"
          element={<DashboardRedirect />}
        />

        {/* ADMIN DASHBOARD */}
        <Route
          path="/admin/dashboard"
          element={
            <RoleRoute role="admin">
              <Dashboard />
            </RoleRoute>
          }
        />

        {/* USER DASHBOARD */}
        <Route
          path="/user/dashboard"
          element={
            <RoleRoute role="user">
              <UserDashboard />
            </RoleRoute>
          }
        />

        {/* CREATE EVENT */}
        <Route
          path="/create-event"
          element={
            <AuthRoute>
              <CreateEvent />
            </AuthRoute>
          }
        />

        {/* MY PROPOSALS */}
        <Route
          path="/users"
          element={
            <AuthRoute>
              <Users />
            </AuthRoute>
          }
        />

        {/* EVENT MANAGEMENT - ADMIN ONLY */}
        <Route
          path="/event-management"
          element={
            <RoleRoute role="admin">
              <EventManagement />
            </RoleRoute>
          }
        />

        {/* ADD USER - ADMIN ONLY */}
        <Route
          path="/AddUser"
          element={
            <RoleRoute role="admin">
              <AddUser />
            </RoleRoute>
          }
        />

        {/* EVENT APPROVAL */}
        <Route
          path="/event-approval"
          element={
            <AuthRoute>
              <EventApproval />
            </AuthRoute>
          }
        />

        {/* HOME */}
        <Route
          path="/home"
          element={
            <AuthRoute>
              <Home />
            </AuthRoute>
          }
        />

        {/* EVENT ROLE ASSIGNMENT - ADMIN ONLY */}
        <Route
          path="/event-role-assignment"
          element={
            <RoleRoute role="admin">
              <EventRoleAssignment />
            </RoleRoute>
          }
        />

        {/* EVENT MONITORING - ADMIN AND USER */}
        <Route
          path="/event-monitoring"
          element={
            <AuthRoute>
              <EventMonitoring />
            </AuthRoute>
          }
        />
        <Route
  path="/venue-management"
  element={
    <RoleRoute role="admin">
      <VenueManagement />
    </RoleRoute>
  }
/>

      </Route>

      {/* FALLBACK ROUTE */}
      <Route
        path="*"
        element={<DashboardRedirect />}
      />
    </Routes>
  );
}
