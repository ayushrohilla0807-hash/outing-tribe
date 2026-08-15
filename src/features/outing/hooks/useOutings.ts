import { useQuery } from "@tanstack/react-query";

import { getOutings } from "../services/outingService";

export function useOutings() {
  return useQuery({
    queryKey: ["outings"],

    queryFn: getOutings,
  });
}
