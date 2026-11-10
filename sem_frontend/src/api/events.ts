import api from "../lib/api";

export interface EventData {
  title: string;
  event_type: string;
  description: string;
  objectives?: string;
  start_date: string;
  end_date: string;
  proposed_venue_id?: number | null;
  estimated_attendees: number;
  estimated_budget: number;
}

export interface EventRequirement {
  id: number;
  event_id: number;
  requirement_name: string;
  status: "pending" | "verified";
}
export const getEvents = async () => {
  const response = await api.get("/events");
  return response.data;
};

export const reviewEvent = async (
  id: number,
  decision: "approved" | "rejected",
  rejectionReason?: string
) => {
  const response = await api.post(`/events/${id}/review`, {
    decision,
    ...(decision === "rejected"
      ? { rejection_reason: rejectionReason }
      : {}),
  });

  return response.data;
};

export const getEventRequirements = async (eventId: number) => {
  const response = await api.get<EventRequirement[]>(
    `/events/${eventId}/requirements`
  );

  return response.data;
};

export const addEventRequirement = async (
  eventId: number,
  requirementName: string
) => {
  const response = await api.post(
    `/events/${eventId}/requirements`,
    { requirement_name: requirementName }
  );

  return response.data;
};
export const submitEvent = async (eventId: number) => {
  const response = await api.post(
    `/events/${eventId}/submit`
  );

  return response.data;
};
export const createEvent = async (data: EventData) => {
  const response = await api.post("/events", data);
  return response.data;
};
export interface EventBudget {
  id: number;
  event_id: number;
  status: "pending" | "approved" | "rejected";
}

export interface BudgetDetails {
  event_id: number;
  estimated_budget: number | string | null;
  budget: EventBudget | null;
}

export const getEventBudget = async (
  eventId: number
): Promise<BudgetDetails> => {
  const response = await api.get<BudgetDetails>(
    `/events/${eventId}/budget`
  );
  return response.data;
};

export const reviewEventBudget = async (
  eventId: number,
  decision: "approved" | "rejected"
) => {
  const response = await api.post(
    `/events/${eventId}/budget/review`,
    { decision }
  );
  return response.data;
};
export const deleteEvent = async (eventId: number) => {
  const response = await api.delete(`/events/${eventId}`);
  return response.data;
};

export const updateEventRequirement = async (
  eventId: number,
  requirementId: number,
  status: "pending" | "verified"
) => {
  const response = await api.patch(
    `/events/${eventId}/requirements/${requirementId}`,
    { status }
  );

  

  return response.data;
};
