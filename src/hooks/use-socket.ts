import { useCallback, useContext, useEffect, useMemo } from "react";
import { get, post } from "../lib/fetchers";
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

export function useSocketIdx() {
  const context = useContext(SocketIOContext);
  return context.socketIdx;
}

export function useSockPost() {
  const socketIdx = useSocketIdx();
  return useCallback(
    (
      url: string,
      body?: any,
      query: Record<string, string | number | boolean | undefined> = {}
    ) => post(`${url}`, body, { ...query, socketIdx }),
    [socketIdx]
  );
}

export function useSockGet() {
  const socketIdx = useSocketIdx();
  return useCallback(
    (
      url: string,
      query: Record<string, string | number | boolean | undefined> = {}
    ) => get(url, { ...query, socketIdx }),
    [socketIdx]
  );
}
