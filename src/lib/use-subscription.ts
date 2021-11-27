import useSWR, { useSWRConfig } from "swr";
import { get } from "./fetchers";
import { useSocket, useSocketIndex } from "./use-socket";

export function useSubscription<T = any>(
  pathname: string,
  query?: Record<string, any>
) {
  const socketIndex = useSocketIndex();
  const { mutate } = useSWRConfig();

  const result = useSWR<T & { dataKey: string }>(
    socketIndex ? pathname : null,
    (pathname: string) =>
      get(pathname, {
        ...(query ?? {}),
        subscribe: true,
        socketIndex,
      })
  );

  if (result.data && !result.data.dataKey) {
    console.error(
      "Server did not return a data key -- this hook will not work properly!"
    );
  }

  useSocket(
    () => ({
      "subscription:update": (key: string) => {
        if (key === result.data?.dataKey) mutate(pathname);
      },
    }),
    [mutate, pathname, result.data?.dataKey]
  );

  return result;
}
