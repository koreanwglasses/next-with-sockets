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
  socketIds = socketIds.filter(
    (socketId) => io.sockets.sockets.get(socketId)?.connected
  );

  if (!allowNone && !socketIds?.length) {
    return res.status(400).send("No sockets linked to current session");
  }

  session.socketIDs = socketIds;
  return socketIds;
}
