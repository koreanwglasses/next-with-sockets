import Express from "express";
import Next from "next";
import { Server as IO } from "socket.io";
import http from "http";
import https from "https";

import iosession from "express-socket.io-session";
import { pruneSockets } from "../lib/get-socket";

// Next
//  EXpress
//    Socket.IO
export interface NEXS {
  prepare(): Promise<void>;
  io: IO;
  server: http.Server;
}

function nexs({
  session,
  dev,
  express: express_,
  server: server_,
}: {
  session: Express.RequestHandler;
  dev?: boolean;
  express?: Express.Express;
  server?: http.Server | https.Server;
}) {
  // Next.js integration
  const next = Next({ dev });
  const handle = next.getRequestHandler();

  // Initialize Express and Socket.IO
  const express = express_ ?? Express();
  const io = new IO();

  // Session setup
  if (!express_) express.use(session);
  io.use(iosession(session, { autoSave: true }));

  // Socket.IO setup
  io.on("connect", (socket) => {
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
  express.all("*", (req, res) => {
    (req as any).io = io;
    return handle(req, res);
  });

  const server = server_ ?? http.createServer(express);

  // Attach Socket.IO, which overrides the /socket.io* routes
  io.attach(server);

  return {
    prepare: () => next.prepare(),
    io,
    server,
  };
}

export default nexs;
