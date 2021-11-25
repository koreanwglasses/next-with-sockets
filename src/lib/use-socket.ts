import { useCallback, useEffect, useState } from "react";
import { useSWRConfig } from "swr";
import io, { Socket } from "socket.io-client";
import { post } from "./fetchers";

export function useSocket(cb: (socket: Socket) => unknown, deps: unknown[]) {
  const { mutate } = useSWRConfig();
  const [ready, setReady] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cb_ = useCallback(cb, deps);

  useEffect(() => {
    const socket = io({ path: "/api/socket/io" });
    socket.on("connect", async () => {
      await post("api/socket/session/link", { socketId: socket.id });
      setReady(true);
    });
    socket.on("disconnect", () => {
      mutate("api/socket/session/link");
    });

    cb_(socket);

    return () => {
      setReady(false);
      socket.disconnect();
    };
  }, [cb_, mutate]);

  return ready;
}
