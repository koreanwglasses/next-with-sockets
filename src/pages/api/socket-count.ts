import type { NextApiRequest, NextApiResponse } from "next";
import { subscribable } from "../../lib/subscriptions";
import { pruneSockets } from "../../lib/validate-socket-ids";

const handler = subscribable((req) => `/api/socket-count#${req.session.id}`)(
  (req: NextApiRequest, res: NextApiResponse) => {
    pruneSockets(req);
    const numSockets = Object.keys(req.session.sockets).length;
    res.send({ numSockets });
  }
);

export default handler;
