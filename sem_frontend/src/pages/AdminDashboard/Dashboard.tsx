
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Group,
  Loader,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconArrowRight,
  IconCalendarEvent,
  IconCalendarPlus,
  IconCheck,
  IconClipboardCheck,
  IconClock,
  IconFileText,
  IconPlayerPlay,
  IconRefresh,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useNavigate } from "react-router";
import { getEvents } from "../../api/events";
import "./Dashboard.css";

interface DashboardEvent {
  id: number;
  title: string;
  event_type: string;
  start_date: string;
  end_date: string;
  status: string;
  user?: { name: string } | null;
}

type ApiError = {
  response?: { data?: { message?: string } };
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

const datePart = (value: string) => value.slice(0, 10);

const todayKey = () => {
  const date = new Date();
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

export function Dashboard() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<DashboardEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEvents = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getEvents();
      const data: DashboardEvent[] = Array.isArray(result)
        ? result
        : result.data ?? [];

      setEvents(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(
        apiError.response?.data?.message ||
          "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadEvents();
  }, []);

  const today = todayKey();

  const approvedEvents = events.filter(
    (event) => event.status === "approved"
  );

  const pendingEvents = events.filter(
    (event) => event.status === "pending"
  );

  const rejectedEvents = events.filter(
    (event) => event.status === "rejected"
  );

  const upcomingEvents = approvedEvents.filter(
    (event) => datePart(event.start_date) > today
  );

  const ongoingEvents = approvedEvents.filter(
    (event) =>
      datePart(event.start_date) <= today &&
      datePart(event.end_date) >= today
  );

  const completedByDate = approvedEvents.filter(
    (event) => datePart(event.end_date) < today
  );

  const sortedUpcoming = [...upcomingEvents]
    .sort((a, b) =>
      a.start_date.localeCompare(b.start_date)
    )
    .slice(0, 4);

  const stats = [
    {
      label: "Total Events",
      value: events.length,
      icon: IconCalendarEvent,
      color: "blue",
    },
    {
      label: "Upcoming Events",
      value: upcomingEvents.length,
      icon: IconClock,
      color: "teal",
    },
    {
      label: "Ongoing Events",
      value: ongoingEvents.length,
      icon: IconPlayerPlay,
      color: "orange",
    },
    {
      label: "Past Events",
      value: completedByDate.length,
      icon: IconCheck,
      color: "violet",
    },
    {
      label: "Pending Approval",
      value: pendingEvents.length,
      icon: IconFileText,
      color: "cyan",
    },
  ];

  const overviewData = [
    {
      name: "Upcoming",
      value: upcomingEvents.length,
      color: "#2563eb",
    },
    {
      name: "Ongoing",
      value: ongoingEvents.length,
      color: "#f59e0b",
    },
    {
      name: "Past",
      value: completedByDate.length,
      color: "#10b981",
    },
    {
      name: "Pending",
      value: pendingEvents.length,
      color: "#06b6d4",
    },
    {
      name: "Rejected",
      value: rejectedEvents.length,
      color: "#8b5cf6",
    },
  ].filter((item) => item.value > 0);

  const trendData = useMemo(() => {
    const months: {
      key: string;
      month: string;
      events: number;
    }[] = [];

    const current = new Date();

    for (let offset = 5; offset >= 0; offset--) {
      const date = new Date(
        current.getFullYear(),
        current.getMonth() - offset,
        1
      );

      const key = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
      ].join("-");

      months.push({
        key,
        month: date.toLocaleDateString("en-PH", {
          month: "short",
        }),
        events: events.filter(
          (event) =>
            datePart(event.start_date).slice(0, 7) === key
        ).length,
      });
    }

    return months;
  }, [events]);

  const quickActions = [
    {
      label: "Event Management",
      icon: IconCalendarEvent,
      path: "/event-management",
    },
    {
      label: "Review Proposals",
      icon: IconClipboardCheck,
      path: "/event-approval",
    },
    {
      label: "Manage Accounts",
      icon: IconUsers,
      path: "/AddUser",
    },
  ];

  return (
    <div className="sc-dashboard">
      <div className="sc-dashboard-header">
        <div>
          <Text className="sc-eyebrow">
            SMARTCAMPUS / ADMIN DASHBOARD
          </Text>
          <Title order={2}>Dashboard Overview</Title>
          <Text c="dimmed" size="sm" mt={4}>
            School event planning and management
          </Text>
        </div>

        <Button
          variant="default"
          leftSection={<IconRefresh size={17} />}
          onClick={() => void loadEvents()}
          loading={loading}
        >
          Refresh
        </Button>
      </div>

      <div className="sc-welcome-banner">
        <div className="sc-welcome-content">
          <Text size="sm" fw={600} c="#bcd6ff">
            CITI GLOBAL COLLEGE
          </Text>
          <Title order={2} c="white" mt={8}>
            Welcome, Administrator!
          </Title>
          <Text c="#dbeafe" mt={5}>
            Monitor school events, proposals, and schedules
            in one workspace.
          </Text>
        </div>

        <div className="sc-banner-art">
          <IconCalendarEvent size={100} stroke={1.2} />
        </div>
      </div>

      {error && (
        <Alert color="red" mb="lg">
          {error}
        </Alert>
      )}

      <SimpleGrid
        cols={{ base: 1, xs: 2, md: 3, xl: 5 }}
        spacing="md"
        mb="lg"
      >
        {stats.map((stat) => {
          const StatIcon = stat.icon;

          return (
            <Paper
              key={stat.label}
              withBorder
              radius="lg"
              p="lg"
              className="sc-stat-card"
            >
              <Group justify="space-between" align="center">
                <ThemeIcon
                  size={48}
                  radius="xl"
                  color={stat.color}
                >
                  <StatIcon size={25} />
                </ThemeIcon>

                <Title order={2}>
                  {loading ? "—" : stat.value}
                </Title>
              </Group>

              <Text fw={600} size="sm" mt="md">
                {stat.label}
              </Text>
            </Paper>
          );
        })}
      </SimpleGrid>

      {loading ? (
        <Stack align="center" py={70}>
          <Loader />
          <Text c="dimmed" size="sm">
            Loading dashboard...
          </Text>
        </Stack>
      ) : (
        <>
          <div className="sc-dashboard-main-grid">
            <Paper
              withBorder
              radius="lg"
              p="lg"
              className="sc-dashboard-panel"
            >
              <Group justify="space-between" mb="md">
                <Title order={4}>Event Overview</Title>
                <Badge variant="light" color="blue">
                  {events.length} Total
                </Badge>
              </Group>

              {overviewData.length === 0 ? (
                <Text c="dimmed" ta="center" py={60}>
                  No event data available.
                </Text>
              ) : (
                <Box h={280}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={overviewData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={3}
                      >
                        {overviewData.map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={entry.color}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </Paper>

            <Paper
              withBorder
              radius="lg"
              p="lg"
              className="sc-dashboard-panel"
            >
              <Group justify="space-between" mb="md">
                <Title order={4}>Event Trends</Title>
                <Badge color="gray" variant="light">
                  Last 6 Months
                </Badge>
              </Group>

              <Box h={280}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient
                        id="eventTrendGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#2563eb"
                          stopOpacity={0.24}
                        />
                        <stop
                          offset="95%"
                          stopColor="#2563eb"
                          stopOpacity={0.02}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e8edf5"
                    />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="events"
                      stroke="#2563eb"
                      strokeWidth={3}
                      fill="url(#eventTrendGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Paper>

            <Paper
              withBorder
              radius="lg"
              p="lg"
              className="sc-dashboard-panel"
            >
              <Group justify="space-between" mb="md">
                <Title order={4}>Upcoming Events</Title>
                <Button
                  variant="subtle"
                  size="xs"
                  rightSection={<IconArrowRight size={15} />}
                  onClick={() => navigate("/event-management")}
                >
                  View All
                </Button>
              </Group>

              <Stack gap="sm">
                {sortedUpcoming.length === 0 ? (
                  <Text c="dimmed" size="sm" py="lg">
                    No upcoming approved events.
                  </Text>
                ) : (
                  sortedUpcoming.map((event) => (
                    <Paper
                      key={event.id}
                      p="sm"
                      radius="md"
                      withBorder
                    >
                      <Group wrap="nowrap" gap="sm">
                        <Avatar
                          color="blue"
                          radius="md"
                          size="lg"
                        >
                          <IconCalendarEvent size={22} />
                        </Avatar>

                        <Box style={{ flex: 1 }}>
                          <Text fw={600} size="sm" lineClamp={2}>
                            {event.title}
                          </Text>
                          <Text c="dimmed" size="xs">
                            {formatDate(event.start_date)}
                          </Text>
                        </Box>

                        <Badge
                          color="teal"
                          variant="light"
                          size="xs"
                        >
                          Approved
                        </Badge>
                      </Group>
                    </Paper>
                  ))
                )}
              </Stack>
            </Paper>
          </div>

          <div className="sc-dashboard-bottom-grid">
            <Paper withBorder radius="lg" p="lg">
              <Group justify="space-between" mb="md">
                <Title order={4}>Notifications</Title>
                <Badge variant="light" color="orange">
                  {pendingEvents.length} Pending
                </Badge>
              </Group>

              {pendingEvents.length === 0 ? (
                <Text size="sm" c="dimmed">
                  No proposals awaiting review.
                </Text>
              ) : (
                <Stack gap="sm">
                  {pendingEvents.slice(0, 4).map((event) => (
                    <Paper
                      key={event.id}
                      p="sm"
                      radius="md"
                      className="sc-activity-row"
                    >
                      <Group justify="space-between" gap="xs">
                        <Box style={{ flex: 1 }}>
                          <Text size="sm" fw={600}>
                            New proposal: {event.title}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {event.user?.name ?? "Unknown organizer"}
                          </Text>
                        </Box>
                        <Badge color="orange" size="xs">
                          Needs Review
                        </Badge>
                      </Group>
                    </Paper>
                  ))}
                </Stack>
              )}

              <Button
                mt="md"
                size="xs"
                variant="subtle"
                onClick={() => navigate("/event-approval")}
              >
                Review Proposals
              </Button>
            </Paper>

            <Paper withBorder radius="lg" p="lg">
              <Title order={4} mb="md">
                Event Activity Summary
              </Title>

              <Stack gap="md">
                <Group gap="sm">
                  <ThemeIcon color="teal" variant="light">
                    <IconCheck size={18} />
                  </ThemeIcon>
                  <Box>
                    <Text size="sm" fw={600}>
                      {approvedEvents.length} Approved Proposals
                    </Text>
                    <Text size="xs" c="dimmed">
                      Approved event records
                    </Text>
                  </Box>
                </Group>

                <Group gap="sm">
                  <ThemeIcon color="orange" variant="light">
                    <IconClock size={18} />
                  </ThemeIcon>
                  <Box>
                    <Text size="sm" fw={600}>
                      {pendingEvents.length} Pending Reviews
                    </Text>
                    <Text size="xs" c="dimmed">
                      Awaiting administrator decision
                    </Text>
                  </Box>
                </Group>

                <Group gap="sm">
                  <ThemeIcon color="red" variant="light">
                    <IconFileText size={18} />
                  </ThemeIcon>
                  <Box>
                    <Text size="sm" fw={600}>
                      {rejectedEvents.length} Rejected Proposals
                    </Text>
                    <Text size="xs" c="dimmed">
                      Declined event requests
                    </Text>
                  </Box>
                </Group>
              </Stack>
            </Paper>

            <Paper withBorder radius="lg" p="lg">
              <Title order={4} mb="md">
                Quick Actions
              </Title>

              <SimpleGrid cols={2} spacing="sm">
                {quickActions.map((action) => {
                  const ActionIcon = action.icon;

                  return (
                    <Button
                      key={action.label}
                      variant="light"
                      color="blue"
                      h={85}
                      className="sc-quick-action"
                      onClick={() => navigate(action.path)}
                    >
                      <Stack align="center" gap={5}>
                        <ActionIcon size={25} />
                        <Text size="xs" fw={600} ta="center">
                          {action.label}
                        </Text>
                      </Stack>
                    </Button>
                  );
                })}

                <Button
                  variant="light"
                  color="gray"
                  h={85}
                  disabled
                >
                  <Stack align="center" gap={5}>
                    <IconSettings size={25} />
                    <Text size="xs" fw={600}>
                      More Features
                    </Text>
                  </Stack>
                </Button>
              </SimpleGrid>
            </Paper>
          </div>
        </>
      )}
    </div>
  );
}
