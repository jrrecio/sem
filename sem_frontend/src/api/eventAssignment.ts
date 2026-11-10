import api from "../lib/api";

export interface EligibleUser {
  id: number;
  name: string;
  email: string;
}

export const getEligibleCoordinators = async () => {
  const response = await api.get<EligibleUser[]>(
    "/event-coordinators/eligible"
  );

  return response.data;
};

export const assignEventCoordinator = async (
  eventId: number,
  userId: number
) => {
  const response = await api.post(
    `/events/${eventId}/assign-coordinator`,
    {
      assigned_user_id: userId,
    }
  );

  return response.data;
};
