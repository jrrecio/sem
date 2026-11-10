
import { useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Group,
  NumberInput,
  Textarea,
  TextInput,
} from "@mantine/core";
import {
  IconCalendarEvent,
  IconCheck,
  IconAlertCircle,
  IconClipboardList,
  IconUsers,
  IconCurrencyPeso,
} from "@tabler/icons-react";
import { createEvent } from "../../api/events";
import "./CreateEvent.css";

export default function CreateEvent() {
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState("");
  const [description, setDescription] = useState("");
  const [objectives, setObjectives] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [attendees, setAttendees] = useState<number | string>(1);
  const [budget, setBudget] = useState<number | string>(0);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async () => {
    setMessage("");
    setErrorMessage("");

    if (
      !title.trim() ||
      !eventType.trim() ||
      !description.trim() ||
      !startDate ||
      !endDate
    ) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    if (endDate < startDate) {
      setErrorMessage("End date cannot be before start date.");
      return;
    }

    if (
      typeof attendees !== "number" ||
      !Number.isInteger(attendees) ||
      attendees < 1
    ) {
      setErrorMessage("Please enter a valid number of attendees.");
      return;
    }

    if (typeof budget !== "number" || budget < 0) {
      setErrorMessage("Please enter a valid estimated budget.");
      return;
    }

    setLoading(true);

    try {
      await createEvent({
        title: title.trim(),
        event_type: eventType.trim(),
        description: description.trim(),
        objectives: objectives.trim(),
        start_date: startDate,
        end_date: endDate,
        estimated_attendees: attendees,
        estimated_budget: budget,
      });

      setMessage("Event proposal saved successfully as a draft!");

      setTitle("");
      setEventType("");
      setDescription("");
      setObjectives("");
      setStartDate("");
      setEndDate("");
      setAttendees(1);
      setBudget(0);
    } catch (error: unknown) {
      const apiError = error as {
        response?: {
          data?: {
            message?: string;
            errors?: Record<string, string[]>;
          };
        };
      };

      const validationErrors = apiError.response?.data?.errors;
      const firstError = validationErrors
        ? Object.values(validationErrors)[0]?.[0]
        : undefined;

      setErrorMessage(
        firstError ||
          apiError.response?.data?.message ||
          "Failed to create event. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-event-page">
      <div className="create-event-container">
        {/* Header */}
        <div className="create-event-header">
          <div>
            <Badge color="blue" variant="light" mb="sm">
              EVENT MANAGEMENT
            </Badge>

            <h1 className="create-event-title">
              Create Event Proposal
            </h1>

            <p className="create-event-subtitle">
              Plan and organize your school event by completing
              the information below.
            </p>
          </div>
        </div>

        {/* Information Banner */}
        <div className="create-event-info">
          <h3>Event Proposal Information</h3>
          <p>
            Complete the required details to create a new event.
            Your proposal will initially be saved as a draft
            before submission for approval.
          </p>
        </div>

        {message && (
          <Alert
            color="green"
            icon={<IconCheck size={18} />}
            mb="lg"
          >
            {message}
          </Alert>
        )}

        {errorMessage && (
          <Alert
            color="red"
            icon={<IconAlertCircle size={18} />}
            mb="lg"
          >
            {errorMessage}
          </Alert>
        )}

        {/* Basic Event Information */}
        <div className="create-event-card">
          <div className="create-event-section-title">
            <div className="create-event-section-icon">
              <IconClipboardList size={23} />
            </div>

            <div>
              <h3>Basic Event Information</h3>
              <p>Provide the main details of your event.</p>
            </div>
          </div>

          <div className="create-event-grid">
            <TextInput
              label="Event Title"
              placeholder="e.g. School Foundation Day"
              value={title}
              onChange={(e) => setTitle(e.currentTarget.value)}
              required
            />

            <TextInput
              label="Event Type"
              placeholder="e.g. School Celebration"
              value={eventType}
              onChange={(e) => setEventType(e.currentTarget.value)}
              required
            />

            <div className="create-event-full">
              <Textarea
                label="Event Description"
                placeholder="Describe the purpose and activities of the event..."
                value={description}
                onChange={(e) =>
                  setDescription(e.currentTarget.value)
                }
                minRows={4}
                autosize
                required
              />
            </div>

            <div className="create-event-full">
              <Textarea
                label="Event Objectives"
                placeholder="What do you want to achieve with this event?"
                value={objectives}
                onChange={(e) =>
                  setObjectives(e.currentTarget.value)
                }
                minRows={3}
                autosize
              />
            </div>
          </div>
        </div>

        {/* Event Schedule */}
        <div className="create-event-card">
          <div className="create-event-section-title">
            <div className="create-event-section-icon">
              <IconCalendarEvent size={23} />
            </div>

            <div>
              <h3>Event Schedule</h3>
              <p>Set the proposed event dates.</p>
            </div>
          </div>

          <div className="create-event-grid">
            <TextInput
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) =>
                setStartDate(e.currentTarget.value)
              }
              required
            />

            <TextInput
              label="End Date"
              type="date"
              min={startDate || undefined}
              value={endDate}
              onChange={(e) =>
                setEndDate(e.currentTarget.value)
              }
              required
            />
          </div>
        </div>

        {/* Attendance and Budget */}
        <div className="create-event-card">
          <div className="create-event-section-title">
            <div className="create-event-section-icon">
              <IconUsers size={23} />
            </div>

            <div>
              <h3>Attendance and Budget</h3>
              <p>
                Estimate the expected participants and budget.
              </p>
            </div>
          </div>

          <div className="create-event-grid">
            <NumberInput
              label={
                <Group gap={6}>
                  <IconUsers size={15} />
                  Estimated Attendees
                </Group>
              }
              placeholder="Enter expected attendees"
              min={1}
              allowDecimal={false}
              allowNegative={false}
              value={attendees}
              onChange={setAttendees}
              required
            />

            <NumberInput
              label={
                <Group gap={6}>
                  <IconCurrencyPeso size={15} />
                  Estimated Budget (PHP)
                </Group>
              }
              placeholder="Enter estimated budget"
              min={0}
              decimalScale={2}
              allowNegative={false}
              thousandSeparator=","
              prefix="₱ "
              value={budget}
              onChange={setBudget}
              required
            />
          </div>
        </div>

        {/* Actions */}
        <div className="create-event-actions">
          <Button
            variant="default"
            radius="md"
            onClick={() => {
              setTitle("");
              setEventType("");
              setDescription("");
              setObjectives("");
              setStartDate("");
              setEndDate("");
              setAttendees(1);
              setBudget(0);
              setMessage("");
              setErrorMessage("");
            }}
            disabled={loading}
          >
            Clear Form
          </Button>

          <Button
            className="create-event-save-button"
            leftSection={<IconCheck size={18} />}
            loading={loading}
            onClick={handleSubmit}
            radius="md"
          >
            Save Event Proposal
          </Button>
        </div>
      </div>
    </div>
  );
}
