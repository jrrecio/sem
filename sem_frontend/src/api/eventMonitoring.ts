import api from "../lib/api";

export interface MonitoringEvent {
  id: number;
  title: string;
  status: string;
  monitoring_tasks_count: number;
  completed_tasks_count: number;
  progress: number;
}

export interface MonitoringTask {
  id: number;
  event_id: number;
  title: string;
  description: string | null;
  status: "pending" | "in_progress" | "completed";
  due_date: string | null;
  assigned_to: number | null;
  assigned_student?: {
    id: number;
    name: string;
    email: string;
  } | null;
}

// GET all monitored events
export const getMonitoringEvents = async () => {
  const response = await api.get<MonitoringEvent[]>(
    "/event-monitoring"
  );
  return response.data;
};

// GET tasks for a specific event
export const getMonitoringTasks = async (eventId: number) => {
  const response = await api.get<MonitoringTask[]>(
    `/events/${eventId}/monitoring`
  );
  return response.data;
};

// CREATE monitoring task
export const createMonitoringTask = async (
  eventId: number,
  data: {
    title: string;
    description?: string;
    due_date?: string | null;
    assigned_to?: number | null;
  }
) => {
  const response = await api.post(
    `/events/${eventId}/monitoring`,
    data
  );
  return response.data;
};

// UPDATE monitoring task
export const updateMonitoringTask = async (
  taskId: number,
  data: Partial<
    Pick<
      MonitoringTask,
      "title" | "description" | "status" | "due_date" | "assigned_to"
    >
  >
) => {
  const response = await api.put(
    `/monitoring-tasks/${taskId}`,
    data
  );
  return response.data;
};

// DELETE monitoring task
export const deleteMonitoringTask = async (taskId: number) => {
  const response = await api.delete(
    `/monitoring-tasks/${taskId}`
  );
  return response.data;
};
