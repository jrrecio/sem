
import { useEffect, useState } from "react";
import {
  ActionIcon,
  Badge,
  Box,
  Divider,
  Group,
  Indicator,
  Loader,
  Menu,
  ScrollArea,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import {
  IconBell,
  IconCalendarEvent,
  IconRefresh,
} from "@tabler/icons-react";
import { useNavigate } from "react-router";
import { getEvents } from "../api/events";

interface NotificationEvent {
  id: number;
  title: string;
  status: string;
  created_at?: string;
}

export function AdminNotifications() {
  const navigate = useNavigate();

  const [events, setEvents] = useState<NotificationEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const loadNotifications = async () => {
    setLoading(true);

    try {
      const response = await getEvents();

      const eventList = Array.isArray(response)
        ? response
        : response.data ?? [];

      const pending = eventList
        .filter(
          (event: NotificationEvent) =>
            event.status === "pending"
        )
        .sort(
          (a: NotificationEvent, b: NotificationEvent) =>
            new Date(b.created_at ?? 0).getTime() -
            new Date(a.created_at ?? 0).getTime()
        );

      setEvents(pending);
    } catch (error) {
      console.error(
        "Failed to load admin notifications:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications();

    const interval = window.setInterval(() => {
      void loadNotifications();
    }, 30000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <Menu
      shadow="lg"
      width={340}
      position="bottom-end"
      radius="lg"
      closeOnItemClick
    >
      <Menu.Target>
        <Indicator
          color="red"
          size={16}
          label={events.length > 9 ? "9+" : events.length}
          disabled={events.length === 0}
        >
          <Tooltip label="Notifications">
            <ActionIcon
              variant="subtle"
              color="gray"
              size="lg"
              radius="md"
              aria-label="Admin notifications"
            >
              <IconBell size={22} />
            </ActionIcon>
          </Tooltip>
        </Indicator>
      </Menu.Target>

      <Menu.Dropdown>
        <Group justify="space-between" px="sm" py="xs">
          <Box>
            <Text fw={700} size="sm">
              Notifications
            </Text>
            <Text size="xs" c="dimmed">
              Event proposals awaiting review
            </Text>
          </Box>

          <Tooltip label="Refresh notifications">
            <ActionIcon
              variant="subtle"
              color="indigo"
              onClick={() => void loadNotifications()}
              loading={loading}
              aria-label="Refresh notifications"
            >
              <IconRefresh size={17} />
            </ActionIcon>
          </Tooltip>
        </Group>

        <Divider />

        <ScrollArea.Autosize mah={320}>
          {loading && events.length === 0 ? (
            <Group justify="center" p="lg">
              <Loader size="sm" />
            </Group>
          ) : events.length === 0 ? (
            <Stack align="center" gap="xs" p="xl">
              <IconBell size={30} color="gray" />
              <Text fw={600} size="sm">
                All caught up!
              </Text>
              <Text size="xs" c="dimmed" ta="center">
                No event proposals are waiting for approval.
              </Text>
            </Stack>
          ) : (
            events.map((event) => (
              <Menu.Item
                key={event.id}
                leftSection={
                  <IconCalendarEvent
                    size={20}
                    color="#4f63d8"
                  />
                }
                onClick={() => navigate("/event-approval")}
              >
                <Stack gap={3}>
                  <Text size="sm" fw={600} lineClamp={1}>
                    {event.title}
                  </Text>

                  <Text size="xs" c="dimmed">
                    New event proposal awaiting approval
                  </Text>

                  <Badge
                    color="orange"
                    size="xs"
                    variant="light"
                  >
                    Pending Review
                  </Badge>
                </Stack>
              </Menu.Item>
            ))
          )}
        </ScrollArea.Autosize>
      </Menu.Dropdown>
    </Menu>
  );
}
