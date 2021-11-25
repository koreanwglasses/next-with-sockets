import type { NextApiRequest } from "next";
import { getSession } from "../../../../lib/get-session";
import { notify, subscribeMiddleware } from "../../../../lib/subscriptions";
import { validateSocketIds } from "../../../../lib/validate-socket-ids";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession(req, res);
  const socketIds = (await validateSocketIds(req, res, true))!;

  const key = "/api/socket/session/link";
  const handles = [session.id, ...socketIds];
  if (!(await subscribeMiddleware(req, res, key, ...handles))) return;

  if (req.method === "GET") {
    return res.json({ socketsLinked: socketIds.length });
  }

  if (req.method === "POST") {
    const socketId = req.body.socketId;
    if (!socketId || typeof socketId !== "string")
      return res.status(400).send("Invalid socketId");

    if (!socketIds.includes(socketId)) {
      socketIds.push(socketId);
      notify(res, key, ...handles);
    }

    session.socketIds = socketIds;
    return res.status(200).send("OK");
  }

  return res.status(501).send("Not Implemented");
}
