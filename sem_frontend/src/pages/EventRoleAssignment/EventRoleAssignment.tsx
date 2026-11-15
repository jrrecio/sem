
import { useEffect, useState } from "react";

import {
  Badge,
  Button,
  Loader,
  Table,
  Text,
  Title,
  Paper,
  Stack,
  Alert,
} from "@mantine/core";

import api from "../../lib/api";

// STEP 1: Define the data structure
interface EventAssignment {
  id: number;
  event_id: number;
  user_id: number;
  event_role: string;

  event: {
    id: number;
    title: string;
  };

  student: {
    id: number;
    name: string;
    email: string;
  };
}

// STEP 2: Create the React component
export function EventRoleAssignment() {
  

  // Store assignments from Laravel
  const [assignments, setAssignments] =
    useState<EventAssignment[]>([]);
  useEffect(() => {
  const fetchAssignments = async () => {
    try {
      const response = await api.get("/event-assignments");

      setAssignments(response.data);
    } catch (error) {
      console.error("Error loading students:", error);
    }
  };

  void fetchAssignments();
}, []);

  // Track loading and errors
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // STEP 3: Fetch data from Laravel
  const fetchAssignments = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(
        "/event-assignments"
      );

      // Save Laravel data into React state
      setAssignments(response.data);

    } catch (err) {
      console.error(err);
      setError("Failed to load event assignments.");

    } finally {
      setLoading(false);
    }
  };

  // STEP 4: Load data when page opens
  useEffect(() => {
    void fetchAssignments();
  }, []);

  // STEP 5: Display loading indicator
  if (loading) {
    return <Loader />;
  }

  // STEP 6: Display the data
  return (
    <Stack gap="lg" p="lg">

      <Title order={2}>
        Event Role Assignment
      </Title>

      <Text c="dimmed">
        View students assigned to school events.
      </Text>

      <Button
        onClick={fetchAssignments}
        style={{ alignSelf: "flex-start" }}
      >
        Refresh Assignments
      </Button>

      {error && (
        <Alert color="red">
          {error}
        </Alert>
      )}

      <Paper withBorder p="lg" radius="lg">
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Student Name</Table.Th>
              <Table.Th>Event</Table.Th>
              <Table.Th>Assigned Role</Table.Th>
              <Table.Th>Status</Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {assignments.map((assignment) => (
              <Table.Tr key={assignment.id}>

                <Table.Td>
                  {assignment.student?.name ?? "Unknown"}
                </Table.Td>

                <Table.Td>
                  {assignment.event?.title ?? "Unknown"}
                </Table.Td>

                <Table.Td>
                  {assignment.event_role}
                </Table.Td>

                <Table.Td>
                  <Badge color="green">
                    Assigned
                  </Badge>
                </Table.Td>

              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        {assignments.length === 0 && !error && (
          <Text ta="center" c="dimmed" mt="md">
            No student assignments found.
          </Text>
        )}
      </Paper>

    </Stack>
  );
}
