import { NextApiRequest } from "next";
import { Server } from "socket.io";
import { getSession } from "./get-session";
import { validateSocketIds, validateSocketIndex } from "./validate-socket-ids";

export async function subscribe(
  req: NextApiRequest,
  res: NextApiResponse,
  key: string,
  socketIndex?: number
) {
  const io = res.socket.server.io;
  const room = `subscribers:${key}`;

  if (socketIndex) {
    const socketId = await validateSocketIndex(req, res, socketIndex);
    if (!socketId) return;

    io.to(socketId).socketsJoin(room);
  } else {
    const socketIds = await validateSocketIds(req, res, true);
    if (!socketIds) return;

    // If no socket is specified, notify all sockets assoc. with
    // current session.
    io.to(socketIds).socketsJoin(room);

    // Record it for future sockets
    const session = await getSession(req, res);
    const sessionScopedSubscriptions = (session.sessionScopedSubscriptions ??
      []) as string[];
    if (!sessionScopedSubscriptions.includes(key))
      sessionScopedSubscriptions.push(key);
    session.sessionScopedSubscriptions = sessionScopedSubscriptions;
  }
}

/**
 * For session scoped subscriptions, any new sockets should also
 * receive notifications
 */
export async function linkSocket(
  req: NextApiRequest,
  res: NextApiResponse,
  socketId: string
) {
  const io = res.socket.server.io;

  const session = await getSession(req, res);
  const sessionScopedSubscriptions = (session.sessionScopedSubscriptions ??
    []) as string[];

  sessionScopedSubscriptions.forEach((key) => {
    const room = `subscribers:${key}`;
    io.to(socketId).socketsJoin(room);
  });
}

export function notify(res: NextApiResponse | Server, key: string) {
  const io = (res as NextApiResponse & Server).socket?.server.io ?? res;
  const room = `subscribers:${key}`;
  io.to(room).emit("subscription:update", key);
}
