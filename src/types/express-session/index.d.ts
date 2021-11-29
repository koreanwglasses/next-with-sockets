import { Session } from "express-session";

declare module "express-session" {
  interface Session {
    sockets: Record<number, string>;
  }
}
