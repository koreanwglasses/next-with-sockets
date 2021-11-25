import { useCallback, useContext, useEffect, useState } from "react";
import { useSWRConfig } from "swr";
import io, { Socket } from "socket.io-client";
import { post } from "./fetchers";
import { SocketIOContext } from "../pages/_app";

export function useSocket(cb: (socket: Socket) => unknown, deps: unknown[]) {
  const socket = useContext(SocketIOContext);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cb_ = useCallback(cb, deps);

  useEffect(() => {
    if (socket) {
      cb_(socket);
    }
  }, [cb_, socket]);

  return !!socket;
}
