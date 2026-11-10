
import { Container, Paper, Stack, Text, Title } from "@mantine/core";
import { useAuth } from "../../context/AuthContext";
import { AssignedEvents } from "../../components/AssignedEvents";

export function UserDashboard() {
  const { user } = useAuth();

  return (
  
    <Container size="lg">
      <Stack gap="lg">
        <Title order={2}>User Dashboard</Title>

        <Paper p="xl" radius="md" withBorder>
          <Title order={3}>
            Welcome, {user?.name}!
          </Title>

          <Text c="dimmed" mt="sm">
            This is your personal dashboard.
          </Text>
          <AssignedEvents />
        </Paper>
      </Stack>
    </Container>
  );
}
