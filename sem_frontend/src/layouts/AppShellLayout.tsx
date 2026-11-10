
import {
  AppShell,
  Avatar,
  Badge,
  Box,
  Burger,
  Center,
  Group,
  Loader,
  Menu,
  Text,
  UnstyledButton,
  ThemeIcon,
} from "@mantine/core";

import { useDisclosure } from "@mantine/hooks";

import {
  IconChevronDown,
  IconLogout,
  IconUserCircle,
  IconBuildingCommunity,
} from "@tabler/icons-react";

import {
  Outlet,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router";

import { Sidebar } from "../components/sidebar";
import { useAuth } from "../context/AuthContext";
import { AdminNotifications } from "../components/AdminNotifications";

import "./AppShellLayout.css";

export default function AppShellLayout() {
  const [opened, { toggle, close }] = useDisclosure(false);

  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <Center h="100vh">
        <Loader color="indigo" />
      </Center>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const pageTitles: Record<string, string> = {
    "/admin/dashboard": "Dashboard",
    "/user/dashboard": "Dashboard",
    "/users": "My Proposals",
    "/event-management": "Event Management",
    "/event-approval": "Event Approval",
    "/create-event": "Create Event",
    "/AddUser": "User Management",
    "/home": "Home",
  };

  const pageTitle =
    pageTitles[location.pathname] ?? "SmartCampus";

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const initials = (user.name || "User")
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <AppShell
      padding={0}
      header={{ height: 76 }}
      navbar={{
        width: 280,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      className="sc-appshell"
    >
      {/* HEADER */}
      <AppShell.Header className="sc-topbar">
        <Group
          h="100%"
          px="lg"
          justify="space-between"
          wrap="nowrap"
        >
          {/* Left side */}
          <Group gap="md" wrap="nowrap">
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
              color="#172541"
            />

            <ThemeIcon
              size={42}
              radius="md"
              className="sc-header-logo"
              visibleFrom="sm"
            >
              <IconBuildingCommunity size={23} />
            </ThemeIcon>

            <Box>
              <Text className="sc-topbar-title">
                {pageTitle}
              </Text>

              <Text className="sc-topbar-subtitle">
                SmartCampus / Event Management
              </Text>
            </Box>
          </Group>

          {/* Right side */}
          <Group gap="md" wrap="nowrap">
            {/* Role badge */}
            <Badge
              variant="light"
              color="indigo"
              radius="md"
              className="sc-header-role"
              visibleFrom="md"
            >
              {user.role === "admin"
                ? "Administrator"
                : "Student User"}
            </Badge>

            {/* Admin notification */}
            {user.role === "admin" && (
              <Box className="sc-header-notifications">
                <AdminNotifications />
              </Box>
            )}

            <Box className="sc-topbar-divider" />

            {/* User profile */}
            <Menu
              shadow="lg"
              width={240}
              position="bottom-end"
              radius="lg"
            >
              <Menu.Target>
                <UnstyledButton className="sc-profile-button">
                  <Group gap="sm" wrap="nowrap">
                    <Avatar
                      size={40}
                      radius="xl"
                      color="indigo"
                      variant="light"
                    >
                      {initials}
                    </Avatar>

                    <Box className="sc-profile-info">
                      <Text className="sc-profile-name">
                        {user.name || "User"}
                      </Text>

                      <Text className="sc-profile-role">
                        {user.role === "admin"
                          ? "Administrator"
                          : "Student User"}
                      </Text>
                    </Box>

                    <IconChevronDown
                      size={16}
                      className="sc-profile-chevron"
                    />
                  </Group>
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>MY ACCOUNT</Menu.Label>

                <Box px="sm" py="xs">
                  <Group gap="sm">
                    <Avatar color="indigo" radius="xl">
                      {initials}
                    </Avatar>

                    <Box>
                      <Text size="sm" fw={700}>
                        {user.name || "User"}
                      </Text>

                      <Text size="xs" c="dimmed">
                        {user.role === "admin"
                          ? "Administrator"
                          : "Student User"}
                      </Text>
                    </Box>
                  </Group>
                </Box>

                <Menu.Divider />

                <Menu.Item
                  leftSection={<IconUserCircle size={18} />}
                  disabled
                >
                  Account Profile
                </Menu.Item>

                <Menu.Divider />

                <Menu.Item
                  color="red"
                  leftSection={<IconLogout size={18} />}
                  onClick={() => void handleLogout()}
                >
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      {/* SIDEBAR */}
      <AppShell.Navbar
        className="sc-app-navbar"
        style={{
          backgroundColor: "#0b1530",
          borderRight: "none",
        }}
      >
        <Sidebar userRole={user.role} />
      </AppShell.Navbar>

      {/* PAGE CONTENT */}
      <AppShell.Main className="sc-app-main">
        <Box
          className="sc-main-content"
          onClick={() => {
            if (opened) close();
          }}
        >
          <Outlet />
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}
