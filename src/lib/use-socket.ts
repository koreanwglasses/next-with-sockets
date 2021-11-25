import { useEffect, useRef } from "react";
import io, { Socket } from "socket.io-client";

export function useSocket(cb: (socket: Socket) => unknown) {
  return useEffect(() => {
    const socket = io({ path: "/api/socketio" });
    socket.on("connect", () => {
      fetch("/api/subscribe", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ socketId: socket.id }),
      });
    });

    cb(socket);

    return () => {
      socket.disconnect();
    };
  }, [cb]);
}
