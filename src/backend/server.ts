import express from "express";
import next from "next";
import { Server as IO, Socket, Handshake } from "socket.io";
import { Server } from "http";

import iosession from "express-socket.io-session";

import sessionFactory from "express-session";
import MongoDBStoreFactory from "connect-mongodb-session";
import { uri } from "./database";

import config from "./config";

// Next.js integration
const app = next({ dev: config.dev });
const handle = app.getRequestHandler();

// Session setup
const MongoDBStore = MongoDBStoreFactory(sessionFactory);
const store = new MongoDBStore({ uri, collection: "sessions" });

app.prepare().then(() => {
  // Initialize Express and Socket.IO
  const server = express();
  const io = new IO();

  // Session setup
  const session = sessionFactory({
    store,
    secret: config.session.secret,
    resave: true,
    saveUninitialized: true,
  });

  server.use(session);
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
  server.all("*", (req, res) => {
    (req as any).io = io;
    return handle(req, res);
  });

  // Start the server
  const httpServer = server.listen(config.server.port, () => {
    console.log(
      `> Ready on http://${config.server.host}:${config.server.port}`
    );
  });

  initialize(httpServer, io);

  // Attach Socket.IO, which overrides the /socket.io* routes
  io.attach(httpServer);
});

// Additional initialization
// i.e. setting up listeners, background processes, etc.

import { pruneSockets } from "../lib/validate-socket-ids";
import { notify } from "../lib/subscriptions";

function initialize(httpServer: Server, io: IO) {
  io.on("connect", (socket: Socket & { handshake: Handshake }) => {
    const session = socket.handshake.session!;
    notify(io, `/api/socket-count#${session.id}`);
    socket.on("disconnect", () => {
      notify(io, `/api/socket-count#${session.id}`);
    });
  });
}
