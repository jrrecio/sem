
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Group,
  Loader,
  Modal,
  Paper,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconCalendarEvent,
  IconCalendarTime,
  IconCheck,
  IconCircleCheck,
  IconClipboardCheck,
  IconCurrencyPeso,
  IconFileCheck,
  IconRefresh,
  IconSearch,
  IconShieldCheck,
  IconUser,
  IconUsers,
  IconX,
} from "@tabler/icons-react";

import {
  getEvents,
  reviewEvent,
  getEventRequirements,
  addEventRequirement,
  updateEventRequirement,
  type EventRequirement,
  getEventBudget,
  reviewEventBudget,
  type BudgetDetails,
} from "../../api/events";

import "./EventApproval.css";

interface EventProposal {
  id: number;
  title: string;
  event_type: string;
  description: string;
  start_date: string;
  end_date: string;
  estimated_attendees: number | null;
  estimated_budget: number | string | null;
  status: string;
  user?: { name: string } | null;
}

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

const getErrorMessage = (
  error: unknown,
  fallback: string
): string => {
  const apiError = error as ApiError;
  return apiError.response?.data?.message || fallback;
};

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
};

const money = (value: number | string | null) =>
  `₱${Number(value ?? 0).toLocaleString("en-PH")}`;

export default function EventApproval() {
  const [events, setEvents] = useState<EventProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  const [selected, setSelected] =
    useState<EventProposal | null>(null);
  const [decision, setDecision] =
    useState<"approved" | "rejected">("approved");
  const [reason, setReason] = useState("");
  const [reviewError, setReviewError] = useState("");

  const [requirementsEvent, setRequirementsEvent] =
    useState<EventProposal | null>(null);
  const [requirements, setRequirements] =
    useState<EventRequirement[]>([]);
  const [requirementName, setRequirementName] = useState("");
  const [requirementsLoading, setRequirementsLoading] =
    useState(false);
  const [requirementsSaving, setRequirementsSaving] =
    useState(false);
  const [requirementsError, setRequirementsError] = useState("");

  const [budgetEvent, setBudgetEvent] =
    useState<EventProposal | null>(null);
  const [budgetDetails, setBudgetDetails] =
    useState<BudgetDetails | null>(null);
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [budgetSaving, setBudgetSaving] = useState(false);
  const [budgetError, setBudgetError] = useState("");

  const loadEvents = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getEvents();
      const list: EventProposal[] = Array.isArray(result)
        ? result
        : result.data ?? [];

      setEvents(list);
    } catch (err) {
      setError(
        getErrorMessage(err, "Unable to load event proposals.")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadEvents();
  }, []);

  const pendingEvents = events.filter(
    (event) => event.status === "pending"
  );
  const approvedCount = events.filter(
    (event) => event.status === "approved"
  ).length;
  const rejectedCount = events.filter(
    (event) => event.status === "rejected"
  ).length;

  const filteredEvents = useMemo(() => {
    const query = search.toLowerCase().trim();
    return pendingEvents.filter(
      (event) =>
        event.title.toLowerCase().includes(query) ||
        event.event_type.toLowerCase().includes(query) ||
        (event.user?.name ?? "").toLowerCase().includes(query)
    );
  }, [events, search]);

  const openReview = (
    event: EventProposal,
    action: "approved" | "rejected"
  ) => {
    setSelected(event);
    setDecision(action);
    setReason("");
    setReviewError("");
    setMessage("");
  };

  const confirmReview = async () => {
    if (!selected) return;

    if (decision === "rejected" && !reason.trim()) {
      setReviewError("Please provide a reason for rejection.");
      return;
    }

    setSaving(true);
    setReviewError("");

    try {
      await reviewEvent(
        selected.id,
        decision,
        decision === "rejected"
          ? reason.trim()
          : undefined
      );

      setSelected(null);
      setMessage(
        decision === "approved"
          ? "Event approved successfully."
          : "Event rejected successfully."
      );
      await loadEvents();
    } catch (err) {
      setReviewError(
        getErrorMessage(err, "Unable to review this event.")
      );
    } finally {
      setSaving(false);
    }
  };

  const openRequirements = async (event: EventProposal) => {
    setRequirementsEvent(event);
    setRequirements([]);
    setRequirementName("");
    setRequirementsError("");
    setRequirementsLoading(true);

    try {
      const data = await getEventRequirements(event.id);
      setRequirements(data);
    } catch (err) {
      setRequirementsError(
        getErrorMessage(
          err,
          "Unable to load event requirements."
        )
      );
    } finally {
      setRequirementsLoading(false);
    }
  };

  const handleAddRequirement = async () => {
    if (!requirementsEvent || !requirementName.trim()) return;

    setRequirementsSaving(true);
    setRequirementsError("");

    try {
      await addEventRequirement(
        requirementsEvent.id,
        requirementName.trim()
      );

      const data = await getEventRequirements(
        requirementsEvent.id
      );
      setRequirements(data);
      setRequirementName("");
    } catch (err) {
      setRequirementsError(
        getErrorMessage(err, "Unable to add requirement.")
      );
    } finally {
      setRequirementsSaving(false);
    }
  };

  const handleVerifyRequirement = async (
    requirement: EventRequirement
  ) => {
    if (!requirementsEvent) return;

    setRequirementsSaving(true);
    setRequirementsError("");

    try {
      const newStatus =
        requirement.status === "verified"
          ? "pending"
          : "verified";

      await updateEventRequirement(
        requirementsEvent.id,
        requirement.id,
        newStatus
      );

      const data = await getEventRequirements(
        requirementsEvent.id
      );
      setRequirements(data);
    } catch (err) {
      setRequirementsError(
        getErrorMessage(
          err,
          "Unable to update requirement status."
        )
      );
    } finally {
      setRequirementsSaving(false);
    }
  };

  const openBudgetReview = async (event: EventProposal) => {
    setBudgetEvent(event);
    setBudgetDetails(null);
    setBudgetError("");
    setBudgetLoading(true);

    try {
      const data = await getEventBudget(event.id);
      setBudgetDetails(data);
    } catch (err) {
      setBudgetError(
        getErrorMessage(err, "Unable to load budget.")
      );
    } finally {
      setBudgetLoading(false);
    }
  };

  const handleBudgetDecision = async (
    action: "approved" | "rejected"
  ) => {
    if (!budgetEvent) return;

    setBudgetSaving(true);
    setBudgetError("");

    try {
      await reviewEventBudget(budgetEvent.id, action);

      setMessage(
        action === "approved"
          ? "Budget approved successfully."
          : "Budget rejected successfully."
      );

      setBudgetEvent(null);
      setBudgetDetails(null);
      await loadEvents();
    } catch (err) {
      setBudgetError(
        getErrorMessage(err, "Unable to review budget.")
      );
    } finally {
      setBudgetSaving(false);
    }
  };

  const verifiedCount = requirements.filter(
    (item) => item.status === "verified"
  ).length;
  const requirementProgress = requirements.length
    ? (verifiedCount / requirements.length) * 100
    : 0;

  const stats = [
    {
      label: "Total Proposals",
      value: events.length,
      description: "All submitted records",
      color: "indigo",
      icon: IconCalendarEvent,
    },
    {
      label: "Pending Review",
      value: pendingEvents.length,
      description: "Awaiting admin decision",
      color: "orange",
      icon: IconCalendarTime,
    },
    {
      label: "Approved Events",
      value: approvedCount,
      description: "Accepted proposals",
      color: "teal",
      icon: IconCircleCheck,
    },
    {
      label: "Rejected Events",
      value: rejectedCount,
      description: "Declined proposals",
      color: "red",
      icon: IconX,
    },
  ];

  return (
    <div className="event-approval-page">
      <div className="event-approval-container">
        <div className="ea-header">
          <div>
            <Group gap="xs" mb={8}>
              <Badge color="indigo" variant="light">
                SMARTCAMPUS
              </Badge>
              <Badge color="gray" variant="outline">
                ADMIN WORKSPACE
              </Badge>
            </Group>

            <Title order={2} className="ea-page-title">
              Event Approvals
            </Title>

            <Text c="dimmed" size="sm" mt={5}>
              Review proposals, verify requirements, and
              approve event budgets.
            </Text>
          </div>

          <Button
            variant="default"
            leftSection={<IconRefresh size={17} />}
            onClick={() => void loadEvents()}
            loading={loading}
          >
            Refresh Proposals
          </Button>
        </div>

        {message && (
          <Alert
            color="green"
            mb="md"
            withCloseButton
            onClose={() => setMessage("")}
          >
            {message}
          </Alert>
        )}

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

        <SimpleGrid cols={{ base: 1, xs: 2, lg: 4 }} mb="xl">
          {stats.map((stat) => {
            const StatIcon = stat.icon;

            return (
              <Paper
                key={stat.label}
                withBorder
                radius="lg"
                p="lg"
                className="ea-stat-card"
              >
                <ThemeIcon
                  size={44}
                  radius="md"
                  color={stat.color}
                  variant="light"
                >
                  <StatIcon size={23} />
                </ThemeIcon>

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

        <Paper
          withBorder
          radius="xl"
          p="lg"
          className="ea-main-panel"
        >
          <Group justify="space-between" mb="lg">
            <div>
              <Title order={4}>Pending Event Proposals</Title>
              <Text size="xs" c="dimmed" mt={4}>
                Review and process submitted event requests
              </Text>
            </div>

            <Badge color="orange" variant="light" size="lg">
              {filteredEvents.length} Pending
            </Badge>
          </Group>

          <TextInput
            mb="lg"
            className="ea-search"
            placeholder="Search events, event types, or organizers..."
            leftSection={<IconSearch size={17} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
          />

          {loading ? (
            <Stack align="center" py={60}>
              <Loader color="indigo" />
              <Text c="dimmed" size="sm">
                Loading proposals...
              </Text>
            </Stack>
          ) : filteredEvents.length === 0 ? (
            <Stack align="center" py={60}>
              <ThemeIcon
                size={64}
                radius="xl"
                color="gray"
                variant="light"
              >
                <IconFileCheck size={30} />
              </ThemeIcon>
              <Text fw={600}>No pending proposals found</Text>
              <Text c="dimmed" size="sm">
                {pendingEvents.length === 0
                  ? "All submitted proposals have been reviewed."
                  : "Try searching with different keywords."}
              </Text>
            </Stack>
          ) : (
            <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }}>
              {filteredEvents.map((event) => (
                <Card
                  key={event.id}
                  withBorder
                  radius="lg"
                  padding="lg"
                  className="ea-event-card"
                >
                  <Stack gap="md" h="100%">
                    <Group justify="space-between">
                      <ThemeIcon
                        size={46}
                        radius="md"
                        color="indigo"
                        variant="light"
                      >
                        <IconCalendarEvent size={24} />
                      </ThemeIcon>

                      <Badge color="orange" variant="light">
                        Pending Review
                      </Badge>
                    </Group>

                    <Box>
                      <Text
                        size="xs"
                        fw={700}
                        c="indigo"
                        tt="uppercase"
                        mb={5}
                      >
                        {event.event_type}
                      </Text>

                      <Title order={4} className="ea-event-title">
                        {event.title}
                      </Title>

                      <Text
                        size="sm"
                        c="dimmed"
                        mt="xs"
                        lineClamp={2}
                      >
                        {event.description}
                      </Text>
                    </Box>

                    <Divider />

                    <Stack gap="sm">
                      <Group gap="sm" wrap="nowrap">
                        <IconUser
                          size={18}
                          className="ea-muted-icon"
                        />
                        <div>
                          <Text size="xs" c="dimmed">
                            Submitted By
                          </Text>
                          <Text size="sm" fw={500}>
                            {event.user?.name ?? "Unknown"}
                          </Text>
                        </div>
                      </Group>

                      <Group gap="sm" wrap="nowrap">
                        <IconCalendarTime
                          size={18}
                          className="ea-muted-icon"
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
                        <IconCurrencyPeso
                          size={18}
                          className="ea-muted-icon"
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

                      <Group gap="sm" wrap="nowrap">
                        <IconUsers
                          size={18}
                          className="ea-muted-icon"
                        />
                        <div>
                          <Text size="xs" c="dimmed">
                            Expected Attendees
                          </Text>
                          <Text size="sm" fw={500}>
                            {event.estimated_attendees ?? "N/A"}
                          </Text>
                        </div>
                      </Group>
                    </Stack>

                    <Paper
                      p="sm"
                      radius="md"
                      className="ea-review-notice"
                    >
                      <Group gap="xs">
                        <IconShieldCheck size={17} />
                        <Text size="xs" fw={500}>
                          Verify requirements and budget before
                          approving this proposal.
                        </Text>
                      </Group>
                    </Paper>

                    <SimpleGrid cols={2} spacing="xs" mt="auto">
                      <Button
                        variant="light"
                        color="indigo"
                        leftSection={
                          <IconClipboardCheck size={16} />
                        }
                        onClick={() =>
                          void openRequirements(event)
                        }
                      >
                        Requirements
                      </Button>

                      <Button
                        variant="light"
                        color="blue"
                        leftSection={
                          <IconCurrencyPeso size={16} />
                        }
                        onClick={() =>
                          void openBudgetReview(event)
                        }
                      >
                        Budget Review
                      </Button>

                      <Button
                        color="teal"
                        leftSection={<IconCheck size={16} />}
                        onClick={() =>
                          openReview(event, "approved")
                        }
                      >
                        Approve
                      </Button>

                      <Button
                        color="red"
                        variant="light"
                        leftSection={<IconX size={16} />}
                        onClick={() =>
                          openReview(event, "rejected")
                        }
                      >
                        Reject
                      </Button>
                    </SimpleGrid>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </Paper>

        {/* Approve / Reject Modal */}
        <Modal
          opened={selected !== null}
          onClose={() => {
            if (!saving) setSelected(null);
          }}
          title={
            decision === "approved"
              ? "Approve Event Proposal"
              : "Reject Event Proposal"
          }
          centered
          size="md"
          radius="lg"
          closeOnClickOutside={!saving}
          closeOnEscape={!saving}
        >
          <Stack gap="lg">
            <Paper p="md" radius="md" className="ea-modal-summary">
              <Text fw={700}>{selected?.title}</Text>
              <Text size="xs" c="dimmed" mt={5}>
                {selected?.event_type}
              </Text>
            </Paper>

            <Text size="sm" c="dimmed">
              {decision === "approved"
                ? "Confirm that the requirements and budget have been reviewed. The system will validate the approval rules."
                : "Please provide a reason for rejecting this proposal."}
            </Text>

            {reviewError && (
              <Alert color="red">{reviewError}</Alert>
            )}

            {decision === "rejected" && (
              <Textarea
                label="Reason for Rejection"
                placeholder="Explain why the proposal is rejected..."
                value={reason}
                onChange={(e) =>
                  setReason(e.currentTarget.value)
                }
                minRows={4}
                required
              />
            )}

            <Group justify="flex-end">
              <Button
                variant="default"
                disabled={saving}
                onClick={() => setSelected(null)}
              >
                Cancel
              </Button>

              <Button
                color={decision === "approved" ? "teal" : "red"}
                loading={saving}
                leftSection={
                  decision === "approved" ? (
                    <IconCheck size={17} />
                  ) : (
                    <IconX size={17} />
                  )
                }
                onClick={() => void confirmReview()}
              >
                Confirm{" "}
                {decision === "approved"
                  ? "Approval"
                  : "Rejection"}
              </Button>
            </Group>
          </Stack>
        </Modal>

        {/* Requirements Verification Modal */}
        <Modal
          opened={requirementsEvent !== null}
          onClose={() => {
            if (!requirementsSaving) {
              setRequirementsEvent(null);
            }
          }}
          title="Event Requirements"
          centered
          size="lg"
          radius="lg"
          closeOnClickOutside={!requirementsSaving}
          closeOnEscape={!requirementsSaving}
        >
          <Stack gap="lg">
            <Paper p="md" radius="md" className="ea-modal-summary">
              <Text fw={700}>
                {requirementsEvent?.title}
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                Requirement verification checklist
              </Text>
            </Paper>

            {requirementsError && (
              <Alert color="red">
                {requirementsError}
              </Alert>
            )}

            {requirementsLoading ? (
              <Group justify="center" py="xl">
                <Loader color="indigo" />
              </Group>
            ) : (
              <>
                <div>
                  <Group justify="space-between" mb="xs">
                    <Text fw={600} size="sm">
                      Verification Progress
                    </Text>
                    <Text fw={700} size="sm">
                      {verifiedCount}/{requirements.length}
                    </Text>
                  </Group>

                  <Progress
                    value={requirementProgress}
                    color="teal"
                    size="lg"
                    radius="xl"
                  />

                  <Text size="xs" c="dimmed" mt={6}>
                    {Math.round(requirementProgress)}% verified
                  </Text>
                </div>

                <Stack gap="sm">
                  {requirements.length === 0 ? (
                    <Paper withBorder p="lg" radius="md">
                      <Text c="dimmed" size="sm" ta="center">
                        No requirements added yet.
                      </Text>
                    </Paper>
                  ) : (
                    requirements.map((requirement) => {
                      const verified =
                        requirement.status === "verified";

                      return (
                        <Paper
                          key={requirement.id}
                          withBorder
                          radius="md"
                          p="md"
                          className="ea-requirement-item"
                        >
                          <Group justify="space-between">
                            <Group gap="sm">
                              <ThemeIcon
                                color={verified ? "teal" : "orange"}
                                variant="light"
                                radius="xl"
                              >
                                {verified ? (
                                  <IconCircleCheck size={17} />
                                ) : (
                                  <IconClipboardCheck size={17} />
                                )}
                              </ThemeIcon>

                              <div>
                                <Text fw={600} size="sm">
                                  {requirement.requirement_name}
                                </Text>
                                <Badge
                                  mt={5}
                                  size="xs"
                                  color={verified ? "teal" : "orange"}
                                  variant="light"
                                >
                                  {verified ? "Verified" : "Pending"}
                                </Badge>
                              </div>
                            </Group>

                            <Button
                              size="xs"
                              variant={verified ? "default" : "light"}
                              color={verified ? "gray" : "teal"}
                              disabled={requirementsSaving}
                              onClick={() =>
                                void handleVerifyRequirement(
                                  requirement
                                )
                              }
                            >
                              {verified ? "Undo" : "Verify"}
                            </Button>
                          </Group>
                        </Paper>
                      );
                    })
                  )}
                </Stack>

                <Divider />

                <div>
                  <Text fw={600} size="sm" mb="xs">
                    Add Requirement
                  </Text>

                  <Group align="end">
                    <TextInput
                      style={{ flex: 1 }}
                      placeholder="Enter requirement name"
                      value={requirementName}
                      onChange={(e) =>
                        setRequirementName(e.currentTarget.value)
                      }
                    />

                    <Button
                      color="indigo"
                      loading={requirementsSaving}
                      disabled={!requirementName.trim()}
                      onClick={() =>
                        void handleAddRequirement()
                      }
                    >
                      Add
                    </Button>
                  </Group>
                </div>
              </>
            )}
          </Stack>
        </Modal>

        {/* Budget Review Modal */}
        <Modal
          opened={budgetEvent !== null}
          onClose={() => {
            if (!budgetSaving) {
              setBudgetEvent(null);
              setBudgetDetails(null);
            }
          }}
          title="Budget Review"
          centered
          size="md"
          radius="lg"
          closeOnClickOutside={!budgetSaving}
          closeOnEscape={!budgetSaving}
        >
          <Stack gap="lg">
            <Paper p="md" radius="md" className="ea-modal-summary">
              <Text fw={700}>{budgetEvent?.title}</Text>
              <Text size="xs" c="dimmed" mt={4}>
                Event budget evaluation
              </Text>
            </Paper>

            {budgetError && (
              <Alert color="red">{budgetError}</Alert>
            )}

            {budgetLoading ? (
              <Group justify="center" py="xl">
                <Loader color="indigo" />
              </Group>
            ) : budgetDetails ? (
              <>
                <Paper
                  p="lg"
                  radius="lg"
                  className="ea-budget-highlight"
                >
                  <Text size="xs" c="dimmed" fw={600}>
                    PROPOSED EVENT BUDGET
                  </Text>
                  <Title order={2} mt="xs">
                    {money(budgetDetails.estimated_budget)}
                  </Title>
                </Paper>

                <Group justify="space-between">
                  <Text fw={600} size="sm">
                    Budget Status
                  </Text>
                  <Badge
                    size="lg"
                    variant="light"
                    color={
                      budgetDetails.budget?.status === "approved"
                        ? "teal"
                        : budgetDetails.budget?.status === "rejected"
                          ? "red"
                          : "orange"
                    }
                  >
                    {budgetDetails.budget?.status ?? "Not reviewed"}
                  </Badge>
                </Group>

                <Divider />

                <Group justify="flex-end">
                  <Button
                    color="red"
                    variant="light"
                    loading={budgetSaving}
                    onClick={() =>
                      void handleBudgetDecision("rejected")
                    }
                  >
                    Reject Budget
                  </Button>

                  <Button
                    color="teal"
                    loading={budgetSaving}
                    onClick={() =>
                      void handleBudgetDecision("approved")
                    }
                  >
                    Approve Budget
                  </Button>
                </Group>
              </>
            ) : (
              <Text c="dimmed" size="sm">
                Unable to load budget details.
              </Text>
            )}
          </Stack>
        </Modal>
      </div>
    </div>
  );
}
