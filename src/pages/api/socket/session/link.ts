import type { NextApiRequest } from "next";
import { getSession } from "../../../../lib/get-session";
import { notify, subscribeMiddleware } from "../../../../lib/subscriptions";
import { validateSocketIds } from "../../../../lib/validate-socket-ids";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession(req, res);
  const socketIds = (await validateSocketIds(req, res, true))!;

  const key = "/api/socket/session/link";
  const handles = [session.id, ...socketIds];
  if (!(await subscribeMiddleware(req, res, key, ...handles))) return;

  if (req.method === "GET") {
    return res.json({ socketsLinked: socketIds.length });
  }

  if (req.method === "POST") {
    const socketId = req.body.socketId;
    if (!socketId || typeof socketId !== "string")
      return res.status(400).send("Invalid socketId");

    // Add socket to list of sockets in current session
    if (!socketIds.includes(socketId)) {
      socketIds.push(socketId);
      notify(res, key, ...handles);
    }

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

    session.socketIds = socketIds;
    session.socketIndices = socketIndices;
    return res.json({ socketIndex: socketIndices[socketId] });
  }

  return res.status(501).send("Not Implemented");
}
