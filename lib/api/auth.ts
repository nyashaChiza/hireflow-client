import apiClient from "./client";

export const login = async (email: string, password: string) => {
  const { data } = await apiClient.post("/auth/login", { email, password });
  return data;
};
