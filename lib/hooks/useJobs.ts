import { useQuery } from "@tanstack/react-query";
import { getJobs } from "../api/jobs";

export const useJobs = () => {
  return useQuery(["jobs"], getJobs);
};
