import type { JoinRequest } from "../models/joinRequest";

const requests: JoinRequest[] = [];

export async function getJoinRequest(
  outingId: string,
  userId: string,
) {
  return (
    requests.find(
      (r) =>
        r.outingId === outingId &&
        r.userId === userId,
    ) ?? null
  );
}

export async function sendJoinRequest(
  outingId: string,
  userId: string,
) {
  const request: JoinRequest = {
    id: crypto.randomUUID(),

    outingId,

    userId,

    status: "pending",

    requestedAt: new Date().toISOString(),
  };

  requests.push(request);

  return request;
}

export async function cancelJoinRequest(
  requestId: string,
) {
  const index = requests.findIndex(
    (r) => r.id === requestId,
  );

  if (index >= 0) {
    requests.splice(index, 1);
  }
}