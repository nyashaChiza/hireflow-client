import { apiClient } from "./client";

export const getApplications = async () => {
  const { data } = await apiClient.get("/applications");
  return data;
};
