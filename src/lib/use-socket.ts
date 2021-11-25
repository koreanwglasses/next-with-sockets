import { useCallback, useContext, useEffect } from "react";
import { Socket } from "socket.io-client";
import { SocketIOContext } from "../pages/_app";

export function useSocket(cb: (socket: Socket) => unknown, deps: unknown[]) {
  const context = useContext(SocketIOContext);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cb_ = useCallback(cb, deps);

  useEffect(() => {
    if (context?.socket) {
      cb_(context?.socket);
    }
  }, [cb_, context]);

  return !!context;
}

export function useSocketIndex() {
  const context = useContext(SocketIOContext);
  return context?.socketIndex
}