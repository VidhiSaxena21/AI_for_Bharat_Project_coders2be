import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

type AnalyzeRequest = z.infer<typeof api.scans.analyze.input>;

export function useAnalyzeScan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: AnalyzeRequest) => {
      const validated = api.scans.analyze.input.parse(data);
      const res = await fetch(api.scans.analyze.path, {
        method: api.scans.analyze.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to analyze scan");
      }
      return api.scans.analyze.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      if (variables.userId) {
        queryClient.invalidateQueries({
          queryKey: [buildUrl(api.scans.history.path, { userId: variables.userId })],
        });
      }
    },
  });
}

export function useScanHistory(userId: number | null) {
  return useQuery({
    queryKey: [userId ? buildUrl(api.scans.history.path, { userId }) : null],
    queryFn: async () => {
      if (!userId) return [];
      const url = buildUrl(api.scans.history.path, { userId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch history");
      return api.scans.history.responses[200].parse(await res.json());
    },
    enabled: !!userId,
  });
}
