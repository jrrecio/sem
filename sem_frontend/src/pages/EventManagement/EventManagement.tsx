
import axios from "axios";
import { useEffect, useMemo, useState } from "react";

// ============================================================
// 1. MANTINE UI IMPORTS
// Purpose: Components for the Event Management interface.
// ============================================================

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

// ============================================================
// 2. ICON IMPORTS
// Purpose: Icons used in the dashboard and action buttons.
// ============================================================

import {
  IconCalendarEvent,
  IconCalendarTime,
  IconCheck,
  IconCurrencyPeso,
  IconEye,
  IconFilter,
  IconRefresh,
  IconSearch,
  IconTrash,
  IconUser,
  IconUserCheck,
  IconUserPlus,
  IconUsers,
} from "@tabler/icons-react";

// ============================================================
// 3. API IMPORTS
// Purpose: Communicate with the Laravel backend.
// ============================================================

import {
  getEvents,
  deleteEvent,
} from "../../api/events";

import {
  getEligibleCoordinators,
  getEventAssignments,
  assignStudentToEvent,
  updateEventAssignment,
  deleteEventAssignment,
  EVENT_ROLES,
  type EventRole,
  type EligibleStudent,
  type EventAssignment,
} from "../../api/eventAssignment";

// ============================================================
// 4. CSS IMPORT
// Purpose: Keep your existing Event Management styling.
// ============================================================

import "./EventManagement.css";

// ============================================================
// 5. EVENT DATA TYPES
// Purpose: Define the structure of events from Laravel.
// ============================================================

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

  user?: {
    name: string;
  } | null;
}

type FilterType = "all" | "assigned" | "unassigned";

type EventTiming = "upcoming" | "ongoing" | "past";

// ============================================================
// 6. HELPER FUNCTIONS
// Purpose: Format money, dates, and event schedule status.
// ============================================================

const money = (amount: number | string | null) => {
  return `₱${Number(amount ?? 0).toLocaleString("en-PH")}`;
};

const formatDate = (date: string) => {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-PH", {
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
  upcoming: {
    label: "Upcoming",
    color: "blue",
  },
  ongoing: {
    label: "Scheduled Today",
    color: "green",
  },
  past: {
    label: "Date Passed",
    color: "gray",
  },
};

// ============================================================
// 7. MAIN COMPONENT
// Purpose: Administrator Event Management dashboard.
// ============================================================

