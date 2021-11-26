import { NextApiRequest } from "next";
import { getSession } from "./get-session";

export async function validateSocketIds(
  req: NextApiRequest,
  res: NextApiResponse,
  allowNone = false
) {
  const session = await getSession(req, res);

  let socketIds = (session.socketIds ?? []) as string[];

  const io = res.socket.server.io;

  // Clean up dead sockets
  socketIds = socketIds.filter(
    (socketId) => io.sockets.sockets.get(socketId)?.connected
  );
  session.socketIds = socketIds;

  for (const socketId in session.socketIndices ?? {}) {
    if (!io.sockets.sockets.get(socketId)?.connected)
      delete session.socketIndices[socketId];
  }

  // Error if there are no sockets and `allowNone` is false
  if (!allowNone && !socketIds?.length) {
    return res.status(400).send("No sockets linked to current session");
  }

  return socketIds;
}

export async function validateSocket(
  req: NextApiRequest,
  res: NextApiResponse,
  socketIndex?: number
) {
  const socketIndex_ =
    socketIndex ?? req.body.socketIndex ?? +(req.query.socketIndex ?? "0");
  if (!socketIndex_) return res.status(400).send("Invalid socket index");

  const socketIds = await validateSocketIds(req, res);
  if (!socketIds) return;

  const session = await getSession(req, res);
  const socketId = socketIds.find(
    (socketId) => session.socketIndices?.[socketId] === socketIndex_
  );

  const io = res.socket.server.io;

  if (!io.sockets.sockets.get(socketId!)?.connected) {
    return res.status(400).send("Invalid socket index");
  }

  return socketId;
}
