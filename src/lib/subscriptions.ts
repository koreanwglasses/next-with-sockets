import { NextApiRequest } from "next";
import { Server as IO } from "socket.io";
import { validateSocketIds } from "./validate-socket-ids";

function getRooms(key: string, ...handles: string[]) {
  return handles.map((scope) => `${key}:${scope}`);
}

export async function subscribeMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  key: string,
  ...handles: string[]
) {
  if (req.method === "GET") {
    if (req.query.subscribe === "true") {
      return subscribe(req, res, key, ...handles);
    }
    if (req.query.unsubscribe === "true") {
      return unsubscribe(req, res, key, ...handles);
    }
  }
  return true;
}

export async function subscribe(
  req: NextApiRequest,
  res: NextApiResponse,
  key: string,
  ...handles: string[]
) {
  const rooms = getRooms(key, ...handles);
  const socketIds = await validateSocketIds(req, res);
  if (!socketIds) return;

  res.socket.server.io.to(socketIds).socketsJoin(rooms);

  return true;
}

export async function unsubscribe(
  req: NextApiRequest,
  res: NextApiResponse,
  key: string,
  ...handles: string[]
) {
  const rooms = getRooms(key, ...handles);

  const socketIds = await validateSocketIds(req, res);
  if (!socketIds) return;

  res.socket.server.io.to(socketIds).socketsLeave(rooms);

  return true;
}

/**
 * Notify all subcribers of `key` that subscribed with
 * any of the specified handles
 * @param key
 * @param handles
 */
export function notify(
  res: NextApiResponse | IO,
  key: string,
  ...handles: string[]
) {
  const rooms = getRooms(key, ...handles);

  const io = (res as NextApiResponse & IO).socket?.server.io ?? res;

  io.to(rooms).emit("update", { key });
}