export default function EventManagement() {

  // ==========================================================
  // 8. EVENT AND ASSIGNMENT STATES
  // Purpose: Store events, assigned students, and messages.
  // ==========================================================

  const [events, setEvents] = useState<ManagedEvent[]>([]);

  const [assignments, setAssignments] =
    useState<EventAssignment[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  // ==========================================================
  // 9. SEARCH AND FILTER STATES
  // Purpose: Search events and filter assignment status.
  // ==========================================================

  const [search, setSearch] = useState("");

  const [filter, setFilter] =
    useState<FilterType>("all");

  // ==========================================================
  // 10. MODAL STATES
  // Purpose: Control which popup is currently displayed.
  // ==========================================================

  const [assignmentEvent, setAssignmentEvent] =
    useState<ManagedEvent | null>(null);

  const [detailsEvent, setDetailsEvent] =
    useState<ManagedEvent | null>(null);

  const [deleteTarget, setDeleteTarget] =
    useState<ManagedEvent | null>(null);

  // ==========================================================
  // 11. ASSIGNMENT FORM STATES
  // Purpose: Add or edit student assignments and roles.
  // ==========================================================

  const [eligibleUsers, setEligibleUsers] =
    useState<EligibleStudent[]>([]);

  const [selectedUserId, setSelectedUserId] =
    useState<string | null>(null);

  const [selectedRole, setSelectedRole] =
    useState<EventRole>("Event Coordinator");

  const [editingAssignmentId, setEditingAssignmentId] =
    useState<number | null>(null);

  const [assignmentLoading, setAssignmentLoading] =
    useState(false);

  const [assignmentSaving, setAssignmentSaving] =
    useState(false);

  const [assignmentError, setAssignmentError] =
    useState("");

  // ==========================================================
  // 12. DELETE EVENT STATES
  // Purpose: Track event deletion and errors.
  // ==========================================================

  const [deleting, setDeleting] = useState(false);

  const [deleteError, setDeleteError] = useState("");

  // ==========================================================
  // 13. FETCH APPROVED EVENTS
  // Purpose: Retrieve approved school events from Laravel.
  // ==========================================================

  const loadEvents = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getEvents();

      const allEvents: ManagedEvent[] =
        Array.isArray(response)
          ? response
          : response.data ?? [];

      const approvedEvents = allEvents.filter(
        (event) => event.status === "approved"
      );

      setEvents(approvedEvents);
    } catch (err) {
      console.error("Failed to fetch events:", err);
      setError("Unable to load approved events.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // 14. FETCH EVENT ASSIGNMENTS
  // Purpose: Retrieve students and their event roles.
  // ==========================================================

  const loadAssignments = async () => {
    try {
      const data = await getEventAssignments();

      setAssignments(data);
    } catch (err) {
      console.error("Failed to fetch assignments:", err);
      setError("Unable to load event assignments.");
      throw err;
    }
  };

  // ==========================================================
  // 15. INITIAL DATA FETCH
  // Purpose: Load data when the page first opens.
  // ==========================================================

  useEffect(() => {
    void loadEvents();
    void loadAssignments().catch(() => {});
  }, []);

  // ==========================================================
  // 16. GET EVENT COORDINATOR
  // Purpose: Find the main coordinator for a specific event.
  // ==========================================================

  const getCoordinator = (eventId: number) => {
    return assignments.find(
      (assignment) =>
        assignment.event_id === eventId &&
        assignment.event_role === "Event Coordinator"
    );
  };

  // ==========================================================
  // 17. CHECK COORDINATOR STATUS
  // Purpose: Determine if an event has a main coordinator.
  // ==========================================================

  const isAssigned = (event: ManagedEvent) => {
    return Boolean(getCoordinator(event.id));
  };

  // ==========================================================
  // 18. GET ASSIGNED STUDENTS
  // Purpose: Get ALL assignments for one event.
  // ==========================================================

  const getAssignedStudents = (eventId: number) => {
    return assignments.filter(
      (assignment) => assignment.event_id === eventId
    );
  };

  // ==========================================================
  // 19. DASHBOARD STATISTICS
  // Purpose: Calculate approved, assigned, and upcoming events.
  // ==========================================================

  const assignedCount = events.filter(isAssigned).length;

  const unassignedCount = events.length - assignedCount;

  const upcomingCount = events.filter(
    (event) => getTiming(event) === "upcoming"
  ).length;

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

  // ==========================================================
  // 20. SEARCH AND FILTER
  // Purpose: Search events, organizers, and assigned students.
  // ==========================================================

  const filteredEvents = useMemo(() => {
    const query = search.toLowerCase().trim();

    return events.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(query) ||
        event.event_type.toLowerCase().includes(query) ||
        (event.user?.name ?? "")
          .toLowerCase()
          .includes(query) ||
        assignments.some(
          (assignment) =>
            assignment.event_id === event.id &&
            (
              (assignment.student?.name ?? "")
                .toLowerCase()
                .includes(query) ||
              (assignment.student?.email ?? "")
                .toLowerCase()
                .includes(query)
            )
        );

      const hasCoordinator = assignments.some(
        (assignment) =>
          assignment.event_id === event.id &&
          assignment.event_role === "Event Coordinator"
      );

      const matchesFilter =
        filter === "all" ||
        (filter === "assigned" && hasCoordinator) ||
        (filter === "unassigned" && !hasCoordinator);

      return matchesSearch && matchesFilter;
    });
  }, [events, assignments, search, filter]);

  // ==========================================================
  // 21. OPEN MANAGE ASSIGNMENTS
  // Purpose: Show assigned students and load eligible users.
  // ==========================================================

  const openAssignment = async (event: ManagedEvent) => {
    setAssignmentEvent(event);
    setSelectedUserId(null);
    setSelectedRole("Event Coordinator");
    setEditingAssignmentId(null);
    setAssignmentError("");
    setAssignmentLoading(true);

    try {
      const [users, currentAssignments] = await Promise.all([
        getEligibleCoordinators(),
        getEventAssignments(),
      ]);

      setEligibleUsers(users);
      setAssignments(currentAssignments);
    } catch (err) {
      console.error("Failed to load assignment data:", err);

      setAssignmentError(
        "Unable to load students or event assignments."
      );
    } finally {
      setAssignmentLoading(false);
    }
  };

  // ==========================================================
  // 22. CLOSE ASSIGNMENT MODAL
  // Purpose: Close the popup and reset the form.
  // ==========================================================

  const closeAssignment = () => {
    if (assignmentSaving) return;

    setAssignmentEvent(null);
    setSelectedUserId(null);
    setSelectedRole("Event Coordinator");
    setEditingAssignmentId(null);
    setAssignmentError("");
  };

  // ==========================================================
  // 23. START EDIT ASSIGNMENT
  // Purpose: Select an existing assignment for editing.
  // ==========================================================

  const startEditAssignment = (
    assignment: EventAssignment
  ) => {
    setEditingAssignmentId(assignment.id);
    setSelectedUserId(String(assignment.user_id));
    setSelectedRole(assignment.event_role as EventRole);
    setAssignmentError("");
  };

  // ==========================================================
  // 24. CANCEL EDIT
  // Purpose: Return the form to Add Assignment mode.
  // ==========================================================

  const cancelEditAssignment = () => {
    setEditingAssignmentId(null);
    setSelectedUserId(null);
    setSelectedRole("Event Coordinator");
    setAssignmentError("");
  };

  // ==========================================================
  // 25. SAVE ASSIGNMENT
  // Purpose: Create a new assignment or update an existing one.
  // ==========================================================

  const saveAssignment = async () => {
    if (!assignmentEvent || !selectedUserId) return;

    setAssignmentSaving(true);
    setAssignmentError("");
    setSuccessMessage("");

    try {
      if (editingAssignmentId !== null) {
        // UPDATE EXISTING ASSIGNMENT
        await updateEventAssignment(
          editingAssignmentId,
          Number(selectedUserId),
          selectedRole
        );
      } else {
        // CREATE NEW ASSIGNMENT
        await assignStudentToEvent(
          assignmentEvent.id,
          Number(selectedUserId),
          selectedRole
        );
      }

      // Refresh assigned students after saving.
      await loadAssignments();

      setSuccessMessage(
        editingAssignmentId !== null
          ? "Student assignment updated successfully!"
          : "Student assigned successfully!"
      );

      // Reset the form while keeping the popup open.
      cancelEditAssignment();
    } catch (err) {
      console.error("Assignment error:", err);

      setAssignmentError(
        axios.isAxiosError(err)
          ? err.response?.data?.message ??
              "Unable to save student assignment."
          : "Unable to save student assignment."
      );
    } finally {
      setAssignmentSaving(false);
    }
  };

  // ==========================================================
  // 26. REMOVE ASSIGNED STUDENT
  // Purpose: Delete only one event assignment.
  // ==========================================================

  const removeAssignedStudent = async (
    assignmentId: number
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this assignment?"
    );

    if (!confirmed) return;

    setAssignmentSaving(true);
    setAssignmentError("");
    setSuccessMessage("");

    try {
      await deleteEventAssignment(assignmentId);

      // Refresh assigned students.
      await loadAssignments();

      if (editingAssignmentId === assignmentId) {
        cancelEditAssignment();
      }

      setSuccessMessage(
        "Student assignment removed successfully!"
      );
    } catch (err) {
      console.error("Failed to remove assignment:", err);

      setAssignmentError(
        axios.isAxiosError(err)
          ? err.response?.data?.message ??
              "Unable to remove student assignment."
          : "Unable to remove student assignment."
      );
    } finally {
      setAssignmentSaving(false);
    }
  };

  // ==========================================================
  // 27. CLOSE DELETE EVENT MODAL
  // Purpose: Close event deletion confirmation.
  // ==========================================================

  const closeDeleteModal = () => {
    if (deleting) return;

    setDeleteTarget(null);
    setDeleteError("");
  };

  // ==========================================================
  // 28. DELETE EVENT
  // Purpose: Permanently delete an event through Laravel.
  // ==========================================================

  const handleDeleteEvent = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    setDeleteError("");

    try {
      await deleteEvent(deleteTarget.id);

      setDeleteTarget(null);

      await loadEvents();
      await loadAssignments();

      setSuccessMessage("Event deleted successfully.");
    } catch (err) {
      console.error("Failed to delete event:", err);

      setDeleteError(
        axios.isAxiosError(err)
          ? err.response?.data?.message ??
              "Failed to delete event."
          : "Failed to delete event."
      );
    } finally {
      setDeleting(false);
    }
  };

  // ==========================================================
  // 29. MAIN PAGE INTERFACE
  // Purpose: Render the Event Management dashboard.
  // ==========================================================

  return (
    <div className="event-management-page">

      {/* ======================================================
          30. PAGE HEADER
          Purpose: Display title and refresh button.
      ====================================================== */}

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
            and manage student assignments.
          </Text>
        </div>

        <Button
          leftSection={<IconRefresh size={17} />}
          variant="default"
          loading={loading}
          onClick={() => {
            void loadEvents();
            void loadAssignments().catch(() => {});
          }}
        >
          Refresh Events
        </Button>
      </div>

      {/* ======================================================
          31. NOTIFICATIONS
          Purpose: Display errors and success messages.
      ====================================================== */}

      {error && (
        <Alert
          color="red"
          mb="md"
          withCloseButton
          onClose={() => setError("")}
        >
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

      {/* ======================================================
          32. DASHBOARD STATISTICS
          Purpose: Display event totals.
      ====================================================== */}

      <SimpleGrid
        cols={{ base: 1, xs: 2, lg: 4 }}
        mb="xl"
      >
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
              <Group
                justify="space-between"
                align="flex-start"
              >
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

      {/* ======================================================
          33. SCHOOL EVENTS PANEL
          Purpose: Display approved event proposals.
      ====================================================== */}

      <Paper
        withBorder
        radius="xl"
        p="lg"
        className="em-main-panel"
      >
        <Group justify="space-between" mb="lg">
          <div>
            <Title order={4}>
              School Events
            </Title>

            <Text size="xs" c="dimmed" mt={4}>
              Browse and manage approved event proposals
            </Text>
          </div>

          <Badge
            variant="light"
            color="indigo"
            size="lg"
          >
            {filteredEvents.length} Events
          </Badge>
        </Group>

        {/* ====================================================
            34. SEARCH AND FILTER
            Purpose: Find events and filter assignment status.
        ==================================================== */}

        <Group mb="lg" align="end" gap="sm">
          <TextInput
            className="em-search"
            placeholder="Search events, organizers, students..."
            leftSection={<IconSearch size={17} />}
            value={search}
            onChange={(event) =>
              setSearch(event.currentTarget.value)
            }
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

        {/* ====================================================
            35. LOADING AND EMPTY STATES
            Purpose: Display loading or no-events messages.
        ==================================================== */}

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

            <Text fw={600}>
              No events found
            </Text>

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

          /* ==================================================
              36. EVENT CARDS
              Purpose: Show event details and assigned students.
          ================================================== */

          <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }}>
            {filteredEvents.map((event) => {
              const assignedStudents =
                getAssignedStudents(event.id);

              const timing = timingLabels[getTiming(event)];

              return (
                <Card
                  key={event.id}
                  withBorder
                  radius="lg"
                  padding="lg"
                  className="em-event-card"
                >
                  <Stack gap="md" h="100%">

                    {/* EVENT STATUS */}

                    <Group
                      justify="space-between"
                      align="start"
                    >
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

                    {/* EVENT TITLE AND TYPE */}

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

                      <Title
                        order={4}
                        className="em-event-title"
                      >
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

                    {/* EVENT INFORMATION */}

                    <Stack gap="sm">

                      {/* Event Schedule */}

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

                      {/* Event Organizer */}

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

                      {/* Estimated Budget */}

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

                    {/* ========================================
                        37. ASSIGNED STUDENTS ON EVENT CARD
                        Purpose: Show names and assigned roles.
                    ======================================== */}

                    <div className="em-coordinator-box">
                      <Group
                        justify="space-between"
                        mb="sm"
                      >
                        <Text
                          size="xs"
                          fw={700}
                          c="dimmed"
                        >
                          ASSIGNED STUDENTS
                        </Text>

                        <Badge
                          size="xs"
                          color={
                            assignedStudents.length > 0
                              ? "teal"
                              : "orange"
                          }
                          variant="light"
                        >
                          {assignedStudents.length > 0
                            ? `${assignedStudents.length} ASSIGNED`
                            : "UNASSIGNED"}
                        </Badge>
                      </Group>

                      {assignedStudents.length === 0 ? (
                        <Group gap="sm">
                          <Avatar
                            color="gray"
                            radius="xl"
                          >
                            <IconUsers size={19} />
                          </Avatar>

                          <Box>
                            <Text size="sm" fw={600}>
                              No students assigned yet
                            </Text>

                            <Text size="xs" c="dimmed">
                              Waiting for assignment
                            </Text>
                          </Box>
                        </Group>
                      ) : (
                        <Stack gap="sm">
                          {assignedStudents.map(
                            (assignment) => (
                              <Group
                                key={assignment.id}
                                gap="sm"
                                wrap="nowrap"
                              >
                                <Avatar
                                  color="indigo"
                                  radius="xl"
                                >
                                  <IconUserCheck size={19} />
                                </Avatar>

                                <Box style={{ flex: 1, minWidth: 0 }}>
                                  <Text
                                    size="sm"
                                    fw={600}
                                  >
                                    {assignment.student?.name ??
                                      "Unknown Student"}
                                  </Text>

                                  <Text
                                    size="xs"
                                    c="dimmed"
                                  >
                                    {assignment.event_role}
                                  </Text>

                                  {assignment.student?.email && (
                                    <Text
                                      size="xs"
                                      c="dimmed"
                                    >
                                      {assignment.student.email}
                                    </Text>
                                  )}
                                </Box>
                              </Group>
                            )
                          )}
                        </Stack>
                      )}
                    </div>

                    {/* ========================================
                        38. EVENT ACTION BUTTONS
                        Purpose: Details, Manage, and Delete.
                    ======================================== */}

                    <Group grow mt="auto" gap="xs">

                      {/* View Event Details */}

                      <Button
                        variant="default"
                        leftSection={<IconEye size={16} />}
                        onClick={() =>
                          setDetailsEvent(event)
                        }
                      >
                        Details
                      </Button>

                      {/* Manage Student Assignments */}

                      <Button
                        color="indigo"
                        leftSection={<IconUsers size={16} />}
                        onClick={() =>
                          void openAssignment(event)
                        }
                      >
                        Manage
                      </Button>

                      {/* Delete Event */}

                      <Button
                        color="red"
                        variant="light"
                        leftSection={<IconTrash size={16} />}
                        onClick={() =>
                          setDeleteTarget(event)
                        }
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

      {/* ======================================================
          39. EVENT DETAILS MODAL
          Purpose: View complete information about an event.
      ====================================================== */}

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

            {/* Event Header */}

            <div>
              <Badge
                color="green"
                variant="light"
                mb="sm"
              >
                Approved
              </Badge>

              <Title order={3}>
                {detailsEvent.title}
              </Title>

              <Text c="dimmed" size="sm">
                {detailsEvent.event_type}
              </Text>
            </div>

            {/* Event Description */}

            {detailsEvent.description && (
              <div>
                <Text
                  fw={600}
                  size="sm"
                  mb={5}
                >
                  Description
                </Text>

                <Text size="sm">
                  {detailsEvent.description}
                </Text>
              </div>
            )}

            <Divider />

            {/* Event Information */}

            <Grid>
              <Grid.Col span={6}>
                <Text size="xs" c="dimmed">
                  Start Date
                </Text>

                <Text fw={600} size="sm">
                  {formatDate(detailsEvent.start_date)}
                </Text>
              </Grid.Col>

              <Grid.Col span={6}>
                <Text size="xs" c="dimmed">
                  End Date
                </Text>

                <Text fw={600} size="sm">
                  {formatDate(detailsEvent.end_date)}
                </Text>
              </Grid.Col>

              <Grid.Col span={6}>
                <Text size="xs" c="dimmed">
                  Estimated Budget
                </Text>

                <Text fw={600} size="sm">
                  {money(detailsEvent.estimated_budget)}
                </Text>
              </Grid.Col>

              <Grid.Col span={6}>
                <Text size="xs" c="dimmed">
                  Attendees
                </Text>

                <Text fw={600} size="sm">
                  {detailsEvent.estimated_attendees ??
                    "Not specified"}
                </Text>
              </Grid.Col>

              <Grid.Col span={12}>
                <Text size="xs" c="dimmed">
                  Organizer
                </Text>

                <Text fw={600} size="sm">
                  {detailsEvent.user?.name ?? "Unknown"}
                </Text>
              </Grid.Col>
            </Grid>

            {/* Main Event Coordinator */}

            <Paper
              withBorder
              radius="md"
              p="md"
            >
              <Group justify="space-between">
                <div>
                  <Text size="xs" c="dimmed">
                    Assigned Coordinator
                  </Text>

                  <Text fw={600}>
                    {getCoordinator(detailsEvent.id)
                      ?.student?.name ?? "Not assigned"}
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
                  Manage
                </Button>
              </Group>
            </Paper>

            {/* All Assigned Students */}

            <Paper
              withBorder
              radius="md"
              p="md"
            >
              <Text
                fw={600}
                size="sm"
                mb="sm"
              >
                Assigned Students and Roles
              </Text>

              {getAssignedStudents(detailsEvent.id)
                .length === 0 ? (
                <Text size="sm" c="dimmed">
                  No students assigned yet.
                </Text>
              ) : (
                <Stack gap="sm">
                  {getAssignedStudents(
                    detailsEvent.id
                  ).map((assignment) => (
                    <Group
                      key={assignment.id}
                      gap="sm"
                    >
                      <Avatar
                        color="indigo"
                        radius="xl"
                      >
                        <IconUser size={18} />
                      </Avatar>

                      <Box>
                        <Text
                          size="sm"
                          fw={600}
                        >
                          {assignment.student?.name ??
                            "Unknown Student"}
                        </Text>

                        <Text
                          size="xs"
                          c="dimmed"
                        >
                          {assignment.event_role}
                        </Text>
                      </Box>
                    </Group>
                  ))}
                </Stack>
              )}
            </Paper>

            <Button
              variant="default"
              onClick={() =>
                setDetailsEvent(null)
              }
            >
              Close
            </Button>

          </Stack>
        )}
      </Modal>

      {/* ======================================================
          40. MANAGE EVENT ASSIGNMENTS MODAL
          Purpose:
          - View all assigned students
          - Add students with selected roles
          - Edit existing assignments
          - Remove individual assignments
      ====================================================== */}

      <Modal
        opened={assignmentEvent !== null}
        onClose={closeAssignment}
        title="Manage Event Assignments"
        centered
        size="lg"
        radius="lg"
        closeOnClickOutside={!assignmentSaving}
        closeOnEscape={!assignmentSaving}
      >
        <Stack gap="lg">

          {/* ================================================
              40.1 SELECTED EVENT INFORMATION
          ================================================ */}

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

              <Box>
                <Text fw={700}>
                  {assignmentEvent?.title}
                </Text>

                <Text size="xs" c="dimmed">
                  {assignmentEvent?.event_type}
                </Text>
              </Box>
            </Group>
          </Paper>

          {/* ================================================
              40.2 ASSIGNMENT ERROR
          ================================================ */}

          {assignmentError && (
            <Alert color="red">
              {assignmentError}
            </Alert>
          )}

          {/* ================================================
              40.3 CURRENTLY ASSIGNED STUDENTS
              Purpose: Display all assigned students and roles.
          ================================================ */}

          <Box>
            <Group
              justify="space-between"
              mb="md"
            >
              <Text fw={700}>
                Currently Assigned Students
              </Text>

              <Badge
                color="indigo"
                variant="light"
              >
                {assignmentEvent
                  ? getAssignedStudents(
                      assignmentEvent.id
                    ).length
                  : 0}{" "}
                Assignments
              </Badge>
            </Group>

            {assignmentLoading ? (
              <Group
                justify="center"
                py="lg"
              >
                <Loader color="indigo" />
              </Group>
            ) : assignmentEvent &&
              getAssignedStudents(
                assignmentEvent.id
              ).length > 0 ? (

              <Stack gap="sm">
                {getAssignedStudents(
                  assignmentEvent.id
                ).map((assignment) => (
                  <Paper
                    key={assignment.id}
                    withBorder
                    radius="md"
                    p="sm"
                  >
                    <Group
                      justify="space-between"
                      wrap="wrap"
                    >

                      {/* STUDENT INFORMATION */}

                      <Group gap="sm">
                        <Avatar
                          color="indigo"
                          radius="xl"
                        >
                          <IconUser size={18} />
                        </Avatar>

                        <Box>
                          <Text
                            size="sm"
                            fw={600}
                          >
                            {assignment.student?.name ??
                              "Unknown Student"}
                          </Text>

                          <Text
                            size="xs"
                            c="dimmed"
                          >
                            {assignment.student?.email}
                          </Text>

                          <Badge
                            color="blue"
                            variant="light"
                            size="sm"
                            mt={5}
                          >
                            {assignment.event_role}
                          </Badge>
                        </Box>
                      </Group>

                      {/* EDIT AND REMOVE BUTTONS */}

                      <Group gap="xs">
                        <Button
                          size="xs"
                          variant="light"
                          color="indigo"
                          disabled={assignmentSaving}
                          onClick={() =>
                            startEditAssignment(
                              assignment
                            )
                          }
                        >
                          Edit
                        </Button>

                        <Button
                          size="xs"
                          variant="light"
                          color="red"
                          leftSection={
                            <IconTrash size={14} />
                          }
                          disabled={assignmentSaving}
                          onClick={() =>
                            void removeAssignedStudent(
                              assignment.id
                            )
                          }
                        >
                          Remove
                        </Button>
                      </Group>

                    </Group>
                  </Paper>
                ))}
              </Stack>

            ) : (
              <Paper
                withBorder
                radius="md"
                p="lg"
              >
                <Stack
                  align="center"
                  gap="xs"
                >
                  <IconUsers size={28} />

                  <Text
                    size="sm"
                    fw={600}
                  >
                    No students assigned yet
                  </Text>

                  <Text
                    size="xs"
                    c="dimmed"
                  >
                    Add a student using the form below.
                  </Text>
                </Stack>
              </Paper>
            )}
          </Box>

          <Divider />

          {/* ================================================
              40.4 ADD OR EDIT ASSIGNMENT FORM
              Purpose: Choose student and event role.
          ================================================ */}

          <Box>
            <Title
              order={5}
              mb="md"
            >
              {editingAssignmentId !== null
                ? "Edit Student Assignment"
                : "Add Student Assignment"}
            </Title>

            <Stack gap="md">

              {/* SELECT STUDENT */}

              <Select
                label="Select Student"
                description="Choose a registered student"
                placeholder="Search by name or email"
                leftSection={
                  <IconSearch size={17} />
                }
                data={eligibleUsers.map(
                  (user) => ({
                    value: String(user.id),
                    label: `${user.name} (${user.email})`,
                  })
                )}
                value={selectedUserId}
                onChange={setSelectedUserId}
                searchable
                disabled={
                  assignmentSaving ||
                  assignmentLoading
                }
                nothingFoundMessage="No students found"
                radius="md"
              />

              {/* SELECT EVENT ROLE */}

              <Select
                
                label="Event Role"
                description="Choose the student's responsibility"
                placeholder="Select a role"
                data={EVENT_ROLES.map(
                  (role) => ({
                    value: role,
                    label: role,
                  })
                )}
                value={selectedRole}
                onChange={(value) => {
                  if (value) {
                    setSelectedRole(
                      value as EventRole
                    );
                  }
                }}
                allowDeselect={false}
                disabled={assignmentSaving}
                radius="md"
              />

              {/* SAVE AND CANCEL EDIT BUTTONS */}

              <Group justify="flex-end">
                {editingAssignmentId !== null && (
                  <Button
                    variant="default"
                    disabled={assignmentSaving}
                    onClick={cancelEditAssignment}
                  >
                    Cancel Edit
                  </Button>
                )}

                <Button
                  color="indigo"
                  leftSection={
                    <IconCheck size={16} />
                  }
                  loading={assignmentSaving}
                  disabled={
                    !selectedUserId ||
                    assignmentLoading
                  }
                  onClick={() =>
                    void saveAssignment()
                  }
                >
                  {editingAssignmentId !== null
                    ? "Save Changes"
                    : "Add Assignment"}
                </Button>
              </Group>

            </Stack>
          </Box>

          <Divider />

          {/* ================================================
              40.5 CLOSE MANAGE ASSIGNMENTS
          ================================================ */}

          <Group justify="flex-end">
            <Button
              variant="default"
              disabled={assignmentSaving}
              onClick={closeAssignment}
            >
              Close
            </Button>
          </Group>

        </Stack>
      </Modal>

      {/* ======================================================
          41. DELETE EVENT MODAL
          Purpose: Confirm permanent event deletion.
      ====================================================== */}

      <Modal
        opened={deleteTarget !== null}
        onClose={closeDeleteModal}
        title="Delete Event"
        centered
      >
        <Stack gap="md">

          {/* Confirmation Message */}

          <Text size="sm">
            Are you sure you want to permanently delete
            <Text span fw={700}>
              {" "}
              {deleteTarget?.title}
            </Text>
            ?
          </Text>

          {/* Delete Error */}

          {deleteError && (
            <Alert color="red">
              {deleteError}
            </Alert>
          )}

          {/* Delete Action Buttons */}

          <Group justify="flex-end">
            <Button
              variant="default"
              disabled={deleting}
              onClick={closeDeleteModal}
            >
              Cancel
            </Button>

            <Button
              color="red"
              loading={deleting}
              leftSection={
                <IconTrash size={16} />
              }
              onClick={() =>
                void handleDeleteEvent()
              }
            >
              Delete Event
            </Button>
          </Group>

        </Stack>
      </Modal>

    </div>
  );
}
