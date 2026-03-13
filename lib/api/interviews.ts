import { apiClient } from "./client";

export const getInterviews = async () => {
  const { data } = await apiClient.get("/interviews");
  return data;
};
