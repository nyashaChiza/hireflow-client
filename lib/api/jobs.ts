import { apiClient } from "./client";

export const getJobs = async () => {
  const { data } = await apiClient.get("/jobs");
  return data;
};
