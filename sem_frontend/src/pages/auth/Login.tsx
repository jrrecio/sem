
import { useState } from "react";
import { useNavigate } from "react-router";
import type { AxiosError } from "axios";

import {
  Anchor,
  Button,
  Center,
  Container,
  Divider,
  Group,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
  Box,
  Badge,
} from "@mantine/core";

import { useForm } from "@mantine/form";
import { useAuth } from "../../context/AuthContext";

type ApiError = {
  message?: string;
  errors?: Record<string, string[]>;
};

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },
    validate: {
      email: (value) =>
        /^\S+@\S+$/.test(value) ? null : "Please enter a valid email",
      password: (value) =>
        value.length >= 6
          ? null
          : "Password must be at least 6 characters",
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setError("");
    setSubmitting(true);

    try {
      await login(values.email, values.password);
      navigate("/dashboard");
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>;

      setError(
        axiosErr.response?.data?.errors?.email?.[0] ??
          axiosErr.response?.data?.message ??
          "Login failed. Please check your credentials."
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
              Manage your workspace with ease.
            </Text>
          </Stack>

          {/* LOGIN CARD */}
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
                  WELCOME BACK
                </Badge>

                <Title order={2} fw={800} c="dark.8">
                  Sign in to your account
                </Title>

                <Text c="dimmed" size="sm">
                  Enter your credentials to access your dashboard.
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
                    label="Email address"
                    placeholder="name@example.com"
                    size="md"
                    radius="md"
                    withAsterisk
                    {...form.getInputProps("email")}
                  />

                  <PasswordInput
                    label="Password"
                    placeholder="Enter your password"
                    size="md"
                    radius="md"
                    withAsterisk
                    {...form.getInputProps("password")}
                  />

                  <Group justify="flex-end">
                    <Text size="xs" c="dimmed">
                      Secure authentication powered by Laravel Sanctum
                    </Text>
                  </Group>

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
                    Sign In
                  </Button>

                </Stack>
              </form>

              <Divider color="gray.2" />

              <Center>
                <Text size="sm" c="dimmed">
                  Don't have an account?{" "}
                  <Anchor
                    component="button"
                    type="button"
                    fw={700}
                    c="blue.7"
                    onClick={() => navigate("/register")}
                  >
                    Create account
                  </Anchor>
                </Text>
              </Center>

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
