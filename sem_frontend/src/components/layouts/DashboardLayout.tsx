
import { NavLink, Stack, Text } from "@mantine/core";
import {
  IconLayoutDashboard,
  IconUsers,
  IconSettings,
} from "@tabler/icons-react";
import { Link, useLocation } from "react-router";

export function DashboardLayout() {
  const location = useLocation();

  const menuItems = [
    {
      label: "Dashboard",
      icon: IconLayoutDashboard,
      path: "/home",
    },
    {
      label: "users",
      icon: IconUsers,
      path: "/users",
    },
    {
      label: "settings",
      icon: IconSettings,
      path: "/settings",
    },
  ];

  return (
    <Stack gap="xs">
      <Text fw={700} size="xl" mb="lg">
        My Dashboard
      </Text>

      {menuItems.map((item) => (
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
