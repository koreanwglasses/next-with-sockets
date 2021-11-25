import type { NextApiRequest } from "next";
import {
  validateSocketIds,
  validateSocketIndex,
} from "../../lib/validate-socket-ids";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Won't work unless `io` is assigned to a const
  // because the res object is disposed after the
  // handler returns
  const io = res.socket.server.io;

  if (req.body.socketIndex) {
    // If a specific index is specified, only pong
    // back to that socket
    const socketId = await validateSocketIndex(req, res, req.body.socketIndex);
    if (!socketId) return;

    setTimeout(() => io.to(socketId).emit("message", "pong"), 1000);
  } else {
    // Otherwise, pong to all sockets assoc. with
    // current session
    const socketIds = await validateSocketIds(req, res);
    if (!socketIds) return;

    setTimeout(() => io.to(socketIds).emit("message", "pong"), 1000);
  }

  return res.status(200).send("OK");
}
