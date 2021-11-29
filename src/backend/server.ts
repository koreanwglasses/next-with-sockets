import sessionFactory from "express-session";
import MongoDBStoreFactory from "connect-mongodb-session";
import { uri } from "./database";

import config from "./config";
import nexs from "./nexs";

import { dbConnect } from "./database";
import { notify } from "../lib/subscriptions";

// Session setup
const MongoDBStore = MongoDBStoreFactory(sessionFactory);
const store = new MongoDBStore({ uri, collection: "sessions" });

const session = sessionFactory({
  store,
  secret: config.session.secret,
  resave: true,
  saveUninitialized: true,
});

// Create app
const app = nexs({ session, dev: config.dev });

app.prepare().then(async () => {
  // Additional initialization
  // i.e. setting up database, listeners, background processes, etc.
  await dbConnect();

  const io = app.io;
  io.on("connect", (socket) => {
    const session = socket.handshake.session!;
    notify(io, `/api/socket-count#${session.id}`);
    socket.on("disconnect", () => {
      notify(io, `/api/socket-count#${session.id}`);
    });
  });

  // Start the server
  app.server.listen(config.server.port, () => {
    console.log(
      `> Ready on http://${config.server.host}:${config.server.port}`
    );
  });
});
