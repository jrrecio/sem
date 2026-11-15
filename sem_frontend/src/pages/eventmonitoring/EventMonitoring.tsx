
import { useEffect, useState } from "react";
import {
  Stack,
  Title,
  Text,
  Loader,
  Alert,
  Card,
  Progress,
  Group,
} from "@mantine/core";

import {
  getMonitoringEvents,
  type MonitoringEvent,
} from "../../api/eventMonitoring";

export default function EventMonitoring() {
  // Store approved events
  const [events, setEvents] = useState<MonitoringEvent[]>([]);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch events when page loads
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getMonitoringEvents();
        setEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
        setError("Failed to load approved events.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <Stack p="lg" gap="md">
      <Title order={2}>Event Monitoring</Title>

      <Text c="dimmed">
        Monitor approved school events,
        assigned tasks, and event progress.
      </Text>

      {/* Loading indicator */}
      {loading && <Loader />}

      {/* Error message */}
      {error && (
        <Alert color="red" title="Error">
          {error}
        </Alert>
      )}

      {/* Approved events */}
      {!loading && !error && (
        <>
          <Title order={4}>Approved Events</Title>

          {events.length === 0 ? (
            <Text c="dimmed">
              No approved events found.
            </Text>
          ) : (
            events.map((event) => (
              <Card
                key={event.id}
                withBorder
                radius="md"
                p="md"
              >
                <Title order={4}>{event.title}</Title>

                <Text size="sm" c="dimmed">
                  Status: {event.status}
                </Text>

               <Group justify="space-between">
  <Text size="sm" fw={500}>
    Event Progress
  </Text>

  <Text size="sm" fw={600}>
    {event.progress}%
  </Text>
</Group>

<Progress
  value={event.progress}
  color="blue"
  size="lg"
  radius="xl"
/>

<Text size="sm" c="dimmed">
  {event.completed_tasks_count} of{" "}
  {event.monitoring_tasks_count} tasks completed
</Text>
              </Card>
            ))
          )}
        </>
      )}
    </Stack>
  );
}
