
import api from "../lib/api";

// ============================================================
// 1. TYPES AND INTERFACES
// Purpose: Define student and event assignment data.
// ============================================================

export interface EligibleStudent {
  id: number;
  name: string;
  email: string;
}

export type EventRole =
  | "Event Coordinator"
  | "Assistant Coordinator"
  | "Documentation Officer"
  | "Logistics Officer"
  | "Finance Officer"
  | "Program Officer";

export const EVENT_ROLES: EventRole[] = [
  "Event Coordinator",
  "Assistant Coordinator",
  "Documentation Officer",
  "Logistics Officer",
  "Finance Officer",
  "Program Officer",
];

export interface EventAssignment {
  id: number;
  event_id: number;
  user_id: number;
  event_role: string;
  student: EligibleStudent | null;
}

// ============================================================
// 2. GET ELIGIBLE STUDENTS
// Purpose: Retrieve registered students for assignment.
// ============================================================

export const getEligibleCoordinators = async () => {
  const response = await api.get<EligibleStudent[]>(
    "/event-assignments/eligible-students"
  );

  return response.data;
};

// ============================================================
// 3. GET ALL ASSIGNMENTS
// Purpose: Retrieve students assigned to school events.
// ============================================================

export const getEventAssignments = async () => {
  const response = await api.get<EventAssignment[]>(
    "/event-assignments"
  );

  return response.data;
};

// ============================================================
// 4. CREATE ASSIGNMENT
// Purpose: Assign a student to an event with a selected role.
// ============================================================

export const assignStudentToEvent = async (
  eventId: number,
  userId: number,
  eventRole: EventRole
) => {
  const response = await api.post(
    "/event-assignments",
    {
      event_id: eventId,
      user_id: userId,
      event_role: eventRole,
    }
  );

  return response.data;
};

// Keep compatibility with existing coordinator function.

export const assignEventCoordinator = async (
  eventId: number,
  userId: number
) => {
  return assignStudentToEvent(
    eventId,
    userId,
    "Event Coordinator"
  );
};

// ============================================================
// 5. UPDATE ASSIGNMENT
// Purpose: Change the student or role of an assignment.
// ============================================================

export const updateEventAssignment = async (
  assignmentId: number,
  userId: number,
  eventRole: EventRole
) => {
  const response = await api.put(
    `/event-assignments/${assignmentId}`,
    {
      user_id: userId,
      event_role: eventRole,
    }
  );

  return response.data;
};

// ============================================================
// 6. DELETE ASSIGNMENT
// Purpose: Remove one assignment without deleting the user.
// ============================================================

export const deleteEventAssignment = async (
  assignmentId: number
) => {
  const response = await api.delete(
    `/event-assignments/${assignmentId}`
  );

  return response.data;
};
