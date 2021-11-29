// Additional initialization
// i.e. setting up database, listeners, background processes, etc.

import { Server as IO, Socket, Handshake } from "socket.io";
import { Server } from "http";
import { dbConnect } from "./database";
import { notify } from "../lib/subscriptions";
import { Example } from "./models/example";

export async function initialize(httpServer: Server, io: IO) {
  await dbConnect();

  io.on("connect", (socket: Socket & { handshake: Handshake }) => {
    const session = socket.handshake.session!;
    notify(io, `/api/socket-count#${session.id}`);
    socket.on("disconnect", () => {
      notify(io, `/api/socket-count#${session.id}`);
    });
  });
}
