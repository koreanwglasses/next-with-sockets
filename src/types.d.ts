import { Server, Socket } from "net";
import { NextApiResponse as NextApiResponse_ } from "next";
import { Server as IO } from "socket.io";

declare global {
  type NextApiResponse<T = any> = NextApiResponse_<T> & {
    socket: Socket & {
      server: Server & {
        io: IO;
      };
    };
  };
}
