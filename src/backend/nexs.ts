import express from "express";
import next from "next";
import { Server as IO, Socket, Handshake } from "socket.io";
import http from "http";

import iosession from "express-socket.io-session";
import { pruneSockets } from "../lib/get-socket";

// Next
//  EXpress
//    Socket.IO
export interface NEXS {
  prepare(): Promise<void>
  io: IO
  server: http.Server
}

export function nexs({
  session,
  dev,
}: {
  session: express.RequestHandler;
  dev: boolean;
}) {
  // Next.js integration
  const nextServer = next({ dev });
  const handle = nextServer.getRequestHandler();

  // Initialize Express and Socket.IO
  const expressServer = express();
  const io = new IO();

  // Session setup
  expressServer.use(session);
  io.use(iosession(session, { autoSave: true }));

  // Socket.IO setup
  io.on("connect", (socket: Socket & { handshake: Handshake }) => {
    const session = socket.handshake.session!;
    pruneSockets(session, io);

    let i = 1;
    while (i in session.sockets) i++;
    session.sockets[i] = socket.id;
    session.save();

    socket.emit("socket:linked", { socketIdx: i });

    socket.on("disconnect", () => {
      const session = socket.handshake.session!;
      delete session.sockets[i];
      session.save();
    });
  });

  // Forward all routes to Next.js
  expressServer.all("*", (req, res) => {
    (req as any).io = io;
    return handle(req, res);
  });

  const httpServer = http.createServer(expressServer);

  // Attach Socket.IO, which overrides the /socket.io* routes
  io.attach(httpServer);

  return {
    prepare: () => nextServer.prepare(),
    io,
    server: httpServer,
  };
}
