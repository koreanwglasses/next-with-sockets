import { NextApiRequest } from "next";
import { Server as IO } from "socket.io";
import { Server } from "http";
import { Session } from "../../../models/sessions";
import { notify } from "../../../lib/subscriptions";
import dbConnect from "../../../lib/database";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!res.socket.server.io) {
    console.log("Starting Socket.IO server");

    const httpServer = res.socket.server as unknown as Server;
    const io = new IO(httpServer, {
      path: "/api/socket/io",
    });
    io.on("connect", (socket) => {
      socket.on("disconnect", async () => {
        await dbConnect();

        const sessions = await Session.find({
          "session.socketIds": socket.id,
        })
          .lean()
          .exec();

        await Session.updateMany(
          { "session.socketIds": socket.id },
          {
            $pull: { "session.socketIds": socket.id },
            $unset: { [`session.socketIndices.${socket.id}`]: "" },
          }
        ).exec();

        sessions.forEach((session) => {
          notify(io, "/api/socket/session/link#" + session._id);
        });
      });
    });

    res.socket.server.io = io;
  }
  res.end();
}
