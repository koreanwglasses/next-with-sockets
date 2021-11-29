import { StrictEventEmitter, Socket, Handshake } from "socket.io";

type CB<Ev> = Ev extends "connect" | "connection"
  ? (socket: Socket & { handshake: Handshake }) => void
  : Parameters<StrictEventEmitter["on"]>[1];

declare module "socket.io" {
  interface Server {
    on<Ev extends string>(ev: Ev, cb: CB<Ev>): this;
  }
}
