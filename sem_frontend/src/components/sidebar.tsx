
import type { ElementType } from "react";
import {
  Box,
  Badge,
  Divider,
  Group,
  NavLink,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";

import {
  IconLayoutDashboard,
  IconUsers,
  IconUserPlus,
  IconCalendarPlus,
  IconLogout,
  IconClipboardCheck,
  IconCalendarEvent,
  IconBuildingCommunity,
  IconChevronRight,
  IconUserCheck,
} from "@tabler/icons-react";

import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import "./sidebar.css";

type Role = "admin" | "user";

interface MenuItem {
  label: string;
  icon: ElementType;
  path: string;
  roles: Role[];
}

interface SidebarProps {
  userRole: Role;
}

export function Sidebar({ userRole }: SidebarProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const menuItems: MenuItem[] = [
    {
      label: "Dashboard",
      icon: IconLayoutDashboard,
      path:
        userRole === "admin"
          ? "/admin/dashboard"
          : "/user/dashboard",
      roles: ["admin", "user"],
    },
    {
      label: "My Proposal",
      icon: IconUsers,
      path: "/users",
      roles: ["user"],
    },
    {
      label: "Event Management",
      icon: IconCalendarEvent,
      path: "/event-management",
      roles: ["admin"],
    },
    {
      label: "Add User",
      icon: IconUserPlus,
      path: "/AddUser",
      roles: ["admin"],
    },
    {
      label: "Create Event",
      icon: IconCalendarPlus,
      path: "/create-event",
      roles: ["user"],
    },
    {
      label: "Event Approval",
      icon: IconClipboardCheck,
      path: "/event-approval",
      roles: ["admin", "user"],
    },
    {
  label: "Event Role Assignment",
  icon: IconUserCheck,
  path: "/event-role-assignment",
  roles: ["admin"],
}

    
  ];

  const filteredMenuItems = menuItems.filter(
    (item) => item.roles.includes(userRole)
  );

  return (
    <Box className="sc-sidebar">
      {/* Branding */}
      <Group gap="sm" className="sc-brand">
        <ThemeIcon
          size={46}
          radius="md"
          className="sc-brand-icon"
        >
          <IconBuildingCommunity size={25} stroke={1.8} />
        </ThemeIcon>

        <Box>
          <Text className="sc-brand-title">
            SmartCampus
          </Text>
          <Text className="sc-brand-subtitle">
            Event Management System
          </Text>
        </Box>
      </Group>

      <Divider className="sc-divider" />

      {/* Account role */}
      <Box className="sc-role-section">
        <Text className="sc-section-label">
          WORKSPACE
        </Text>

        <Group justify="space-between" align="center">
          <Text className="sc-workspace-name">
            {userRole === "admin"
              ? "Administrator"
              : "Student Workspace"}
          </Text>

          <Badge
            size="sm"
            radius="sm"
            className="sc-role-badge"
          >
            {userRole === "admin" ? "ADMIN" : "USER"}
          </Badge>
        </Group>
      </Box>

      {/* Navigation */}
      <Stack gap={6} className="sc-nav">
        <Text className="sc-section-label sc-nav-label">
          MAIN MENU
        </Text>

        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              component={Link}
              to={item.path}
              label={item.label}
              leftSection={
                <Icon size={20} stroke={1.8} />
              }
              rightSection={
                active ? (
                  <IconChevronRight size={15} />
                ) : null
              }
              active={active}
              className={`sc-nav-link ${
                active ? "sc-nav-link-active" : ""
              }`}
            />
          );
        })}
      </Stack>

      {/* Bottom section */}
      <Box className="sc-sidebar-bottom">
        <Divider className="sc-divider" />

        <NavLink
          label="Logout"
          leftSection={<IconLogout size={20} />}
          className="sc-logout"
          onClick={() => void handleLogout()}
        />

        <Text className="sc-footer">
          SmartCampus © 2026
        </Text>
      </Box>
    </Box>
  );
}
