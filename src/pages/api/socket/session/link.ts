import type { NextApiRequest } from "next";
import { getSession } from "../../../../lib/get-session";
import { notify, subscribe } from "../../../../lib/subscriptions";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession(req, res);

  const dataKey = `/api/socket/session/link#${session.id}`;
  if (req.query.subscribe === "true") {
    await subscribe(req, res, dataKey);
  }

  if (req.method === "GET") {
    return res.json({ socketsLinked: session.socketIds?.length ?? 0, dataKey });
  }

  if (req.method === "POST") {
    const socketId = req.body.socketId;
    if (!socketId || typeof socketId !== "string")
      return res.status(400).send("Invalid socketId");

    // Assign the socket a unique and stable index so
    // different sockets on the same session (i.e. different tabs)
    // can make unique requests if necessary.
    // Starts from 1 to make it easy to distinguish from undefined
    const socketIndices = (session.socketIndices ?? {}) as Record<
      string,
      number
    >;
    if (!(socketId in socketIndices)) {
      socketIndices[socketId] =
        1 + Math.max(0, ...Object.values(socketIndices));
    }
    session.socketIndices = socketIndices;

    // Add socket to list of sockets in current session
    const socketIds = session.socketIds ?? [];

    if (!socketIds.includes(socketId)) {
      socketIds.push(socketId);
      session.socketIds = socketIds;

      // Notify subscribers of changes
      await session.commit();
      notify(res, dataKey);
    }

    return res.json({ socketIndex: socketIndices[socketId] });
  }

  return res.status(501).send("Not Implemented");
}
