import type { NextApiRequest } from "next";
import { getSession } from "../../lib/get-session";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession(req, res);

  const socketId = session.socketId;

  if (!socketId)
    return res.status(400).send("No socketId found for current session");

  // Won't work unless `io` is assigned to a const
  // because the res object is disposed after the
  // handler returns
  const io = res.socket.server.io;
  setTimeout(() => io.to(socketId).emit("message", "pong"), 1000);

  return res.status(200).send("OK");
}
