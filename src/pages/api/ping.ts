import type { NextApiRequest } from "next";
import { validateSocketIds } from "../../lib/validate-socket-ids";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const socketIds = await validateSocketIds(req, res);
  if (!socketIds) return;

  // Won't work unless `io` is assigned to a const
  // because the res object is disposed after the
  // handler returns
  const io = res.socket.server.io;
  setTimeout(() => io.to(socketIds).emit("message", "pong"), 1000);

  return res.status(200).send("OK");
}
