import type { NextApiRequest } from "next";
import { getSession } from "../../lib/get-session";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!req.body.socketId || typeof req.body.socketId !== "string")
    return res.status(400).send("Invalid socketId");

  const session = await getSession(req, res);
  session.socketId = req.body.socketId;

  return res.status(200).send("OK");
}
