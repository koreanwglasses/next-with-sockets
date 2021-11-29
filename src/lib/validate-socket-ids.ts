import { Session } from "express-session";
import { NextApiRequest } from "next";
import { Server as IO } from "socket.io";

export function getSocket(req: NextApiRequest) {
  const socketIdx = +req.query.socketIdx;
  if (isNaN(socketIdx)) throw { code: 400, message: "Invalid socketIdx" };

  pruneSockets(req);

  const socket = req.io.sockets.sockets.get(req.session.sockets[socketIdx]);
  if (!socket) throw { code: 400, message: "Invalid socketIdx" };

  return socket;
}

export function pruneSockets(req: NextApiRequest): void;
export function pruneSockets(session: Session, io: IO): void;
export function pruneSockets(req_session: NextApiRequest | Session, io_?: IO) {
  const session = (req_session as NextApiRequest).session ?? req_session;
  const io = io_ ?? (req_session as NextApiRequest).io;

  if (!session.sockets) session.sockets = {};

  // Remove disconnected sockets from session
  for (const socketIdx in session.sockets) {
    const socket = io.sockets.sockets.get(session.sockets[socketIdx]);
    if (!socket?.connected) {
      delete session.sockets[socketIdx];
    }
  }

  session.save();
}
