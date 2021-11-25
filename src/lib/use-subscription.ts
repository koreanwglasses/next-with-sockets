import useSWR, { useSWRConfig } from "swr";
import { get } from "./fetchers";
import { useSocket } from "./use-socket";

export function useSubscription<T = any>(
  pathname: string,
  body?: Record<string, any>
) {
  const { mutate } = useSWRConfig();

  const ready = useSocket(
    (socket) => {
      socket.on("update", ({ key }) => {
        if (key === pathname) mutate(pathname);
      });
    },
    [mutate, pathname]
  );

  const result = useSWR<T>(ready ? pathname : null, (pathname) =>
    get(pathname, { ...(body ?? {}), subscribe: true })
  );

  return result;
}
