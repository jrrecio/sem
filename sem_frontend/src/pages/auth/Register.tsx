
import { useState } from "react";
import { useNavigate } from "react-router";
import type { AxiosError } from "axios";

import {
  Anchor,
  Button,
  Checkbox,
  Container,
  Divider,
  Paper,
  Stack,
  Text,
  TextInput,
  PasswordInput,
  Title,
  Box,
  Badge,
  Group,
} from "@mantine/core";

import { useForm } from "@mantine/form";
import { useAuth } from "../../context/AuthContext";

type ApiError = {
  message?: string;
  errors?: Record<string, string[]>;
};

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      password: "",
      terms: false,
    },
    validate: {
      name: (value) =>
        value.trim().length > 0 ? null : "Name is required",
      email: (value) =>
        /^\S+@\S+$/.test(value) ? null : "Please enter a valid email",
      password: (value) =>
        value.length >= 8
          ? null
          : "Password must be at least 8 characters",
      terms: (value) =>
        value ? null : "You must accept the terms and conditions",
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setError("");
    setSubmitting(true);

    try {
      await register(
        values.name,
        values.email,
        values.password
      );

      navigate("/login");
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>;

      setError(
        axiosErr.response?.data?.errors?.email?.[0] ??
          axiosErr.response?.data?.errors?.name?.[0] ??
          axiosErr.response?.data?.errors?.password?.[0] ??
          axiosErr.response?.data?.message ??
          "Registration failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      mih="100vh"
      style={{
        background:
          "radial-gradient(circle at 15% 20%, #1e40af 0%, transparent 35%), linear-gradient(135deg, #0f172a 0%, #111827 55%, #172554 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <Container size="xs" w="100%" px={0}>
        <Stack align="center" gap="xl">

          {/* BRAND */}
          <Stack align="center" gap={6}>
            <Box
              w={58}
              h={58}
              bg="blue.6"
              style={{
                borderRadius: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 30px rgba(59,130,246,0.35)",
              }}
            >
              <Text c="white" fw={900} size="xl">
                S
              </Text>
            </Box>

            <Title order={2} c="white" fw={800}>
              SEM Workspace
            </Title>

            <Text c="gray.4" size="sm">
              Create your account and get started.
            </Text>
          </Stack>

          {/* REGISTER CARD */}
          <Paper
            radius="xl"
            p={{ base: "xl", sm: 36 }}
            w="100%"
            shadow="xl"
            style={{
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <Stack gap="lg">

              <Stack gap={5}>
                <Badge color="blue" variant="light" w="fit-content">
                  GET STARTED
                </Badge>

                <Title order={2} fw={800} c="dark.8">
                  Create your account
                </Title>

                <Text c="dimmed" size="sm">
                  Fill in your information to create your workspace account.
                </Text>
              </Stack>

              {error && (
                <Box
                  p="sm"
                  style={{
                    backgroundColor: "#fff1f2",
                    border: "1px solid #fecdd3",
                    borderRadius: 10,
                  }}
                >
                  <Text c="red.7" size="sm">
                    {error}
                  </Text>
                </Box>
              )}

              <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="md">

                  <TextInput
                    label="Full name"
                    placeholder="Enter your full name"
                    size="md"
                    radius="md"
                    withAsterisk
                    {...form.getInputProps("name")}
                  />

                  <TextInput
                    label="Email address"
                    placeholder="name@example.com"
                    size="md"
                    radius="md"
                    withAsterisk
                    {...form.getInputProps("email")}
                  />

                  <PasswordInput
                    label="Password"
                    placeholder="Create a password"
                    size="md"
                    radius="md"
                    withAsterisk
                    {...form.getInputProps("password")}
                  />

                  <Checkbox
                    color="blue"
                    label="I agree to the terms and conditions"
                    {...form.getInputProps("terms", {
                      type: "checkbox",
                    })}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    radius="md"
                    loading={submitting}
                    styles={{
                      root: {
                        background:
                          "linear-gradient(90deg, #2563eb, #4f46e5)",
                        border: 0,
                        transition: "0.2s ease",
                      },
                    }}
                  >
                    Create Account
                  </Button>

                </Stack>
              </form>

              <Divider color="gray.2" />

              <Group justify="center" gap={5}>
                <Text size="sm" c="dimmed">
                  Already have an account?
                </Text>

                <Anchor
                  component="button"
                  type="button"
                  fw={700}
                  c="blue.7"
                  onClick={() => navigate("/login")}
                >
                  Sign in
                </Anchor>
              </Group>

            </Stack>
          </Paper>

          {/* FOOTER */}
          <Text c="gray.5" size="xs" ta="center">
            © {new Date().getFullYear()} SEM Workspace. All rights reserved.
          </Text>

        </Stack>
      </Container>
    </Box>
  );
}
