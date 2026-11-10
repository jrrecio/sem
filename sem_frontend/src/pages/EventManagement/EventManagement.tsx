
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Grid,
  Group,
  Loader,
  Modal,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconCalendarEvent,
  IconCalendarTime,
  IconCheck,
  IconCircleCheck,
  IconClock,
  IconCurrencyPeso,
  IconEye,
  IconFilter,
  IconRefresh,
  IconSearch,
  IconUser,
  IconUserCheck,
  IconUserPlus,
  IconUsers,
} from "@tabler/icons-react";

import { getEvents } from "../../api/events";
import {
  getEligibleCoordinators,
  assignEventCoordinator,
  type EligibleUser,
} from "../../api/eventAssignment";
import { IconTrash } from "@tabler/icons-react";
import { deleteEvent } from "../../api/events";

import "./EventManagement.css";

interface ManagedEvent {
  id: number;
  title: string;
  event_type: string;
  description?: string | null;
  start_date: string;
  end_date: string;
  estimated_budget: number | string | null;
  estimated_attendees?: number | null;
  status: string;
  assigned_user_id?: number | null;
  user?: { name: string } | null;
  coordinator?: {
    id: number;
    name: string;
    email: string;
  } | null;
}

type FilterType = "all" | "assigned" | "unassigned";
type EventTiming = "upcoming" | "ongoing" | "past";

const money = (amount: number | string | null) =>
  `₱${Number(amount ?? 0).toLocaleString("en-PH")}`;

const formatDate = (date: string) => {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime())
    ? date
    : parsed.toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
};

const dateOnly = (date: string) => date.slice(0, 10);

const getTiming = (event: ManagedEvent): EventTiming => {
  const today = new Date();
  const currentDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  if (dateOnly(event.start_date) > currentDate) {
    return "upcoming";
  }

  if (dateOnly(event.end_date) < currentDate) {
    return "past";
  }

  return "ongoing";
};

const timingLabels = {
  upcoming: { label: "Upcoming", color: "blue" },
  ongoing: { label: "Scheduled Today", color: "green" },
  past: { label: "Date Passed", color: "gray" },
};

