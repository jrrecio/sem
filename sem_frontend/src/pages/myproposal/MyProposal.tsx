
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Divider,
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
  IconFileDescription,
  IconFileText,
  IconSearch,
  IconSend,
  IconX,
  IconAlertCircle,
  IconRefresh,
  IconPlus,
  IconArrowRight,
} from "@tabler/icons-react";

import { useNavigate } from "react-router";
import { getEvents, submitEvent } from "../../api/events";
import "./MyProposal.css";

interface EventProposal {
  id: number;
  user_id: number;
  title: string;
  event_type: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
}

export function Users() {
  const navigate = useNavigate();

  const [events, setEvents] = useState<EventProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] =
    useState<number | null>(null);

  const [selectedEvent, setSelectedEvent] =
    useState<EventProposal | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<string | null>("all");

  const loadEvents = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getEvents();

      const eventList = Array.isArray(response)
        ? response
        : response.data ?? [];

      setEvents(eventList);
    } catch (err) {
      console.error(err);
      setError("Failed to load event proposals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadEvents();
  }, []);

  const handleSubmitApproval = async () => {
    if (!selectedEvent) return;

    const eventId = selectedEvent.id;

    setSubmittingId(eventId);
    setError("");
    setSuccess("");

    try {
      await submitEvent(eventId);

      setSelectedEvent(null);

      setSuccess(
        "Event submitted successfully! It is now pending administrator approval."
      );

      await loadEvents();
    } catch (err: unknown) {
      console.error(err);

      const apiError = err as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      setError(
        apiError.response?.data?.message ||
          "Failed to submit event for approval."
      );
    } finally {
      setSubmittingId(null);
    }
  };

  const stats = useMemo(
    () => ({
      total: events.length,
      draft: events.filter(
        (event) => event.status === "draft"
      ).length,
      pending: events.filter(
        (event) => event.status === "pending"
      ).length,
      approved: events.filter(
        (event) => event.status === "approved"
      ).length,
      rejected: events.filter(
        (event) => event.status === "rejected"
      ).length,
    }),
    [events]
  );

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const query = search.toLowerCase().trim();

      const matchesSearch =
        event.title.toLowerCase().includes(query) ||
        event.event_type.toLowerCase().includes(query) ||
        (event.description ?? "")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        !statusFilter ||
        event.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [events, search, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "teal";
      case "pending":
        return "orange";
      case "rejected":
        return "red";
      case "draft":
        return "gray";
      default:
        return "gray";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "approved":
        return "Approved";
      case "pending":
        return "Pending Review";
      case "rejected":
        return "Rejected";
      case "draft":
        return "Draft";
      default:
        return status;
    }
  };

  const formatDate = (date: string) => {
    if (!date) return "Not specified";

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

  const statCards = [
    {
      label: "Total Proposals",
      value: stats.total,
      icon: IconFileText,
      color: "indigo",
      className: "mp-stat-indigo",
    },
    {
      label: "Drafts",
      value: stats.draft,
      icon: IconFileDescription,
      color: "gray",
      className: "mp-stat-gray",
    },
    {
      label: "Pending Review",
      value: stats.pending,
      icon: IconClock,
      color: "orange",
      className: "mp-stat-orange",
    },
    {
      label: "Approved",
      value: stats.approved,
      icon: IconCircleCheck,
      color: "teal",
      className: "mp-stat-teal",
    },
    {
      label: "Rejected",
      value: stats.rejected,
      icon: IconAlertCircle,
      color: "red",
      className: "mp-stat-red",
    },
  ];

  return (
    <Box className="mp-page">
      {/* Page header */}
      <Group
        justify="space-between"
        align="center"
        mb="xl"
        className="mp-header"
      >
        <Box>
          <Text className="mp-eyebrow">
            SMARTCAMPUS / EVENT PLANNING
          </Text>

          <Title order={2} className="mp-title">
            My Proposals
          </Title>

          <Text className="mp-subtitle">
            Track, manage, and submit your event proposals
            for administrator approval.
          </Text>
        </Box>

        <Group gap="sm">
          <Button
            variant="default"
            radius="md"
            leftSection={<IconRefresh size={17} />}
            onClick={() => void loadEvents()}
            loading={loading}
          >
            Refresh
          </Button>

          <Button
            radius="md"
            color="indigo"
            leftSection={<IconPlus size={18} />}
            onClick={() => navigate("/create-event")}
          >
            Create Proposal
          </Button>
        </Group>
      </Group>

      {/* Summary cards */}
      <SimpleGrid
        cols={{ base: 1, xs: 2, md: 3, lg: 5 }}
        spacing="md"
        mb="xl"
      >
        {statCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <Paper
              key={stat.label}
              withBorder
              radius="lg"
              p="lg"
              className="mp-stat-card"
            >
              <Group
                justify="space-between"
                align="flex-start"
                mb="md"
              >
                <ThemeIcon
                  size={44}
                  radius="md"
                  color={stat.color}
                  variant="light"
                >
                  <Icon size={23} stroke={1.8} />
                </ThemeIcon>
              </Group>

              <Text className="mp-stat-value">
                {stat.value}
              </Text>

              <Text className="mp-stat-label">
                {stat.label}
              </Text>
            </Paper>
          );
        })}
      </SimpleGrid>

      {/* Alerts */}
      {error && (
        <Alert
          color="red"
          icon={<IconX size={18} />}
          mb="lg"
          radius="md"
          withCloseButton
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          color="teal"
          icon={<IconCheck size={18} />}
          mb="lg"
          radius="md"
          withCloseButton
          onClose={() => setSuccess("")}
        >
          {success}
        </Alert>
      )}

      {/* Proposal section */}
      <Paper
        withBorder
        radius="lg"
        p="lg"
        className="mp-content-panel"
      >
        <Group
          justify="space-between"
          align="center"
          mb="lg"
          className="mp-section-header"
        >
          <Box>
            <Title order={4} className="mp-section-title">
              Event Proposals
            </Title>

            <Text size="sm" c="dimmed">
              {filteredEvents.length} proposal(s) found
            </Text>
          </Box>

          <Group gap="sm" className="mp-filters">
            <TextInput
              placeholder="Search proposals..."
              leftSection={<IconSearch size={17} />}
              value={search}
              onChange={(e) =>
                setSearch(e.currentTarget.value)
              }
              radius="md"
              className="mp-search"
            />

            <Select
              data={[
                { value: "all", label: "All Status" },
                { value: "draft", label: "Draft" },
                { value: "pending", label: "Pending" },
                { value: "approved", label: "Approved" },
                { value: "rejected", label: "Rejected" },
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              radius="md"
              className="mp-status-filter"
              allowDeselect={false}
            />
          </Group>
        </Group>

        {loading ? (
          <Group justify="center" py={70}>
            <Loader color="indigo" />
          </Group>
        ) : filteredEvents.length === 0 ? (
          <Stack
            align="center"
            justify="center"
            py={65}
            gap="sm"
          >
            <ThemeIcon
              size={70}
              radius="xl"
              color="gray"
              variant="light"
            >
              <IconFileDescription size={34} />
            </ThemeIcon>

            <Title order={4}>
              No proposals found
            </Title>

            <Text
              size="sm"
              c="dimmed"
              ta="center"
            >
              {events.length === 0
                ? "You have no event proposals yet."
                : "Try changing your search or status filter."}
            </Text>

            {events.length === 0 && (
              <Button
                mt="sm"
                color="indigo"
                leftSection={<IconPlus size={17} />}
                onClick={() =>
                  navigate("/create-event")
                }
              >
                Create Proposal
              </Button>
            )}
          </Stack>
        ) : (
          <SimpleGrid
            cols={{ base: 1, md: 2, xl: 3 }}
            spacing="lg"
          >
            {filteredEvents.map((event) => (
              <Card
                key={event.id}
                withBorder
                radius="lg"
                padding="lg"
                className="mp-event-card"
              >
                <Stack gap="md" h="100%">
                  <Group
                    justify="space-between"
                    align="flex-start"
                  >
                    <ThemeIcon
                      size={46}
                      radius="md"
                      color="indigo"
                      variant="light"
                    >
                      <IconCalendarEvent size={23} />
                    </ThemeIcon>

                    <Badge
                      color={getStatusColor(event.status)}
                      variant="light"
                      radius="sm"
                      size="lg"
                    >
                      {getStatusLabel(event.status)}
                    </Badge>
                  </Group>

                  <Box>
                    <Text className="mp-event-type">
                      {event.event_type}
                    </Text>

                    <Title
                      order={4}
                      className="mp-event-title"
                    >
                      {event.title}
                    </Title>

                    <Text
                      size="sm"
                      c="dimmed"
                      mt="sm"
                      lineClamp={3}
                      className="mp-description"
                    >
                      {event.description ||
                        "No description provided."}
                    </Text>
                  </Box>

                  <Divider />

                  <Group gap="sm" wrap="nowrap">
                    <ThemeIcon
                      color="gray"
                      variant="light"
                      size={34}
                      radius="md"
                    >
                      <IconCalendarTime size={18} />
                    </ThemeIcon>

                    <Box>
                      <Text size="xs" c="dimmed">
                        Event Schedule
                      </Text>

                      <Text size="sm" fw={600}>
                        {formatDate(event.start_date)}
                        {" – "}
                        {formatDate(event.end_date)}
                      </Text>
                    </Box>
                  </Group>

                  <Box className="mp-status-box">
                    {event.status === "draft" && (
                      <Group gap="xs" wrap="nowrap">
                        <IconFileDescription size={18} />
                        <Text size="xs">
                          This proposal is saved as a draft.
                          Submit it when ready.
                        </Text>
                      </Group>
                    )}

                    {event.status === "pending" && (
                      <Group gap="xs" wrap="nowrap">
                        <IconClock size={18} />
                        <Text size="xs">
                          Waiting for administrator review.
                        </Text>
                      </Group>
                    )}

                    {event.status === "approved" && (
                      <Group gap="xs" wrap="nowrap">
                        <IconCircleCheck size={18} />
                        <Text size="xs">
                          Your proposal has been approved.
                        </Text>
                      </Group>
                    )}

                    {event.status === "rejected" && (
                      <Group gap="xs" wrap="nowrap">
                        <IconAlertCircle size={18} />
                        <Text size="xs">
                          This proposal was rejected.
                        </Text>
                      </Group>
                    )}
                  </Box>

                  {event.status === "draft" ? (
                    <Button
                      mt="auto"
                      fullWidth
                      color="indigo"
                      radius="md"
                      leftSection={<IconSend size={17} />}
                      rightSection={
                        <IconArrowRight size={16} />
                      }
                      onClick={() =>
                        setSelectedEvent(event)
                      }
                    >
                      Submit for Approval
                    </Button>
                  ) : (
                    <Button
                      mt="auto"
                      fullWidth
                      variant="light"
                      color={getStatusColor(event.status)}
                      radius="md"
                      disabled
                    >
                      {getStatusLabel(event.status)}
                    </Button>
                  )}
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </Paper>

      {/* Submit confirmation modal */}
      <Modal
        opened={selectedEvent !== null}
        onClose={() => {
          if (submittingId === null) {
            setSelectedEvent(null);
          }
        }}
        title={
          <Group gap="sm">
            <ThemeIcon
              color="indigo"
              variant="light"
              radius="md"
              size={36}
            >
              <IconSend size={19} />
            </ThemeIcon>

            <Text fw={700}>
              Submit Event Proposal
            </Text>
          </Group>
        }
        centered
        radius="lg"
        closeOnClickOutside={submittingId === null}
        closeOnEscape={submittingId === null}
      >
        <Stack gap="lg">
          <Text size="sm">
            Are you sure you want to submit{" "}
            <Text span fw={700}>
              {selectedEvent?.title}
            </Text>{" "}
            for administrator approval?
          </Text>

          <Alert
            color="blue"
            radius="md"
            variant="light"
            icon={<IconClock size={18} />}
          >
            Once submitted, the proposal status
            will change from Draft to Pending.
          </Alert>

          <Group justify="flex-end">
            <Button
              variant="default"
              radius="md"
              disabled={submittingId !== null}
              onClick={() =>
                setSelectedEvent(null)
              }
            >
              Cancel
            </Button>

            <Button
              color="indigo"
              radius="md"
              loading={submittingId !== null}
              leftSection={<IconSend size={16} />}
              onClick={() =>
                void handleSubmitApproval()
              }
            >
              Confirm Submission
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}
