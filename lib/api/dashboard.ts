import { apiClient } from "./client";

export const getDashboardStats = async () => {
  const { data } = await apiClient.get("/dashboard");
  return data;
};
