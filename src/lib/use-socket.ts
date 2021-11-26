import { useContext, useEffect, useMemo } from "react";
import { Socket } from "socket.io-client";
import { SocketIOContext } from "../pages/_app";

export function useSocket(
  listeners: () => {
    [event: string]: (...args: any) => unknown;
  },
  deps?: unknown[]
) {
  const context = useContext(SocketIOContext);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const listeners_ = useMemo(listeners, deps);

  useEffect(() => {
    if (context.socket) {
      const eventHandlers = Object.entries(listeners_) as [
        string,
        (...args: any) => unknown
      ][];

      eventHandlers.forEach(([event, handler]) =>
        context.socket!.on(event, handler)
      );

      return () => {
        eventHandlers.map(([event, handler]) =>
          context.socket?.off(event, handler)
        );
      };
    }
  }, [context.socket, listeners_]);

  return !!context;
}

export function useSocketIndex() {
  const context = useContext(SocketIOContext);
  return context.socketIndex;
}
