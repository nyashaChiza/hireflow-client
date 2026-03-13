import { apiClient } from "./client";

export const submitScore = async (id: string, score: number) => {
  const { data } = await apiClient.post(`/scoring/${id}`, { score });
  return data;
};
