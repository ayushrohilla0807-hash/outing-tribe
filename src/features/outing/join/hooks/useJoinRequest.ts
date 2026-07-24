import { useState } from "react";

export type JoinStatus =
  | "not_joined"
  | "pending"
  | "accepted"
  | "rejected";

export function useJoinRequest() {
  const [statuses, setStatuses] = useState<
    Record<string, JoinStatus>
  >({});

  const getStatus = (outingId: string) =>
    statuses[outingId] ?? "not_joined";

  const sendRequest = (outingId: string) => {
    setStatuses((prev) => ({
      ...prev,
      [outingId]: "pending",
    }));
  };

  const cancelRequest = (outingId: string) => {
    setStatuses((prev) => ({
      ...prev,
      [outingId]: "not_joined",
    }));
  };

  const acceptRequest = (outingId: string) => {
    setStatuses((prev) => ({
      ...prev,
      [outingId]: "accepted",
    }));
  };

  const rejectRequest = (outingId: string) => {
    setStatuses((prev) => ({
      ...prev,
      [outingId]: "rejected",
    }));
  };

  return {
    getStatus,
    sendRequest,
    cancelRequest,
    acceptRequest,
    rejectRequest,
  };
}