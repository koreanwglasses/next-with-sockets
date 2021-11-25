import { NextApiRequest } from "next";
import { Server as IO } from "socket.io";
import { validateSocketIds } from "./validate-socket-ids";

function getRooms(key: string, ...scope: string[]) {
  return scope.map((scope) => `${key}:${scope}`);
}

export async function subscribeMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  key: string,
  ...scope: string[]
) {
  if (req.method === "GET") {
    if (req.query.subscribe === "true") {
      return subscribe(req, res, key, ...scope);
    }
    if (req.query.unsubscribe === "true") {
      return unsubscribe(req, res, key, ...scope);
    }
  }
  return true;
}

export async function subscribe(
  req: NextApiRequest,
  res: NextApiResponse,
  key: string,
  ...scope: string[]
) {
  const rooms = getRooms(key, ...scope);
  const socketIds = await validateSocketIds(req, res);
  if (!socketIds) return;

  res.socket.server.io.to(socketIds).socketsJoin(rooms);

  return true;
}

export async function unsubscribe(
  req: NextApiRequest,
  res: NextApiResponse,
  key: string,
  ...scope: string[]
) {
  const rooms = getRooms(key, ...scope);

  const socketIds = await validateSocketIds(req, res);
  if (!socketIds) return;

  res.socket.server.io.to(socketIds).socketsLeave(rooms);

  return true;
}

export function notify(
  res: NextApiResponse | IO,
  key: string,
  ...scope: string[]
) {
  const rooms = getRooms(key, ...scope);

  const io = (res as NextApiResponse & IO).socket?.server.io ?? res;

  io.to(rooms).emit("update", { key });
}
