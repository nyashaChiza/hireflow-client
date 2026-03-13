import { apiClient } from "./client";

export const getShortlist = async () => {
  const { data } = await apiClient.get("/shortlist");
  return data;
};
