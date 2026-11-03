import { NavLink, Stack, Text } from "@mantine/core";
import {
  IconLayoutDashboard,
  IconUsers,
  IconSettings,
} from "@tabler/icons-react";
import { Link, useLocation } from "react-router";

type Role = "admin" | "manager" | "user";

interface MenuItem {
  label: string;
  icon: React.ElementType;
  path: string;
  roles: Role[];
}

export function Sidebar() {
  const location = useLocation();

  // Get the logged-in user's role
  const userRole: Role = "user"; // Replace with your auth context

  const menuItems: MenuItem[] = [
    {
      label: "Dashboard",
      icon: IconLayoutDashboard,
      path: "/dashboard",
      roles: ["admin", "manager", "user"],
    },
    {
      label: "Users",
      icon: IconUsers,
      path: "/users",
      roles: ["admin", "manager"],
    },
    {
      label: "Settings",
      icon: IconSettings,
      path: "/settings",
      roles: ["admin"],
    },
  ];

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <Stack gap="xs">
      <Text fw={700} size="xl" mb="lg">
        My Dashboard
      </Text>

      {filteredMenuItems.map((item) => (
        <NavLink
          key={item.path}
          component={Link}
          to={item.path}
          label={item.label}
          leftSection={<item.icon size={20} />}
          active={location.pathname === item.path}
          variant="light"
        />
      ))}
    </Stack>
  );
}