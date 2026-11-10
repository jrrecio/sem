
import { useState } from "react";
import type { FormEvent } from "react";

import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Group,
  Paper,
  PasswordInput,
  Radio,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";

import {
  IconAlertCircle,
  IconCheck,
  IconLock,
  IconMail,
  IconShieldCheck,
  IconUser,
  IconUserPlus,
  IconUsers,
} from "@tabler/icons-react";

import api from "../../lib/api";
import "./AddUser.css";

type Role = "admin" | "user";

export function AddUser() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("user");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const clearForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRole("user");
  };

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const response = await api.post("/register", {
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });

      setSuccess(
        response.data.message ||
          "User account created successfully!"
      );

      clearForm();
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
          "Failed to create user account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="au-page">
      {/* PAGE HEADER */}
      <Group
        justify="space-between"
        align="center"
        className="au-header"
        mb="xl"
      >
        <Box>
          <Text className="au-eyebrow">
            SMARTCAMPUS / USER MANAGEMENT
          </Text>

          <Title order={2} className="au-page-title">
            Add New User
          </Title>

          <Text className="au-page-subtitle">
            Create and manage authorized accounts
            for the SmartCampus system.
          </Text>
        </Box>

        <Badge
          color="indigo"
          variant="light"
          radius="md"
          size="lg"
          leftSection={<IconShieldCheck size={14} />}
        >
          Administrator Access
        </Badge>
      </Group>

      {/* MAIN LAYOUT */}
      <SimpleGrid
        cols={{ base: 1, lg: 3 }}
        spacing="xl"
        className="au-main-grid"
      >
        {/* LEFT COLUMN - REGISTRATION FORM */}
        <Box className="au-form-column">
          <Paper
            withBorder
            radius="lg"
            className="au-form-panel"
          >
            <Group gap="md" mb="lg">
              <ThemeIcon
                size={48}
                radius="md"
                color="indigo"
                variant="light"
              >
                <IconUserPlus size={25} />
              </ThemeIcon>

              <Box>
                <Title
                  order={4}
                  className="au-section-title"
                >
                  Account Information
                </Title>

                <Text size="sm" c="dimmed">
                  Fill in the details to register
                  a new user.
                </Text>
              </Box>
            </Group>

            <Divider mb="xl" />

            {/* SUCCESS MESSAGE */}
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

            {/* ERROR MESSAGE */}
            {error && (
              <Alert
                color="red"
                icon={<IconAlertCircle size={18} />}
                mb="lg"
                radius="md"
                withCloseButton
                onClose={() => setError("")}
              >
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Stack gap="lg">
                {/* PERSONAL DETAILS */}
                <Box>
                  <Text className="au-form-section-label">
                    PERSONAL DETAILS
                  </Text>

                  <Stack gap="md">
                    <TextInput
                      label="Full Name"
                      placeholder="Enter user's full name"
                      leftSection={
                        <IconUser size={18} />
                      }
                      value={name}
                      onChange={(e) =>
                        setName(e.currentTarget.value)
                      }
                      required
                      radius="md"
                      size="md"
                    />

                    <TextInput
                      label="Email Address"
                      placeholder="example@school.edu"
                      type="email"
                      leftSection={
                        <IconMail size={18} />
                      }
                      value={email}
                      onChange={(e) =>
                        setEmail(e.currentTarget.value)
                      }
                      required
                      radius="md"
                      size="md"
                    />
                  </Stack>
                </Box>

                <Divider />

                {/* ACCOUNT SECURITY */}
                <Box>
                  <Text className="au-form-section-label">
                    ACCOUNT SECURITY
                  </Text>

                  <PasswordInput
                    label="Password"
                    placeholder="Enter a secure password"
                    leftSection={
                      <IconLock size={18} />
                    }
                    value={password}
                    onChange={(e) =>
                      setPassword(e.currentTarget.value)
                    }
                    minLength={8}
                    description="Use at least 8 characters."
                    required
                    radius="md"
                    size="md"
                  />
                </Box>

                <Divider />

                {/* ACCOUNT ROLE */}
                <Box>
                  <Text className="au-form-section-label">
                    ACCOUNT ROLE
                  </Text>

                  <Text size="sm" c="dimmed" mb="md">
                    Choose the permissions for this account.
                  </Text>

                  <Radio.Group
                    value={role}
                    onChange={(value) =>
                      setRole(value as Role)
                    }
                    name="accountRole"
                  >
                    <Stack gap="sm">
                      {/* REGULAR USER */}
                      <Paper
                        withBorder
                        radius="md"
                        className={`au-role-option ${
                          role === "user"
                            ? "au-role-selected"
                            : ""
                        }`}
                        onClick={() => setRole("user")}
                      >
                        <Group wrap="nowrap" gap="md">
                          <ThemeIcon
                            size={42}
                            radius="md"
                            color="blue"
                            variant="light"
                          >
                            <IconUsers size={22} />
                          </ThemeIcon>

                          <Box style={{ flex: 1 }}>
                            <Text fw={700} size="sm">
                              Regular User
                            </Text>

                            <Text size="xs" c="dimmed">
                              Create proposals and track
                              event approval status.
                            </Text>
                          </Box>

                          <Radio value="user" />
                        </Group>
                      </Paper>

                      {/* ADMINISTRATOR */}
                      <Paper
                        withBorder
                        radius="md"
                        className={`au-role-option ${
                          role === "admin"
                            ? "au-role-selected"
                            : ""
                        }`}
                        onClick={() => setRole("admin")}
                      >
                        <Group wrap="nowrap" gap="md">
                          <ThemeIcon
                            size={42}
                            radius="md"
                            color="violet"
                            variant="light"
                          >
                            <IconShieldCheck size={22} />
                          </ThemeIcon>

                          <Box style={{ flex: 1 }}>
                            <Text fw={700} size="sm">
                              Administrator
                            </Text>

                            <Text size="xs" c="dimmed">
                              Manage events, users,
                              proposals, and approvals.
                            </Text>
                          </Box>

                          <Radio value="admin" />
                        </Group>
                      </Paper>
                    </Stack>
                  </Radio.Group>
                </Box>

                <Divider />

                {/* FORM BUTTONS */}
                <Group justify="flex-end" gap="sm">
                  <Button
                    type="button"
                    variant="default"
                    radius="md"
                    size="md"
                    disabled={loading}
                    onClick={() => {
                      clearForm();
                      setError("");
                      setSuccess("");
                    }}
                  >
                    Clear Form
                  </Button>

                  <Button
                    type="submit"
                    color="indigo"
                    radius="md"
                    size="md"
                    loading={loading}
                    leftSection={
                      <IconUserPlus size={18} />
                    }
                  >
                    Create Account
                  </Button>
                </Group>
              </Stack>
            </form>
          </Paper>
        </Box>

        {/* RIGHT COLUMN - INFORMATION */}
        <Box>
          <Stack gap="lg">
            <Paper
              withBorder
              radius="lg"
              className="au-info-panel"
            >
              <Group gap="sm" mb="md">
                <ThemeIcon
                  color="indigo"
                  variant="light"
                  size={40}
                  radius="md"
                >
                  <IconShieldCheck size={21} />
                </ThemeIcon>

                <Title order={5}>
                  Account Guidelines
                </Title>
              </Group>

              <Stack gap="md">
                <Group align="start" wrap="nowrap">
                  <Avatar
                    size={30}
                    color="indigo"
                    radius="xl"
                  >
                    1
                  </Avatar>

                  <Box>
                    <Text fw={600} size="sm">
                      Use valid information
                    </Text>

                    <Text size="xs" c="dimmed">
                      Enter the user's correct name
                      and email address.
                    </Text>
                  </Box>
                </Group>

                <Group align="start" wrap="nowrap">
                  <Avatar
                    size={30}
                    color="indigo"
                    radius="xl"
                  >
                    2
                  </Avatar>

                  <Box>
                    <Text fw={600} size="sm">
                      Set a secure password
                    </Text>

                    <Text size="xs" c="dimmed">
                      Use a strong password with
                      at least 8 characters.
                    </Text>
                  </Box>
                </Group>

                <Group align="start" wrap="nowrap">
                  <Avatar
                    size={30}
                    color="indigo"
                    radius="xl"
                  >
                    3
                  </Avatar>

                  <Box>
                    <Text fw={600} size="sm">
                      Assign the correct role
                    </Text>

                    <Text size="xs" c="dimmed">
                      Administrator accounts have
                      elevated permissions.
                    </Text>
                  </Box>
                </Group>
              </Stack>
            </Paper>

            {/* HELP PANEL */}
            <Paper
              radius="lg"
              className="au-help-panel"
            >
              <ThemeIcon
                size={42}
                radius="md"
                variant="light"
                color="indigo"
                mb="md"
              >
                <IconUserPlus size={23} />
              </ThemeIcon>

              <Title order={5} mb="xs">
                User Management
              </Title>

              <Text size="sm" c="dimmed">
                Accounts created here can access
                SmartCampus according to their
                assigned role.
              </Text>
            </Paper>
          </Stack>
        </Box>
      </SimpleGrid>
    </Box>
  );
}
