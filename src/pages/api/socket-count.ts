import type { NextApiRequest, NextApiResponse } from "next";
import { subscribable } from "../../lib/subscriptions";
import { pruneSockets } from "../../lib/get-socket";

export default subscribable({
  dataKey: (req) => `/api/socket-count#${req.session.id}`,
  handler(req: NextApiRequest, res: NextApiResponse) {
    pruneSockets(req);
    const numSockets = Object.keys(req.session.sockets).length;
    return res.send({ numSockets });
  },
});
