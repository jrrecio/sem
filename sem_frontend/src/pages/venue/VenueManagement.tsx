
/* =========================================
   PART 1: IMPORTS
========================================= */

import { useEffect, useState } from "react";

import {
  Stack,
  Title,
  Text,
  Paper,
  Table,
  Badge,
  Loader,
  Alert,
  Button,
  Modal,
  TextInput,
  NumberInput,
  Textarea,
  Select,
  Group,
} from "@mantine/core";

import {
  getVenues,
  createVenue,
  type Venue,
  type CreateVenueData,
} from "../../api/venue";


export default function VenueManagement() {

  /* =========================================
     PART 2: STATE VARIABLES
  ========================================= */

  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add Venue modal
  const [opened, setOpened] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Venue form fields
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState<number | string>(1);
  const [description, setDescription] = useState("");
  const [facilities, setFacilities] = useState("");
  const [status, setStatus] =
    useState<CreateVenueData["status"]>("active");


  /* =========================================
     PART 3: FETCH VENUES FROM LARAVEL
     GET /api/venues
  ========================================= */

  const fetchVenues = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getVenues();
      setVenues(data);

    } catch (err) {
      console.error("Error fetching venues:", err);
      setError("Failed to load venues.");

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchVenues();
  }, []);


  /* =========================================
     PART 4: RESET VENUE FORM
  ========================================= */

  const resetForm = () => {
    setName("");
    setLocation("");
    setCapacity(1);
    setDescription("");
    setFacilities("");
    setStatus("active");
    setFormError("");
  };


  /* =========================================
     PART 5: SAVE NEW VENUE
     POST /api/venues
  ========================================= */

  const handleCreateVenue = async () => {

    if (!name.trim() || !location.trim()) {
      setFormError("Venue name and location are required.");
      return;
    }

    if (
      typeof capacity !== "number" ||
      !Number.isInteger(capacity) ||
      capacity < 1
    ) {
      setFormError("Capacity must be a positive whole number.");
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      const venueData: CreateVenueData = {
        name: name.trim(),
        location: location.trim(),
        capacity,
        description: description.trim(),
        facilities: facilities
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        status,
      };

      await createVenue(venueData);

      setOpened(false);
      resetForm();

      // Refresh venue table after saving
      await fetchVenues();

    } catch (err: any) {
      console.error("Error creating venue:", err);

      setFormError(
        err.response?.data?.message ||
        "Failed to create venue."
      );

    } finally {
      setSaving(false);
    }
  };


  /* =========================================
     PART 6: MAIN VENUE MANAGEMENT PAGE
  ========================================= */

  return (
    <Stack p="lg" gap="md">

      {/* PART 6.1: PAGE HEADER */}

      <div>
        <Title order={2}>
          Venue & Resource Allocation
        </Title>

        <Text c="dimmed" size="sm">
          Manage school venues, view recommendations,
          and confirm venue reservations.
        </Text>
      </div>


      {/* =====================================
          PART 7: VENUE MANAGEMENT TABLE
      ===================================== */}

      <Paper withBorder radius="md" p="lg">

        <Group justify="space-between" mb="md">
          <div>
            <Title order={4}>Venue Management</Title>

            <Text size="sm" c="dimmed">
              Manage registered school venues,
              capacities, facilities, and status.
            </Text>
          </div>

          {/* PART 7.1: ADD VENUE BUTTON */}

          <Button onClick={() => setOpened(true)}>
            + Add Venue
          </Button>
        </Group>

        {/* PART 7.2: LOADING */}

        {loading && <Loader />}

        {/* PART 7.3: ERROR */}

        {error && (
          <Alert color="red" title="Error">
            {error}
          </Alert>
        )}

        {/* PART 7.4: VENUE RECORDS */}

        {!loading && !error && (
          <>
            {venues.length === 0 ? (
              <Text c="dimmed">
                No venues found in the database.
              </Text>
            ) : (
              <Table.ScrollContainer minWidth={700}>
                <Table striped highlightOnHover>

                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Venue Name</Table.Th>
                      <Table.Th>Location</Table.Th>
                      <Table.Th>Capacity</Table.Th>
                      <Table.Th>Facilities</Table.Th>
                      <Table.Th>Status</Table.Th>
                    </Table.Tr>
                  </Table.Thead>

                  <Table.Tbody>
                    {venues.map((venue) => (
                      <Table.Tr key={venue.id}>

                        <Table.Td>{venue.name}</Table.Td>

                        <Table.Td>{venue.location}</Table.Td>

                        <Table.Td>{venue.capacity}</Table.Td>

                        <Table.Td>
                          {venue.facilities?.join(", ") || "None"}
                        </Table.Td>

                        <Table.Td>
                          <Badge
                            color={
                              venue.status === "active"
                                ? "green"
                                : venue.status === "maintenance"
                                ? "yellow"
                                : "gray"
                            }
                          >
                            {venue.status}
                          </Badge>
                        </Table.Td>

                      </Table.Tr>
                    ))}
                  </Table.Tbody>

                </Table>
              </Table.ScrollContainer>
            )}
          </>
        )}

      </Paper>


      {/* =====================================
          PART 8: GREEDY ALGORITHM SECTION
          To be connected in a later step
      ===================================== */}

      <Paper withBorder radius="md" p="lg">

        <Title order={4}>
          Greedy Venue Recommendation
        </Title>

        <Text c="dimmed" mt="sm">
          Recommend suitable venues for approved
          events based on capacity, facilities,
          and schedule availability.
        </Text>

        <Text size="sm" fw={500} mt="sm">
          Algorithm: Greedy Algorithm
        </Text>

        <Text size="sm" c="dimmed">
          Administrator confirmation is required
          before reserving a venue.
        </Text>

      </Paper>


      {/* =====================================
          PART 9: VENUE RESERVATIONS
          To be connected in a later step
      ===================================== */}

      <Paper withBorder radius="md" p="lg">

        <Title order={4}>Venue Reservations</Title>

        <Text c="dimmed" mt="sm">
          Confirmed venue reservations will
          appear here.
        </Text>

      </Paper>


      {/* =====================================
          PART 10: ADD VENUE MODAL FORM
      ===================================== */}

      <Modal
        opened={opened}
        onClose={() => {
          setOpened(false);
          resetForm();
        }}
        title="Add New Venue"
        centered
      >

        <Stack gap="md">

          {/* PART 10.1: VENUE NAME */}

          <TextInput
            label="Venue Name"
            placeholder="School Auditorium"
            required
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
          />

          {/* PART 10.2: LOCATION */}

          <TextInput
            label="Location"
            placeholder="Main Building"
            required
            value={location}
            onChange={(e) => setLocation(e.currentTarget.value)}
          />

          {/* PART 10.3: CAPACITY */}

          <NumberInput
            label="Venue Capacity"
            placeholder="200"
            required
            min={1}
            allowDecimal={false}
            value={capacity}
            onChange={setCapacity}
          />

          {/* PART 10.4: DESCRIPTION */}

          <Textarea
            label="Description"
            placeholder="Enter venue description"
            value={description}
            onChange={(e) =>
              setDescription(e.currentTarget.value)
            }
          />

          {/* PART 10.5: FACILITIES */}

          <TextInput
            label="Facilities"
            description="Separate facilities with commas."
            placeholder="Projector, Sound System, Air Conditioning"
            value={facilities}
            onChange={(e) =>
              setFacilities(e.currentTarget.value)
            }
          />

          {/* PART 10.6: STATUS */}

          <Select
            label="Venue Status"
            data={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
              { value: "maintenance", label: "Maintenance" },
            ]}
            value={status}
            allowDeselect={false}
            onChange={(value) => {
              if (
                value === "active" ||
                value === "inactive" ||
                value === "maintenance"
              ) {
                setStatus(value);
              }
            }}
          />

          {/* PART 10.7: FORM ERROR */}

          {formError && (
            <Alert color="red" title="Unable to save">
              {formError}
            </Alert>
          )}

          {/* PART 10.8: SAVE / CANCEL BUTTONS */}

          <Group justify="flex-end">

            <Button
              variant="default"
              disabled={saving}
              onClick={() => {
                setOpened(false);
                resetForm();
              }}
            >
              Cancel
            </Button>

            <Button
              loading={saving}
              onClick={handleCreateVenue}
            >
              Save Venue
            </Button>

          </Group>

        </Stack>

      </Modal>

    </Stack>
  );
}
