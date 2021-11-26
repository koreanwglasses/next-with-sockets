import { NextApiRequest } from "next";
import { Server } from "socket.io";
import { validateSocket } from "./validate-socket-ids";

export async function subscribe(
  req: NextApiRequest,
  res: NextApiResponse,
  key: string
) {
  const io = res.socket.server.io;
  const room = `subscribers:${key}`;

  const socketId = await validateSocket(req, res);
  if (!socketId) return;

  io.to(socketId).socketsJoin(room);
}

export function notify(res: NextApiResponse | Server, key: string) {
  const io = (res as NextApiResponse & Server).socket?.server.io ?? res;
  const room = `subscribers:${key}`;
  io.to(room).emit("subscription:update", key);
}
