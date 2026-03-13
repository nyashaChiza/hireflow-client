import { apiClient } from "./client";

export const setSelection = async (id: string, status: string) => {
  const { data } = await apiClient.post(`/selection/${id}`, { status });
  return data;
};
