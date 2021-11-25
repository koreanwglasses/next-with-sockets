import { NextApiRequest } from "next";
import { Server as IO } from "socket.io";
import { Server } from "http";
import { notify } from "../../../lib/subscriptions";

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
      socket.on("disconnect", () => {
        notify(io, "/api/socket/session/link", socket.id);
      });
    });

    res.socket.server.io = io;
  }
  res.end();
}