export default function EventManagement() {
  const [events, setEvents] = useState<ManagedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  const [assignmentEvent, setAssignmentEvent] =
    useState<ManagedEvent | null>(null);
  const [detailsEvent, setDetailsEvent] =
    useState<ManagedEvent | null>(null);

  const [eligibleUsers, setEligibleUsers] =
    useState<EligibleUser[]>([]);
  const [selectedUserId, setSelectedUserId] =
    useState<string | null>(null);

  const [assignmentLoading, setAssignmentLoading] =
    useState(false);
  const [assignmentSaving, setAssignmentSaving] =
    useState(false);
  const [assignmentError, setAssignmentError] = useState("");
  const [deleteTarget, setDeleteTarget] =
  useState<ManagedEvent | null>(null);

const [deleting, setDeleting] = useState(false);
const [deleteError, setDeleteError] = useState("");

  const loadEvents = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getEvents();
      const allEvents: ManagedEvent[] = Array.isArray(response)
        ? response
        : response.data ?? [];

      setEvents(
        allEvents.filter((event) => event.status === "approved")
      );
    } catch {
      setError("Unable to load approved events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadEvents();
  }, []);

  const isAssigned = (event: ManagedEvent) =>
    event.assigned_user_id != null || event.coordinator != null;

  const assignedCount = events.filter(isAssigned).length;
  const unassignedCount = events.length - assignedCount;
  const upcomingCount = events.filter(
    (event) => getTiming(event) === "upcoming"
  ).length;

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const query = search.toLowerCase().trim();

      const matchesSearch =
        event.title.toLowerCase().includes(query) ||
        event.event_type.toLowerCase().includes(query) ||
        (event.user?.name ?? "").toLowerCase().includes(query) ||
        (event.coordinator?.name ?? "")
          .toLowerCase()
          .includes(query);

      const matchesFilter =
        filter === "all" ||
        (filter === "assigned" && isAssigned(event)) ||
        (filter === "unassigned" && !isAssigned(event));

      return matchesSearch && matchesFilter;
    });
  }, [events, search, filter]);

  const openAssignment = async (event: ManagedEvent) => {
    setAssignmentEvent(event);
    setSelectedUserId(
      event.assigned_user_id != null
        ? String(event.assigned_user_id)
        : event.coordinator
          ? String(event.coordinator.id)
          : null
    );
    setAssignmentError("");
    setAssignmentLoading(true);

    try {
      const users = await getEligibleCoordinators();
      setEligibleUsers(users);
    } catch {
      setAssignmentError("Unable to load registered users.");
    } finally {
      setAssignmentLoading(false);
    }
  };

  const closeAssignment = () => {
    if (assignmentSaving) return;
    setAssignmentEvent(null);
    setSelectedUserId(null);
    setAssignmentError("");
  };

  const saveAssignment = async () => {
    if (!assignmentEvent || !selectedUserId) return;

    setAssignmentSaving(true);
    setAssignmentError("");
    setSuccessMessage("");

    try {
      await assignEventCoordinator(
        assignmentEvent.id,
        Number(selectedUserId)
      );

      setAssignmentEvent(null);
      setSelectedUserId(null);
      setSuccessMessage(
        "Event coordinator assigned successfully!"
      );

      await loadEvents();
    } catch {
      setAssignmentError(
        "Unable to assign coordinator. Please try again."
      );
    } finally {
      setAssignmentSaving(false);
    }
  };

  const statCards = [
    {
      label: "Approved Events",
      value: events.length,
      icon: IconCalendarEvent,
      color: "blue",
      description: "Ready for management",
    },
    {
      label: "Assigned Events",
      value: assignedCount,
      icon: IconUserCheck,
      color: "teal",
      description: "With event coordinators",
    },
    {
      label: "Unassigned Events",
      value: unassignedCount,
      icon: IconUserPlus,
      color: "orange",
      description: "Need a coordinator",
    },
    {
      label: "Upcoming Events",
      value: upcomingCount,
      icon: IconCalendarTime,
      color: "violet",
      description: "Scheduled for future dates",
    },
  ];

  return (
    <div className="event-management-page">
      <div className="em-header">
        <div>
          <Group gap="xs" mb={8}>
            <Badge color="indigo" variant="light">
              SMARTCAMPUS
            </Badge>
            <Badge variant="outline" color="gray">
              ADMIN WORKSPACE
            </Badge>
          </Group>

          <Title order={2} className="em-page-title">
            Event Management
          </Title>

          <Text c="dimmed" size="sm" mt={5}>
            Organize approved school events, monitor schedules,
            and assign event coordinators.
          </Text>
        </div>

        <Button
          leftSection={<IconRefresh size={17} />}
          variant="default"
          loading={loading}
          onClick={() => void loadEvents()}
        >
          Refresh Events
        </Button>
      </div>

      {error && (
        <Alert color="red" mb="md" withCloseButton
          onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert
          color="green"
          mb="md"
          withCloseButton
          onClose={() => setSuccessMessage("")}
        >
          {successMessage}
        </Alert>
      )}

      <SimpleGrid cols={{ base: 1, xs: 2, lg: 4 }} mb="xl">
        {statCards.map((stat) => {
          const StatIcon = stat.icon;

          return (
            <Paper
              key={stat.label}
              withBorder
              radius="lg"
              p="lg"
              className="em-stat-card"
            >
              <Group justify="space-between" align="flex-start">
                <ThemeIcon
                  size={44}
                  radius="md"
                  color={stat.color}
                  variant="light"
                >
                  <StatIcon size={23} />
                </ThemeIcon>
              </Group>

              <Title order={2} mt="md">
                {loading ? "—" : stat.value}
              </Title>

              <Text fw={600} size="sm" mt={3}>
                {stat.label}
              </Text>

              <Text c="dimmed" size="xs" mt={3}>
                {stat.description}
              </Text>
            </Paper>
          );
        })}
      </SimpleGrid>

      <Paper withBorder radius="xl" p="lg" className="em-main-panel">
        <Group justify="space-between" mb="lg">
          <div>
            <Title order={4}>School Events</Title>
            <Text size="xs" c="dimmed" mt={4}>
              Browse and manage approved event proposals
            </Text>
          </div>
          <Badge variant="light" color="indigo" size="lg">
            {filteredEvents.length} Events
          </Badge>
        </Group>

        <Group mb="lg" align="end" gap="sm">
          <TextInput
            className="em-search"
            placeholder="Search events, organizers, coordinators..."
            leftSection={<IconSearch size={17} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
          />

          <Select
            className="em-filter"
            leftSection={<IconFilter size={17} />}
            value={filter}
            onChange={(value) =>
              setFilter((value ?? "all") as FilterType)
            }
            data={[
              { value: "all", label: "All Events" },
              { value: "assigned", label: "Assigned" },
              { value: "unassigned", label: "Unassigned" },
            ]}
            allowDeselect={false}
          />
        </Group>

        {loading ? (
          <Stack align="center" py={60}>
            <Loader color="indigo" />
            <Text size="sm" c="dimmed">
              Loading school events...
            </Text>
          </Stack>
        ) : filteredEvents.length === 0 ? (
          <Stack align="center" py={60} gap="sm">
            <ThemeIcon
              size={64}
              radius="xl"
              color="gray"
              variant="light"
            >
              <IconCalendarEvent size={30} />
            </ThemeIcon>

            <Text fw={600}>No events found</Text>
            <Text c="dimmed" size="sm" ta="center">
              {events.length === 0
                ? "Approved events will appear here."
                : "Try another search or filter."}
            </Text>

            {events.length > 0 && (
              <Button
                variant="subtle"
                onClick={() => {
                  setSearch("");
                  setFilter("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </Stack>
        ) : (
          <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }}>
            {filteredEvents.map((event) => {
              const timing = timingLabels[getTiming(event)];
              const assigned = isAssigned(event);

              return (
                <Card
                  key={event.id}
                  withBorder
                  radius="lg"
                  padding="lg"
                  className="em-event-card"
                >
                  <Stack gap="md" h="100%">
                    <Group justify="space-between" align="start">
                      <ThemeIcon
                        size={46}
                        radius="md"
                        color="indigo"
                        variant="light"
                      >
                        <IconCalendarEvent size={24} />
                      </ThemeIcon>

                      <Badge
                        color={timing.color}
                        variant="light"
                      >
                        {timing.label}
                      </Badge>
                    </Group>

                    <Box>
                      <Text
                        size="xs"
                        c="indigo"
                        fw={700}
                        tt="uppercase"
                        mb={5}
                      >
                        {event.event_type}
                      </Text>

                      <Title order={4} className="em-event-title">
                        {event.title}
                      </Title>

                      <Badge
                        color="green"
                        variant="dot"
                        mt="sm"
                      >
                        Approved Proposal
                      </Badge>
                    </Box>

                    <Divider />

                    <Stack gap="sm">
                      <Group gap="sm" wrap="nowrap">
                        <IconCalendarTime
                          size={18}
                          className="em-muted-icon"
                        />
                        <div>
                          <Text size="xs" c="dimmed">
                            Event Schedule
                          </Text>
                          <Text size="sm" fw={500}>
                            {formatDate(event.start_date)}
                            {" – "}
                            {formatDate(event.end_date)}
                          </Text>
                        </div>
                      </Group>

                      <Group gap="sm" wrap="nowrap">
                        <IconUser
                          size={18}
                          className="em-muted-icon"
                        />
                        <div>
                          <Text size="xs" c="dimmed">
                            Event Organizer
                          </Text>
                          <Text size="sm" fw={500}>
                            {event.user?.name ?? "Unknown"}
                          </Text>
                        </div>
                      </Group>

                      <Group gap="sm" wrap="nowrap">
                        <IconCurrencyPeso
                          size={18}
                          className="em-muted-icon"
                        />
                        <div>
                          <Text size="xs" c="dimmed">
                            Estimated Budget
                          </Text>
                          <Text size="sm" fw={600}>
                            {money(event.estimated_budget)}
                          </Text>
                        </div>
                      </Group>
                    </Stack>

                    <div className="em-coordinator-box">
                      <Group justify="space-between" mb="sm">
                        <Text size="xs" fw={700} c="dimmed">
                          EVENT COORDINATOR
                        </Text>
                        <Badge
                          size="xs"
                          color={assigned ? "teal" : "orange"}
                          variant="light"
                        >
                          {assigned ? "Assigned" : "Unassigned"}
                        </Badge>
                      </Group>

                      <Group gap="sm">
                        <Avatar
                          color={assigned ? "indigo" : "gray"}
                          radius="xl"
                        >
                          {assigned ? (
                            <IconUserCheck size={19} />
                          ) : (
                            <IconUsers size={19} />
                          )}
                        </Avatar>

                        <div>
                          <Text size="sm" fw={600}>
                            {event.coordinator?.name ??
                              (assigned
                                ? "Coordinator assigned"
                                : "No coordinator yet")}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {event.coordinator?.email ??
                              (assigned
                                ? "Assignment saved"
                                : "Waiting for assignment")}
                          </Text>
                        </div>
                      </Group>
                    </div>

                    <Group grow mt="auto" gap="xs">
                      <Button
                        variant="default"
                        leftSection={<IconEye size={16} />}
                        onClick={() => setDetailsEvent(event)}
                      >
                        Details
                      </Button>

                      <Button
                        color="indigo"
                        leftSection={
                          assigned ? (
                            <IconUserCheck size={16} />
                          ) : (
                            <IconUserPlus size={16} />
                          )
                        }
                        onClick={() =>
                          void openAssignment(event)
                        }
                      >
                        {assigned ? "Change" : "Assign"}
                      </Button>
                        <Button
    color="red"
    variant="light"
    leftSection={<IconTrash size={16} />}
    onClick={() => setDeleteTarget(event)}
  >
    Delete
  </Button>
                    </Group>
                  </Stack>
                </Card>
              );
            })}
          </SimpleGrid>
        )}
      </Paper>

      {/* Event Details */}
      <Modal
        opened={detailsEvent !== null}
        onClose={() => setDetailsEvent(null)}
        title="Event Details"
        centered
        size="lg"
        radius="lg"
      >
        {detailsEvent && (
          <Stack gap="lg">
            <div>
              <Badge color="green" variant="light" mb="sm">
                Approved
              </Badge>
              <Title order={3}>{detailsEvent.title}</Title>
              <Text c="dimmed" size="sm">
                {detailsEvent.event_type}
              </Text>
            </div>

            {detailsEvent.description && (
              <div>
                <Text fw={600} size="sm" mb={5}>
                  Description
                </Text>
                <Text size="sm">
                  {detailsEvent.description}
                </Text>
              </div>
            )}

            <Divider />

            <Grid>
              <Grid.Col span={6}>
                <Text size="xs" c="dimmed">Start Date</Text>
                <Text fw={600} size="sm">
                  {formatDate(detailsEvent.start_date)}
                </Text>
              </Grid.Col>

              <Grid.Col span={6}>
                <Text size="xs" c="dimmed">End Date</Text>
                <Text fw={600} size="sm">
                  {formatDate(detailsEvent.end_date)}
                </Text>
              </Grid.Col>

              <Grid.Col span={6}>
                <Text size="xs" c="dimmed">Estimated Budget</Text>
                <Text fw={600} size="sm">
                  {money(detailsEvent.estimated_budget)}
                </Text>
              </Grid.Col>

              <Grid.Col span={6}>
                <Text size="xs" c="dimmed">Attendees</Text>
                <Text fw={600} size="sm">
                  {detailsEvent.estimated_attendees ?? "Not specified"}
                </Text>
              </Grid.Col>

              <Grid.Col span={12}>
                <Text size="xs" c="dimmed">Organizer</Text>
                <Text fw={600} size="sm">
                  {detailsEvent.user?.name ?? "Unknown"}
                </Text>
              </Grid.Col>
            </Grid>

            <Paper withBorder radius="md" p="md">
              <Group justify="space-between">
                <div>
                  <Text size="xs" c="dimmed">
                    Assigned Coordinator
                  </Text>
                  <Text fw={600}>
                    {detailsEvent.coordinator?.name ??
                      "Not assigned"}
                  </Text>
                </div>

                <Button
                  size="xs"
                  variant="light"
                  onClick={() => {
                    const selectedEvent = detailsEvent;
                    setDetailsEvent(null);
                    void openAssignment(selectedEvent);
                  }}
                >
                  {isAssigned(detailsEvent) ? "Change" : "Assign"}
                </Button>
              </Group>
            </Paper>

            <Button
              variant="default"
              onClick={() => setDetailsEvent(null)}
            >
              Close
            </Button>
          </Stack>
        )}
      </Modal>

      {/* Assign Coordinator */}
      <Modal
        opened={assignmentEvent !== null}
        onClose={closeAssignment}
        title="Assign Event Coordinator"
        centered
        size="md"
        radius="lg"
        closeOnClickOutside={!assignmentSaving}
        closeOnEscape={!assignmentSaving}
      >
        <Stack gap="lg">
          <Paper
            radius="md"
            p="md"
            className="em-assignment-summary"
          >
            <Group gap="sm">
              <ThemeIcon
                size={44}
                radius="md"
                color="indigo"
                variant="light"
              >
                <IconCalendarEvent size={22} />
              </ThemeIcon>

              <div>
                <Text fw={700}>
                  {assignmentEvent?.title}
                </Text>
                <Text size="xs" c="dimmed">
                  {assignmentEvent?.event_type}
                </Text>
              </div>
            </Group>
          </Paper>

          <Text size="sm" c="dimmed">
            Select one registered user to coordinate this
            event. You can change the assigned coordinator
            later.
          </Text>

          {assignmentError && (
            <Alert color="red">
              {assignmentError}
            </Alert>
          )}

          {assignmentLoading ? (
            <Group justify="center" py="xl">
              <Loader color="indigo" />
            </Group>
          ) : (
            <Select
              label="Event Coordinator"
              description="Choose a registered user"
              placeholder="Search by name or email"
              leftSection={<IconSearch size={17} />}
              data={eligibleUsers.map((user) => ({
                value: String(user.id),
                label: `${user.name} (${user.email})`,
              }))}
              value={selectedUserId}
              onChange={setSelectedUserId}
              searchable
              disabled={assignmentSaving}
              nothingFoundMessage="No users found"
              size="md"
              radius="md"
            />
          )}

          {selectedUserId && (
            <Paper withBorder radius="md" p="sm">
              <Group gap="sm">
                <Avatar color="indigo" radius="xl">
                  <IconUser size={18} />
                </Avatar>
                <div>
                  <Text size="sm" fw={600}>
                    {eligibleUsers.find(
                      (user) =>
                        String(user.id) === selectedUserId
                    )?.name ?? "Selected Coordinator"}
                  </Text>
                  <Text size="xs" c="dimmed">
                    Selected for assignment
                  </Text>
                </div>
                <IconCircleCheck
                  size={20}
                  color="teal"
                  style={{ marginLeft: "auto" }}
                />
              </Group>
            </Paper>
          )}

          <Divider />

          <Group justify="flex-end">
            <Button
              variant="default"
              onClick={closeAssignment}
              disabled={assignmentSaving}
            >
              Cancel
            </Button>

            <Button
              color="indigo"
              leftSection={<IconCheck size={17} />}
              loading={assignmentSaving}
              disabled={
                !selectedUserId ||
                assignmentLoading ||
                eligibleUsers.length === 0
              }
              onClick={() => void saveAssignment()}
            >
              Confirm Assignment
            </Button>
          </Group>
        </Stack>
      </Modal>

<Modal
  opened={deleteTarget !== null}
  onClose={() => {
    if (!deleting) {
      setDeleteTarget(null);
      setDeleteError("");
    }
  }}
  title="Delete Event"
  centered
>
  <Stack gap="md">
    <Text size="sm">
      Are you sure you want to permanently delete
      <Text span fw={700}>
        {" "}{deleteTarget?.title}
      </Text>
      ?
    </Text>

    {deleteError && (
      <Alert color="red">{deleteError}</Alert>
    )}

    <Group justify="flex-end">
      <Button
        variant="default"
        disabled={deleting}
        onClick={() => setDeleteTarget(null)}
      >
        Cancel
      </Button>

      <Button
        color="red"
        loading={deleting}
        leftSection={<IconTrash size={16} />}
        onClick={async () => {
          if (!deleteTarget) return;

          setDeleting(true);
          setDeleteError("");

          try {
            await deleteEvent(deleteTarget.id);
            setDeleteTarget(null);
            await loadEvents();
          } catch {
            setDeleteError("Failed to delete event.");
          } finally {
            setDeleting(false);
          }
        }}
      >
        Delete Event
      </Button>
    </Group>
  </Stack>
</Modal>

    </div>
  );
}
