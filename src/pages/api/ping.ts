import type { NextApiRequest, NextApiResponse } from "next";
import { getSocket } from "../../lib/validate-socket-ids";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const socket = getSocket(req);
  setTimeout(() => socket.emit("message", "pong"), 1000);
  return res.status(200).send("OK");
}
