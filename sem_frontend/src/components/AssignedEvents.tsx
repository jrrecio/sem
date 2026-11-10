
import { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Box,
  Button,
  Group,
  Loader,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {
  IconCalendarEvent,
  IconEye,
} from "@tabler/icons-react";
import { useNavigate } from "react-router";
import api from "../lib/api";

interface AssignedEvent {
  id: number;
  title: string;
  event_type: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
}

export function AssignedEvents() {
  const [events, setEvents] = useState<AssignedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get("/my-assigned-events");
        setEvents(response.data);
      } catch {
        setError("Failed to load assigned events.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  if (loading) {
    return (
      <Group justify="center" py="xl">
        <Loader />
      </Group>
    );
  }

  return (
    <Box>
      <Group justify="space-between" mb="lg">
        <Box>
          <Title order={3}>My Assigned Events</Title>
          <Text size="sm" c="dimmed">
            Events assigned to you by the administrator.
          </Text>
        </Box>

        <Badge color="indigo" size="lg">
          {events.length} Assigned
        </Badge>
      </Group>

      {error && (
        <Alert color="red" mb="md">
          {error}
        </Alert>
      )}

      {!error && events.length === 0 && (
        <Paper withBorder p="xl" radius="lg">
          <Text c="dimmed">
            No events have been assigned to you yet.
          </Text>
        </Paper>
      )}

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        {events.map((event) => (
          <Paper
            key={event.id}
            withBorder
            p="lg"
            radius="lg"
          >
            <Stack gap="md">
              <Group justify="space-between">
                <IconCalendarEvent
                  size={28}
                  color="#4f46e5"
                />
                <Badge color="teal">
                  Assigned
                </Badge>
              </Group>

              <Box>
                <Title order={4}>{event.title}</Title>
                <Text size="sm" c="dimmed">
                  {event.event_type}
                </Text>
              </Box>

              <Text size="sm" lineClamp={3}>
                {event.description}
              </Text>

              <Text size="sm">
                <strong>Schedule:</strong>{" "}
                {event.start_date} – {event.end_date}
              </Text>

              <Button
                color="indigo"
                leftSection={<IconEye size={17} />}
                onClick={() =>
                  navigate(`/assigned-events/${event.id}`)
                }
              >
                View Event
              </Button>
            </Stack>
          </Paper>
        ))}
      </SimpleGrid>
    </Box>
  );
}
