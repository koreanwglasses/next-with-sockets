import { Session } from "express-session";
import "next";
import { Server as IO } from "socket.io";

declare module "next" {
  interface NextApiRequest {
    session: Session;
    io: IO;
  }
}
